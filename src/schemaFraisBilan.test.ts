import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { investmentBySlug } from './data/investments';
import { FONDS_EUROS_EXAMPLE, UC_EXAMPLE, SchemaFraisBilan } from './components/schemas/fiches';
import { fondsEurosGrowth, fondsEurosYearlyInterest, ucFeesDrag } from './lib/calc/ficheExemples';

/**
 * Fiches Fonds en euros et Unités de compte : l'exemple chiffré gagne un schéma (constat du 2026-11-19). Exemples fictifs,
 * aucun chiffre nouveau : les montants du schéma sont recalculés et doivent être ceux du texte de la fiche.
 */
const norm = (t: string) => t.replace(/[\u00a0\u202f]/g, ' ');
const eur = (n: number) => `${norm(n.toLocaleString('fr-FR'))} €`;
const plain = (svg: string) => norm(svg.replace(/<[^>]+>/g, ' ').replace(/&#x27;|&#39;/g, '’')).replace(/\s+/g, ' ');

describe('fiche Fonds en euros : intérêts de chaque année et coût de 0,5 point de frais', () => {
  const { capital, netPct, years, extraFeesPts } = FONDS_EUROS_EXAMPLE;
  const g = fondsEurosGrowth(capital, netPct, years, extraFeesPts);
  const ys = fondsEurosYearlyInterest(capital, netPct, years);
  const svg = renderToStaticMarkup(createElement(SchemaFraisBilan, { kind: 'fonds-euros', children: 'légende' }));
  const t = plain(svg);
  const ex = norm(investmentBySlug['fonds-euros']!.example);

  it('intérêts annuels : 500 € tirés du capital chaque année, le reste des intérêts déjà gagnés', () => {
    expect(ys.map((y) => y.total)).toEqual([500, 513, 525, 538, 552]);
    for (const y of ys) {
      expect(y.onCapital).toBe(500);
      expect(y.onCapital + y.onInterest).toBe(y.total);
    }
    expect(ys[0]!.total).toBe(g.firstYearInterest);
    expect(ys[years - 1]!.total).toBe(g.lastYearInterest);
  });
  it('mêmes hypothèses et montants que le texte de la fiche, marqué fictif', () => {
    expect(ex).toMatch(/^Exemple fictif/);
    expect(ex).toContain(`${eur(capital)} à 2,5 % net de frais pendant ${years} ans`);
    for (const v of [g.final, g.firstYearInterest, g.lastYearInterest, g.finalWithMoreFees, g.gap]) expect(ex).toContain(eur(v));
  });
  it('le schéma montre chaque année, les gains avec et sans frais et l’écart', () => {
    for (const y of ys) expect(t).toContain(`Année ${y.year} ${eur(y.total)}`);
    expect(t).toContain(`environ ${eur(g.final - capital)}`);
    expect(t).toContain(`environ ${eur(g.finalWithMoreFees - capital)}`);
    expect(t).toContain(`${eur(g.gap)} de moins`);
    expect((g.final - capital) - (g.finalWithMoreFees - capital)).toBe(g.gap);
    expect(t).toContain('plus d’un cinquième');
    expect(g.gap / (g.final - capital)).toBeGreaterThan(0.2);
  });
  it('accessible et léger', () => {
    expect(svg).toContain('role="img"');
    expect(svg).toContain('<desc');
    expect(svg.length).toBeLessThan(15000);
  });
});

describe('fiche Unités de compte : gains en 20 ans avec ou sans frais', () => {
  const { amount, grossPct, feePct, years } = UC_EXAMPLE;
  const u = ucFeesDrag(amount, grossPct, feePct, years);
  const svg = renderToStaticMarkup(createElement(SchemaFraisBilan, { kind: 'unites-de-compte', children: 'légende' }));
  const t = plain(svg);
  const ex = norm(investmentBySlug['unites-de-compte']!.example);

  it('mêmes hypothèses et montants que le texte de la fiche, marqué fictif', () => {
    expect(ex).toMatch(/^Exemple fictif/);
    expect(ex).toContain(`${eur(amount)} placés ${years} ans, avec une hypothèse de ${grossPct} % par an avant frais`);
    expect(ex).toContain('1,5 % de frais');
    for (const v of [u.withoutFees, u.withFees, u.cost]) expect(ex).toContain(eur(v));
  });
  it('le schéma montre les gains avec et sans frais, l’écart et sa part du capital final', () => {
    expect(t).toContain(`environ ${eur(u.withoutFees - amount)}`);
    expect(t).toContain(`environ ${eur(u.withFees - amount)}`);
    expect(t).toContain(`${eur(u.cost)} de moins`);
    expect(t).toContain(`environ 4,4 %`);
    expect(t).toContain(`plus du quart des ${eur(u.withoutFees)} atteints sans frais`);
    expect(u.cost / u.withoutFees).toBeGreaterThan(0.25);
    expect(t).toContain('avant impôt');
  });
  it('accessible et léger', () => {
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
  });
});
