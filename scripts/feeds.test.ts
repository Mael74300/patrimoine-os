import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
// @ts-expect-error module JavaScript du build, sans déclaration de types
import { buildAtom, feedEntries } from './lib/atom.mjs';
// @ts-expect-error module JavaScript du build, sans déclaration de types
import { buildPayload, urlsFromSitemap } from './indexnow.mjs';
import { pagesMeta } from '../src/seo';

const site = 'https://exemple.github.io/patrimoine-os';

describe('flux Atom', () => {
  const pages = pagesMeta(site);
  const entries = feedEntries(pages, site, '2026-10-01') as { url: string; updated: string }[];
  it('couvre fiches, guides et simulateurs, sans pages noindex', () => {
    expect(entries.some((e) => e.url.includes('/encyclopedie/pea/'))).toBe(true);
    expect(entries.some((e) => e.url.includes('/guides/'))).toBe(true);
    expect(entries.some((e) => e.url.includes('/simulateurs/budget/'))).toBe(true);
    expect(entries.some((e) => e.url.includes('/recherche/'))).toBe(false);
  });
  it('est trié du plus récent au plus ancien et bien formé', () => {
    const dates = entries.map((e) => e.updated);
    expect([...dates].sort().reverse()).toEqual(dates);
    const xml = buildAtom(entries, site) as string;
    expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom"');
    expect((xml.match(/<entry>/g) ?? []).length).toBe(entries.length);
    expect(xml).not.toMatch(/&(?!amp;|lt;|gt;|quot;)/);
  });
});

describe('IndexNow', () => {
  it('extrait les adresses du sitemap et construit la charge', () => {
    const urls = urlsFromSitemap('<urlset><url><loc>https://a.fr/x/?a=1&amp;b=2</loc></url><url><loc>https://a.fr/y/</loc></url></urlset>');
    expect(urls).toEqual(['https://a.fr/x/?a=1&b=2', 'https://a.fr/y/']);
    const p = buildPayload('https://a.github.io/depot/', 'abc', urls);
    expect(p).toEqual({ host: 'a.github.io', key: 'abc', keyLocation: 'https://a.github.io/depot/abc.txt', urlList: urls });
  });
  it('le fichier de clé versionné contient exactement sa clé', () => {
    const files = readdirSync('public').filter((f) => /^[0-9a-f]{32}\.txt$/.test(f));
    expect(files).toHaveLength(1);
    expect(readFileSync(`public/${files[0]}`, 'utf8')).toBe(files[0].replace('.txt', ''));
  });
});
