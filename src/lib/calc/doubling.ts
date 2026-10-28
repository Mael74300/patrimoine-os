import { clamp, num } from './common';

/**
 * Temps pour multiplier un capital, sans versement, à rendement annuel constant supposé.
 * - Durée exacte : ln(multiple) / ln(1 + rendement).
 * - Règle de 72 (approximation de tête) : 72 / rendement en %, valable pour doubler ; pour un autre multiple,
 *   on la généralise par 72 × ln(multiple) / ln(2) / rendement en %.
 * Le rendement est une hypothèse saisie, jamais une prévision.
 */
export type DoublingInput = {
  initial: number;
  /** Rendement annuel nominal supposé (0,05 = 5 %). */
  annualReturn: number;
  /** Inflation annuelle supposée, pour la durée en pouvoir d'achat (0 = non utilisée). */
  inflation: number;
  /** Multiple visé (2 = doubler). */
  multiple: number;
};

export type DoublingResult = {
  multiple: number;
  /** Capital visé (initial × multiple). */
  target: number;
  /** Années pour atteindre le multiple en valeur nominale, ou null si le rendement n'est pas positif. */
  exactYears: number | null;
  /** Estimation par la règle de 72 (généralisée), ou null si le rendement n'est pas positif. */
  rule72Years: number | null;
  /** rule72Years − exactYears, en années. */
  rule72Gap: number | null;
  /** Rendement réel annuel : (1 + rendement) / (1 + inflation) − 1. */
  realReturn: number;
  /** Années pour atteindre le multiple en pouvoir d'achat, ou null si le rendement réel n'est pas positif. */
  realYears: number | null;
};

function yearsToMultiple(rate: number, multiple: number): number | null {
  if (!(rate > 0) || !(multiple > 1)) return null;
  return Math.log(multiple) / Math.log(1 + rate);
}

export function doubling(input: DoublingInput): DoublingResult {
  const initial = Math.max(0, num(input.initial));
  const rate = clamp(input.annualReturn, -0.99, 10, 0);
  const inflation = clamp(input.inflation, -0.99, 10, 0);
  const multiple = clamp(input.multiple, 1, 1000, 2);
  const exactYears = yearsToMultiple(rate, multiple);
  const rule72Years = rate > 0 && multiple > 1 ? (72 * (Math.log(multiple) / Math.log(2))) / (rate * 100) : null;
  const realReturn = (1 + rate) / (1 + inflation) - 1;
  return {
    multiple,
    target: initial * multiple,
    exactYears,
    rule72Years,
    rule72Gap: exactYears !== null && rule72Years !== null ? rule72Years - exactYears : null,
    realReturn,
    realYears: yearsToMultiple(realReturn, multiple),
  };
}
