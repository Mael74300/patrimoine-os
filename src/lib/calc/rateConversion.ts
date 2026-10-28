import { clamp } from './common';

/**
 * Conversion d'un taux annuel en taux sur une période plus courte (mois, trimestre, semestre…).
 * - Taux équivalent (actuariel) : (1 + r)^(1/n) − 1. Capitalisé n fois, il redonne exactement le taux annuel.
 * - Taux proportionnel : r / n. Capitalisé n fois, il donne un rendement annuel effectif différent de r.
 * Calcul fondé uniquement sur le taux et le nombre de périodes saisis.
 */
export type RateConversionInput = {
  /** Taux annuel effectif (0,05 = 5 %). */
  annualRate: number;
  /** Nombre de périodes par an (12 = mensuel, 4 = trimestriel, 2 = semestriel). */
  periods: number;
};

export type RateConversionResult = {
  periods: number;
  /** Taux par période équivalent : (1 + r)^(1/n) − 1. */
  equivalentRate: number;
  /** Taux par période proportionnel : r / n. */
  proportionalRate: number;
  /** Taux annuel nominal capitalisé n fois équivalent : n × taux équivalent. */
  nominalRate: number;
  /** Taux annuel effectif obtenu en capitalisant n fois le taux proportionnel : (1 + r/n)^n − 1. */
  effectiveFromProportional: number;
  /** effectiveFromProportional − annualRate. */
  gap: number;
};

export function rateConversion(input: RateConversionInput): RateConversionResult {
  const r = clamp(input.annualRate, -0.99, 10, 0);
  const n = Math.round(clamp(input.periods, 1, 365, 12));
  const equivalentRate = Math.pow(1 + r, 1 / n) - 1;
  const proportionalRate = r / n;
  const effectiveFromProportional = Math.pow(1 + proportionalRate, n) - 1;
  return { periods: n, equivalentRate, proportionalRate, nominalRate: n * equivalentRate, effectiveFromProportional, gap: effectiveFromProportional - r };
}
