import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaDiversification, SchemaDiversificationPrincipe, SchemaInterets } from './components/Illustrations';
import { diversificationRows, snowballGroups } from './lib/illustrationData';

/**
 * Guides Intérêts composés et Diversifier : schémas redessinés en viewBox 340 (2026-11-15) pour que leurs textes
 * s'affichent à 12 px et plus à 375 px (contre ~11 px en viewBox 420). Ces tests figent la géométrie retenue.
 * Largeur moyenne d'un caractère estimée à 0,52 em (police système sans empattement).
 */
const largeur = (texte: string, taille: number) => texte.length * 0.52 * taille;
const svg = (c: () => unknown) => renderToStaticMarkup(createElement(c as never));
const rects = (s: string) => [...s.matchAll(/<rect( x="([\d.]+)")?( y="[\d.]+")? width="([\d.]+)"/g)].map((m) => [Number(m[2] ?? 0), Number(m[4])]);

describe('schémas des guides en viewBox 340', () => {
  it('intérêts composés : quatre barres de 70 dans le cadre, chiffres de l’exemple inchangés', () => {
    const s = svg(SchemaInterets);
    expect(s).toContain('viewBox="0 0 340 ');
    const barres = rects(s).filter(([, w]) => w === 70);
    expect(barres).toHaveLength(8);
    for (const [x] of barres) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x + 70).toBeLessThanOrEqual(340);
    }
    expect(largeur('+ 16 533 €', 12)).toBeLessThan(70);
    const [g10, g20] = snowballGroups();
    expect(Math.round(g10.compound.total)).toBe(16289);
    expect(Math.round(g20.compound.total)).toBe(26533);
    expect(s).toMatch(/\+ 16[\s  ]533/);
    expect(s).toContain('Intérêts simples');
    expect(s).toContain('Intérêts composés');
    expect(s.length).toBeLessThan(15000);
  });

  it('diversification, principe : quatre placements empilés, « Fonds en euros » tient dans sa case, sans chiffre', () => {
    const s = svg(SchemaDiversificationPrincipe);
    expect(s).toContain('viewBox="0 0 340 ');
    const cases = rects(s).filter(([, w]) => w === 160);
    expect(cases).toHaveLength(4);
    for (const [x, w] of cases) expect(x + w).toBeLessThanOrEqual(340);
    expect(largeur('Actions : en baisse', 12)).toBeLessThan(160 - 12);
    expect(largeur('pas de la même manière', 12)).toBeLessThan(162);
    expect(largeur('Mais si tout baisse en même temps,', 13)).toBeLessThan(330);
    expect(s).not.toMatch(/\d\s?(%|€)/);
  });

  it('diversification, exemple : barres et étiquettes dans le cadre, mêmes résultats', () => {
    const s = svg(SchemaDiversification);
    expect(s).toContain('viewBox="0 0 340 310"');
    for (const [x, w] of rects(s)) expect(x + w).toBeLessThanOrEqual(330);
    const rows = diversificationRows();
    expect(rows.map((r) => Math.round(r.totalEur))).toEqual([-2000, -1340]);
    // étiquette de la plus longue barre de perte : 10 + 230 + 10, puis « −2 000 € » en 14 px
    expect(10 + 230 + 10 + largeur('−2 000 €', 14)).toBeLessThan(340);
    expect(largeur('7 000 € en actions, 3 000 € prudents', 13)).toBeLessThan(330);
    expect(largeur('Actions −1 400 €, prudent +60 € : −13,4 %', 13)).toBeLessThan(330);
  });
});
