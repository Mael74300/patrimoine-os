/**
 * Durée de lecture affichée sur les guides (« Guide · 3 min de lecture »).
 * Elle se déduit du texte réellement affiché : rubriques, légendes des schémas et questions fréquentes,
 * à 200 mots par minute, arrondie à la minute (1 minute au moins).
 * Le test `src/guideReadingTime.test.ts` recompte chaque guide pour que la durée annoncée reste juste.
 */
export const WORDS_PER_MINUTE = 200;

/** Nombre de mots d'un texte : groupes séparés par des espaces qui contiennent une lettre ou un chiffre. */
export function countWords(text: string): number {
  return text.split(/\s+/).filter((t) => /[\p{L}\d]/u.test(t)).length;
}

/** Durée de lecture exacte, en minutes (non arrondie). */
export function readingMinutesExact(words: number): number {
  return words / WORDS_PER_MINUTE;
}

/** Durée de lecture arrondie à la minute la plus proche, 1 minute au moins. */
export function readingMinutes(words: number): number {
  return Math.max(1, Math.round(readingMinutesExact(words)));
}
