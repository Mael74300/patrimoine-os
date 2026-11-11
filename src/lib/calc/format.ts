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
export const fmtYears = (n: number | null) => (n === null ? 'non atteint en 100 ans' : n === 0 ? 'déjà atteint' : `${n} an${n > 1 ? 's' : ''}`);
