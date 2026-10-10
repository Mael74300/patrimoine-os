/**
 * Conventions communes à tous les modules de calcul.
 * - Taux en décimal (0,05 = 5 %), montants en euros, durées en années.
 * - Taux mensuel d'un PLACEMENT : équivalent actuariel (1 + r)^(1/12) − 1.
 * - Taux mensuel d'un CRÉDIT : taux nominal / 12 (convention bancaire française).
 * - Toute entrée non finie est remplacée par une valeur neutre ; aucune fonction ne renvoie NaN.
 * - Les fonctions sont pures et déterministes : mêmes hypothèses, mêmes résultats.
 */

/** Nombre fini ou valeur de repli. */
export const num = (v: unknown, fallback = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);

/** Nombre fini, borné. */
export const clamp = (v: unknown, min: number, max: number, fallback = min): number => Math.min(max, Math.max(min, num(v, fallback)));

/** Durée en années entières, ≥ 0. */
export const years = (v: unknown, max = 100): number => Math.floor(clamp(v, 0, max, 0));

/** Division protégée. */
export const safeDiv = (a: number, b: number, fallback = 0): number => (b === 0 || !Number.isFinite(b) ? fallback : a / b);

/** Taux mensuel actuariel équivalent à un taux annuel (placements). */
export function monthlyRate(annual: number): number {
  const a = Math.max(-0.99, num(annual));
  return Math.pow(1 + a, 1 / 12) - 1;
}

/** Rendement net de frais : (1 + r) × (1 − f) − 1. */
export function netOfFees(annualReturn: number, annualFees: number): number {
  return (1 + num(annualReturn)) * (1 - clamp(annualFees, 0, 1)) - 1;
}

/** Rendement réel (corrigé de l'inflation) : (1 + r) / (1 + i) − 1. */
export function realRate(nominal: number, inflation: number): number {
  return safeDiv(1 + num(nominal), 1 + num(inflation), 1) - 1;
}

/** Valeur exprimée en euros d'aujourd'hui. */
export function deflate(value: number, inflation: number, y: number): number {
  return safeDiv(value, Math.pow(1 + num(inflation), y), value);
}

/** Imposition simplifiée des gains : un taux unique, jamais sur une perte. */
export function afterTax(value: number, invested: number, taxRate: number): number {
  const gains = Math.max(0, value - invested);
  return value - gains * clamp(taxRate, 0, 1);
}
