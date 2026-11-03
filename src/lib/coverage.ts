/** Part du montant visé déjà couverte par l'épargne, entre 0 et 1 (0 si aucun montant visé). */
export function coverageRatio(savings: number, target: number): number {
  if (!(target > 0) || !(savings > 0)) return 0;
  return Math.min(1, savings / target);
}

/** Pourcentage entier arrondi à l'inférieur : on ne dit jamais « 100 % » tant qu'il manque quelque chose. */
export function coveragePercent(savings: number, target: number): number {
  return Math.floor(coverageRatio(savings, target) * 100);
}
