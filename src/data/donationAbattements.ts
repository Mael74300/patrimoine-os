/**
 * Abattements des donations (montant exonéré de droits, par donateur et par bénéficiaire, renouvelable tous les 15 ans).
 * Source : Service-Public F14203, consultée le 2026-11-09. Test : donationAbattements.test.ts.
 */
export const DONATION_ABATTEMENTS: { lien: string; montant: number }[] = [
  { lien: 'Enfant', montant: 100_000 },
  { lien: 'Époux ou partenaire de Pacs', montant: 80_724 },
  { lien: 'Petit-enfant', montant: 31_865 },
  { lien: 'Frère ou sœur', montant: 15_932 },
  { lien: 'Neveu ou nièce', montant: 7_967 },
  { lien: 'Arrière-petit-enfant', montant: 5_310 },
];

export const fmtEuros = (n: number) => `${n.toLocaleString('fr-FR').replace(/[  ]/g, ' ')} €`;
