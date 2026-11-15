import { num } from './common';

/** Décomposition d'une valeur projetée : ce que l'épargnant a versé et ce que le placement a ajouté (ou retiré). */
export type ProjectionSplit = { contributed: number; gains: number };

export function projectionSplit(value: number, contributed: number): ProjectionSplit {
  const c = Math.max(0, num(contributed));
  return { contributed: c, gains: num(value) - c };
}

/** Total versé après `years` années pleines : capital initial + 12 versements par an. */
export function totalContributed(initial: number, monthly: number, years: number): number {
  return Math.max(0, num(initial)) + Math.max(0, num(monthly)) * 12 * Math.max(0, Math.floor(num(years)));
}

/**
 * Mois où le total versé dépasse un plafond de versements (capital initial puis un versement par mois).
 * 0 si le capital initial le dépasse déjà ; null s'il n'est pas dépassé sur la durée (années pleines).
 */
export function monthCapExceeded(initial: number, monthly: number, years: number, cap: number): number | null {
  const start = Math.max(0, num(initial));
  const perMonth = Math.max(0, num(monthly));
  const months = Math.max(0, Math.floor(num(years))) * 12;
  if (start > cap) return 0;
  if (perMonth <= 0) return null;
  const month = Math.floor((cap - start) / perMonth) + 1;
  return month <= months ? month : null;
}

/**
 * Ce qu'une durée de projection fait dépasser : des versements mensuels après la dernière année où l'on peut verser
 * (`deposits`), et une durée au-delà de laquelle le taux du contrat ne s'applique plus (`contract`). Années pleines.
 */
export function durationExceeded(
  monthly: number,
  years: number,
  limit: { depositYears: number; contractYears: number },
): { deposits: boolean; contract: boolean } {
  const y = Math.max(0, Math.floor(num(years)));
  return { deposits: num(monthly) > 0 && y > limit.depositYears, contract: y > limit.contractYears };
}
