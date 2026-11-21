import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync } from 'node:fs';
import { SchemaFormationBilan, FORMATION_BILAN } from './components/Illustrations';
import { trainingPayoff } from './lib/calc/ficheExemples';
import { investmentBySlug } from './data/investments';

/**
 * Fiche Formation et compétences, exemple chiffré en schéma (constat du 2026-11-21) : exemple fictif, formation à 1 000 €,
 * hausse de salaire de 200 € nets par mois, épargnée à 5 % par an. 5 mois de hausse couvrent la dépense ; environ 31 000 €
 * en 10 ans (24 000 € versés) et 81 500 € en 20 ans (48 000 € versés), comme l'ancien texte de la fiche.
 */
const TAILLES: Record<string, { px: number; em: number }> = {
  'ill-step': { px: 14.5, em: 0.56 },
  'ill-in': { px: 12, em: 0.56 },
  'ill-sub': { px: 13, em: 0.52 },
};
const svg = renderToStaticMarkup(createElement(SchemaFormationBilan)).replace(/<!-- -->/g, '').replace(/&#x27;/g, "'").replace(/[\u00a0\u202f]/g, ' ');
const fiche = investmentBySlug['capital-humain']!;
const n = (t: string) => t.replace(/[\u00a0\u202f]/g, ' ');

describe('fiche Formation et compétences : exemple chiffré en schéma', () => {
  it('mêmes hypothèses que la légende de la fiche', () => {
    expect(FORMATION_BILAN).toEqual({ cout: 1000, hausse: 200, taux: 5, horizons: [10, 20] });
    const ex = n(fiche.example);
    for (const s of ['formation à 1 000 €', 'hausse de salaire de 200 € nets par mois', 'épargnée chaque mois à 5 % par an']) expect(ex).toContain(s);
  });

  it('recalcule l’exemple : 5 mois, ≈ 31 000 € en 10 ans dont 24 000 € versés, ≈ 81 500 € en 20 ans dont 48 000 € versés', () => {
    expect(trainingPayoff(1000, 200, 5, [10, 20])).toEqual({ paybackMonths: 5, saved: [{ years: 10, contributed: 24000, value: 31000 }, { years: 20, contributed: 48000, value: 81500 }] });
    for (const m of ['La formation : 1 000 €', '1 000 € dépensés', '200 €', '5 mois de hausse à 200 € nets la remboursent',
      'La hausse épargnée à 5 % par an', 'En 10 ans : ≈ 31 000 €', 'En 20 ans : ≈ 81 500 €', '24 000 €', '48 000 €', 'versé', 'intérêts, avant impôt']) expect(svg).toContain(m);
    const desc = /<desc[^>]*>([^<]+)<\/desc>/.exec(svg)![1];
    expect(desc).toMatch(/^Exemple fictif/);
    expect(desc).toContain('environ 7 000 € d’intérêts');
    expect(desc).toContain('environ 33 500 € d’intérêts');
  });

  it('barres à l’échelle : cinq mois de hausse couvrent la dépense ; 10 et 20 ans à une même échelle', () => {
    const rects = [...svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="30"/g)].map((m) => ({ x: +m[1], y: +m[2], w: +m[3] }));
    const depense = rects.filter((r) => r.y === 26);
    expect(depense).toHaveLength(1);
    const mois = rects.filter((r) => r.y === 64);
    expect(mois).toHaveLength(5);
    expect(mois.at(-1)!.x + mois.at(-1)!.w + 2).toBeCloseTo(depense[0]!.x + depense[0]!.w, 6);
    const k = 338 / 81500;
    const dix = rects.filter((r) => r.y === 192);
    const vingt = rects.filter((r) => r.y === 254);
    expect(dix[1]!.x).toBeCloseTo(1 + 24000 * k, 6);
    expect(dix[1]!.w).toBeCloseTo(7000 * k, 6);
    expect(vingt[1]!.x).toBeCloseTo(1 + 48000 * k, 6);
    expect(vingt[1]!.x + vingt[1]!.w).toBeCloseTo(339, 6);
  });

  it('chaque texte tient dans le dessin, viewBox 340, léger et accessible', () => {
    expect(svg).toMatch(/viewBox="0 0 340 \d+"/);
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
    const hauteur = Number(/viewBox="0 0 340 (\d+)"/.exec(svg)![1]);
    const ts = [...svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)"(?: text-anchor="(start|middle|end)")? class="([\w -]+)"[^>]*>([^<]+)<\/text>/g)];
    expect(ts.length).toBe(15);
    for (const [, xs, ys, a, classe, contenu] of ts) {
      const x = Number(xs);
      const t = TAILLES[classe];
      expect(t, classe).toBeDefined();
      const l = contenu.length * t.em * t.px;
      const [debut, fin] = a === 'middle' ? [x - l / 2, x + l / 2] : a === 'end' ? [x - l, x] : [x, x + l];
      expect(debut, contenu).toBeGreaterThanOrEqual(0);
      expect(fin, contenu).toBeLessThanOrEqual(340);
      expect(Number(ys), contenu).toBeLessThanOrEqual(hauteur - 4);
    }
  });

  it('la fiche affiche le schéma dans « Exemple chiffré » ; le texte en est la légende', () => {
    const page: string = readFileSync('src/pages/InvestmentPage.tsx', 'utf8');
    expect(page).toContain("if (inv.slug === 'capital-humain') return <SchemaFormationBilan>{ex}</SchemaFormationBilan>;");
  });
});
