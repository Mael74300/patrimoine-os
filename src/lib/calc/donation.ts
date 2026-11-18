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

export interface TrancheDonation { base: number; taux: number; droits: number }

/**
 * Détail des droits tranche par tranche, comme dans l'exemple de Service-Public F14203 (droits au centime près, non arrondis) :
 * chaque taux ne s'applique qu'à la part comprise dans sa tranche. Seules les tranches atteintes sont renvoyées.
 */
export function detailDroitsLigneDirecte(partTaxable: number): TrancheDonation[] {
  let reste = Math.max(0, partTaxable);
  let bas = 0;
  const out: TrancheDonation[] = [];
  for (const t of BAREME_LIGNE_DIRECTE) {
    const base = Math.min(reste, t.jusqua - bas);
    if (base <= 0) break;
    out.push({ base, taux: t.taux, droits: Math.round(base * t.taux * 100) / 100 });
    reste -= base;
    bas = t.jusqua;
  }
  return out;
}

export interface DonationEstimate {
  /** Montant donné (négatif ramené à 0). */
  montant: number;
  /** Part couverte par le don familial d'argent (0 s'il ne s'applique pas). */
  donFamilial: number;
  /** Part couverte par l'abattement lié au lien de parenté. */
  abattement: number;
  /** Total reçu sans droits (don familial + abattement). */
  sansDroits: number;
  /** Part taxée au barème en ligne directe. */
  taxable: number;
  /** Droits à payer, arrondis à l'euro. */
  droits: number;
  /** Droits rapportés au montant donné (0 à 1). */
  tauxMoyen: number;
}

/**
 * Droits d'une donation en ligne directe (parent → enfant, grand-parent → petit-enfant), pour un premier don
 * du même donateur au même bénéficiaire depuis 15 ans : le don familial d'argent (s'il s'applique) et l'abattement
 * sont retirés du montant, le reste est taxé au barème. Les montants d'abattement sont passés en paramètres
 * (données vérifiées de `src/data/donationAbattements.ts` et de la fiche).
 */
export function estimerDonation(montant: number, abattement: number, donFamilial: number): DonationEstimate {
  const m = Math.max(0, Number.isFinite(montant) ? montant : 0);
  const fam = Math.min(m, Math.max(0, donFamilial));
  const abat = Math.min(m - fam, Math.max(0, abattement));
  const taxable = m - fam - abat;
  const droits = droitsDonationLigneDirecte(taxable);
  return { montant: m, donFamilial: fam, abattement: abat, sansDroits: fam + abat, taxable, droits, tauxMoyen: m > 0 ? droits / m : 0 };
}
