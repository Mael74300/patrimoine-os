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

const dureeEnMois = (m: number): string => {
  const y = Math.floor(m / 12);
  const r = m % 12;
  return [y ? `${y} an${y > 1 ? 's' : ''}` : '', r ? `${r} mois` : ''].filter(Boolean).join(' et ');
};

/** Retraits réguliers : combien de temps le capital tient, et le retrait qui tiendrait tout l'horizon. */
export function withdrawalTakeaway(p: { capital: number; monthly: number; years: number; monthsUntilEmpty: number | null; remaining: number; totalWithdrawn: number; sustainable: number }): string {
  if (!(p.capital > 0) || !(p.monthly > 0) || !(p.years >= 1)) return '';
  const ans = `${p.years} an${p.years > 1 ? 's' : ''}`;
  if (p.monthsUntilEmpty !== null) {
    return `En retirant ${fmtEur(p.monthly)} le premier mois sur un capital de ${fmtEur(p.capital)}, il n'y a plus rien au bout de ${dureeEnMois(p.monthsUntilEmpty)}, après ${fmtEur(p.totalWithdrawn)} retirés en tout. Pour tenir ${ans}, le premier retrait devrait rester sous ${fmtEur(p.sustainable)} par mois.`;
  }
  return `En retirant ${fmtEur(p.monthly)} le premier mois sur un capital de ${fmtEur(p.capital)}, vous avez encore ${fmtEur(p.remaining)} au bout de ${ans}, après ${fmtEur(p.totalWithdrawn)} retirés en tout. Le premier retrait pourrait aller jusqu'à ${fmtEur(p.sustainable)} par mois sans épuiser le capital avant ${ans}. Tout repose sur le rendement supposé : s'il est plus faible, le capital dure moins longtemps.`;
}

/** Épargne de précaution : montant à réunir, ce qui manque et en combien de temps avec le versement saisi. */
export function precautionTakeaway(p: { target: number; savings: number; monthlySaving: number; reachedAt: number | null }): string {
  if (!(p.target > 0)) return '';
  const gap = Math.max(0, p.target - p.savings);
  if (gap === 0) return `Votre épargne de ${fmtEur(p.savings)} couvre déjà le montant visé de ${fmtEur(p.target)} : en cas d'imprévu, vous avez de quoi tenir sans toucher à vos autres placements.`;
  const base = `Pour être à l'abri d'un imprévu, il faut mettre ${fmtEur(p.target)} de côté, disponibles à tout moment. Vous en avez ${fmtEur(p.savings)} : il manque ${fmtEur(gap)}.`;
  if (!(p.monthlySaving > 0)) return `${base} Sans versement mensuel, ce manque ne se comble pas.`;
  if (p.reachedAt === null) return `${base} Avec ${fmtEur(p.monthlySaving)} par mois, ce montant n'est pas atteint en 50 ans : il faut verser davantage.`;
  return `${base} Avec ${fmtEur(p.monthlySaving)} par mois, vous y arrivez en ${dureeEnMois(p.reachedAt)}.`;
}

/** Rembourser ou investir : l'option qui laisse le plus à l'horizon, avec le compromis certain / incertain. */
export function prepayTakeaway(p: { lump: number; advantageInvest: number; interestSaved: number; breakEvenReturn: number | null }): string {
  if (!(p.lump > 0)) return '';
  const certain = `Rembourser vous fait économiser ${fmtEur(p.interestSaved)} d'intérêts : ce gain est certain, alors que le rendement d'un placement n'est qu'une hypothèse.`;
  const seuil = p.breakEvenReturn === null ? '' : ` Les deux options s'équivalent avec un rendement brut d'environ ${fmtPct(p.breakEvenReturn)} par an ; en dessous, rembourser l'emporte.`;
  if (Math.round(p.advantageInvest) === 0) return `Avec ces hypothèses, investir ${fmtEur(p.lump)} ou les utiliser pour rembourser votre crédit vous laisse à peu près le même patrimoine à la fin. ${certain}`;
  return p.advantageInvest > 0
    ? `Avec ces hypothèses, placer ${fmtEur(p.lump)} vous laisse ${fmtEur(p.advantageInvest)} de plus à la fin du crédit que les utiliser pour rembourser. ${certain}${seuil}`
    : `Avec ces hypothèses, utiliser ${fmtEur(p.lump)} pour rembourser votre crédit vous laisse ${fmtEur(-p.advantageInvest)} de plus à la fin que les placer. ${certain}${seuil}`;
}

/** Immobilier locatif : ce que rapporte le bien, ce que le propriétaire paie de sa poche, et le patrimoine à l'horizon. */
export function rentalTakeaway(p: { totalCost: number; netYield: number; monthlyCashflow: number; monthlyCashflowAfterTax: number | null; horizon: number; netEquity: number }): string {
  if (!(p.totalCost > 0) || !Number.isFinite(p.netYield)) return '';
  const rendement = `Chaque année, les loyers encaissés, une fois les charges payées, représentent environ ${fmtPct(p.netYield)} de ce que coûtent l'achat, les frais et les travaux (avant crédit et impôt).`;
  const mois = Math.round(p.monthlyCashflow);
  const tresorerie = mois >= 0
    ? ` Chaque mois, le loyer couvre la mensualité du crédit et les charges, et il reste environ ${fmtEur(mois)} avant impôt.`
    : ` Chaque mois, le loyer ne suffit pas à payer la mensualité du crédit et les charges : il faut sortir environ ${fmtEur(-mois)} de votre poche avant impôt.`;
  let apres = '';
  if (p.monthlyCashflowAfterTax !== null) {
    const a = Math.round(p.monthlyCashflowAfterTax);
    apres = a >= 0
      ? ` Après l'impôt estimé de la première année, il reste environ ${fmtEur(a)} par mois.`
      : ` Après l'impôt estimé de la première année, l'effort mensuel est d'environ ${fmtEur(-a)}.`;
  }
  const fin = ` À ${p.horizon} an${p.horizon > 1 ? 's' : ''}, une fois le crédit déduit, le bien représenterait environ ${fmtEur(p.netEquity)} de patrimoine : c'est une estimation qui suppose que le prix et les loyers évoluent comme saisi.`;
  return rendement + tresorerie + apres + fin;
}
