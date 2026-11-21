import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaNumeriqueBilan, NUMERIQUE_BILAN } from './components/Illustrations';
import { subscriptionChurn, subscriptionMonths } from './lib/calc/ficheExemples';
import { investmentBySlug } from './data/investments';

/**
 * Fiche Activité numérique, exemple chiffré en schéma (constat du 2026-11-21) : exemple fictif, 200 abonnés à 15 € par mois,
 * 5 % de départs par mois. Sans nouveaux clients, environ 108 abonnés et 1 620 € par mois au bout de 12 mois ; avec 10 nouveaux
 * clients par mois, 200 abonnés et 3 000 € par mois. Pure arithmétique, recalculée ici.
 */
const svg = renderToStaticMarkup(createElement(SchemaNumeriqueBilan)).replace(/<!-- -->/g, '').replace(/&#x27;/g, "'").replace(/[\u00a0\u202f]/g, ' ');
const n = (t: string) => t.replace(/[\u00a0\u202f]/g, ' ');

describe('fiche Activité numérique : exemple chiffré en schéma', () => {
  it('mêmes hypothèses que la légende de la fiche', () => {
    expect(NUMERIQUE_BILAN).toEqual({ abonnes: 200, prix: 15, departsPct: 5, mois: 12 });
    const ex = n(investmentBySlug['activite-numerique']!.example);
    for (const s of ['200 abonnés à 15 € par mois', '3 000 € par mois', '5 % d’entre eux résilient chaque mois']) expect(ex).toContain(s);
  });

  it('recalcule la série mois par mois, cohérente avec subscriptionChurn', () => {
    expect(Math.round(200 * 0.95 ** 12)).toBe(108);
    const seul = subscriptionMonths(200, 15, 5, 12);
    expect(seul).toHaveLength(13);
    expect(seul[0]).toEqual({ month: 0, clients: 200, revenue: 3000 });
    expect(seul[12]).toEqual({ month: 12, clients: 108, revenue: 1620 });
    const c = subscriptionChurn(200, 15, 5, 12);
    expect(seul[12]!.clients).toBe(c.clientsLeft);
    expect(seul[12]!.revenue).toBe(c.revenueLeft);
    for (let i = 1; i < seul.length; i++) expect(seul[i]!.revenue).toBeLessThan(seul[i - 1]!.revenue);
    // 10 arrivées compensent exactement 5 % de 200 départs : le nombre d'abonnés ne bouge pas.
    for (const m of subscriptionMonths(200, 15, 5, 12, 10)) expect(m.clients).toBe(200);
  });

  it('textes du schéma', () => {
    for (const m of ['Sans nouveaux clients', '5 % partent chaque mois', '3 000 € par mois au départ', '≈ 1 620 €', '≈ 108 abonnés au bout d’un an',
      'Avec 10 nouveaux clients par mois', 'autant que de départs : 3 000 € par mois', '200 abonnés gardés', 'aujourd’hui', '12 mois']) expect(svg).toContain(m);
    const desc = /<desc[^>]*>([^<]+)<\/desc>/.exec(svg)![1]!;
    expect(desc).toMatch(/^Exemple fictif/);
    expect(desc).toContain('environ 108 abonnés au bout de 12 mois, soit environ 1 620 € par mois');
  });

  it('barres à l’échelle : 3 000 € = 80 px dans les deux rangées', () => {
    const rects = [...svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g)].map((m) => ({ y: +m[2], h: +m[4] }));
    expect(rects).toHaveLength(26);
    const haut = rects.slice(0, 13);
    const bas = rects.slice(13);
    subscriptionMonths(200, 15, 5, 12).forEach((m, i) => {
      expect(haut[i]!.h).toBeCloseTo((m.revenue / 3000) * 80, 6);
      expect(haut[i]!.y + haut[i]!.h).toBeCloseTo(126, 6);
    });
    for (const b of bas) expect(b.h).toBeCloseTo(80, 6);
  });
});
