import { clamp, monthlyRate, num, safeDiv } from './common';
import { monthlySavingNeeded } from './precaution';

/**
 * Objectif d'épargne : versement mensuel à prévoir pour atteindre un montant (apport, voyage, travaux, véhicule…)
 * à une échéance donnée. Intérêts au taux mensuel équivalent, versements en fin de mois, avant impôt.
 */
export type SavingsGoalInput = {
  target: number;
  current: number;
  years: number;
  annualRate: number;
};

export type SavingsGoalResult = {
  months: number;
  /** Versement mensuel nécessaire (0 si l'objectif est déjà couvert). */
  monthly: number;
  /** Total des versements sur la période, sans l'épargne de départ. */
  deposits: number;
  /** Intérêts cumulés : objectif − épargne de départ − versements (≥ 0). */
  interest: number;
  /** Part de l'objectif apportée par les intérêts (0 à 1). */
  interestShare: number;
  /** Solde à la fin de chaque année (0 = départ), versement mensuel nécessaire appliqué. */
  series: number[];
};

export function savingsGoal(input: SavingsGoalInput): SavingsGoalResult {
  const target = Math.max(0, num(input.target));
  const current = Math.max(0, num(input.current));
  const months = Math.floor(clamp(input.years, 0, 60, 0)) * 12;
  const rate = clamp(input.annualRate, -0.05, 0.2, 0);
  const monthly = monthlySavingNeeded(target, current, months, rate);
  const r = monthlyRate(rate);
  const series: number[] = [current];
  let balance = current;
  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + r) + monthly;
    if (m % 12 === 0) series.push(balance);
  }
  const deposits = monthly * months;
  const reached = Math.max(target, current);
  const interest = months === 0 ? 0 : Math.max(0, balance - current - deposits);
  return { months, monthly, deposits, interest, interestShare: safeDiv(interest, reached), series };
}

/** Versement mensuel nécessaire pour plusieurs taux annuels, à objectif et durée identiques. */
export function monthlyByRate(input: Omit<SavingsGoalInput, 'annualRate'>, rates: number[]): { rate: number; monthly: number }[] {
  const months = Math.floor(clamp(input.years, 0, 60, 0)) * 12;
  return rates.map((rate) => ({ rate, monthly: monthlySavingNeeded(input.target, input.current, months, rate) }));
}

/** Versement mensuel nécessaire pour plusieurs durées (en années), à objectif et taux identiques. */
export function monthlyByDuration(input: Omit<SavingsGoalInput, 'years'>, durations: number[]): { years: number; monthly: number }[] {
  return durations.map((years) => ({ years, monthly: monthlySavingNeeded(input.target, input.current, Math.floor(clamp(years, 0, 60, 0)) * 12, input.annualRate) }));
}
