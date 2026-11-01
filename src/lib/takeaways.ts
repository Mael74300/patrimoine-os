import { fmtEur, fmtNum, fmtPct } from './finance';

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
  const rendement = `Par an, les loyers moins les charges représentent environ ${fmtPct(p.netYield)} du coût total (achat, frais, travaux), avant crédit et impôt.`;
  const mois = Math.round(p.monthlyCashflow);
  const tresorerie = mois >= 0
    ? `\nChaque mois, le loyer couvre la mensualité du crédit et les charges : il reste environ ${fmtEur(mois)} avant impôt.`
    : `\nChaque mois, le loyer ne couvre pas la mensualité du crédit et les charges : il faut sortir environ ${fmtEur(-mois)} de votre poche avant impôt.`;
  let apres = '';
  if (p.monthlyCashflowAfterTax !== null) {
    const a = Math.round(p.monthlyCashflowAfterTax);
    apres = a >= 0
      ? `\nAprès l'impôt estimé de la première année, il reste environ ${fmtEur(a)} par mois.`
      : `\nAprès l'impôt estimé de la première année, l'effort mensuel est d'environ ${fmtEur(-a)}.`;
  }
  const fin = `\nÀ ${p.horizon} an${p.horizon > 1 ? 's' : ''}, crédit déduit, le bien représenterait environ ${fmtEur(p.netEquity)} de patrimoine (estimation, si prix et loyers évoluent comme saisi).`;
  return rendement + tresorerie + apres + fin;
}

const ansTxt = (n: number) => `${n} an${n > 1 ? 's' : ''}`;

/** Intérêts composés, « combien placer » : somme à mettre de côté aujourd'hui et part des intérêts. */
export function presentValueTakeaway(p: { target: number; years: number; monthly: number; initial: number; contributed: number; gain: number; noInitialNeeded: boolean }): string {
  if (!(p.target > 0) || !(p.years >= 1)) return '';
  if (p.noInitialNeeded) return `Avec ${fmtEur(p.monthly)} versés chaque mois pendant ${ansTxt(p.years)}, vous atteignez ${fmtEur(p.target)} sans placer de somme de départ.`;
  const gain = p.gain > 0
    ? ` Sur ces ${fmtEur(p.target)}, ${fmtEur(p.gain)} viennent des intérêts : vous n'avez à sortir de votre poche que ${fmtEur(p.contributed)}.`
    : ` Avec ce rendement, les intérêts n'apportent rien : tout vient de ce que vous versez (${fmtEur(p.contributed)}).`;
  return `Pour disposer de ${fmtEur(p.target)} dans ${ansTxt(p.years)}, il faut placer ${fmtEur(p.initial)} dès aujourd'hui, en plus de ${fmtEur(p.monthly)} par mois.${gain}`;
}

/** Intérêts composés, « en combien de temps » : durée, intérêts et temps gagné grâce au rendement. */
export function timeToTargetTakeaway(p: { target: number; months: number | null; interest: number; contributed: number; monthsWithoutReturn: number | null }): string {
  if (!(p.target > 0) || p.months === null) return '';
  const sans = p.monthsWithoutReturn !== null && p.monthsWithoutReturn > p.months
    ? ` Sans rendement, il faudrait ${dureeEnMois(p.monthsWithoutReturn)} : le rendement fait gagner ${dureeEnMois(p.monthsWithoutReturn - p.months)}.`
    : '';
  const interets = p.interest > 0 ? `, dont ${fmtEur(p.interest)} d'intérêts et ${fmtEur(p.contributed)} venant de vous` : '';
  return `Avec ces hypothèses, vous atteignez ${fmtEur(p.target)} en ${dureeEnMois(p.months)}${interets}.${sans}`;
}

/** Intérêts composés, « quel rendement » : rendement à viser et part qu'il doit fournir. */
export function requiredReturnTakeaway(p: { target: number; years: number; annualRate: number | null; contributed: number; withoutReturn: number; alreadyReached: boolean }): string {
  if (!(p.target > 0) || !(p.years >= 1) || p.annualRate === null) return '';
  if (p.alreadyReached) return `Vos versements suffisent à atteindre ${fmtEur(p.target)} en ${ansTxt(p.years)} : aucun rendement n'est nécessaire.`;
  const part = Math.max(0, p.target - p.withoutReturn);
  return `Pour passer de ${fmtEur(p.contributed)} versés à ${fmtEur(p.target)} en ${ansTxt(p.years)}, il faut que l'argent rapporte environ ${fmtPct(p.annualRate)} par an en moyenne, sans interruption. Le rendement doit fournir ${fmtEur(part)} : plus ce taux est élevé, plus il suppose de prendre des risques, et aucun taux n'est garanti.`;
}

/** Intérêts composés, « doubler son capital » : durée exacte, règle de 72 et durée en pouvoir d'achat. */
export function doublingTakeaway(p: { multiple: number; exactYears: number | null; realYears: number | null; realReturn: number }): string {
  if (!(p.multiple > 1)) return '';
  const quoi = p.multiple === 2 ? 'doubler' : `multiplier par ${fmtNum(p.multiple)}`;
  if (p.exactYears === null) return `Avec ce rendement, le capital ne peut pas être multiplié par ${fmtNum(p.multiple)} : il ne progresse pas.`;
  const exact = `Avec ces hypothèses, il faut environ ${fmtNum(p.exactYears)} ans pour ${quoi} le nombre d'euros du compte.`;
  const reel = p.realYears === null
    ? ` Mais une fois l'inflation retirée, le pouvoir d'achat n'augmente pas : vous avez plus d'euros, pas plus de choses à acheter.`
    : ` En tenant compte de l'inflation, il faut environ ${fmtNum(p.realYears)} ans pour ${quoi} ce que l'on peut réellement acheter.`;
  return exact + reel;
}

/** Intérêts simples ou composés : écart au bout de la durée. */
export function simpleVsCompoundTakeaway(p: { initial: number; years: number; simpleFinal: number; compoundFinal: number; gap: number }): string {
  if (!(p.initial > 0) || !(p.years >= 1)) return '';
  if (Math.round(p.gap) === 0) return `Avec ces hypothèses, les deux méthodes donnent le même résultat : ${fmtEur(p.compoundFinal)} après ${ansTxt(p.years)}.`;
  const sens = p.gap > 0 ? `${fmtEur(p.gap)} de plus avec les intérêts composés` : `${fmtEur(-p.gap)} de moins avec les intérêts composés`;
  return `Avec ${fmtEur(p.initial)} placés pendant ${ansTxt(p.years)}, vous obtenez ${fmtEur(p.simpleFinal)} si seuls les ${fmtEur(p.initial)} de départ rapportent, et ${fmtEur(p.compoundFinal)} si les intérêts rapportent aussi : ${sens}.`;
}

/** Coût d'attendre : capital perdu et effort de rattrapage. */
export function delayCostTakeaway(p: { monthly: number; years: number; delayYears: number; startNow: number; startLater: number; cost: number; catchUpMonthly: number | null }): string {
  if (!(p.monthly > 0) || !(p.years >= 1) || !(p.delayYears > 0) || p.delayYears >= p.years) return '';
  const attente = `${fmtNum(p.delayYears)} an${p.delayYears > 1 ? 's' : ''}`;
  const rattrape = p.catchUpMonthly === null ? '' : ` Pour arriver au même capital en commençant plus tard, il faudrait verser ${fmtEur(p.catchUpMonthly)} par mois au lieu de ${fmtEur(p.monthly)}.`;
  if (Math.round(p.cost) <= 0) return `Avec ces hypothèses, attendre ${attente} ne change pas le capital final (${fmtEur(p.startNow)}).`;
  return `Commencer maintenant donne ${fmtEur(p.startNow)} dans ${ansTxt(p.years)}, contre ${fmtEur(p.startLater)} en attendant ${attente} : l'attente coûte ${fmtEur(p.cost)}.${rattrape}`;
}

/** Épargne qui augmente : capital supplémentaire obtenu en relevant le versement chaque année. */
export function stepUpTakeaway(p: { monthly: number; years: number; flatCapital: number; steppedCapital: number; extraCapital: number; lastMonthly: number }): string {
  if (!(p.monthly > 0) || !(p.years >= 1)) return '';
  if (Math.round(p.extraCapital) === 0) return `Avec ces hypothèses, relever le versement chaque année ne change pas le capital final (${fmtEur(p.flatCapital)}).`;
  return `En partant de ${fmtEur(p.monthly)} par mois et en relevant le versement chaque année, vous arrivez à ${fmtEur(p.steppedCapital)} après ${ansTxt(p.years)}, contre ${fmtEur(p.flatCapital)} avec un versement constant : ${fmtEur(p.extraCapital)} d'écart. La dernière année, le versement atteint ${fmtEur(p.lastMonthly)} par mois.`;
}

/** Conversion de taux : pourquoi ne pas simplement diviser le taux annuel. */
export function rateConversionTakeaway(p: { annualRate: number; periods: number; equivalentRate: number; proportionalRate: number; gap: number }): string {
  if (![2, 4, 12].includes(p.periods) || !Number.isFinite(p.equivalentRate)) return '';
  const nom = p.periods === 12 ? 'mensuel' : p.periods === 4 ? 'trimestriel' : 'semestriel';
  const pct = (x: number) => `${(x * 100).toFixed(4).replace('.', ',')} %`;
  return `Pour obtenir ${fmtPct(p.annualRate)} sur l'année, appliquez un taux ${nom} de ${pct(p.equivalentRate)} à chaque période, pas ${pct(p.proportionalRate)} (le taux annuel divisé par ${p.periods}), qui donnerait un peu trop.`;
}

/** Budget : la répartition de 100 € de revenu et l'effort pour atteindre le taux visé. */
export function budgetTakeaway(p: { income: number; shares: { needs: number; wants: number; saving: number }; unallocated: number; targetRate: number; missing: number }): string {
  if (!(p.income > 0)) return '';
  const cent = (x: number) => Math.round(x * 100);
  const repartition = `Sur 100 € de revenu, ${cent(p.shares.needs)} € vont aux besoins, ${cent(p.shares.wants)} € aux envies et ${cent(p.shares.saving)} € à l'épargne.`;
  const reste = p.unallocated < 0
    ? ` Vos postes dépassent le revenu de ${fmtEur(-p.unallocated)} par mois : le budget n'est pas équilibré.`
    : Math.round(p.unallocated) > 0
      ? ` Il reste ${fmtEur(p.unallocated)} par mois que vous n'avez affectés à rien.`
      : '';
  const cible = p.missing > 0
    ? ` Pour épargner ${fmtPct(p.targetRate)} de votre revenu, il faudrait mettre de côté ${fmtEur(p.missing)} de plus chaque mois.`
    : ` Vous atteignez déjà le taux d'épargne visé (${fmtPct(p.targetRate)}).`;
  return repartition + reste + cible;
}

/** Inflation : ce que la somme permet d'acheter à l'horizon, laissée telle quelle ou placée. */
export function inflationTakeaway(p: { amount: number; years: number; inflation: number; annualReturn: number; idleRealValue: number; nominalToKeepPower: number; investedRealValue: number }): string {
  if (!(p.amount > 0) || !(p.years > 0)) return '';
  const duree = `${p.years} an${p.years > 1 ? 's' : ''}`;
  const rien = p.inflation > 0
    ? `Avec ${fmtPct(p.inflation)} d'inflation par an, ${fmtEur(p.amount)} laissés tels quels pendant ${duree} ne permettront d'acheter que ce que ${fmtEur(p.idleRealValue)} achètent aujourd'hui. Pour garder le même pouvoir d'achat, il faudrait alors détenir ${fmtEur(p.nominalToKeepPower)}.`
    : `Avec ${fmtPct(p.inflation)} d'inflation par an, ${fmtEur(p.amount)} laissés tels quels pendant ${duree} permettent d'acheter, en euros d'aujourd'hui, ${fmtEur(p.idleRealValue)}.`;
  const diff = Math.round(p.investedRealValue) - Math.round(p.amount);
  const place = ` Placée à ${fmtPct(p.annualReturn)} par an, la même somme vaut ${fmtEur(p.investedRealValue)} en euros d'aujourd'hui : ${diff > 0 ? `elle gagne ${fmtEur(diff)} de pouvoir d'achat` : diff < 0 ? `elle perd encore ${fmtEur(-diff)} de pouvoir d'achat` : 'son pouvoir d\'achat est conservé'}.`;
  return rien + place;
}

const durationFr = (months: number): string => {
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y ? `${y} an${y > 1 ? 's' : ''}` : '', m || !y ? `${m} mois` : ''].filter(Boolean).join(' ');
};

/** Plusieurs dettes : durée et intérêts avec l'avalanche, comparés aux seules mensualités minimales. */
export function debtsTakeaway(p: { extra: number; minimum: { months: number | null; totalInterest: number }; avalanche: { months: number | null; totalInterest: number }; snowball: { months: number | null; totalInterest: number }; interestSavedByAvalanche: number | null }): string {
  const { minimum: min, avalanche: av, snowball: sn } = p;
  if (av.months === null) return 'Avec ce budget, les dettes ne sont pas soldées en 50 ans : les mensualités ne couvrent pas les intérêts. Augmentez les mensualités ou le versement supplémentaire.';
  if (av.months === 0) return '';
  const ajout = p.extra > 0 ? `En ajoutant ${fmtEur(p.extra)} par mois à vos mensualités minimales, ` : 'Avec vos mensualités minimales, ';
  const duree = `vous êtes libéré de toutes vos dettes en ${durationFr(av.months)} avec l'avalanche (${fmtEur(av.totalInterest)} d'intérêts)`;
  const vs = p.extra > 0 && min.months !== null
    ? `, contre ${durationFr(min.months)} et ${fmtEur(min.totalInterest)} d'intérêts sans versement supplémentaire`
    : '';
  const boule = sn.months !== null && p.interestSavedByAvalanche !== null
    ? p.interestSavedByAvalanche > 0.5
      ? ` La boule de neige coûterait ${fmtEur(p.interestSavedByAvalanche)} d'intérêts de plus pour une durée de ${durationFr(sn.months)}.`
      : ' La boule de neige donne ici le même résultat.'
    : '';
  return `${ajout}${duree}${vs}.${boule}`;
}

/** Impact des frais : écart de capital entre le niveau de frais le plus bas et le plus élevé saisis. */
export function feesTakeaway(p: { years: number; lowest: { fees: number; finalValue: number }; highest: { fees: number; finalValue: number; cost: number; shareOfGains: number }; noFees: number }): string {
  const { lowest: lo, highest: hi } = p;
  const ecart = lo.finalValue - hi.finalValue;
  if (!(p.years > 0) || !(ecart > 0.5) || !(p.noFees > 0)) return '';
  const part = hi.shareOfGains > 0 ? ` soit ${fmtPct(hi.shareOfGains)} des gains que vous auriez eus sans frais` : '';
  return `Sur ${p.years} an${p.years > 1 ? 's' : ''}, avec ${fmtPct(lo.fees)} de frais par an, votre capital atteint ${fmtEur(lo.finalValue)} ; avec ${fmtPct(hi.fees)}, il n'atteint que ${fmtEur(hi.finalValue)}. Cet écart de ${fmtEur(ecart)} vient uniquement des frais : à ${fmtPct(hi.fees)}, ils vous coûtent ${fmtEur(hi.cost)} au total,${part}.`;
}

/** Patrimoine à long terme : versements, capital simulé, puis valeur après impôt en euros d'aujourd'hui. */
export function wealthTakeaway(p: { years: number; contributed: number; withdrawn: number; value: number; gains: number; netValue: number; netRealValue: number; taxRate: number; inflation: number }): string {
  if (!(p.years > 0) || !(p.contributed > 0) || !(p.value > 0)) return '';
  const duree = `${p.years} an${p.years > 1 ? 's' : ''}`;
  const retraits = p.withdrawn > 0.5 ? ` et en retirez ${fmtEur(p.withdrawn)} en chemin` : '';
  const gain = p.gains >= 0 ? `, dont ${fmtEur(p.gains)} de gains simulés` : `, avec une perte simulée de ${fmtEur(-p.gains)}`;
  const impot = p.value - p.netValue > 0.5
    ? ` Après un impôt de ${fmtPct(p.taxRate)} sur les gains, il vous resterait ${fmtEur(p.netValue)}.`
    : '';
  const reel = p.inflation > 0
    ? ` Avec ${fmtPct(p.inflation)} d'inflation par an, cette somme ne vaudra que ${fmtEur(p.netRealValue)} en euros d'aujourd'hui : c'est le chiffre le plus proche de votre pouvoir d'achat réel.`
    : '';
  return `En ${duree}, vous versez ${fmtEur(p.contributed)}${retraits}, et le capital simulé atteint ${fmtEur(p.value)}${gain}.${impot}${reel}`;
}

/** Entreprise : le chiffre d'affaires n'est pas un gain ; ce qui reste, la trésorerie et le besoin de financement du scénario pessimiste. */
export function businessTakeaway(p: { years: number; revenueFirst: number; revenueLast: number; netResultLast: number; cashLast: number; pessimisticLowestCash: number }): string {
  if (!(p.years > 0) || !(p.revenueLast > 0)) return '';
  const duree = `${p.years} an${p.years > 1 ? 's' : ''}`;
  const reste = p.netResultLast >= 0
    ? `il vous reste ${fmtEur(p.netResultLast)} de résultat net la dernière année`
    : `l'entreprise perd ${fmtEur(-p.netResultLast)} la dernière année`;
  const treso = p.cashLast >= 0 ? `la trésorerie finale est de ${fmtEur(p.cashLast)}` : `la trésorerie finale est négative (${fmtEur(p.cashLast)})`;
  const risque = p.pessimisticLowestCash < 0
    ? ` Dans le scénario pessimiste, la trésorerie tombe jusqu'à ${fmtEur(p.pessimisticLowestCash)} : il faudrait trouver ce financement (apport, prêt, délais de paiement négociés).`
    : '';
  return `Dans le scénario central, le chiffre d'affaires passe de ${fmtEur(p.revenueFirst)} à ${fmtEur(p.revenueLast)} en ${duree}, mais ce n'est pas ce que vous gagnez : après charges, rémunération et impôt, ${reste}, et ${treso}.${risque}`;
}

/** Portefeuille : gain annuel supposé, frais, support dominant et projection. */
export function portfolioTakeaway(p: { total: number; netReturn: number; annualFeesEuro: number; topLabel: string; topWeight: number; years: number; monthly: number; contributed: number; value: number }): string {
  if (!(p.total > 0)) return '';
  const gain = p.total * p.netReturn;
  const annuel = gain >= 0
    ? `rapporte en moyenne ${fmtPct(p.netReturn)} par an une fois les frais déduits, soit environ ${fmtEur(gain)} par an (hypothèse saisie, pas une garantie)`
    : `perd en moyenne ${fmtPct(-p.netReturn)} par an une fois les frais déduits, soit environ ${fmtEur(-gain)} par an`;
  const frais = p.annualFeesEuro > 0.5 ? ` Les frais vous coûtent ${fmtEur(p.annualFeesEuro)} par an.` : '';
  const poids = p.topWeight >= 0.5 ? ` « ${p.topLabel} » pèse ${fmtPct(p.topWeight)} du total : si ce support chute, tout le portefeuille en souffre.` : '';
  const proj = p.years > 0 && p.value > 0
    ? ` En ${p.years} an${p.years > 1 ? 's' : ''}, avec ${fmtEur(p.monthly)} versés en plus chaque mois, il atteindrait environ ${fmtEur(p.value)} (dont ${fmtEur(p.contributed)} de versements, capital de départ compris), sans tenir compte des hausses et baisses des marchés.`
    : '';
  return `Votre portefeuille de ${fmtEur(p.total)} ${annuel}.${frais}${poids}${proj}`;
}
