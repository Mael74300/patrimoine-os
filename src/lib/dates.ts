/**
 * Dates affichées au lecteur : toujours en toutes lettres (« 8 novembre 2026 », « 1er août 2026 »),
 * jamais au format machine « 2026-11-08 ». Les données peuvent garder le format ISO (tri, révisions,
 * données structurées) ; seul l'affichage passe par `fmtDate`.
 */
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

/** « 2026-11-08 » → « 8 novembre 2026 » ; « 2026-08-01 » → « 1er août 2026 ». Un texte déjà en lettres est rendu tel quel. */
export function fmtDate(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return value;
  const [, y, mo, d] = m;
  const day = Number(d);
  const month = MONTHS[Number(mo) - 1];
  if (!month || day < 1 || day > 31) return value;
  // Espaces insécables : la date ne se coupe pas en fin de ligne.
  return `${day === 1 ? '1er' : day} ${month} ${y}`;
}
