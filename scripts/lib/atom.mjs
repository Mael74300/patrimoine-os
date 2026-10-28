/** Flux Atom des nouveautés (fiches, guides, simulateurs), généré au pré-rendu. Fonctions pures. */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Entrées : pages ayant une date (Article) ou un simulateur (date du site). Les plus récentes d'abord. */
export function feedEntries(pages, siteUrl, fallbackDate) {
  const entries = [];
  for (const p of pages) {
    if (p.noindex) continue;
    const article = (p.jsonLd ?? []).find((j) => j['@type'] === 'Article');
    const isSim = p.path.startsWith('/simulateurs/') && p.path !== '/simulateurs/';
    if (!article && !isSim) continue;
    entries.push({ url: siteUrl + p.path, title: article?.headline ?? p.title, summary: p.description, updated: article?.dateModified ?? fallbackDate });
  }
  return entries.sort((a, b) => b.updated.localeCompare(a.updated) || a.url.localeCompare(b.url));
}

export function buildAtom(entries, siteUrl) {
  const updated = entries.length ? entries[0].updated : '1970-01-01';
  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="fr">
  <title>Patrimoine OS — nouveautés</title>
  <subtitle>Fiches, guides et simulateurs mis à jour</subtitle>
  <id>${esc(siteUrl)}/</id>
  <link rel="self" type="application/atom+xml" href="${esc(siteUrl)}/feed.xml" />
  <link rel="alternate" type="text/html" href="${esc(siteUrl)}/" />
  <updated>${updated}T00:00:00Z</updated>
${entries.map((e) => `  <entry>
    <title>${esc(e.title)}</title>
    <id>${esc(e.url)}</id>
    <link rel="alternate" type="text/html" href="${esc(e.url)}" />
    <updated>${e.updated}T00:00:00Z</updated>
    <summary>${esc(e.summary)}</summary>
  </entry>`).join('\n')}
</feed>
`;
}

/** Date de dernière modification d'une page : celle de son Article (fiche, guide) si elle existe, sinon la date de repli. */
export function pageLastmod(page, fallbackDate) {
  const article = (page.jsonLd ?? []).find((j) => j['@type'] === 'Article');
  return article?.dateModified ?? fallbackDate;
}
