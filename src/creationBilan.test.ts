import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync } from 'node:fs';
import { SchemaCreationBilan, CREATION_BILAN } from './components/Illustrations';
import { yearlySavingsValue } from './lib/calc/ficheExemples';
import { investmentBySlug } from './data/investments';

/**
 * Fiche Créer son entreprise, exemple chiffré en schéma (constat du 2026-11-21) : exemple fictif, 30 000 € de bénéfice par an,
 * dont 10 000 € épargnés ; en 10 ans, 100 000 € mis de côté ; placés à 4 % par an (versements en fin d’année), environ 120 100 €,
 * dont environ 20 100 € d’intérêts. Pure arithmétique, recalculée ici.
 */
const TAILLES: Record<string, { px: number; em: number }> = {
  'ill-step': { px: 14.5, em: 0.56 },
  'ill-in': { px: 12, em: 0.56 },
  'ill-sub': { px: 13, em: 0.52 },
};
const svg = renderToStaticMarkup(createElement(SchemaCreationBilan)).replace(/<!-- -->/g, '').replace(/&#x27;/g, "'").replace(/[  ]/g, ' ');
const fiche = investmentBySlug['creation-entreprise']!;
const n = (t: string) => t.replace(/[  ]/g, ' ');

describe('fiche Créer son entreprise : exemple chiffré en schéma', () => {
  it('mêmes hypothèses que la légende de la fiche', () => {
    expect(CREATION_BILAN).toEqual({ benefice: 30000, epargne: 10000, taux: 4, annees: 10 });
    const ex = n(fiche.example);
    for (const s of ['30 000 € de bénéfice par an', '10 000 € épargnés chaque année', 'après impôts et cotisations', '4 % par an']) expect(ex).toContain(s);
  });

  it('recalcule l’exemple : 100 000 € mis de côté, environ 120 100 € placés, dont environ 20 100 € d’intérêts', () => {
    const exact = 10000 * ((1.04 ** 10 - 1) / 0.04);
    expect(Math.round(exact)).toBe(120061);
    expect(yearlySavingsValue(10000, 4, 10)).toEqual({ saved: 100000, withGrowth: 120100 });
    for (const m of ['Une année : 30 000 € de bénéfice', '10 000 €', '20 000 € : impôts et dépenses', 'épargnés, après impôts et cotisations',
      'En 10 ans : 10 fois 10 000 €', '= 100 000 € mis de côté, sans les placer', 'Placés à 4 % par an', '100 000 € mis de côté',
      'total ≈ 120 100 €, dont ≈ 20 100 € d’intérêts', '+ la valeur de revente ? Sans garantie']) expect(svg).toContain(m);
    const desc = /<desc[^>]*>([^<]+)<\/desc>/.exec(svg)![1];
    expect(desc).toMatch(/^Exemple fictif/);
    expect(desc).toContain('sans garantie');
  });

  it('« les intérêts n’en ajoutent qu’une part » : moins d’un cinquième du total', () => {
    const { saved, withGrowth } = yearlySavingsValue(10000, 4, 10);
    expect((withGrowth - saved) / withGrowth).toBeLessThan(0.2);
    expect(n(fiche.example)).toContain('À retenir : l’essentiel du capital vient de ce que l’activité permet de mettre de côté');
  });

  it('barres à l’échelle : une année sur toute la largeur ; dix ans et le total placé à une même échelle', () => {
    const rects = [...svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="30"/g)].map((m) => ({ x: +m[1], y: +m[2], w: +m[3] }));
    const an = rects.filter((r) => r.y === 26);
    expect(an).toHaveLength(2);
    expect(an[1]!.w).toBeCloseTo((20000 / 30000) * 338, 6);
    expect(an[1]!.x).toBeCloseTo(1 + (10000 / 30000) * 338, 6);
    const k = 338 / 120100;
    const blocs = rects.filter((r) => r.y === 124);
    expect(blocs).toHaveLength(10);
    blocs.forEach((b, i) => expect(b.x).toBeCloseTo(1 + i * 10000 * k, 6));
    const total = rects.filter((r) => r.y === 222);
    expect(total[1]!.x).toBeCloseTo(1 + 100000 * k, 6);
    expect(total[1]!.w).toBeCloseTo(20100 * k, 6);
    expect(total[1]!.x + total[1]!.w).toBeCloseTo(339, 6);
  });

  it('chaque texte tient dans le dessin, viewBox 340, léger et accessible', () => {
    expect(svg).toMatch(/viewBox="0 0 340 \d+"/);
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
    const hauteur = Number(/viewBox="0 0 340 (\d+)"/.exec(svg)![1]);
    const ts = [...svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)"(?: text-anchor="(start|middle|end)")? class="([\w -]+)"[^>]*>([^<]+)<\/text>/g)];
    expect(ts.length).toBe(10);
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
    expect(page).toContain("if (inv.slug === 'creation-entreprise') return <SchemaCreationBilan>{ex}</SchemaCreationBilan>;");
  });
});
