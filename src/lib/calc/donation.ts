/**
 * Barème des droits de donation en ligne directe (parent → enfant, grand-parent → petit-enfant),
 * appliqué à la part taxable restant après abattement.
 * Source : Service-Public F14203 (page vérifiée le 13 mai 2026), consultée le 2026-11-13.
 */
export const BAREME_LIGNE_DIRECTE: { jusqua: number; taux: number }[] = [
  { jusqua: 8_072, taux: 0.05 },
  { jusqua: 12_109, taux: 0.1 },
  { jusqua: 15_932, taux: 0.15 },
  { jusqua: 552_324, taux: 0.2 },
  { jusqua: 902_838, taux: 0.3 },
  { jusqua: 1_805_677, taux: 0.4 },
  { jusqua: Infinity, taux: 0.45 },
];

/** Droits de donation en ligne directe sur une part taxable (après abattement), arrondis à l'euro. */
export function droitsDonationLigneDirecte(partTaxable: number): number {
  let reste = Math.max(0, partTaxable);
  let bas = 0;
  let droits = 0;
  for (const t of BAREME_LIGNE_DIRECTE) {
    const tranche = Math.min(reste, t.jusqua - bas);
    if (tranche <= 0) break;
    droits += tranche * t.taux;
    reste -= tranche;
    bas = t.jusqua;
  }
  return Math.round(droits);
}
