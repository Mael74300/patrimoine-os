import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { GuidePage, guideCtaIndex, sectionId } from './pages/Guides';
import { guideBySlug, guides } from './data/guides';

const render = (slug: string) => renderToStaticMarkup(
  createElement(MemoryRouter, { initialEntries: [`/guides/${slug}`] },
    createElement(Routes, null, createElement(Route, { path: '/guides/:slug', element: createElement(GuidePage) }))),
);

describe('bouton principal des guides (chantier 156)', () => {
  it('la rubrique désignée par `after` existe', () => {
    for (const g of guides) {
      if (g.cta?.after) expect(g.sections.map((s) => s.heading), g.slug).toContain(g.cta.after);
    }
    expect(guideCtaIndex(guideBySlug['taux-endettement-capacite-emprunt'])).toBe(0);
    expect(guideCtaIndex(guideBySlug['pret-a-taux-zero-ptz'])).toBe(guideBySlug['pret-a-taux-zero-ptz'].sections.length - 1);
  });

  it('chaque guide affiche son bouton une seule fois, avant les questions fréquentes et « Pour aller plus loin »', () => {
    for (const g of guides.filter((x) => x.cta)) {
      const html = render(g.slug);
      const btn = `class="btn" href="${g.cta!.to}"`;
      expect(html.split(btn).length - 1, g.slug).toBe(1);
      const at = html.indexOf(btn);
      for (const marker of ['Questions fréquentes', 'id="rub-pour-aller-plus-loin"', 'id="rub-sources"']) {
        const m = html.indexOf(marker);
        if (m >= 0 && !g.widget) expect(at, `${g.slug} : ${marker}`).toBeLessThan(m);
      }
    }
  });

  it('Taux d’endettement : le bouton suit l’explication du calcul', () => {
    const html = render('taux-endettement-capacite-emprunt');
    const at = html.indexOf('class="btn" href="/simulateurs/endettement"');
    const [calcul, repere] = guideBySlug['taux-endettement-capacite-emprunt'].sections.map((s) => html.indexOf(`id="${sectionId(s.heading)}"`));
    expect(calcul).toBeGreaterThan(0);
    expect(at).toBeGreaterThan(calcul);
    expect(at).toBeLessThan(repere);
  });
});
