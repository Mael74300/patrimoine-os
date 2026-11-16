/** Sommaire « Sur cette page » des guides et des fiches : ancres et rubrique en cours (fonctions pures). */

/** Identifiant d’ancre stable d’une rubrique (sans accents). */
export function sectionId(heading: string): string {
  return 'rub-' + heading.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Rubrique en cours de lecture : la dernière dont le titre est passé sous la ligne de lecture
 * (`line` px sous le haut de la fenêtre). En bas de page, la dernière rubrique visible l’emporte,
 * sinon une rubrique courte en fin de page ne serait jamais signalée. −1 avant la première rubrique.
 * @param tops position de chaque titre par rapport au haut de la fenêtre (getBoundingClientRect().top)
 */
export function activeSection(tops: number[], line: number, atBottom = false, viewport = Infinity): number {
  let idx = -1;
  for (let i = 0; i < tops.length; i++) if (tops[i] <= line) idx = i;
  if (atBottom) {
    for (let i = tops.length - 1; i > idx; i--) if (tops[i] < viewport) return i;
  }
  return idx;
}
