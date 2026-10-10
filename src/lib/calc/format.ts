/**
 * Formatage français. Les espaces fines insécables (U+202F) et insécables (U+00A0) sont unifiés,
 * pour un rendu identique entre le pré-rendu (Node) et le navigateur.
 */
const nbsp = (s: string) => s.replace(/[  ]/g, ' ');
const eur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const eur2 = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 2 });
const n1 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

export const fmtEur = (n: number) => (Number.isFinite(n) ? nbsp(eur.format(Math.abs(n) < 0.5 ? 0 : n)) : '—');
export const fmtEur2 = (n: number) => (Number.isFinite(n) ? nbsp(eur2.format(n)) : '—');
export const fmtPct = (n: number) => (Number.isFinite(n) ? nbsp(pct.format(n)) : '—');
export const fmtNum = (n: number) => (Number.isFinite(n) ? nbsp(n1.format(n)) : '—');
export const fmtYears = (n: number | null) => (n === null ? 'non atteint en 100 ans' : n === 0 ? 'déjà atteint' : `${n} an${n > 1 ? 's' : ''}`);
