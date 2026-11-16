/** Cartes « Pour aller plus loin » des guides : combien en montrer d'emblée, lesquelles replier. */
export const NEXT_VISIBLE = 4;

/**
 * Jusqu'à deux premiers éléments de chaque liste (simulateurs, puis fiches), complétés par l'autre
 * liste s'il en manque, pour atteindre `visible` ; le reste est replié, dans le même ordre.
 */
export function splitNext<T>(sims: T[], fiches: T[], visible = NEXT_VISIBLE): [T[], T[]] {
  const half = Math.floor(visible / 2);
  const nSims = Math.min(sims.length, Math.max(half, visible - fiches.length));
  const nFiches = Math.min(fiches.length, visible - nSims);
  return [[...sims.slice(0, nSims), ...fiches.slice(0, nFiches)], [...sims.slice(nSims), ...fiches.slice(nFiches)]];
}
