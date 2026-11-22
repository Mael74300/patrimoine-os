/**
 * Impression d'une page (chantier 256). Sur papier, un bloc replié n'est qu'un titre suivi de « + » : la feuille
 * d'impression masque donc les blocs fermés. Certains doivent pourtant s'imprimer ouverts, car ils portent des
 * hypothèses du calcul (réglages avancés d'un simulateur : rendement, revalorisation…) ou une liste repliée
 * seulement sur téléphone (avertissement d'un simulateur compris), ou la suite des cases Frais et Fiscalité du comparateur : un résultat imprimé sans ses hypothèses ne veut rien dire.
 */

/** Blocs à ouvrir le temps de l'impression : repliables d'un formulaire de simulateur et listes repliées sur mobile. */
export const PRINT_OPEN_SELECTOR = '.sim-form details, details.mob-fold, details.sim-notice, details.cmp-more';

type Openable = { open: boolean };

/** Ouvre les blocs fermés et renvoie ceux qu'il faudra refermer après l'impression. */
export function openForPrint<T extends Openable>(blocks: Iterable<T>): T[] {
  const opened: T[] = [];
  for (const b of blocks) {
    if (!b.open) {
      b.open = true;
      opened.push(b);
    }
  }
  return opened;
}

/** Referme les blocs ouverts pour l'impression : la page retrouve l'état choisi par le visiteur. */
export function restoreAfterPrint(opened: Openable[]): void {
  for (const b of opened) b.open = false;
}

/** Adresse imprimée en bas de page, pour retrouver la page en ligne (sans paramètre ni ancre). */
export function printedAddress(siteUrl: string, pathname: string): string {
  const base = siteUrl.replace(/\/+$/, '');
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return path === '/' ? `${base}/` : base + path;
}
