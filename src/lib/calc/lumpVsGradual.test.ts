import { describe, expect, it } from 'vitest';
import { lumpVsGradual, type LumpVsGradualInput } from './lumpVsGradual';

// Exemples fictifs.
const base: LumpVsGradualInput = { amount: 12000, spreadMonths: 12, years: 5, annualReturn: 0.05, cashRate: 0, path: 'steady', move: 0.2 };

describe("Investir d'un coup ou progressivement", () => {
  it('étalement sur 1 mois : mêmes résultats', () => {
    const r = lumpVsGradual({ ...base, spreadMonths: 1 });
    expect(r.gradual).toBeCloseTo(r.lump, 6);
  });

  it('prix constant, trésorerie à 0 % : aucun écart, capital conservé', () => {
    const r = lumpVsGradual({ ...base, annualReturn: 0, move: 0 });
    expect(r.lump).toBeCloseTo(12000, 6);
    expect(r.gradual).toBeCloseTo(12000, 6);
  });

  it('rendement régulier positif : investir d’un coup finit au-dessus', () => {
    const r = lumpVsGradual(base);
    expect(r.lump).toBeCloseTo(12000 * Math.pow(1.05, 5), 4);
    expect(r.advantageGradual).toBeLessThan(0);
  });

  it('baisse initiale : l’étalement finit au-dessus ; hausse initiale : en dessous', () => {
    expect(lumpVsGradual({ ...base, path: 'dip' }).advantageGradual).toBeGreaterThan(0);
    expect(lumpVsGradual({ ...base, path: 'rise' }).advantageGradual).toBeLessThan(0);
  });

  it('trésorerie rémunérée au même taux que le prix régulier : écart nul', () => {
    const r = lumpVsGradual({ ...base, cashRate: 0.05 });
    expect(r.gradual).toBeCloseTo(r.lump, 4);
  });

  it('entrées aberrantes : aucun NaN', () => {
    const r = lumpVsGradual({ amount: NaN, spreadMonths: -3, years: NaN, annualReturn: NaN, cashRate: Infinity, path: 'dip', move: 5 });
    for (const v of Object.values(r)) expect(Number.isFinite(v)).toBe(true);
  });
});
