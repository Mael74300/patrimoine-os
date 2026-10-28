import { describe, expect, it } from 'vitest';
import { simpleVsCompound } from './simpleVsCompound';

// Exemples fictifs.
describe('Intérêts simples ou composés', () => {
  it('10 000 € à 5 % pendant 10 ans : 15 000 € en simple, 10 000 × 1,05^10 en composé', () => {
    const r = simpleVsCompound({ initial: 10000, annualRate: 0.05, years: 10 });
    expect(r.simpleFinal).toBeCloseTo(15000, 9);
    expect(r.compoundFinal).toBeCloseTo(10000 * Math.pow(1.05, 10), 6);
    expect(r.compoundFinal).toBeCloseTo(16288.95, 2);
    expect(r.simpleInterest).toBeCloseTo(5000, 9);
    expect(r.gap).toBeCloseTo(r.compoundInterest - r.simpleInterest, 9);
    expect(r.rows).toHaveLength(11);
  });

  it('année 0 et année 1 : aucun écart', () => {
    const r = simpleVsCompound({ initial: 2000, annualRate: 0.04, years: 5 });
    expect(r.rows[0]).toMatchObject({ year: 0, simple: 2000, compound: 2000, gap: 0 });
    expect(r.rows[1].gap).toBeCloseTo(0, 9);
    expect(r.rows[2].gap).toBeCloseTo(2000 * 0.04 * 0.04, 9);
  });

  it('taux nul ou durée nulle : aucun intérêt', () => {
    const a = simpleVsCompound({ initial: 1000, annualRate: 0, years: 20 });
    expect(a.simpleFinal).toBe(1000);
    expect(a.compoundFinal).toBe(1000);
    const b = simpleVsCompound({ initial: 1000, annualRate: 0.05, years: 0 });
    expect(b.compoundInterest).toBe(0);
    expect(b.ratio).toBe(1);
  });

  it('entrées invalides : jamais NaN', () => {
    const r = simpleVsCompound({ initial: NaN, annualRate: Infinity, years: -3 });
    for (const v of [r.simpleFinal, r.compoundFinal, r.gap, r.ratio]) expect(Number.isFinite(v)).toBe(true);
  });
});
