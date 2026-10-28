import { clamp, monthlyRate, num } from './common';

/**
 * Rendement annuel nécessaire pour atteindre un capital visé à une échéance donnée, avec un capital de départ
 * et un versement mensuel (fin de mois). Résolu par dichotomie sur le même modèle que « Durée pour atteindre un capital » :
 * capital = capital × (1 + taux mensuel équivalent) + versement. Le rendement obtenu est une exigence, jamais une prévision.
 */
export type RequiredReturnInput = {
  initial: number;
  monthly: number;
  /** Durée en années (arrondie au mois). */
  years: number;
  target: number;
};

export type RequiredReturnResult = {
  /** Rendement annuel nécessaire (0,05 = 5 %) ; null si hors de la plage [-50 % ; 100 %]. */
  annualRate: number | null;
  /** Total versé (capital de départ + versements) à l'échéance. */
  contributed: number;
  /** Capital atteint sans aucun rendement. */
  withoutReturn: number;
  /** Vrai si l'objectif est déjà atteint sans rendement (rendement nécessaire ≤ 0). */
  alreadyReached: boolean;
  months: number;
};

export const MIN_RATE = -0.5;
export const MAX_RATE = 1;

/** Capital final après `months` mois à un rendement annuel donné. */
export function futureValue(initial: number, monthly: number, annualRate: number, months: number): number {
  const i = monthlyRate(annualRate);
  let v = initial;
  for (let m = 0; m < months; m++) v = v * (1 + i) + monthly;
  return v;
}

export function requiredReturn(input: RequiredReturnInput): RequiredReturnResult {
  const initial = Math.max(0, num(input.initial));
  const monthly = Math.max(0, num(input.monthly));
  const target = Math.max(0, num(input.target));
  const months = Math.round(clamp(input.years, 0, 100, 0) * 12);
  const contributed = initial + monthly * months;
  const withoutReturn = contributed;
  if (months === 0 || withoutReturn >= target) {
    return { annualRate: months === 0 && target > initial ? null : 0, contributed, withoutReturn, alreadyReached: withoutReturn >= target, months };
  }
  if (futureValue(initial, monthly, MAX_RATE, months) < target) {
    return { annualRate: null, contributed, withoutReturn, alreadyReached: false, months };
  }
  let lo = 0;
  let hi = MAX_RATE;
  for (let k = 0; k < 80; k++) {
    const mid = (lo + hi) / 2;
    if (futureValue(initial, monthly, mid, months) < target) lo = mid;
    else hi = mid;
  }
  return { annualRate: hi, contributed, withoutReturn, alreadyReached: false, months };
}
