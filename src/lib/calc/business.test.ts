import { describe, expect, it } from 'vitest';
import { BUSINESS_SCENARIOS, lowestCash, projectBusiness } from './business';

const B = {
  revenueY1: 120000, revenueGrowth: 0.1, grossMarginRate: 0.6, fixedCosts: 30000, fixedCostsGrowth: 0,
  founderPay: 24000, socialRate: 0.45, corporateTaxRate: 0.25, receivableDays: 30, initialCash: 10000,
  initialInvestment: 5000, valuationMultiple: 5, years: 5,
};

describe('calculateur entrepreneurial', () => {
  it('distingue CA, résultat, trésorerie et valeur', () => {
    const y1 = projectBusiness(B)[0];
    const op = 120000 * 0.6 - 30000 - 24000 * 1.45;
    expect(y1.operatingResult).toBeCloseTo(op, 8);
    expect(y1.netResult).toBeCloseTo(op * 0.75, 8);
    expect(y1.cashFlow).toBeCloseTo(op * 0.75 - (120000 * 30) / 365, 8);
    expect(y1.cash).toBeCloseTo(10000 - 5000 + y1.cashFlow, 8);
    expect(y1.valuation).toBeCloseTo(y1.netResult * 5, 8);
  });
  it('les pertes sont reportées sur les bénéfices suivants', () => {
    const rows = projectBusiness({ ...B, revenueY1: 50000, revenueGrowth: 1 });
    expect(rows[0].corporateTax).toBe(0);
    const loss = -rows[0].operatingResult;
    expect(rows[1].corporateTax).toBeCloseTo(Math.max(0, rows[1].operatingResult - loss) * 0.25, 6);
  });
  it('valeur jamais négative et besoin de financement détecté', () => {
    const rows = projectBusiness({ ...B, revenueY1: 10000 });
    expect(rows.every((r) => r.valuation >= 0)).toBe(true);
    expect(lowestCash(rows, 5000)).toBeLessThan(0);
  });
  it('scénarios ordonnés', () => {
    const p = projectBusiness(B, BUSINESS_SCENARIOS.pessimiste).at(-1)!.cash;
    const c = projectBusiness(B, BUSINESS_SCENARIOS.central).at(-1)!.cash;
    const o = projectBusiness(B, BUSINESS_SCENARIOS.optimiste).at(-1)!.cash;
    expect(p).toBeLessThan(c);
    expect(c).toBeLessThan(o);
  });
  it('durée nulle', () => expect(projectBusiness({ ...B, years: 0 })).toHaveLength(0));
});
