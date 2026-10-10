import { clamp, num, realRate, safeDiv } from './common';

/**
 * Indépendance financière (approche par taux de retrait).
 * Aucun taux de retrait ne garantit un capital durable : rendements, inflation et ordre des performances
 * réelles diffèrent toujours des hypothèses.
 */
export type FireInput = {
  annualExpenses: number;
  currentWealth: number;
  recurringIncome: number; // revenus annuels hors travail : pension, loyers nets…
  annualSavings: number;
  nominalReturn: number;
  inflation: number;
  withdrawalRate: number;
};

/** Capital visé : dépenses non couvertes / taux de retrait (en euros d'aujourd'hui). */
export function fireTarget(annualExpenses: number, recurringIncome: number, withdrawalRate: number): number {
  const gap = Math.max(0, num(annualExpenses) - num(recurringIncome));
  if (gap === 0) return 0;
  const w = num(withdrawalRate);
  return w > 0 ? gap / w : Infinity;
}

/**
 * Années nécessaires pour atteindre la cible, en raisonnant en euros constants :
 * capital × (1 + rendement réel) + épargne annuelle (épargne revalorisée comme l'inflation).
 * Renvoie null si la cible n'est pas atteinte en 100 ans.
 */
export function yearsToTarget(input: FireInput, target = fireTarget(input.annualExpenses, input.recurringIncome, input.withdrawalRate)): number | null {
  if (!Number.isFinite(target)) return null;
  let capital = Math.max(0, num(input.currentWealth));
  if (capital >= target) return 0;
  const r = realRate(input.nominalReturn, input.inflation);
  const s = Math.max(0, num(input.annualSavings));
  for (let y = 1; y <= 100; y++) {
    capital = capital * (1 + r) + s;
    if (capital >= target) return y;
  }
  return null;
}

export type DrawdownYear = { year: number; capital: number; withdrawal: number };

/**
 * Phase de retrait : chaque début d'année, on retire les dépenses non couvertes revalorisées de l'inflation,
 * puis le capital restant progresse au rendement nominal. Renvoie la série et l'année d'épuisement éventuelle.
 */
export function drawdown(capital0: number, input: FireInput, maxYears = 60) {
  let capital = Math.max(0, num(capital0));
  const inf = clamp(input.inflation, -0.05, 0.3, 0);
  const r = clamp(input.nominalReturn, -0.5, 0.5, 0);
  const series: DrawdownYear[] = [{ year: 0, capital, withdrawal: 0 }];
  let depletedAt: number | null = null;
  for (let y = 1; y <= maxYears; y++) {
    const need = Math.max(0, num(input.annualExpenses) - num(input.recurringIncome)) * Math.pow(1 + inf, y - 1);
    const withdrawal = Math.min(need, capital);
    capital = (capital - withdrawal) * (1 + r);
    if (withdrawal < need && depletedAt === null) depletedAt = y;
    series.push({ year: y, capital: Math.max(0, capital), withdrawal });
  }
  return { series, depletedAt };
}

/** Taux d'épargne : part du revenu disponible épargnée. */
export const savingsRate = (savings: number, income: number) => safeDiv(num(savings), num(income));
