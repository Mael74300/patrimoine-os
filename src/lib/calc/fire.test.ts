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
  it('capital en euros d’aujourd’hui : inflation retirée année après année', () => {
    const d = drawdown(100000, { ...F, annualExpenses: 3000, recurringIncome: 0, nominalReturn: 0.05, inflation: 0.02 }, 2);
    // An 1 : (100 000 − 3 000) × 1,05 = 101 850 € courants, soit 101 850 / 1,02 en euros d’aujourd’hui.
    expect(d.series[1].capital).toBeCloseTo(101850, 6);
    expect(d.series[1].realCapital).toBeCloseTo(101850 / 1.02, 6);
    // An 2 : retrait revalorisé 3 060 €, (101 850 − 3 060) × 1,05 = 103 729,5 €, divisé par 1,02².
    expect(d.series[2].capital).toBeCloseTo(103729.5, 6);
    expect(d.series[2].realCapital).toBeCloseTo(103729.5 / 1.02 ** 2, 6);
    expect(d.series[0].realCapital).toBe(100000);
  });
  it('inflation nulle : euros courants et d’aujourd’hui identiques', () => {
    const d = drawdown(240000, { ...F, nominalReturn: 0.03, inflation: 0 }, 10);
    d.series.forEach((p) => expect(p.realCapital).toBeCloseTo(p.capital, 9));
  });
});
