import { describe, expect, it } from 'vitest';
import { BUSINESS_SCENARIOS, corporateTaxAmount, IS_RATES, lowestCash, projectBusiness } from './business';

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
  it('taux réduit des PME : 15 % jusqu’à 42 500 €, puis le taux normal (impots.gouv.fr, vérifié le 16 novembre 2026)', () => {
    expect(IS_RATES).toMatchObject({ normal: 0.25, reduced: 0.15, reducedCap: 42500, maxTurnover: 10_000_000 });
    expect(IS_RATES.verifiedOn).toBe('2026-11-16');
    expect(corporateTaxAmount(30000, 0.25, true)).toBeCloseTo(4500, 8);
    expect(corporateTaxAmount(50000, 0.25, true)).toBeCloseTo(42500 * 0.15 + 7500 * 0.25, 8); // 6 375 + 1 875 = 8 250
    expect(corporateTaxAmount(50000, 0.25, false)).toBeCloseTo(12500, 8);
    expect(corporateTaxAmount(50000, 0.25, true, 12_000_000)).toBeCloseTo(12500, 8); // chiffre d'affaires au-delà de 10 M€
    expect(corporateTaxAmount(-1000, 0.25, true)).toBe(0);
  });
  it('le taux réduit s’applique dans la projection et allège l’impôt', () => {
    const normal = projectBusiness(B).at(-1)!;
    const reduced = projectBusiness({ ...B, smallBusinessRate: true }).at(-1)!;
    expect(reduced.corporateTax).toBeCloseTo(corporateTaxAmount(normal.operatingResult, 0.25, true), 6);
    expect(reduced.corporateTax).toBeLessThan(normal.corporateTax);
    expect(reduced.netResult - normal.netResult).toBeCloseTo(normal.corporateTax - reduced.corporateTax, 6);
  });
});
