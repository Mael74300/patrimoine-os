import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { investments } from './data/investments';
import { isoDate, laterRubricUpdate } from './lib/dates';
import { ficheLastUpdate, ficheRubricUpdate } from './lib/ficheDates';
import InvestmentPage from './pages/InvestmentPage';
import { pagesMeta } from './seo';

const render = (slug: string) => renderToString(createElement(MemoryRouter, { initialEntries: [`/encyclopedie/${slug}`] },
  createElement(Routes, null, createElement(Route, { path: '/encyclopedie/:slug', element: createElement(InvestmentPage) }))));
const text = (html: string) => html.replace(/<!-- -->/g, '').replace(/<[^>]+>/g, '').replace(/ /g, ' ');
const FR = '(\\d{1,2}(?:er)? [a-zéû]+ 20\\d\\d)';

describe('dates des fiches', () => {
  it('lit une date écrite en lettres ou au format ISO', () => {
    expect(isoDate('12 novembre 2026')).toBe('2026-11-12');
    expect(isoDate('1er août 2026')).toBe('2026-08-01');
    expect(isoDate('4 novembre 2026')).toBe('2026-11-04');
    expect(isoDate('2026-10-10')).toBe('2026-10-10');
    expect(isoDate('bientôt')).toBeNull();
    expect(isoDate('2026-13-01')).toBeNull();
  });

  it('retient la rubrique revérifiée la plus récente, après la relecture complète seulement', () => {
    const r = (asOf: string, verified = true) => ({ verified, asOf });
    expect(laterRubricUpdate('2026-10-10', [{ label: 'frais', checked: r('12 novembre 2026') }, { label: 'fiscalité', checked: r('4 novembre 2026') }]))
      .toEqual({ date: '2026-11-12', labels: ['frais'] });
    expect(laterRubricUpdate('2026-10-10', [{ label: 'frais', checked: r('5 novembre 2026') }, { label: 'fiscalité', checked: r('5 novembre 2026') }]))
      .toEqual({ date: '2026-11-05', labels: ['frais', 'fiscalité'] });
    // Date égale ou antérieure à la relecture, ou rubrique non vérifiée : rien à signaler.
    expect(laterRubricUpdate('2026-11-12', [{ label: 'frais', checked: r('12 novembre 2026') }])).toBeNull();
    expect(laterRubricUpdate('2026-10-10', [{ label: 'frais', checked: r('12 novembre 2026', false) }])).toBeNull();
  });

  it('chaque fiche : la date du bas n’est jamais plus ancienne qu’un badge « vérifié au » de la page', () => {
    for (const inv of investments) {
      const t = text(render(inv.slug));
      const badges = [...t.matchAll(new RegExp(`vérifié au ${FR}`, 'g'))].map((m) => isoDate(m[1])!);
      const bottom = new RegExp(`Dernière vérification : ${FR}`).exec(t);
      expect(bottom, inv.slug).not.toBeNull();
      const shown = isoDate(bottom![1])!;
      for (const b of badges) expect(shown >= b, `${inv.slug} : ${shown} < ${b}`).toBe(true);
      expect(shown, inv.slug).toBe(ficheLastUpdate(inv));
      // La relecture complète reste affichée quand une rubrique a été revérifiée depuis.
      if (ficheRubricUpdate(inv)) expect(t, inv.slug).toContain('relecture complète : ');
    }
  });

  it('les données structurées et le plan du site portent la même date que la page', () => {
    const pages = pagesMeta('https://exemple.test');
    for (const inv of investments) {
      const page = pages.find((p) => p.path === `/encyclopedie/${inv.slug}/`)!;
      const article = page.jsonLd!.find((j) => (j as Record<string, unknown>)['@type'] === 'Article') as { dateModified: string };
      expect(article.dateModified, inv.slug).toBe(ficheLastUpdate(inv));
    }
  });
});
