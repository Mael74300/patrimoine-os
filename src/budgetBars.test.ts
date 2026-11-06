import { describe, expect, it } from 'vitest';
import { analyzeBudget, budgetBarSegments, BUDGET_BENCHMARK } from './lib/calc/budget';

const sum = (s: { width: number }[]) => s.reduce((t, x) => t + x.width, 0);

describe('barre du budget', () => {
  it('exemple 2 500 € : 56 / 26 / 10 % et 8 % non affectés, total 100 %', () => {
    const seg = budgetBarSegments(analyzeBudget({ netIncome: 2500, needs: 1400, wants: 650, saving: 250 }));
    expect(seg.map((s) => [s.key, Math.round(s.width)])).toEqual([['needs', 56], ['wants', 26], ['saving', 10], ['free', 8]]);
    expect(sum(seg)).toBeCloseTo(100, 6);
  });
  it('dépassement : la barre reste à 100 % et le non affecté disparaît', () => {
    const seg = budgetBarSegments(analyzeBudget({ netIncome: 1000, needs: 800, wants: 400, saving: 0 }));
    expect(seg.map((s) => s.key)).toEqual(['needs', 'wants']);
    expect(sum(seg)).toBeCloseTo(100, 6);
  });
  it('revenu nul et postes nuls : aucun segment', () => {
    expect(budgetBarSegments(analyzeBudget({ netIncome: 0, needs: 0, wants: 0, saving: 0 }))).toEqual([]);
  });
  it('le repère 50 / 30 / 20 fait 100 %', () => {
    const s = BUDGET_BENCHMARK.needs + BUDGET_BENCHMARK.wants + BUDGET_BENCHMARK.saving;
    expect(s).toBeCloseTo(1, 10);
  });
});
