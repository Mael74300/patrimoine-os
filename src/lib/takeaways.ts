import { fmtEur, fmtPct } from './finance';

/**
 * Phrases « Concrètement » affichées sous les résultats des simulateurs.
 * Elles ne font que reformuler les résultats calculés (aucun chiffre réglementaire ici).
 */

/** Crédit : ce que l'on rend au total pour la somme empruntée. */
export function creditTakeaway(p: { principal: number; years: number; monthlyTotal: number; totalCost: number }): string {
  if (!(p.principal > 0) || !(p.years > 0)) return '';
  const rendu = p.principal + p.totalCost;
  const par100 = Math.round((p.totalCost / p.principal) * 100);
  return `Vous recevez ${fmtEur(p.principal)} et vous rendez ${fmtEur(rendu)} en tout, soit ${fmtEur(p.monthlyTotal)} par mois pendant ${p.years} an${p.years > 1 ? 's' : ''}. Le crédit vous coûte donc ${fmtEur(p.totalCost)} de plus que la somme reçue (environ ${par100} € pour 100 € empruntés).`;
}

/** Taux d'endettement : la part des revenus prise par les crédits, et ce qui reste. */
export function debtRatioTakeaway(p: { income: number; ratioAfter: number; remainingAfter: number; withinRef: boolean; refLabel: string }): string {
  if (!(p.income > 0)) return '';
  const part = `Sur 100 € de revenus, ${Math.round(p.ratioAfter * 100)} € partent dans les crédits.`;
  const reste = p.remainingAfter < 0
    ? ` Après vos autres charges, il manque ${fmtEur(-p.remainingAfter)} par mois : ce projet n'est pas tenable avec ces chiffres.`
    : ` Une fois les autres charges payées, il vous reste ${fmtEur(p.remainingAfter)} par mois pour vivre.`;
  const repere = p.withinRef
    ? ` Vous êtes sous le repère de ${p.refLabel}.`
    : ` Vous dépassez le repère de ${p.refLabel} : la banque peut refuser ou demander un autre montage.`;
  return part + reste + repere;
}

/** Rendement réel : traduit le taux annuel équivalent en gain sur 100 € placés. */
export function performanceTakeaway(p: { invested: number; gain: number; annualized: number | null }): string {
  if (!(p.invested > 0) || p.annualized === null) return '';
  const verbe = p.gain >= 0 ? `gagné ${fmtEur(p.gain)}` : `perdu ${fmtEur(-p.gain)}`;
  return `Vous avez versé ${fmtEur(p.invested)} et ${verbe}. Ramené à une année, c'est comme si l'argent placé avait rapporté ${fmtPct(p.annualized)} par an en moyenne. Ce taux sert à comparer avec un livret ou un autre placement sur la même durée.`;
}
