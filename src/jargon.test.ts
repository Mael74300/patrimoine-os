import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync } from 'node:fs';
import { glossary } from './data/glossary';
import { investments } from './data/investments';
import { guides } from './data/guides';
import { annotateJargon, isTerm, JARGON_PATTERNS, MAX_PER_PAGE, type JargonSegment, type TermSegment } from './lib/jargon';
import { JargonText } from './components/Jargon';

const css: string = readFileSync('src/styles.css', 'utf8');
const marked = (segs: JargonSegment[][]): TermSegment[] => segs.flat().filter(isTerm);
const join = (segs: JargonSegment[]) => segs.map((s) => (typeof s === 'string' ? s : s.text)).join('');

const pages = [
  ...investments.map((i) => ({ path: `/encyclopedie/${i.slug}`, title: i.name, paras: [i.definition, i.howItWorks, ...i.howToInvest] })),
  ...guides.map((g) => ({ path: `/guides/${g.slug}`, title: g.title, paras: g.sections.flatMap((s) => s.body) })),
];

describe('Jargon expliqué sur place (fiches et guides)', () => {
  it('ne repère que des notions du glossaire, jamais un mot à double sens', () => {
    const terms = new Set(glossary.map((t) => t.term));
    for (const name of Object.keys(JARGON_PATTERNS)) expect(terms.has(name), name).toBe(true);
    const all = Object.values(JARGON_PATTERNS).flat().join('|').toLowerCase();
    for (const ambigu of ['action', 'obligation', 'amortissement']) expect(all).not.toMatch(new RegExp(`(^|\\|)${ambigu}`));
  });

  it('ne change pas un mot du texte, souligne chaque notion une seule fois et au plus six par page', () => {
    let total = 0;
    for (const p of pages) {
      const segs = annotateJargon(p.paras, p);
      segs.forEach((s, i) => expect(join(s)).toBe(p.paras[i]));
      const m = marked(segs);
      expect(new Set(m.map((s) => s.term.term)).size, p.path).toBe(m.length);
      expect(m.length).toBeLessThanOrEqual(MAX_PER_PAGE);
      total += m.length;
    }
    expect(total).toBeGreaterThan(60);
  });

  it('ne souligne pas la notion dont la page parle déjà (titre ou lien du glossaire)', () => {
    const terms = (path: string) => {
      const p = pages.find((x) => x.path === path)!;
      return marked(annotateJargon(p.paras, p)).map((s) => s.term.term);
    };
    expect(terms('/encyclopedie/assurance-vie')).not.toContain('Assurance-vie');
    expect(terms('/guides/combien-epargne-de-precaution')).not.toContain('Épargne de précaution');
    expect(terms('/guides/inflation-pouvoir-d-achat-epargne')).not.toContain('Inflation');
    expect(terms('/encyclopedie/credit-immobilier')).toEqual(['Effet de levier', 'Rendement brut et net', 'Taux d’endettement', 'Capacité d’emprunt']);
  });

  it('respecte les mots entiers et la casse des sigles', () => {
    const [segs] = annotateJargon(['Le PERSONNEL per diem, puis un PER et un ETF.']);
    expect(marked([segs]).map((s) => s.text)).toEqual(['PER', 'ETF']);
  });

  it('affiche la définition du glossaire, telle quelle, avec un lien de secours vers le glossaire', () => {
    const term = glossary.find((t) => t.term === 'Effet de levier')!;
    const [segs] = annotateJargon(['Avec un effet de levier, on emprunte.']);
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(JargonText, { segs })));
    expect(html).toContain('href="/glossaire#effet-de-levier"');
    expect(html).toContain('popover="auto"');
    expect(html).toContain('role="dialog"');
    expect(html).toContain(term.definition.replace(/’/g, '’'));
    expect(html).toContain('aria-label="Fermer la définition"');
  });

  it('bulle masquée par défaut (navigateur sans popover : simple lien), bouton de fermeture de 44 px', () => {
    expect(css).toMatch(/\n\.term-pop \{ display: none; \}/);
    expect(css).toMatch(/\.term-pop:popover-open \{[^}]*display: block;/);
    expect(css).toMatch(/\.term-pop-close \{[^}]*width: 44px; height: 44px;/);
  });
});
