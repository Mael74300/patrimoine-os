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

/** Objectif d'épargne : ce que l'on verse soi-même et ce que les intérêts apportent. */
export function savingsGoalTakeaway(p: { target: number; current: number; years: number; monthly: number; deposits: number; interest: number }): string {
  if (!(p.target > 0) || !(p.years >= 1)) return '';
  const ans = `${p.years} an${p.years > 1 ? 's' : ''}`;
  if (p.monthly === 0) return `Avec ${fmtEur(p.current)} déjà épargnés, vous atteignez ${fmtEur(p.target)} en ${ans} sans rien verser de plus, grâce au taux choisi.`;
  const interets = p.interest > 0
    ? ` Les intérêts apportent ${fmtEur(p.interest)} : le reste, soit ${fmtEur(p.deposits)}, vient de vos versements.`
    : ` Avec ce taux, il n'y a pas d'intérêts : tout vient de vos versements.`;
  return `Pour disposer de ${fmtEur(p.target)} dans ${ans}, il faut mettre de côté ${fmtEur(p.monthly)} chaque mois.${interets} Plus l'échéance est lointaine, plus la mensualité baisse (voir le tableau plus bas).`;
}

/** Louer ou acheter : qui est le plus riche à l'horizon, avec la mise en garde sur les hypothèses. */
export function rentVsBuyTakeaway(p: { horizonYears: number; advantage: number; breakEvenMonth: number | null }): string {
  if (!(p.horizonYears >= 1)) return '';
  const ans = `${p.horizonYears} an${p.horizonYears > 1 ? 's' : ''}`;
  const quand = p.breakEvenMonth !== null ? ` L'achat prend l'avantage durablement à partir du mois ${p.breakEvenMonth}.` : '';
  const fin = ' Ce résultat vient uniquement des hypothèses saisies : changez le prix, le loyer ou le rendement et il peut s’inverser.';
  if (Math.round(p.advantage) === 0) return `Au bout de ${ans}, acheter et louer vous laissent à peu près le même patrimoine avec ces hypothèses.${fin}`;
  return p.advantage > 0
    ? `Au bout de ${ans}, avec ces hypothèses, vous seriez plus riche de ${fmtEur(p.advantage)} en achetant qu’en louant.${quand}${fin}`
    : `Au bout de ${ans}, avec ces hypothèses, vous seriez plus riche de ${fmtEur(-p.advantage)} en louant (et en plaçant la différence) qu’en achetant.${fin}`;
}

/** Indépendance financière : capital à réunir, avance actuelle et délai (en euros constants). */
export function fireTakeaway(p: { gap: number; withdrawalRate: number; target: number; currentWealth: number; annualSavings: number; years: number | null }): string {
  if (!(p.gap >= 0) || !Number.isFinite(p.target)) return '';
  if (p.gap === 0) return 'Vos revenus récurrents couvrent déjà vos dépenses : aucun capital n’est nécessaire pour les financer.';
  const base = `Pour financer ${fmtEur(p.gap)} de dépenses par an que vos revenus ne couvrent pas, en retirant ${fmtPct(p.withdrawalRate)} du capital la première année, il faut environ ${fmtEur(p.target)}.`;
  if (p.years === 0) return `${base} Votre patrimoine de ${fmtEur(p.currentWealth)} atteint déjà ce capital.`;
  if (p.years === null) return `${base} Avec ces hypothèses, vous ne l’atteignez pas en 100 ans.`;
  return `${base} Avec ${fmtEur(p.currentWealth)} déjà réunis et ${fmtEur(p.annualSavings)} mis de côté chaque année, vous y arrivez dans environ ${p.years} an${p.years > 1 ? 's' : ''}, en euros constants.`;
}
