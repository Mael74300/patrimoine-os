import { describe, expect, it } from 'vitest';
import { drawdown, fireTarget, yearsToTarget } from './fire';

const F = { annualExpenses: 30000, currentWealth: 100000, recurringIncome: 6000, annualSavings: 20000, nominalReturn: 0.05, inflation: 0.02, withdrawalRate: 0.04 };

describe('indépendance financière', () => {
  it('capital visé = dépenses non couvertes / taux de retrait', () => {
    expect(fireTarget(30000, 6000, 0.04)).toBeCloseTo(600000, 6);
    expect(fireTarget(30000, 40000, 0.04)).toBe(0);
    expect(fireTarget(30000, 0, 0)).toBe(Infinity);
  });
  it('déjà atteint', () => expect(yearsToTarget({ ...F, currentWealth: 1e6 })).toBe(0));
  it('taux de retrait nul : jamais atteint', () => expect(yearsToTarget({ ...F, withdrawalRate: 0 })).toBeNull());
  it('rendement réel nul : progression linéaire', () => {
    expect(yearsToTarget({ ...F, nominalReturn: 0.02, inflation: 0.02, currentWealth: 0, annualSavings: 60000 })).toBe(10);
  });
  it('épuisement du capital', () => {
    const d = drawdown(240000, { ...F, nominalReturn: 0, inflation: 0, recurringIncome: 0 }, 20);
    expect(d.depletedAt).toBe(9);
    const safe = drawdown(10_000_000, F, 30);
    expect(safe.depletedAt).toBeNull();
  });
});
