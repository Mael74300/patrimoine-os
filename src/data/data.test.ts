import { describe, expect, it } from 'vitest';
import { categoryById } from './categories';
import { guides } from './guides';
import { investmentBySlug, investments } from './investments';
import { loanPayment, projectGrowth } from '../lib/finance';

describe('intégrité des données éditoriales', () => {
  it('slugs uniques', () => {
    expect(new Set(investments.map((i) => i.slug)).size).toBe(investments.length);
  });

  it.each(investments.map((i) => [i.slug, i] as const))('%s : catégorie, alternatives et sources valides', (_, i) => {
    expect(categoryById[i.category]).toBeDefined();
    for (const a of i.alternatives) expect(investmentBySlug[a], `alternative ${a}`).toBeDefined();
    expect(i.sources.length).toBeGreaterThan(0);
    for (const s of i.sources) expect(s.url).toMatch(/^https:\/\//);
    expect(i.example.toLowerCase()).toContain('fictif');
  });

  it('les guides pointent vers des fiches existantes', () => {
    for (const g of guides) for (const r of g.related) expect(investmentBySlug[r], r).toBeDefined();
  });
});

describe('les exemples chiffrés des fiches sont exacts', () => {
  it('ETF : 200 €/mois, 20 ans, 6 % ≈ 92 000 €', () => {
    const v = projectGrowth({ initial: 0, monthly: 200, annualReturn: 0.06, annualFees: 0, years: 20, inflation: 0 }).at(-1)!.value;
    expect(Math.abs(v - 92000)).toBeLessThan(1500);
  });
  it('Capital humain : 200 €/mois, 20 ans, 5 % ≈ 82 000 €', () => {
    const v = projectGrowth({ initial: 0, monthly: 200, annualReturn: 0.05, annualFees: 0, years: 20, inflation: 0 }).at(-1)!.value;
    expect(Math.abs(v - 82000)).toBeLessThan(1500);
  });
  it('Fonds euros : 20 000 € à 2,5 % sur 5 ans ≈ 22 630 €', () => {
    expect(20000 * Math.pow(1.025, 5)).toBeCloseTo(22628, -1);
  });
  it('Crédit : 200 000 € à 3,6 % sur 20 ans → ≈ 80 850 € d’intérêts', () => {
    expect(loanPayment(200000, 0.036, 20) * 240 - 200000).toBeCloseTo(80850, -2);
  });
  it('Compte à terme : 300 € bruts → 205,80 € nets au PFU de 31,4 %', () => {
    expect(300 * (1 - 0.314)).toBeCloseTo(205.8, 6);
  });
});

import { amortize, netOfFees, rentalAnalysis } from '../lib/finance';
import { RENTAL } from '../lib/calc/fixtures';
import { pagesMeta } from '../seo';

describe('les exemples chiffrés des guides sont exacts', () => {
  const g = (monthly: number, r: number, y: number, changes = [] as { fromYear: number; monthly: number }[]) =>
    projectGrowth({ initial: 0, monthly, annualReturn: r, annualFees: 0, years: y, inflation: 0, savingsChanges: changes }).at(-1)!;
  it('frais : 10 000 € sur 25 ans à 6 % → ≈ 40 800 € (0,2 %) contre ≈ 29 400 € (1,5 %)', () => {
    expect(10000 * (1 + netOfFees(0.06, 0.002)) ** 25).toBeCloseTo(40800, -2);
    expect(10000 * (1 + netOfFees(0.06, 0.015)) ** 25).toBeCloseTo(29400, -2);
  });
  it('1 % de frais sur 25 ans réduit un capital d’environ 22 %', () => expect(1 - 0.99 ** 25).toBeCloseTo(0.22, 2));
  it('épargne limitée : ≈ 34 400 € puis ≈ 78 200 € avec paliers', () => {
    expect(g(50, 0.04, 30).value).toBeCloseTo(34400, -2);
    const p = g(50, 0.04, 30, [{ fromYear: 6, monthly: 100 }, { fromYear: 11, monthly: 150 }]);
    expect(p.value).toBeCloseTo(78200, -2);
    expect(p.contributed).toBe(45000);
  });
  it('rentabilité locative : brut 6 %, net ≈ 3,6 %, effort ≈ 390 €/mois', () => {
    const r = rentalAnalysis(RENTAL);
    expect(r.grossYield).toBeCloseTo(0.06, 10);
    expect(r.netYield).toBeCloseTo(0.036, 3);
    expect(Math.abs(r.monthlyCashflow + 390)).toBeLessThan(5);
  });
  it('crédit : 180 000 € à 3,5 % → ≈ 6 200 € d’intérêts la première année', () => {
    expect(amortize({ principal: 180000, annualRate: 0.035, years: 20 }).schedule[0].interest).toBeCloseTo(6200, -2);
  });
});

describe('référencement', () => {
  const pages = pagesMeta('https://exemple.test');
  it('chemins, titres et descriptions uniques et renseignés', () => {
    expect(new Set(pages.map((p) => p.path)).size).toBe(pages.length);
    expect(new Set(pages.map((p) => p.title)).size).toBe(pages.length);
    for (const p of pages) {
      expect(p.path).toMatch(/^\/([a-z0-9-]+\/)*$/);
      expect(p.description.length).toBeGreaterThan(30);
      expect(p.description.length).toBeLessThan(200);
    }
  });
});
