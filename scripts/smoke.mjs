/**
 * Test de fumée du site pré-rendu. Sert dist/ (construit avec BASE_PATH=/) et charge chaque page à 375 px
 * puis à 1280 px : aucune erreur JavaScript, aucune erreur de console (hors requêtes réseau bloquées),
 * aucun débordement horizontal, et aucun texte de schéma ou de graphique qui touche ou dépasse le bord
 * de la case qui le contient (marge intérieure d'au moins MARGE_TEXTE px, mesurée avec des largeurs de type Arial). Usage : node scripts/smoke.mjs [dossier] (défaut : dist).
 */
import { createServer } from 'node:http';
import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(process.argv[2] ?? 'dist');
const MARGE_TEXTE = 1;
const VIEWPORTS = [{ width: 375, height: 800 }, { width: 1280, height: 900 }];
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };

async function pagesOf(dir, rel = '') {
  const out = [];
  for (const e of await readdir(join(dir, rel), { withFileTypes: true })) {
    const r = join(rel, e.name);
    if (e.isDirectory()) out.push(...(await pagesOf(dir, r)));
    else if (e.name === 'index.html') out.push('/' + rel.split(sep).join('/') + (rel ? '/' : ''));
  }
  return out;
}

const server = createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = resolve(root, '.' + p);
  try {
    if (!file.startsWith(root) || !(await stat(file)).isFile()) throw new Error();
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(await readFile(file));
  } catch {
    res.writeHead(404, { 'content-type': 'text/html' }).end(await readFile(join(root, '404.html')).catch(() => 'introuvable'));
  }
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const origin = `http://127.0.0.1:${server.address().port}`;

const pages = await pagesOf(root);
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const problems = [];
for (const viewport of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport });
  // Seul le site lui-même est joignable : les scripts tiers (statistiques) sont bloqués, comme le fait la CSP.
  await ctx.route((url) => url.origin !== origin, (route) => route.abort());
  const page = await ctx.newPage();
  let errors = [];
  page.on('pageerror', (e) => errors.push(`erreur JavaScript : ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(`console : ${m.text()}`);
  });
  page.on('response', (r) => {
    if (r.url().startsWith(origin) && r.status() >= 400 && !r.url().endsWith('/404.html')) errors.push(`HTTP ${r.status()} : ${r.url()}`);
  });
  for (const path of pages) {
    errors = [];
    await page.goto(origin + path, { waitUntil: 'load' });
    await page.waitForTimeout(100);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) {
      const fautifs = await page.evaluate(() => [...document.querySelectorAll('body *')]
        .filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1)
        .slice(0, 4)
        .map((e) => `${e.tagName.toLowerCase()}${e.className && typeof e.className === 'string' ? '.' + e.className.split(' ').join('.') : ''} (droite à ${Math.round(e.getBoundingClientRect().right)} px)`));
      errors.push(`débordement horizontal de ${overflow} px${fautifs.length ? ' ; éléments : ' + fautifs.join(', ') : ''}`);
    }
    // Texte d'un dessin SVG : la plus petite case (rect) qui contient le centre du texte doit le contenir
    // entièrement, avec une marge horizontale ; sans case, le texte reste dans le dessin.
    // Mesure faite avec Liberation Sans (mêmes largeurs qu'Arial, installée avec les dépendances de Playwright),
    // pour un résultat identique quelle que soit la police système de la machine.
    const serres = await page.evaluate((marge) => {
      document.documentElement.style.setProperty('--font', "'Liberation Sans', Arial, sans-serif");
      document.documentElement.style.setProperty('--font-schema', "'Liberation Sans', Arial, sans-serif");
      const out = [];
      for (const svg of document.querySelectorAll('svg')) {
        const sb = svg.getBoundingClientRect();
        if (!sb.width) continue;
        const cases = [...svg.querySelectorAll('rect')].map((r) => r.getBoundingClientRect()).filter((b) => b.width > 0 && b.height > 0);
        for (const t of svg.querySelectorAll('text')) {
          const tb = t.getBoundingClientRect();
          if (!tb.width) continue;
          const cx = tb.left + tb.width / 2;
          const cy = tb.top + tb.height / 2;
          const c = cases
            .filter((b) => cx > b.left && cx < b.right && cy > b.top && cy < b.bottom)
            .sort((a, b) => a.width * a.height - b.width * b.height)[0];
          const m = c ? Math.min(tb.left - c.left, c.right - tb.right) : Math.min(tb.left - sb.left, sb.right - tb.right) + marge;
          if (m < marge) out.push(`« ${t.textContent} » ${c ? 'touche le bord de sa case' : 'dépasse du dessin'} (marge ${m.toFixed(1)} px)`);
        }
      }
      return out;
    }, MARGE_TEXTE);
    errors.push(...serres.map((e) => `texte de schéma : ${e}`));
    for (const e of errors) problems.push(`${path} (${viewport.width} px) : ${e}`);
  }
  await ctx.close();
}
await browser.close();
server.close();

console.log(`Test de fumée : ${pages.length} pages × ${VIEWPORTS.length} largeurs.`);
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('Aucune erreur.');
