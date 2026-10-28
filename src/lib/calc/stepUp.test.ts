import { describe, expect, it } from 'vitest';
import { stepUp } from './stepUp';

// Exemples fictifs.
describe('Versement qui augmente chaque année', () => {
  it('sans rendement : 100 €/mois +10 % pendant 2 ans = 12 × 100 + 12 × 110', () => {
    const r = stepUp({ monthly: 100, annualIncrease: 0.1, annualReturn: 0, years: 2 });
    expect(r.steppedInvested).toBeCloseTo(2520, 9);
    expect(r.steppedCapital).toBeCloseTo(2520, 9);
    expect(r.flatInvested).toBe(2400);
    expect(r.lastMonthly).toBeCloseTo(110, 9);
    expect(r.extraCapital).toBeCloseTo(120, 9);
  });

  it('hausse nulle : identique au versement constant (formule de la rente)', () => {
    const r = stepUp({ monthly: 200, annualIncrease: 0, annualReturn: 0.05, years: 10 });
    const m = Math.pow(1.05, 1 / 12) - 1;
    expect(r.flatCapital).toBeCloseTo(200 * ((Math.pow(1 + m, 120) - 1) / m), 6);
    expect(r.steppedCapital).toBeCloseTo(r.flatCapital, 9);
    expect(r.equivalentFlatMonthly).toBeCloseTo(200, 9);
  });

  it('le versement constant équivalent redonne le capital avec hausse', () => {
    const r = stepUp({ monthly: 150, annualIncrease: 0.03, annualReturn: 0.04, years: 20 });
    const again = stepUp({ monthly: r.equivalentFlatMonthly, annualIncrease: 0, annualReturn: 0.04, years: 20 });
    expect(again.steppedCapital).toBeCloseTo(r.steppedCapital, 6);
    expect(r.extraCapital).toBeGreaterThan(0);
  });

  it('entrées dégradées : jamais de NaN', () => {
    const r = stepUp({ monthly: NaN, annualIncrease: NaN, annualReturn: NaN, years: 0 });
    expect(Object.values(r).every(Number.isFinite)).toBe(true);
  });
});
