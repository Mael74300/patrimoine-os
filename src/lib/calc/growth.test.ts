import { describe, expect, it } from 'vitest';
import { afterTax, deflate, monthlyRate, netOfFees, realRate } from './common';
import { monthlyFor, projectGrowth, requiredMonthly } from './growth';

const base = { initial: 0, monthly: 0, annualReturn: 0, annualFees: 0, years: 10, inflation: 0 };

describe('conventions', () => {
  it('le taux mensuel recompose exactement le taux annuel', () => {
    expect(Math.pow(1 + monthlyRate(0.05), 12)).toBeCloseTo(1.05, 12);
  });
  it('frais multiplicatifs', () => expect(netOfFees(0.07, 0.01)).toBeCloseTo(1.07 * 0.99 - 1, 12));
  it('rendement réel', () => expect(realRate(0.05, 0.02)).toBeCloseTo(1.05 / 1.02 - 1, 12));
  it('déflation', () => expect(deflate(1102.5, 0.05, 2)).toBeCloseTo(1000, 8));
  it("l'impôt ne porte que sur les gains", () => {
    expect(afterTax(15000, 10000, 0.314)).toBeCloseTo(13430, 8);
    expect(afterTax(9000, 10000, 0.314)).toBe(9000);
  });
});

describe('projection de patrimoine', () => {
  it('sans rendement, la valeur égale les versements', () => {
    const p = projectGrowth({ ...base, initial: 1000, monthly: 100 }).at(-1)!;
    expect(p.value).toBeCloseTo(13000, 6);
    expect(p.gains).toBeCloseTo(0, 6);
  });
  it('capital seul : 10 000 € × 1,05^10', () => {
    expect(projectGrowth({ ...base, initial: 10000, annualReturn: 0.05 }).at(-1)!.value).toBeCloseTo(10000 * 1.05 ** 10, 4);
  });
  it('versements en début de mois : formule fermée', () => {
    const r = monthlyRate(0.06);
    const expected = 200 * ((Math.pow(1 + r, 240) - 1) / r) * (1 + r);
    expect(projectGrowth({ ...base, monthly: 200, annualReturn: 0.06, years: 20 }).at(-1)!.value).toBeCloseTo(expected, 4);
  });
  it('valeur réelle nulle en inflation égale au rendement', () => {
    expect(projectGrowth({ ...base, initial: 1000, annualReturn: 0.02, inflation: 0.02, years: 5 }).at(-1)!.realValue).toBeCloseTo(1000, 6);
  });
  it('retrait ponctuel en fin d’année', () => {
    const p = projectGrowth({ ...base, initial: 10000, years: 3, withdrawals: [{ year: 2, amount: 4000 }] });
    expect(p[2].value).toBeCloseTo(6000, 8);
    expect(p[3].withdrawn).toBe(4000);
    expect(p[3].gains).toBeCloseTo(0, 8);
  });
  it('un retrait ne peut dépasser le capital disponible', () => {
    const p = projectGrowth({ ...base, initial: 1000, years: 1, withdrawals: [{ year: 1, amount: 5000 }] }).at(-1)!;
    expect(p.value).toBe(0);
    expect(p.withdrawn).toBe(1000);
  });
  it("variation de l'épargne par phases", () => {
    const input = { ...base, monthly: 100, years: 4, savingsChanges: [{ fromYear: 3, monthly: 300 }] };
    expect(monthlyFor(2, input)).toBe(100);
    expect(monthlyFor(3, input)).toBe(300);
    expect(projectGrowth(input).at(-1)!.contributed).toBe(100 * 24 + 300 * 24);
  });
  it('revalorisation des versements depuis le début de la phase', () => {
    const input = { ...base, monthly: 100, contributionGrowth: 0.1, savingsChanges: [{ fromYear: 3, monthly: 200 }] };
    expect(monthlyFor(2, input)).toBeCloseTo(110, 10);
    expect(monthlyFor(4, input)).toBeCloseTo(220, 10);
  });
  it('durée nulle, négative ou invalide : seul le point initial', () => {
    expect(projectGrowth({ ...base, initial: 500, years: 0 })).toHaveLength(1);
    expect(projectGrowth({ ...base, initial: 500, years: -3 })).toHaveLength(1);
    expect(projectGrowth({ ...base, initial: 500, years: NaN })).toHaveLength(1);
  });
  it('valeurs négatives neutralisées, jamais de NaN', () => {
    const p = projectGrowth({ ...base, initial: -100, monthly: -50, annualReturn: -2, years: 3 });
    for (const pt of p) expect(Number.isFinite(pt.value)).toBe(true);
    expect(p.at(-1)!.value).toBeGreaterThanOrEqual(0);
  });
  it('déterministe', () => {
    const i = { ...base, initial: 5000, monthly: 300, annualReturn: 0.05, years: 25 };
    expect(projectGrowth(i)).toEqual(projectGrowth(i));
  });
});

describe('versement requis', () => {
  it('atteint exactement la cible', () => {
    const m = requiredMonthly(300000, 5000, 0.05, 25);
    expect(projectGrowth({ ...base, initial: 5000, monthly: m, annualReturn: 0.05, years: 25 }).at(-1)!.value).toBeCloseTo(300000, 2);
  });
  it('nul si le capital suffit ou si la durée est nulle', () => {
    expect(requiredMonthly(1000, 2000, 0.03, 5)).toBe(0);
    expect(requiredMonthly(1000, 0, 0.03, 0)).toBe(0);
  });
  it('rendement nul : division simple', () => expect(requiredMonthly(12000, 0, 0, 1)).toBeCloseTo(1000, 10));
});
