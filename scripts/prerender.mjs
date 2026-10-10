/**
 * Pré-rendu statique : une page HTML complète par adresse (titre, description, URL canonique,
 * Open Graph, données structurées), plus 404.html, sitemap.xml et robots.txt.
 * Variables : SITE_URL (ex. https://compte.github.io/patrimoine-os) et BASE_PATH (ex. /patrimoine-os/).
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const siteUrl = (process.env.SITE_URL || 'https://exemple.github.io/patrimoine-os').replace(/\/$/, '');
const base = process.env.BASE_PATH || '/';

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const { render, pagesMeta, lastModified } = await import(pathToFileURL(join(root, 'dist-ssr', 'entry-server.js')).href);
const template = await readFile(join(dist, 'index.html'), 'utf8');

function page(meta, html, { noindex = false, path = '' } = {}) {
  const url = siteUrl + meta.path;
  const head = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    noindex ? '<meta name="robots" content="noindex" />' : `<link rel="canonical" href="${esc(url)}" />`,
    '<meta property="og:type" content="website" />',
    '<meta property="og:locale" content="fr_FR" />',
    '<meta property="og:site_name" content="Patrimoine OS" />',
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    noindex ? '' : `<meta property="og:url" content="${esc(url)}" />`,
    ...(meta.jsonLd ?? []).map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`),
  ].filter(Boolean).join('\n    ');
  return template
    .replace('<!--csp-->', `<meta http-equiv="Content-Security-Policy" content="${CSP}" />`)
    .replace('<!--head-->', head)
    .replace('data-path=""', path ? `data-path="${esc(path)}"` : '')
    .replace('<!--app-->', html);
}

const pages = pagesMeta(siteUrl);
for (const meta of pages) {
  const html = render(meta.path, base);
  const file = join(dist, meta.path, 'index.html');
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, page(meta, html, { noindex: !!meta.noindex, path: meta.path }));
}

// Page 404 servie par GitHub Pages pour toute adresse inconnue.
await writeFile(
  join(dist, '404.html'),
  page({ path: '/404/', title: 'Page introuvable | Patrimoine OS', description: 'Cette page n’existe pas.' }, render('/page-introuvable/', base), { noindex: true }),
);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.filter((p) => !p.noindex).map((p) => `  <url><loc>${esc(siteUrl + p.path)}</loc><lastmod>${lastModified}</lastmod></url>`).join('\n')}
</urlset>
`;
await writeFile(join(dist, 'sitemap.xml'), sitemap);
await writeFile(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
await rm(join(root, 'dist-ssr'), { recursive: true, force: true });

console.log(`Pré-rendu : ${pages.length} pages, 404.html, sitemap.xml, robots.txt → ${siteUrl}`);
