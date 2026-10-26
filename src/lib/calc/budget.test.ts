import { describe, expect, it } from 'vitest';
import { analyzeBudget, BUDGET_BENCHMARK, catchUp, monthsOfIncomeSavedPerYear, projectBudgetSaving, savingForRate } from './budget';

const B = { netIncome: 2500, needs: 1500, wants: 600, saving: 250 };

describe('budget et taux d’épargne', () => {
  it('le repère 50 / 30 / 20 totalise 100 %', () => {
    expect(BUDGET_BENCHMARK.needs + BUDGET_BENCHMARK.wants + BUDGET_BENCHMARK.saving).toBeCloseTo(1, 12);
  });

  it('parts, taux d’épargne et revenu non affecté', () => {
    const r = analyzeBudget(B);
    expect(r.shares.needs).toBeCloseTo(0.6, 12);
    expect(r.shares.wants).toBeCloseTo(0.24, 12);
    expect(r.savingRate).toBeCloseTo(0.1, 12);
    expect(r.unallocated).toBe(150);
    expect(r.gaps.needs).toBe(250);
    expect(r.gaps.saving).toBe(-250);
  });

  it('revenu nul ou entrées invalides : jamais de NaN', () => {
    const r = analyzeBudget({ netIncome: 0, needs: NaN, wants: -5, saving: 100 });
    expect(r.savingRate).toBe(0);
    expect(r.unallocated).toBe(-100);
    expect(Object.values(r.shares).every(Number.isFinite)).toBe(true);
  });

  it('dépassement du revenu : revenu non affecté négatif', () => {
    expect(analyzeBudget({ netIncome: 1000, needs: 800, wants: 400, saving: 0 }).unallocated).toBe(-200);
  });

  it('effort pour un taux cible', () => {
    expect(savingForRate(2500, 0.2)).toBe(500);
    expect(savingForRate(2500, 2)).toBe(2500);
    expect(savingForRate(-1, 0.2)).toBe(0);
  });

  it('rattrapage : d’abord le revenu non affecté, puis les envies', () => {
    const c = catchUp(B, 0.2); // il manque 250 € ; 150 € non affectés, 100 € à prendre sur les envies
    expect(c.missing).toBe(250);
    expect(c.fromUnallocated).toBe(150);
    expect(c.fromWants).toBe(100);
    expect(c.uncovered).toBe(0);
  });

  it('rattrapage impossible : le reste est signalé', () => {
    const c = catchUp({ netIncome: 2000, needs: 1900, wants: 50, saving: 0 }, 0.2); // manque 400 : 50 non affectés, 50 en envies
    expect(c.fromUnallocated).toBe(50);
    expect(c.fromWants).toBe(50);
    expect(c.uncovered).toBe(300);
  });

  it('objectif déjà atteint : rien à trouver', () => {
    expect(catchUp({ netIncome: 2000, needs: 1000, wants: 400, saving: 600 }, 0.2).missing).toBe(0);
  });

  it('mois de revenu épargnés par an', () => {
    expect(monthsOfIncomeSavedPerYear(0.2)).toBeCloseTo(2.4, 12);
    expect(monthsOfIncomeSavedPerYear(-1)).toBe(0);
  });
});

describe('projection de l’épargne du budget', () => {
  it('rendement nul : somme des versements', () => {
    const p = projectBudgetSaving(250, 0, 10);
    expect(p.contributed).toBe(30000);
    expect(p.finalValue).toBeCloseTo(30000, 6);
    expect(p.gains).toBeCloseTo(0, 6);
  });
  it('rendement positif : gains positifs ; durée nulle ou entrées invalides sans NaN', () => {
    expect(projectBudgetSaving(250, 0.04, 10).gains).toBeGreaterThan(0);
    const z = projectBudgetSaving(NaN, NaN, 0);
    expect(z.finalValue).toBe(0);
  });
});
