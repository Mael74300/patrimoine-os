/**
 * IndexNow : prévient les moteurs compatibles (Bing, Yandex…) que les pages du sitemap ont changé.
 * Lancé après la publication. Ne fait JAMAIS échouer le déploiement : toute erreur est seulement affichée.
 * La clé n'est pas un secret : elle est publiée à la racine du site (public/<clé>.txt).
 */
import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Adresses <loc> d'un sitemap. */
export function urlsFromSitemap(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&'));
}

export function buildPayload(siteUrl, key, urls) {
  const site = new URL(siteUrl);
  return { host: site.host, key, keyLocation: `${siteUrl.replace(/\/$/, '')}/${key}.txt`, urlList: urls };
}

async function main() {
  const siteUrl = process.env.SITE_URL;
  if (!siteUrl) return console.log('IndexNow : SITE_URL absent, envoi ignoré.');
  const keyFile = (await readdir(join(root, 'public'))).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
  if (!keyFile) return console.log('IndexNow : fichier de clé absent, envoi ignoré.');
  const key = keyFile.replace('.txt', '');
  const base = siteUrl.replace(/\/$/, '');
  const sitemap = await fetch(`${base}/sitemap.xml`, { signal: AbortSignal.timeout(20000) });
  if (!sitemap.ok) return console.log(`IndexNow : sitemap indisponible (HTTP ${sitemap.status}), envoi ignoré.`);
  const urls = urlsFromSitemap(await sitemap.text());
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(buildPayload(siteUrl, key, urls)),
    signal: AbortSignal.timeout(20000),
  });
  console.log(`IndexNow : ${urls.length} adresses envoyées, réponse HTTP ${res.status}.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((e) => console.log(`IndexNow : envoi non effectué (${e.message}).`)).finally(() => process.exit(0));
}
