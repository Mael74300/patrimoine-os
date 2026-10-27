import { clamp, num } from './common';

/**
 * Rendement réel d'un placement (taux de rendement interne) à partir de ce qui a été versé et de la valeur finale.
 * - Un versement initial à l'origine, puis un versement mensuel en fin de chaque mois, sur toute la durée.
 * - La valeur finale est celle constatée à la fin du dernier mois.
 * - Le taux mensuel est trouvé par dichotomie ; le rendement annuel est le taux annuel actuariel équivalent (1 + m)^12 − 1.
 * Tout est fondé sur les montants saisis ; aucune prévision.
 */
export type PerformanceInput = {
  initial: number;
  monthly: number;
  /** Durée du placement, en mois entiers. */
  months: number;
  finalValue: number;
};

export type PerformanceResult = {
  /** Total versé (versement initial + versements mensuels). */
  invested: number;
  /** Valeur finale − total versé. */
  gain: number;
  /** Gain / total versé (rendement cumulé, non annualisé), ou null si rien n'a été versé. */
  cumulative: number | null;
  /** Rendement annuel équivalent (TRI), ou null s'il n'est pas défini (rien versé, durée nulle, valeur finale négative). */
  annualized: number | null;
};

/** Valeur finale d'un placement au taux mensuel m, pour les versements saisis. */
function valueAt(initial: number, monthly: number, months: number, m: number): number {
  if (Math.abs(m) < 1e-12) return initial + monthly * months;
  const g = Math.pow(1 + m, months);
  return initial * g + (monthly * (g - 1)) / m;
}

export function performance(input: PerformanceInput): PerformanceResult {
  const initial = Math.max(0, num(input.initial));
  const monthly = Math.max(0, num(input.monthly));
  const months = Math.floor(clamp(input.months, 0, 960, 0));
  const finalValue = Math.max(0, num(input.finalValue));

  const invested = initial + monthly * months;
  const gain = finalValue - invested;
  const cumulative = invested > 0 ? gain / invested : null;
  if (invested <= 0 || months === 0) return { invested, gain, cumulative, annualized: null };

  // valueAt est croissante en m : dichotomie sur le taux mensuel.
  let lo = -0.99;
  let hi = 1;
  if (valueAt(initial, monthly, months, lo) > finalValue) return { invested, gain, cumulative, annualized: -1 };
  if (valueAt(initial, monthly, months, hi) < finalValue) return { invested, gain, cumulative, annualized: null };
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (valueAt(initial, monthly, months, mid) < finalValue) lo = mid;
    else hi = mid;
  }
  const m = (lo + hi) / 2;
  return { invested, gain, cumulative, annualized: Math.pow(1 + m, 12) - 1 };
}
