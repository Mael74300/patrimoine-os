/**
 * Nombres saisis dans les champs, au format français : « 200 000 », « 3,5 ».
 * Le séparateur des milliers est une espace insécable (comme dans le reste du site).
 */

const NBSP = ' ';

/** Affiche un nombre comme on l'écrit en français, sans arrondir au-delà de `maxDecimals` chiffres après la virgule. */
export function formatFr(n: number, maxDecimals = 4): string {
  if (!Number.isFinite(n)) return '';
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: maxDecimals })
    .format(n)
    .replace(/[\s  ]/g, NBSP)
    .replace('−', '-');
}

/**
 * Lit un nombre tapé à la française ou à l'anglaise : espaces ignorées, virgule ou point décimal,
 * signe moins ordinaire ou typographique. Renvoie NaN si le texte n'est pas (encore) un nombre.
 */
export function parseFr(text: string): number {
  const t = text.replace(/[\s  ]/g, '').replace('−', '-').replace(',', '.');
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(t)) return NaN;
  return parseFloat(t);
}

/**
 * Pendant la frappe : regroupe les milliers d'un nombre entier tapé en fin de champ (« 2500000 » → « 2 500 000 »).
 * Un nombre décimal en cours de frappe (« 3, ») ou un texte incomplet (« - ») est laissé tel quel.
 */
export function liveFormatFr(text: string): string {
  if (!/^-?[\d\s  ]+$/.test(text)) return text;
  const n = parseFr(text);
  return Number.isFinite(n) ? formatFr(n, 0) : text;
}

/** Valeur après un appui sur flèche haut ou bas : un pas de plus ou de moins, bornée, sans erreur d'arrondi binaire. */
export function stepValue(current: number, step: number, dir: 1 | -1, min = -Infinity, max = Infinity): number {
  const decimals = (String(step).split('.')[1] ?? '').length;
  const f = Math.pow(10, decimals);
  const next = Math.round((current + dir * step) * f) / f;
  return Math.min(max, Math.max(min, next));
}
