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
