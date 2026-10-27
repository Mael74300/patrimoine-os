/**
 * Contrôle SEO du site pré-rendu. Lit les pages HTML de dist/ et signale :
 * titre et description absents, en double ou de longueur déraisonnable, URL canonique absente ou
 * incohérente, liens internes cassés, pages orphelines (sans lien entrant), JSON-LD invalide.
 * Utilisé par le build (échec en cas d'erreur) et par les tests.
 */
import { access, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const LIMITS = { titleMin: 10, titleMax: 70, descMin: 50, descMax: 170 };

const unesc = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const norm = (p) => (p.replace(/\/+$/, '') || '/');

/** pages : [{ path, html, noindex? }] ; paths : chemins publics (« /guides/x/ »). */
export function checkSeo(pages, { siteUrl, base = '/' }) {
  const errors = [];
  const known = new Set(pages.map((p) => norm(p.path)));
  const inbound = new Map(pages.map((p) => [norm(p.path), new Set()]));
  const titles = new Map();
  const descs = new Map();

  for (const p of pages) {
    const here = norm(p.path);
    const html = p.html;
    const title = /<title>([^<]*)<\/title>/.exec(html)?.[1];
    const desc = /<meta name="description" content="([^"]*)"/.exec(html)?.[1];
    const noindex = /<meta name="robots" content="noindex"/.test(html);
    if (!title) errors.push(`${here} : titre absent`);
    else {
      const t = unesc(title);
      if (t.length < LIMITS.titleMin || t.length > LIMITS.titleMax) errors.push(`${here} : titre de ${t.length} caractères (attendu ${LIMITS.titleMin}–${LIMITS.titleMax})`);
      if (!noindex) titles.set(t, [...(titles.get(t) ?? []), here]);
    }
    if (!desc) errors.push(`${here} : description absente`);
    else {
      const d = unesc(desc);
      if (d.length < LIMITS.descMin || d.length > LIMITS.descMax) errors.push(`${here} : description de ${d.length} caractères (attendu ${LIMITS.descMin}–${LIMITS.descMax})`);
      if (!noindex) descs.set(d, [...(descs.get(d) ?? []), here]);
    }
    const canonical = /<link rel="canonical" href="([^"]*)"/.exec(html)?.[1];
    if (!noindex) {
      if (!canonical) errors.push(`${here} : URL canonique absente`);
      else if (unesc(canonical) !== siteUrl + p.path) errors.push(`${here} : URL canonique « ${canonical} » différente de l’adresse attendue`);
    }
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      try {
        const data = JSON.parse(m[1]);
        for (const item of Array.isArray(data) ? data : [data]) {
          if (item['@context'] !== 'https://schema.org') errors.push(`${here} : JSON-LD sans @context schema.org`);
          if (!item['@type']) errors.push(`${here} : JSON-LD sans @type`);
        }
      } catch {
        errors.push(`${here} : JSON-LD invalide`);
      }
    }
    for (const m of html.matchAll(/<a [^>]*?href="([^"]*)"/g)) {
      let href = unesc(m[1]).split('#')[0].split('?')[0];
      if (!href || /^(https?:|mailto:|tel:)/.test(href)) continue;
      if (!href.startsWith('/')) continue;
      const prefix = base.replace(/\/$/, '');
      if (prefix && (href === prefix || href.startsWith(prefix + '/'))) href = href.slice(prefix.length) || '/';
      const target = norm(href);
      if (/\.[a-z0-9]+$/i.test(target)) continue; // fichier (og.png, sitemap.xml…)
      if (!known.has(target)) errors.push(`${here} : lien interne cassé vers « ${m[1]} »`);
      else if (target !== here) inbound.get(target).add(here);
    }
  }
  for (const [t, where] of titles) if (where.length > 1) errors.push(`titre en double « ${t} » : ${where.join(', ')}`);
  for (const [d, where] of descs) if (where.length > 1) errors.push(`description en double (${where.join(', ')}) : « ${d.slice(0, 60)}… »`);
  for (const p of pages) {
    const here = norm(p.path);
    if (here === '/' || /<meta name="robots" content="noindex"/.test(p.html)) continue;
    if (inbound.get(here).size === 0) errors.push(`${here} : page orpheline (aucun lien entrant)`);
  }
  return errors;
}

/** Lit dist/ d’après le sitemap et la liste des pages (noindex incluses via les chemins fournis). */
export async function checkDist(dist, siteUrl, base) {
  const sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8');
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => unesc(m[1]).slice(siteUrl.length));
  const pages = [];
  for (const path of paths) pages.push({ path, html: await readFile(join(dist, path, 'index.html'), 'utf8') });
  pages.push({ path: '/404/', html: await readFile(join(dist, '404.html'), 'utf8') });
  const errors = checkSeo(pages.filter((p) => p.path !== '/404/'), { siteUrl, base });
  // Chaque image Open Graph du site doit exister dans dist/.
  for (const p of pages) {
    const m = p.html.match(/<meta property="og:image" content="([^"]+)"/);
    if (!m) continue;
    const src = unesc(m[1]);
    if (!src.startsWith(siteUrl + '/')) continue;
    try {
      await access(join(dist, src.slice(siteUrl.length)));
    } catch {
      errors.push(`${p.path} : image Open Graph introuvable (${src})`);
    }
  }
  return { pages, errors };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const siteUrl = new URL(process.env.SITE_URL || 'https://exemple.github.io/patrimoine-os').href.replace(/\/$/, '');
  const { pages, errors } = await checkDist(join(root, 'dist'), siteUrl, process.env.BASE_PATH || '/');
  if (errors.length) {
    console.error(`Contrôle SEO : ${errors.length} erreur(s)\n- ` + errors.join('\n- '));
    process.exit(1);
  }
  console.log(`Contrôle SEO : ${pages.length - 1} pages indexables conformes`);
}
