import { clamp, monthlyRate, num } from './common';

/**
 * Durée nécessaire pour atteindre un capital visé avec un capital de départ et un versement mensuel,
 * à rendement annuel supposé constant. Chaque mois : capital = capital × (1 + taux mensuel équivalent) + versement (fin de mois).
 * Le rendement est une hypothèse saisie, jamais une prévision.
 */
export type TimeToTargetInput = {
  initial: number;
  monthly: number;
  /** Rendement annuel supposé (0,05 = 5 %). */
  annualRate: number;
  target: number;
};

export type TimeToTargetResult = {
  /** Nombre de mois avant d'atteindre l'objectif ; null s'il n'est pas atteint en 100 ans. */
  months: number | null;
  /** Durée en années (décimale) ; null si non atteint. */
  years: number | null;
  /** Total versé (capital de départ + versements) à l'arrivée. */
  contributed: number;
  /** Capital à l'arrivée. */
  finalValue: number;
  /** Intérêts = capital à l'arrivée − total versé. */
  interest: number;
  /** Part de l'objectif apportée par les intérêts (0 à 1). */
  interestShare: number;
  /** Durée sans aucun rendement (versements seuls) ; null si non atteint. */
  monthsWithoutReturn: number | null;
  reached: boolean;
};

export const MAX_MONTHS = 1200;

export function timeToTarget(input: TimeToTargetInput): TimeToTargetResult {
  const initial = Math.max(0, num(input.initial));
  const monthly = Math.max(0, num(input.monthly));
  const target = Math.max(0, num(input.target));
  const i = monthlyRate(clamp(input.annualRate, -0.99, 10, 0));
  let value = initial;
  let months = 0;
  while (value < target && months < MAX_MONTHS) {
    value = value * (1 + i) + monthly;
    months++;
  }
  const reached = value >= target;
  const contributed = initial + monthly * months;
  const interest = value - contributed;
  let monthsWithoutReturn: number | null = null;
  if (initial >= target) monthsWithoutReturn = 0;
  else if (monthly > 0) {
    const m = Math.ceil((target - initial) / monthly - 1e-9);
    monthsWithoutReturn = m <= MAX_MONTHS ? m : null;
  }
  return {
    months: reached ? months : null,
    years: reached ? months / 12 : null,
    contributed,
    finalValue: value,
    interest,
    interestShare: value > 0 ? Math.max(0, interest) / value : 0,
    monthsWithoutReturn,
    reached,
  };
}
