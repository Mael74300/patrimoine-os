import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { investments } from './data/investments';
import { guides } from './data/guides';
import { simulators } from './lib/simulatorsList';
import { INLINE_LINKS, pathOf } from './lib/inlineLinks';
import { annotateJargon, isLink, linkOnly, type JargonSegment } from './lib/jargon';
import { JargonText } from './components/Jargon';
import { ficheParagraphs } from './lib/ficheText';

const join = (segs: JargonSegment[]) => segs.map((s) => (typeof s === 'string' ? s : s.text)).join('');
const routes = new Set([
  '/encyclopedie',
  ...investments.map((i) => `/encyclopedie/${i.slug}`),
  ...guides.map((g) => `/guides/${g.slug}`),
  ...simulators.map((s) => `/simulateurs/${s.slug}`),
]);

const guidePages = guides.map((g) => ({ path: `/guides/${g.slug}`, title: g.title, paras: g.sections.flatMap((s) => s.body) }));
const fichePages = investments.map((i) => ({ path: `/encyclopedie/${i.slug}`, title: i.name, paras: ficheParagraphs(i) }));
const shortTexts = investments.flatMap((i) => [i.example, i.fees.text, i.tax.text, i.minCapital.text].map((t) => ({ path: `/encyclopedie/${i.slug}`, t })));

describe('Liens dans le texte (pages citées par leur nom)', () => {
  it('chaque lien mène à une page qui existe', () => {
    for (const l of INLINE_LINKS) expect(routes.has(pathOf(l.to)), l.to).toBe(true);
  });

  it('chaque expression est réellement citée sur le site, et devient un lien au moins une fois', () => {
    const found = new Set<string>();
    for (const p of [...guidePages, ...fichePages]) for (const s of annotateJargon(p.paras, p).flat()) if (isLink(s)) found.add(s.to);
    for (const { path, t } of shortTexts) for (const s of linkOnly(t, path)) if (isLink(s)) found.add(s.to);
    // Comparateur : rubriques Frais et Fiscalité affichées hors de leur fiche (« fiche Donation » y devient un lien).
    for (const { t } of shortTexts) for (const s of linkOnly(t)) if (isLink(s)) found.add(s.to);
    for (const l of INLINE_LINKS) expect(found.has(l.to), l.phrase).toBe(true);
  });

  it('ne change pas un mot du texte, ne lie jamais la page courante et chaque cible une seule fois par page', () => {
    for (const p of [...guidePages, ...fichePages]) {
      const segs = annotateJargon(p.paras, p);
      segs.forEach((s, i) => expect(join(s)).toBe(p.paras[i]));
      const links = segs.flat().filter(isLink).map((s) => pathOf(s.to));
      expect(links, p.path).not.toContain(p.path);
      expect(new Set(links).size, p.path).toBe(links.length);
    }
    for (const { path, t } of shortTexts) expect(join(linkOnly(t, path))).toBe(t);
  });

  it('exemples : guide Combien épargner par mois et fiche ETF', () => {
    const g = guidePages.find((p) => p.path === '/guides/combien-epargner-par-mois-objectif')!;
    const to = annotateJargon(g.paras, g).flat().filter(isLink).map((s) => s.to);
    expect(to).toEqual(expect.arrayContaining(['/encyclopedie/livret-a', '/simulateurs/budget']));
    const etf = investments.find((i) => i.slug === 'etf-monde')!;
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(JargonText, { segs: linkOnly(etf.tax.text, '/encyclopedie/etf-monde') })));
    expect(html).toContain('href="/encyclopedie/pea"');
    expect(html).toContain('href="/encyclopedie/compte-titres"');
    // Sur sa propre fiche, « fiche Donation » reste du texte.
    const don = investments.find((i) => i.slug === 'donation')!;
    expect(linkOnly(don.tax.text, '/encyclopedie/donation').some(isLink)).toBe(false);
  });
});
