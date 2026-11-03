/**
 * Écho lisible d'un grand nombre saisi dans un champ (« 250000 » → « 250 000 »).
 * Renvoie une chaîne vide quand le nombre se lit déjà bien (moins de 5 chiffres) ou n'est pas fini.
 */
export function readableNumber(n: number, unit?: string): string {
  if (!Number.isFinite(n) || Math.abs(n) < 10000) return '';
  const digits = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(n).replace(/ /g, ' ');
  return unit ? `${digits} ${unit}` : digits;
}
