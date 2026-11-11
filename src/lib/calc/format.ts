/**
 * Formatage français. Les espaces fines insécables (U+202F) et insécables (U+00A0) sont unifiés,
 * pour un rendu identique entre le pré-rendu (Node) et le navigateur.
 */
const nbsp = (s: string) => s.replace(/[  ]/g, ' ');
/**
 * Signe moins typographique (U+2212) au lieu du trait d'union « - » que renvoie `Intl` :
 * « −392 € » se lit comme un montant négatif, pas comme un tiret collé au nombre.
 */
export const MINUS = '\u2212';
const typo = (s: string) => nbsp(s).replace(/^-/, MINUS);
const eur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const eur2 = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 2 });
const n1 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

export const fmtEur = (n: number) => (Number.isFinite(n) ? typo(eur.format(Math.abs(n) < 0.5 ? 0 : n)) : '—');
export const fmtEur2 = (n: number) => (Number.isFinite(n) ? typo(eur2.format(n)) : '—');
export const fmtPct = (n: number) => (Number.isFinite(n) ? typo(pct.format(n)) : '—');
export const fmtNum = (n: number) => (Number.isFinite(n) ? typo(n1.format(n)) : '—');
/**
 * Écart entre deux taux, en points de pourcentage : 3,71 % − 3 % = « 0,71 point » (et non « 0,71 % »,
 * qui voudrait dire 0,71 % du taux). `diff` est une différence de taux décimaux (0,0071).
 */
export const fmtPts = (diff: number, maximumFractionDigits = 2) => {
  if (!Number.isFinite(diff)) return '—';
  const v = Number((diff * 100).toFixed(maximumFractionDigits));
  const s = typo(v.toLocaleString('fr-FR', { maximumFractionDigits }));
  return `${s}\u00a0${Math.abs(v) >= 2 ? 'points' : 'point'}`;
};
/** « 1 an », « 12 ans », « 2,5 ans » : espace insécable entre le nombre et l'unité (pas de « 18 » seul en fin de ligne). */
export const fmtAns = (n: number) => `${typo(n1.format(n))}\u00a0an${Math.abs(n) >= 2 ? 's' : ''}`;
export const fmtYears = (n: number | null) => (n === null ? 'non atteint en 100\u00a0ans' : n === 0 ? 'déjà atteint' : fmtAns(n));
/**
 * Une durée en mois, dite comme on la dit à l'oral : 145 → « 12 ans et 1 mois », 18 → « 1 an et 6 mois »,
 * 8 → « 8 mois », 24 → « 2 ans ». Arrondie au mois entier supérieur (une durée commencée compte).
 * Un seul format pour tous les simulateurs, au lieu de « mois 145 » ou « 1 an 6 mois ».
 */
export const fmtMonths = (months: number) => {
  if (!Number.isFinite(months)) return '—';
  const total = Math.max(0, Math.ceil(months - 1e-9));
  const y = Math.floor(total / 12);
  const m = total % 12;
  const ans = y ? `${y}\u00a0an${y > 1 ? 's' : ''}` : '';
  const mois = m || !y ? `${m}\u00a0mois` : '';
  return [ans, mois].filter(Boolean).join(' et ');
};
