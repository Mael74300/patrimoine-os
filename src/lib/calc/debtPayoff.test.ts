import { describe, expect, it } from 'vitest';
import { comparePayoff, payoffPlan } from './debtPayoff';

// Exemple fictif.
const D = [
  { name: 'Carte', balance: 2000, rate: 0.2, minPayment: 60 },
  { name: 'Prêt auto', balance: 6000, rate: 0.05, minPayment: 150 },
  { name: 'Petit prêt', balance: 1000, rate: 0.03, minPayment: 50 },
];

describe('Remboursement de plusieurs dettes', () => {
  it('une dette, taux nul : durée = solde / mensualité, aucun intérêt', () => {
    const r = payoffPlan([{ name: 'a', balance: 1200, rate: 0, minPayment: 100 }], 0, 'avalanche');
    expect(r.months).toBe(12);
    expect(r.totalInterest).toBeCloseTo(0, 9);
    expect(r.totalPaid).toBeCloseTo(1200, 6);
  });

  it('total payé = soldes + intérêts, pour chaque méthode', () => {
    for (const m of ['avalanche', 'snowball', 'minimum'] as const) {
      const r = payoffPlan(D, 100, m);
      expect(r.months).not.toBeNull();
      expect(r.totalPaid).toBeCloseTo(9000 + r.totalInterest, 4);
    }
  });

  it('l’avalanche coûte au plus autant d’intérêts que la boule de neige, qui coûte moins que les minimums seuls', () => {
    const c = comparePayoff(D, 100);
    expect(c.avalanche.totalInterest).toBeLessThanOrEqual(c.snowball.totalInterest + 1e-6);
    expect(c.snowball.totalInterest).toBeLessThan(c.minimum.totalInterest);
    expect(c.interestSavedByAvalanche).toBeGreaterThanOrEqual(-1e-6);
    expect(c.avalanche.months!).toBeLessThanOrEqual(c.minimum.months!);
  });

  it('la boule de neige solde d’abord le plus petit solde, l’avalanche le taux le plus élevé', () => {
    const c = comparePayoff(D, 100);
    expect(c.snowball.payoffMonths[2]!).toBeLessThan(c.snowball.payoffMonths[0]!);
    expect(c.avalanche.payoffMonths[0]!).toBeLessThan(c.avalanche.payoffMonths[2]!);
  });

  it('mensualité inférieure aux intérêts : dette jamais soldée (null)', () => {
    const r = payoffPlan([{ name: 'a', balance: 10000, rate: 0.2, minPayment: 100 }], 0, 'avalanche');
    expect(r.months).toBeNull();
    expect(r.payoffMonths[0]).toBeNull();
  });

  it('entrées vides, négatives ou non finies : aucun NaN', () => {
    expect(payoffPlan([], 50, 'snowball').months).toBe(0);
    const r = payoffPlan([{ name: 'a', balance: -5, rate: NaN, minPayment: -1 }], NaN, 'avalanche');
    expect(r.months).toBe(0);
    expect(Number.isFinite(r.totalInterest)).toBe(true);
  });
});
