import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync } from 'node:fs';
import { SchemaFonciereBilan, FONCIERE_BILAN } from './components/Illustrations';
import { listedPropertyYear } from './lib/calc/ficheExemples';
import { investmentBySlug } from './data/investments';

/**
 * Fiche Foncières cotées, exemple chiffré en schéma (constat du 2026-11-21) : 5 000 € d'actions, −10 % sur le cours
 * (−500 €), +4 % de dividendes (+200 €), 4 700 € au bout d'un an, soit −300 €. Pure arithmétique, recalculée ici.
 */
const TAILLES: Record<string, { px: number; em: number }> = {
  'ill-step': { px: 14.5, em: 0.56 },
  'ill-in': { px: 12, em: 0.56 },
  'ill-sub': { px: 13, em: 0.52 },
};
const svg = renderToStaticMarkup(createElement(SchemaFonciereBilan)).replace(/<!-- -->/g, '').replace(/&#x27;/g, "'").replace(/[  ]/g, ' ');

describe('fiche Foncières cotées : exemple chiffré en schéma', () => {
  it('recalcule l’exemple : −500 €, +200 €, 4 700 €, bilan −300 €', () => {
    expect(FONCIERE_BILAN).toEqual({ mise: 5000, baissePct: 10, dividendePct: 4 });
    expect(listedPropertyYear(5000, 10, 4)).toEqual({ afterDrop: 4500, dividends: 200 });
    for (const m of ['5 000 €', '−500 €', '+200 €', '4 700 €', '−10 %', 'Dividendes', 'Bilan de l’année : −300 €', 'les loyers ne protègent pas de la Bourse']) expect(svg).toContain(m);
    const desc = /<desc[^>]*>([^<]+)<\/desc>/.exec(svg)![1];
    expect(desc).toMatch(/^Exemple fictif/);
    expect(desc).toContain('200 € avant impôt');
  });

  it('cascade proportionnelle aux montants depuis zéro', () => {
    const rects = [...svg.matchAll(/<rect x="(\d+)" y="([\d.]+)" width="66" height="([\d.]+)"/g)].map((m) => ({ x: Number(m[1]), y: Number(m[2]), h: Number(m[3]) }));
    expect(rects).toHaveLength(5);
    const [depart, baisse, divid, actions, dividFin] = rects;
    const parEuro = depart.h / 5000;
    expect(baisse.h / parEuro).toBeCloseTo(500, 5);
    expect(divid.h / parEuro).toBeCloseTo(200, 5);
    expect(actions.h / parEuro).toBeCloseTo(4500, 5);
    expect(dividFin.h).toBeCloseTo(divid.h, 5);
    // Tous les montants partent de la même ligne de base : la colonne « Après un an » s'arrête 300 € sous le départ.
    expect(actions.y + actions.h).toBeCloseTo(depart.y + depart.h, 5);
    expect((dividFin.y - depart.y) / parEuro).toBeCloseTo(300, 5);
    expect(baisse.y).toBeCloseTo(depart.y, 5);
    expect(divid.y + divid.h).toBeCloseTo(baisse.y + baisse.h, 5);
  });

  it('le texte de la fiche reste cohérent et ne recopie pas le dessin', () => {
    const ex = investmentBySlug['foncieres-cotees'].example.replace(/[  ]/g, ' ');
    expect(ex).toMatch(/^Exemple fictif/);
    for (const m of ['5 000 €', 'baisse de 10 %', '4 % de dividendes', 'avant impôt', 'À retenir']) expect(ex).toContain(m);
    for (const m of ['4 500 €', '200 €', '4 700 €', '300 €']) expect(ex).not.toContain(m);
  });

  it('chaque texte tient dans le dessin, viewBox 340, léger et accessible', () => {
    expect(svg).toMatch(/viewBox="0 0 340 \d+"/);
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
    const hauteur = Number(/viewBox="0 0 340 (\d+)"/.exec(svg)![1]);
    const ts = [...svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)"(?: text-anchor="(middle|end)")? class="([\w -]+)"[^>]*>([^<]+)<\/text>/g)];
    expect(ts.length).toBeGreaterThan(10);
    for (const [, xs, ys, a, classe, contenu] of ts) {
      const x = Number(xs);
      const t = TAILLES[classe];
      expect(t, classe).toBeDefined();
      const l = contenu.length * t.em * t.px;
      const [debut, fin] = a === 'middle' ? [x - l / 2, x + l / 2] : a === 'end' ? [x - l, x] : [x, x + l];
      expect(debut, contenu).toBeGreaterThanOrEqual(2);
      expect(fin, contenu).toBeLessThanOrEqual(338);
      expect(Number(ys), contenu).toBeLessThanOrEqual(hauteur - 4);
    }
  });

  it('la fiche affiche le schéma dans « Exemple chiffré »', () => {
    const page: string = readFileSync('src/pages/InvestmentPage.tsx', 'utf8');
    expect(page).toContain("if (inv.slug === 'foncieres-cotees') return <SchemaFonciereBilan>{ex}</SchemaFonciereBilan>;");
  });
});
