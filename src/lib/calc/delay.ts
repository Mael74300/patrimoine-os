import { clamp, monthlyRate, num } from './common';

/**
 * Coût d'attendre : même versement mensuel, commencé tout de suite ou après un délai, pour le même horizon d'arrivée.
 * Versements en fin de mois, rendement annuel constant supposé (taux mensuel actuariel), avant frais et impôts.
 * Le rendement est une hypothèse saisie, jamais une prévision.
 */
export type DelayInput = {
  monthly: number;
  annualReturn: number;
  /** Horizon d'arrivée, en années à partir d'aujourd'hui. */
  years: number;
  /** Délai avant de commencer à verser, en années (inférieur à l'horizon). */
  delayYears: number;
};

export type DelayResult = {
  months: number;
  delayMonths: number;
  /** Capital à l'horizon en commençant tout de suite. */
  startNow: number;
  /** Capital à l'horizon en commençant après le délai. */
  startLater: number;
  investedNow: number;
  investedLater: number;
  /** startNow − startLater : capital perdu à l'arrivée en attendant. */
  cost: number;
  /** Versement mensuel nécessaire après le délai pour atteindre le même capital que `startNow` (null si impossible : plus aucun mois de versement). */
  catchUpMonthly: number | null;
};

/** Valeur acquise de 1 € versé chaque fin de mois pendant n mois. */
function annuityFactor(n: number, m: number): number {
  if (n <= 0) return 0;
  return Math.abs(m) < 1e-12 ? n : (Math.pow(1 + m, n) - 1) / m;
}

export function delayCost(input: DelayInput): DelayResult {
  const monthly = Math.max(0, num(input.monthly));
  const months = Math.floor(clamp(input.years, 0, 80, 0) * 12);
  const delayMonths = Math.min(months, Math.floor(clamp(input.delayYears, 0, 80, 0) * 12));
  const m = monthlyRate(input.annualReturn);
  const nLater = months - delayMonths;
  const fNow = annuityFactor(months, m);
  const fLater = annuityFactor(nLater, m);
  const startNow = monthly * fNow;
  const startLater = monthly * fLater;
  return {
    months,
    delayMonths,
    startNow,
    startLater,
    investedNow: monthly * months,
    investedLater: monthly * nLater,
    cost: startNow - startLater,
    catchUpMonthly: fLater > 0 ? (monthly * fNow) / fLater : null,
  };
}
