/**
 * Pré-rendu statique : une page HTML complète par adresse (titre, description, URL canonique,
 * Open Graph, données structurées), plus 404.html, sitemap.xml, feed.xml et robots.txt.
 * Variables : SITE_URL (ex. https://compte.github.io/patrimoine-os) et BASE_PATH (ex. /patrimoine-os/).
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildAtom, feedEntries, pageLastmod } from './lib/atom.mjs';
import { ogFileName, ogLabel, renderOgImage } from './lib/ogimage.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
// new URL() met le nom d'hôte en minuscules (Mael74300.github.io → mael74300.github.io).
const siteUrl = new URL(process.env.SITE_URL || 'https://exemple.github.io/patrimoine-os').href.replace(/\/$/, '');
const base = process.env.BASE_PATH || '/';

const { render, pagesMeta, lastModified, config } = await import(pathToFileURL(join(root, 'dist-ssr', 'entry-server.js')).href);

const gc = config.analytics.goatcounter;
const gcOrigin = gc ? `https://${gc}.goatcounter.com` : '';
const CSP = [
  "default-src 'self'",
  `script-src 'self'${gc ? ' https://gc.zgo.at' : ''}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data:${gc ? ' ' + gcOrigin : ''}`,
  "font-src 'self'",
  `connect-src 'self'${gc ? ' ' + gcOrigin : ''}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const template = await readFile(join(dist, 'index.html'), 'utf8');

function page(meta, html, { noindex = false, path = '' } = {}) {
  const url = siteUrl + meta.path;
  const head = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    noindex ? '<meta name="robots" content="noindex" />' : '',
    !noindex || meta.canonicalPath ? `<link rel="canonical" href="${esc(meta.canonicalPath ? siteUrl + meta.canonicalPath : url)}" />` : '',
    '<meta property="og:type" content="website" />',
    '<meta property="og:locale" content="fr_FR" />',
    '<meta property="og:site_name" content="Patrimoine OS" />',
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:image" content="${esc(siteUrl)}/${!noindex && ogFileName(meta.path) ? 'og/' + ogFileName(meta.path) : 'og.png'}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    // Mesure d'audience sans cookie ; le comptage est déclenché par l'application à chaque page.
    gc ? `<script data-goatcounter="${gcOrigin}/count" data-goatcounter-settings='{"no_onload": true}' async src="https://gc.zgo.at/count.js"></script>` : '',
    `<link rel="alternate" type="application/atom+xml" title="Patrimoine OS — nouveautés" href="${esc(siteUrl)}/feed.xml" />`,
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
  // Image de partage propre à la page (titre sans le suffixe de site), générée sans service externe.
  const og = meta.noindex ? null : ogFileName(meta.path);
  if (og) {
    await mkdir(join(dist, 'og'), { recursive: true });
    await writeFile(join(dist, 'og', og), renderOgImage({ title: meta.title.replace(/\s*\|\s*Patrimoine OS$/, ''), label: ogLabel(meta.path) }));
  }
}

// Page 404 servie par GitHub Pages pour toute adresse inconnue.
await writeFile(
  join(dist, '404.html'),
  page({ path: '/404/', title: 'Page introuvable | Patrimoine OS', description: 'Cette page n’existe pas.' }, render('/page-introuvable/', base), { noindex: true }),
);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.filter((p) => !p.noindex).map((p) => `  <url><loc>${esc(siteUrl + p.path)}</loc><lastmod>${pageLastmod(p, lastModified)}</lastmod></url>`).join('\n')}
</urlset>
`;
await writeFile(join(dist, 'sitemap.xml'), sitemap);
await writeFile(join(dist, 'feed.xml'), buildAtom(feedEntries(pages, siteUrl, lastModified), siteUrl));
await writeFile(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
await rm(join(root, 'dist-ssr'), { recursive: true, force: true });

console.log(`Pré-rendu : ${pages.length} pages, 404.html, sitemap.xml, feed.xml, robots.txt → ${siteUrl}`);
