import { describe, expect, it } from 'vitest';
import { timeToTarget } from './timeToTarget';

// Exemples fictifs.
describe('Durée pour atteindre un capital', () => {
  it('sans rendement : 10 000 € à 500 € par mois = 20 mois', () => {
    const r = timeToTarget({ initial: 0, monthly: 500, annualRate: 0, target: 10000 });
    expect(r.months).toBe(20);
    expect(r.years).toBeCloseTo(20 / 12, 9);
    expect(r.contributed).toBe(10000);
    expect(r.interest).toBeCloseTo(0, 9);
    expect(r.monthsWithoutReturn).toBe(20);
  });

  it('avec rendement : atteint plus tôt que sans rendement, dernier mois cohérent', () => {
    const r = timeToTarget({ initial: 1000, monthly: 300, annualRate: 0.05, target: 20000 });
    expect(r.reached).toBe(true);
    expect(r.months!).toBeLessThan(r.monthsWithoutReturn!);
    const i = Math.pow(1.05, 1 / 12) - 1;
    let v = 1000;
    for (let k = 0; k < r.months! - 1; k++) v = v * (1 + i) + 300;
    expect(v).toBeLessThan(20000);
    expect(r.finalValue).toBeCloseTo(v * (1 + i) + 300, 6);
    expect(r.finalValue).toBeGreaterThanOrEqual(20000);
    expect(r.interest).toBeCloseTo(r.finalValue - r.contributed, 9);
  });

  it('objectif déjà atteint : 0 mois ; aucun versement ni rendement : jamais atteint', () => {
    expect(timeToTarget({ initial: 5000, monthly: 0, annualRate: 0, target: 4000 }).months).toBe(0);
    const r = timeToTarget({ initial: 100, monthly: 0, annualRate: 0, target: 4000 });
    expect(r.reached).toBe(false);
    expect(r.months).toBeNull();
    expect(r.monthsWithoutReturn).toBeNull();
  });

  it('entrées invalides : jamais NaN', () => {
    const r = timeToTarget({ initial: NaN, monthly: Infinity, annualRate: NaN, target: -5 });
    for (const v of [r.finalValue, r.contributed, r.interest, r.interestShare]) expect(Number.isFinite(v)).toBe(true);
  });
});
