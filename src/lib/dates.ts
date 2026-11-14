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

/** « 12 novembre 2026 », « 1er août 2026 » ou « 2026-11-12 » → « 2026-11-12 » ; null si la date n'est pas reconnue. */
export function isoDate(value: string): string | null {
  const v = value.trim().replace(/ /g, ' ');
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return fmtDate(v) === v ? null : v;
  const m = /^(\d{1,2})(?:er)? (\S+) (\d{4})$/.exec(v);
  if (!m) return null;
  const mo = MONTHS.indexOf(m[2].toLowerCase());
  const d = Number(m[1]);
  if (mo < 0 || d < 1 || d > 31) return null;
  return `${m[3]}-${String(mo + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/**
 * Rubriques d'une fiche revérifiées après la relecture complète de la fiche (`verifiedOn`).
 * Renvoie la date la plus récente et les rubriques concernées, ou null si aucune n'est plus récente :
 * la page peut alors dire « relue en entier le … » sans contredire les dates des rubriques.
 */
export function laterRubricUpdate(
  verifiedOn: string,
  rubrics: { label: string; checked?: { verified: boolean; asOf?: string } }[],
): { date: string; labels: string[] } | null {
  const dated = rubrics
    .filter((r) => r.checked?.verified && r.checked.asOf)
    .map((r) => ({ label: r.label, date: isoDate(r.checked!.asOf!) }))
    .filter((r): r is { label: string; date: string } => r.date !== null && r.date > verifiedOn);
  if (dated.length === 0) return null;
  const date = dated.map((r) => r.date).sort().at(-1)!;
  return { date, labels: dated.filter((r) => r.date === date).map((r) => r.label) };
}
