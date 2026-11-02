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
