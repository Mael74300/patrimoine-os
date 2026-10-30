/**
 * Test de fumée du site pré-rendu. Sert dist/ (construit avec BASE_PATH=/) et charge chaque page à 375 px
 * puis à 1280 px : aucune erreur JavaScript, aucune erreur de console (hors requêtes réseau bloquées),
 * aucun débordement horizontal. Usage : node scripts/smoke.mjs [dossier] (défaut : dist).
 */
import { createServer } from 'node:http';
import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(process.argv[2] ?? 'dist');
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
    if (overflow > 0) errors.push(`débordement horizontal de ${overflow} px`);
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
