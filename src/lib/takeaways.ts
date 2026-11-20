import { fmtAns, fmtDuree, fmtEur, fmtMonths, fmtNum, fmtPart, fmtPct } from './finance';

/**
 * Phrases « Concrètement » affichées sous les résultats des simulateurs.
 * Elles ne font que reformuler les résultats calculés (aucun chiffre réglementaire ici).
 */

/** Crédit : ce que l'on rend au total pour la somme empruntée. */
export function creditTakeaway(p: { principal: number; years: number; monthlyTotal: number; totalCost: number }): string {
  if (!(p.principal > 0) || !(p.years > 0)) return '';
  const rendu = p.principal + p.totalCost;
  const par100 = Math.round((p.totalCost / p.principal) * 100);
  return `Vous recevez ${fmtEur(p.principal)} et vous rendez ${fmtEur(rendu)} en tout, soit ${fmtEur(p.monthlyTotal)} par mois pendant ${fmtAns(p.years)}. Le crédit vous coûte donc ${fmtEur(p.totalCost)} de plus que la somme reçue (environ ${par100} € pour 100 € empruntés).`;
}

/** Crédit : d'où vient la capacité d'emprunt, et le projet saisi comparé à cette limite. */
export function capacityTakeaway(p: { income: number; debtRatio: number; years: number; capacity: number; principal: number }): string {
  if (!(p.income > 0) || !(p.debtRatio > 0) || !(p.years > 0) || !(p.capacity > 0)) return '';
  const base = `C'est le montant dont la mensualité, assurance comprise, atteint ${fmtPct(p.debtRatio)} de vos revenus, au taux et sur la durée saisis plus haut (${fmtAns(p.years)}).`;
  if (!(p.principal > 0)) return base;
  const ecart = p.capacity - p.principal;
  return base + (ecart >= 0
    ? ` Votre projet de ${fmtEur(p.principal)} reste en dessous, avec ${fmtEur(ecart)} de marge.`
    : ` Votre projet de ${fmtEur(p.principal)} le dépasse de ${fmtEur(-ecart)} : il faudrait emprunter moins, par exemple grâce à un apport.`);
}

/** Taux d'endettement : la part des revenus prise par les crédits, et ce qui reste. */
export function debtRatioTakeaway(p: { income: number; ratioAfter: number; remainingAfter: number; withinRef: boolean; refLabel: string }): string {
  if (!(p.income > 0)) return '';
  const part = `Sur 100 € de revenus, ${Math.round(p.ratioAfter * 100)} € partent dans les crédits.`;
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

/**
 * Objectif d'épargne : ce que veulent dire les cases, sans recopier leurs montants (versement, total versé, intérêts).
 * Qui fait le travail (vous ou les intérêts), ce que le taux change par rapport à un argent qui ne rapporte rien,
 * puis le levier le plus simple pour verser moins.
 */
export function savingsGoalTakeaway(p: { target: number; current: number; years: number; monthly: number; interest: number; monthlyWithoutReturn: number }): string {
  if (!(p.target > 0) || !(p.years >= 1)) return '';
  const ans = fmtAns(p.years);
  if (p.monthly === 0) return `Avec ${fmtEur(p.current)} déjà épargnés, vous atteignez ${fmtEur(p.target)} en ${ans} sans rien verser de plus, grâce au taux choisi.`;
  const share = p.interest / p.target;
  let qui: string;
  if (p.interest <= 0.5) qui = 'Avec ce taux, il n\'y a pas d\'intérêts : tout vient de votre poche.';
  else if (share < 0.15) qui = `Sur ${ans}, c'est surtout votre effort qui compte : les intérêts n'apportent qu'une petite partie.`;
  else if (share < 0.4) qui = `Sur ${ans}, les intérêts apportent une part notable, mais l'essentiel vient de votre poche.`;
  else qui = `Sur ${ans}, les intérêts apportent une grosse part : le temps travaille pour vous.`;
  const ecart = p.monthlyWithoutReturn - p.monthly;
  let taux = '';
  if (ecart >= 1) taux = ` Le taux allège l'effort de ${fmtEur(ecart)} par mois face à un argent qui ne rapporte rien.`;
  else if (ecart <= -1) taux = ` Ce rendement négatif alourdit l'effort de ${fmtEur(-ecart)} par mois face à un argent qui ne rapporte rien.`;
  return `${qui}${taux} Pour verser moins, reculez l'échéance si possible (voir les barres).`;
}

/** Louer ou acheter : qui est le plus riche à l'horizon, avec la mise en garde sur les hypothèses. */
export function rentVsBuyTakeaway(p: { horizonYears: number; advantage: number; breakEvenMonth: number | null }): string {
  if (!(p.horizonYears >= 1)) return '';
  const ans = fmtAns(p.horizonYears);
  const quand = p.breakEvenMonth !== null ? ` L'achat prend l'avantage pour de bon au bout de ${fmtMonths(p.breakEvenMonth)}.` : '';
  const fin = ' Ce résultat vient uniquement de vos hypothèses : voyez plus bas ce qui peut le faire basculer.';
  if (Math.round(p.advantage) === 0) return `Au bout de ${ans}, acheter et louer vous laissent à peu près le même patrimoine avec ces hypothèses.${fin}`;
  return p.advantage > 0
    ? `Au bout de ${ans}, avec ces hypothèses, vous seriez plus riche de ${fmtEur(p.advantage)} en achetant qu’en louant.${quand}${fin}`
    : `Au bout de ${ans}, avec ces hypothèses, vous seriez plus riche de ${fmtEur(-p.advantage)} en louant (et en plaçant la différence) qu’en achetant.${fin}`;
}

/**
 * Indépendance financière : capital à réunir, délai (en euros d'aujourd'hui), puis durée du capital en retrait.
 * `lastsYears` : année d'épuisement de la phase de retrait (null : tient tout l'horizon) ; omis : phrase non ajoutée.
 */
export function fireTakeaway(p: { gap: number; withdrawalRate: number; target: number; currentWealth: number; annualSavings: number; years: number | null; nominalReturn?: number; lastsYears?: number | null; horizon?: number }): string {
  if (!(p.gap >= 0) || !Number.isFinite(p.target)) return '';
  if (p.gap === 0) return 'Vos revenus récurrents couvrent déjà vos dépenses : aucun capital n’est nécessaire pour les financer.';
  const base = `Pour financer ${fmtEur(p.gap)} de dépenses par an que vos revenus ne couvrent pas, en retirant ${fmtPct(p.withdrawalRate)} du capital la première année, il faut environ ${fmtEur(p.target)}.`;
  const lasts = p.lastsYears === undefined || p.nominalReturn === undefined
    ? ''
    : ` Ensuite, à ${fmtPct(p.nominalReturn)} par an, il ${p.lastsYears === null ? `durerait plus de ${fmtAns(p.horizon ?? 60)}` : `serait épuisé au bout de ${fmtAns(p.lastsYears)}`}.`;
  if (p.years === 0) return `${base} Votre patrimoine de ${fmtEur(p.currentWealth)} atteint déjà ce capital.${lasts}`;
  if (p.years === null) return `${base} Avec ces hypothèses, vous ne l’atteignez pas en 100 ans.`;
  return `${base} Avec ${fmtEur(p.currentWealth)} déjà réunis et ${fmtEur(p.annualSavings)} mis de côté chaque année, vous y arrivez dans environ ${fmtAns(p.years)} (en euros d’aujourd’hui).${lasts}`;
}

/** Retraits réguliers : combien de temps le capital tient, et le retrait qui tiendrait tout l'horizon. */
/**
 * Retraits : ce que les cases ne disent pas. Elles affichent déjà la durée, le capital restant et le retrait tenable ;
 * la phrase les relie (combien de temps avant l'horizon le capital s'épuise, de combien baisser ou monter le premier retrait,
 * ce que l'on aura retiré en tout) sans recopier leurs montants. L'écart se calcule sur les montants arrondis à l'euro,
 * comme dans les cases.
 */
export function withdrawalTakeaway(p: { capital: number; monthly: number; years: number; monthsUntilEmpty: number | null; remaining: number; totalWithdrawn: number; sustainable: number }): string {
  if (!(p.capital > 0) || !(p.monthly > 0) || !(p.years >= 1)) return '';
  const ans = fmtAns(p.years);
  const gap = Math.round(p.monthly) - Math.round(p.sustainable);
  const share = Math.round((Math.abs(gap) / p.monthly) * 100);
  const total = p.totalWithdrawn > p.capital
    ? `vous auriez retiré ${fmtEur(p.totalWithdrawn)}, plus que le capital placé, grâce à son rendement`
    : `vous auriez retiré ${fmtEur(p.totalWithdrawn)} en tout`;
  if (p.monthsUntilEmpty !== null) {
    const early = Math.floor(p.years * 12) - p.monthsUntilEmpty;
    const when = early > 0 ? `Le capital est vide ${fmtMonths(early)} avant l'horizon de ${ans}.` : `Le capital est vide juste à l'horizon de ${ans}.`;
    const lower = gap > 0
      ? ` Pour tenir jusqu'au bout, commencez ${fmtEur(gap)} plus bas par mois${share >= 1 ? ` (environ ${share}\u00a0% de moins)` : ''}.`
      : '';
    return `${when}${lower} D'ici là, ${total}.`;
  }
  const higher = gap < 0
    ? ` Le premier retrait pourrait monter de ${fmtEur(-gap)} par mois${share >= 1 ? ` (environ ${share}\u00a0% de plus)` : ''} sans vider le capital avant ${ans}.`
    : ' Votre retrait est presque au maximum tenable sur cette durée.';
  const t = total.charAt(0).toUpperCase() + total.slice(1);
  return `Votre retrait tient jusqu'à l'horizon de ${ans}, et il reste du capital ensuite. ${t}.${higher} Tout repose sur le rendement supposé : s'il est plus faible, le capital dure moins longtemps.`;
}

/**
 * Retraits : légende du graphique quand la courbe du retrait tenable s'ajoute à celle du retrait saisi.
 * Le montant n'y est pas répété : la légende de la courbe l'affiche déjà.
 * Chaîne vide quand les deux retraits s'affichent pareil (la seconde courbe n'apporterait rien).
 */
export function withdrawalChartNote(p: { monthly: number; years: number; sustainable: number }): string {
  if (!(p.monthly > 0) || !(p.sustainable > 0) || !(p.years >= 1) || fmtEur(p.sustainable) === fmtEur(p.monthly)) return '';
  const ans = fmtAns(p.years);
  return p.sustainable < p.monthly
    ? `Pointillés : le retrait tenable, qui fait durer le capital les ${ans}.`
    : `Pointillés : le premier retrait au plus haut qui fait encore durer le capital les ${ans}.`;
}

/**
 * Épargne de précaution : ce que les cases de résultat ne disent pas. Elles affichent déjà le montant visé, le manque,
 * le délai avec le versement saisi et le versement qui tiendrait le délai souhaité ; la phrase les relie
 * (avance ou retard sur le délai souhaité, versement à ajouter) sans recopier leurs montants.
 * `needed` est le versement arrondi à l'euro supérieur, comme dans la case.
 */
export function precautionTakeaway(p: { target: number; savings: number; monthlySaving: number; reachedAt: number | null; deadline: number; needed: number }): string {
  if (!(p.target > 0)) return '';
  if (p.savings >= p.target) return 'Votre épargne couvre déjà le montant visé : en cas d\'imprévu, vous avez de quoi tenir sans toucher à vos autres placements ni emprunter.';
  const role = 'Cette réserve sert à payer un imprévu sans vendre un placement ni emprunter.';
  if (!(p.monthlySaving > 0)) return `${role} Sans versement mensuel, le manque ne se comble pas : même une petite somme chaque mois fait avancer.`;
  const extra = Math.max(0, p.needed - p.monthlySaving);
  const toAdd = extra > 0 ? ` Pour la finir dans le délai souhaité, il faudrait verser ${fmtEur(extra)} de plus chaque mois.` : '';
  if (p.reachedAt === null) return `${role} Avec ce versement, elle ne serait pas complète avant 50\u00a0ans.${toAdd}`;
  const diff = p.reachedAt - p.deadline;
  if (diff < 0) return `${role} Votre versement suffit : elle serait complète ${fmtMonths(-diff)} avant le délai que vous vous êtes fixé.`;
  if (diff === 0) return `${role} Votre versement suffit : elle serait complète juste dans le délai que vous vous êtes fixé.`;
  return `${role} Votre versement ne suffit pas pour tenir le délai que vous vous êtes fixé : elle serait complète ${fmtMonths(diff)} plus tard.${toAdd}`;
}

/** Épargne de précaution : part des intérêts dans la réserve, en mots (« moins de 2 % »), arrondie au point supérieur strict. */
export function interestShareLabel(share: number): string {
  return `moins de ${Math.floor(Math.max(0, share) * 100) + 1}\u00a0%`;
}

/** Épargne de précaution : composition du montant visé, en mots (sous-titre de la carte « Montant visé »). */
export function precautionTargetSub(months: number, extraReserve: number): string {
  const base = `${fmtNum(months)}\u00a0mois de dépenses`;
  return extraReserve > 0 ? `${base} + ${fmtEur(extraReserve)} de réserve (réglages avancés)` : base;
}

/**
 * Épargne de précaution : ce que rapporte la réserve une fois complète et placée sur les livrets (une année pleine),
 * distingué des intérêts gagnés pendant la constitution (barre « D'où viendra la réserve »), qui ne portent que sur une réserve incomplète.
 * Avec un seul livret, le montant annuel figure déjà sur sa ligne : la phrase ne le recopie pas.
 */
export function precautionPlacementTakeaway(p: { yearlyInterest: number; blendedRate: number; overflow: number; livrets: number; building: boolean }): string {
  if (!(p.yearlyInterest > 0)) return '';
  const rest = p.overflow > 0 ? ` sur les livrets (hors les ${fmtEur(p.overflow)} placés au-delà des plafonds)` : '';
  const base = p.livrets > 1
    ? `Une fois complète et placée ainsi, la réserve rapporterait environ ${fmtEur(p.yearlyInterest)} par an${rest}, soit ${fmtPct(p.blendedRate)} en moyenne.`
    : `Les intérêts indiqués sur la ligne du livret sont ceux d’une année pleine, une fois la réserve complète${rest}.`;
  if (!p.building) return base;
  return `${base} Ceux de la barre « D’où viendra la réserve », eux, sont gagnés pendant la constitution, quand la réserve n’est pas encore complète.`;
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

/**
 * Immobilier locatif : ce que le propriétaire paie de sa poche chaque mois, puis le verdict du bilan à l'horizon
 * en mots (sans recopier les montants du bilan affiché juste en dessous). `gap` et `badGap` : « détenu à la fin »
 * moins « sorti de votre poche », scénario central et défavorable, arrondis à l'euro comme l'affichage.
 */
export function rentalTakeaway(p: { totalCost: number; netYield: number; monthlyCashflow: number; monthlyCashflowAfterTax: number | null; horizon: number; gap: number; badGap?: number }): string {
  if (!(p.totalCost > 0) || !Number.isFinite(p.netYield)) return '';
  const mois = Math.round(p.monthlyCashflow);
  const a = p.monthlyCashflowAfterTax === null ? null : Math.round(p.monthlyCashflowAfterTax);
  // Après impôt, en une incise de la même phrase : « et » si le signe ne change pas, « mais » s'il s'inverse.
  const apres = a === null ? ''
    : `${(a < 0) === (mois < 0) ? ', et' : ', mais'}${a < 0 && mois >= 0 ? ' il faut ajouter' : a >= 0 && mois < 0 ? ' il reste' : ''} environ ${fmtEur(Math.abs(a))} après l'impôt estimé de la première année`;
  const tresorerie = mois >= 0
    ? `Chaque mois, le loyer couvre la mensualité du crédit et les charges : il reste environ ${fmtEur(mois)} avant impôt${apres}.`
    : `Chaque mois, le loyer ne couvre pas la mensualité du crédit et les charges : il faut ajouter environ ${fmtEur(-mois)} de votre poche avant impôt${apres}.`;
  const gap = Math.round(p.gap);
  const bad = p.badGap === undefined ? null : Math.round(p.badGap);
  const en = `En ${fmtAns(p.horizon)}`;
  let fin: string;
  if (gap > 0) {
    fin = bad === null ? `${en}, vous détiendriez plus que ce que vous auriez sorti de votre poche.`
      : bad >= 0 ? `${en}, vous détiendriez plus que ce que vous auriez sorti de votre poche, même dans le scénario défavorable.`
      : `${en}, vous détiendriez plus que ce que vous auriez sorti de votre poche ; dans le scénario défavorable, ce serait l'inverse.`;
  } else if (gap === 0) {
    fin = `${en}, vous détiendriez à peu près ce que vous auriez sorti de votre poche.`;
  } else {
    fin = `${en}, vous auriez sorti de votre poche plus que ce que vous détiendriez à la fin.`;
  }
  return `${tresorerie}\n${fin} Le bilan ci-dessous donne le détail.`;
}

/**
 * Immobilier locatif : sous-titre de la carte « Solde mensuel » (loyer − mensualité − charges),
 * qui dit en mots simples ce que signifie le signe du montant (arrondi à l'euro, comme l'affichage).
 */
export function rentalCashflowSub(monthly: number, afterTax: boolean): string {
  const when = afterTax ? 'après impôt' : 'avant impôt';
  const v = Math.round(monthly);
  if (!Number.isFinite(v) || v === 0) return `loyer et dépenses s'équilibrent, ${when}`;
  return v < 0 ? `à ajouter de votre poche, ${when}` : `en plus dans votre poche, ${when}`;
}

const ansTxt = (n: number) => fmtAns(n);

/** Intérêts composés, « combien placer » : somme à mettre de côté aujourd'hui et part des intérêts. */
export function presentValueTakeaway(p: { target: number; years: number; monthly: number; initial: number; contributed: number; gain: number; noInitialNeeded: boolean }): string {
  if (!(p.target > 0) || !(p.years >= 1)) return '';
  if (p.noInitialNeeded) return `Avec ${fmtEur(p.monthly)} versés chaque mois pendant ${fmtAns(p.years)}, vous atteignez ${fmtEur(p.target)} sans placer de somme de départ.`;
  const gain = p.gain > 0
    ? ` Sur ces ${fmtEur(p.target)}, ${fmtEur(p.gain)} viennent des intérêts : vous n'avez à sortir de votre poche que ${fmtEur(p.contributed)}.`
    : ` Avec ce rendement, les intérêts n'apportent rien : tout vient de ce que vous versez (${fmtEur(p.contributed)}).`;
  return `Pour disposer de ${fmtEur(p.target)} dans ${fmtAns(p.years)}, il faut placer ${fmtEur(p.initial)} dès aujourd'hui, en plus de ${fmtEur(p.monthly)} par mois.${gain}`;
}

/** Intérêts composés, « en combien de temps » : durée, intérêts et temps gagné grâce au rendement. */
export function timeToTargetTakeaway(p: { target: number; months: number | null; interest: number; contributed: number; monthsWithoutReturn: number | null }): string {
  if (!(p.target > 0) || p.months === null) return '';
  const sans = p.monthsWithoutReturn !== null && p.monthsWithoutReturn > p.months
    ? ` Sans rendement, il faudrait ${fmtMonths(p.monthsWithoutReturn)} : le rendement fait gagner ${fmtMonths(p.monthsWithoutReturn - p.months)}.`
    : '';
  const interets = p.interest > 0 ? `, dont ${fmtEur(p.interest)} d'intérêts et ${fmtEur(p.contributed)} venant de vous` : '';
  return `Avec ces hypothèses, vous atteignez ${fmtEur(p.target)} en ${fmtMonths(p.months)}${interets}.${sans}`;
}

/** Intérêts composés, « quel rendement » : rendement à viser et part qu'il doit fournir. */
export function requiredReturnTakeaway(p: { target: number; years: number; annualRate: number | null; contributed: number; withoutReturn: number; alreadyReached: boolean }): string {
  if (!(p.target > 0) || !(p.years >= 1) || p.annualRate === null) return '';
  if (p.alreadyReached) return `Vos versements suffisent à atteindre ${fmtEur(p.target)} en ${fmtAns(p.years)} : aucun rendement n'est nécessaire.`;
  const part = Math.max(0, p.target - p.withoutReturn);
  return `Pour passer de ${fmtEur(p.contributed)} versés à ${fmtEur(p.target)} en ${fmtAns(p.years)}, il faut que l'argent rapporte environ ${fmtPct(p.annualRate)} par an en moyenne, sans interruption. Le rendement doit fournir ${fmtEur(part)} : plus ce taux est élevé, plus il suppose de prendre des risques, et aucun taux n'est garanti.`;
}

/** Intérêts composés, « doubler son capital » : durée exacte, règle de 72 et durée en pouvoir d'achat. */
export function doublingTakeaway(p: { multiple: number; exactYears: number | null; realYears: number | null; realReturn: number }): string {
  if (!(p.multiple > 1)) return '';
  const quoi = p.multiple === 2 ? 'doubler' : `multiplier par ${fmtNum(p.multiple)}`;
  if (p.exactYears === null) return `Avec ce rendement, le capital ne peut pas être multiplié par ${fmtNum(p.multiple)} : il ne progresse pas.`;
  const exact = `Avec ces hypothèses, il faut environ ${fmtDuree(p.exactYears)} pour ${quoi} le nombre d'euros du compte.`;
  const reel = p.realYears === null
    ? ` Mais une fois l'inflation retirée, le pouvoir d'achat n'augmente pas : vous avez plus d'euros, pas plus de choses à acheter.`
    : ` En tenant compte de l'inflation, il faut environ ${fmtDuree(p.realYears)} pour ${quoi} ce que l'on peut réellement acheter.`;
  return exact + reel;
}

/** Intérêts simples ou composés : écart au bout de la durée. */
export function simpleVsCompoundTakeaway(p: { initial: number; years: number; simpleFinal: number; compoundFinal: number; gap: number }): string {
  if (!(p.initial > 0) || !(p.years >= 1)) return '';
  if (Math.round(p.gap) === 0) return `Avec ces hypothèses, les deux méthodes donnent le même résultat : ${fmtEur(p.compoundFinal)} après ${fmtAns(p.years)}.`;
  const sens = p.gap > 0 ? `${fmtEur(p.gap)} de plus avec les intérêts composés` : `${fmtEur(-p.gap)} de moins avec les intérêts composés`;
  return `Avec ${fmtEur(p.initial)} placés pendant ${fmtAns(p.years)}, vous obtenez ${fmtEur(p.simpleFinal)} si seuls les ${fmtEur(p.initial)} de départ rapportent, et ${fmtEur(p.compoundFinal)} si les intérêts rapportent aussi : ${sens}.`;
}

/** Coût d'attendre : capital perdu et effort de rattrapage. */
export function delayCostTakeaway(p: { monthly: number; years: number; delayYears: number; startNow: number; startLater: number; cost: number; catchUpMonthly: number | null }): string {
  if (!(p.monthly > 0) || !(p.years >= 1) || !(p.delayYears > 0) || p.delayYears >= p.years) return '';
  const attente = fmtAns(p.delayYears);
  const rattrape = p.catchUpMonthly === null ? '' : ` Pour arriver au même capital en commençant plus tard, il faudrait verser ${fmtEur(p.catchUpMonthly)} par mois au lieu de ${fmtEur(p.monthly)}.`;
  if (Math.round(p.cost) <= 0) return `Avec ces hypothèses, attendre ${attente} ne change pas le capital final (${fmtEur(p.startNow)}).`;
  return `Commencer maintenant donne ${fmtEur(p.startNow)} dans ${fmtAns(p.years)}, contre ${fmtEur(p.startLater)} en attendant ${attente} : l'attente coûte ${fmtEur(p.cost)}.${rattrape}`;
}

/** Épargne qui augmente : capital supplémentaire obtenu en relevant le versement chaque année. */
export function stepUpTakeaway(p: { monthly: number; years: number; flatCapital: number; steppedCapital: number; extraCapital: number; lastMonthly: number }): string {
  if (!(p.monthly > 0) || !(p.years >= 1)) return '';
  if (Math.round(p.extraCapital) === 0) return `Avec ces hypothèses, relever le versement chaque année ne change pas le capital final (${fmtEur(p.flatCapital)}).`;
  return `En partant de ${fmtEur(p.monthly)} par mois et en relevant le versement chaque année, vous arrivez à ${fmtEur(p.steppedCapital)} après ${fmtAns(p.years)}, contre ${fmtEur(p.flatCapital)} avec un versement constant : ${fmtEur(p.extraCapital)} d'écart. La dernière année, le versement atteint ${fmtEur(p.lastMonthly)} par mois.`;
}

/** Conversion de taux : pourquoi ne pas simplement diviser le taux annuel. */
export function rateConversionTakeaway(p: { annualRate: number; periods: number; equivalentRate: number; proportionalRate: number; gap: number }): string {
  if (![2, 4, 12].includes(p.periods) || !Number.isFinite(p.equivalentRate)) return '';
  const nom = p.periods === 12 ? 'mensuel' : p.periods === 4 ? 'trimestriel' : 'semestriel';
  const pct = (x: number) => `${(x * 100).toFixed(4).replace('.', ',')} %`;
  return `Pour obtenir ${fmtPct(p.annualRate)} sur l'année, appliquez un taux ${nom} de ${pct(p.equivalentRate)} à chaque période, pas ${pct(p.proportionalRate)} (le taux annuel divisé par ${p.periods}), qui donnerait un peu trop.`;
}

/**
 * Budget : ce que signifient les cases, sans recopier leurs montants (taux, revenu non affecté, effort)
 * ni la répartition déjà dessinée par la barre. Les seuls montants cités sont nouveaux : la part prise sur
 * les envies, ce qu'il resterait de libre, ce qui ne peut pas être couvert.
 */
export function budgetTakeaway(p: { income: number; shares: { needs: number; wants: number; saving: number }; unallocated: number; targetRate: number; missing: number; wants?: number; fromUnallocated?: number; fromWants?: number; uncovered?: number }): string {
  if (!(p.income > 0)) return '';
  const r = (x: number) => Math.round(Math.max(0, x ?? 0));
  if (Math.round(p.unallocated) < 0) {
    return 'Vos dépenses et votre épargne dépassent votre revenu (montant négatif dans la case « Revenu non affecté ») : le budget n\'est pas équilibré. Vérifiez d\'abord les montants saisis, puis cherchez la dépense à réduire avant de viser un taux d\'épargne.';
  }
  const libre = r(p.unallocated);
  if (!(r(p.missing) > 0)) {
    return `Vous atteignez déjà le taux d'épargne visé (${fmtPct(p.targetRate)}).`
      + (libre > 0 ? ' L\'argent que vous n\'avez affecté à rien peut rester disponible ou renforcer encore votre épargne.' : '');
  }
  const fromFree = r(p.fromUnallocated ?? 0);
  const fromWants = r(p.fromWants ?? 0);
  const uncovered = r(p.uncovered ?? 0);
  const but = `Pour épargner ${fmtPct(p.targetRate)} de votre revenu`;
  const toutLibre = fromFree > 0 && fromFree === libre;
  if (uncovered > 0) {
    const efforts = [toutLibre ? 'en épargnant tout l\'argent non affecté' : '', fromWants > 0 ? 'en renonçant à toutes les envies' : ''].filter(Boolean);
    return efforts.length
      ? `${but}, même ${efforts.join(' et ')}, il manquerait ${fmtEur(uncovered)} par mois : il faudrait réduire les besoins, augmenter le revenu, ou viser un taux plus réaliste.`
      : `${but}, il n'y a ni argent non affecté ni envies à réduire : l'effort devrait venir des besoins ou d'un revenu plus élevé, sinon visez un taux plus réaliste.`;
  }
  if (fromWants === 0) {
    return toutLibre
      ? `${but}, il suffit de mettre de côté tout l'argent que vous n'avez affecté à rien.`
      : `${but}, il suffit de mettre de côté une partie de l'argent que vous n'avez affecté à rien : il vous en resterait ${fmtEur(libre - fromFree)} par mois.`;
  }
  const envies = p.wants !== undefined ? ` (elles passeraient à ${fmtEur(Math.max(0, p.wants - fromWants))} par mois)` : '';
  return fromFree > 0
    ? `${but}, mettez de côté tout l'argent que vous n'avez affecté à rien et retirez ${fmtEur(fromWants)} par mois aux envies${envies}.`
    : `${but}, il faudrait prendre tout l'effort sur les envies${envies}.`;
}

/** Budget : position d'un poste face au repère 50 / 30 / 20, en mots (écart en euros par mois, repère en part du revenu). */
export function budgetGapPhrase(gap: number, bench: number): string {
  const g = Math.round(gap);
  const repere = `le repère de ${fmtPct(bench)}`;
  if (g === 0) return `au niveau du repère de ${fmtPct(bench)}`;
  return g > 0 ? `${fmtEur(g)} de plus que ${repere}` : `${fmtEur(-g)} de moins que ${repere}`;
}

/**
 * Inflation : ce que veulent dire les trois cases, sans recopier leurs montants. D'abord un repère du quotidien
 * (ce que deviendrait le prix d'un panier de 100 €, à l'inflation saisie), puis le rôle du placement : grandir plus vite,
 * aussi vite ou moins vite que les prix. `basketLater` est le prix du panier à l'horizon, calculé par `purchasingPower`.
 */
export function inflationTakeaway(p: { amount: number; years: number; inflation: number; annualReturn: number; realReturn: number; basketLater: number }): string {
  if (!(p.amount > 0) || !(p.years > 0)) return '';
  const dans = `dans ${fmtAns(p.years)}`;
  const panier = fmtEur(p.basketLater);
  const prix = p.inflation > 0
    ? `Avec des prix qui montent de ${fmtPct(p.inflation)} par an, un panier de courses de 100 € aujourd'hui en coûterait environ ${panier} ${dans} : une somme qui ne bouge pas en achète de moins en moins.`
    : p.inflation < 0
      ? `Avec des prix qui baissent de ${fmtPct(-p.inflation)} par an, un panier de courses de 100 € aujourd'hui en coûterait environ ${panier} ${dans} : une somme qui ne bouge pas en achète davantage.`
      : `Sans inflation, les prix ne bougent pas : une somme laissée telle quelle garde ce qu'elle permet d'acheter.`;
  const r = Math.round(p.realReturn * 10000);
  const taux = `à ${fmtPct(p.annualReturn)} par an`;
  const place = p.annualReturn === 0
    ? ` Placée à 0 % par an, elle ne rapporte rien : c'est comme la laisser telle quelle.`
    : p.annualReturn < 0
      ? ` Placée ${taux}, elle perd de la valeur : c'est pire que la laisser telle quelle.`
      : r > 0
        ? ` Placée ${taux}, la somme grandit plus vite que les prix : elle achètera plus qu'aujourd'hui.`
        : r === 0
          ? ` Placée ${taux}, la somme grandit au même rythme que les prix : elle achètera autant qu'aujourd'hui, sans plus.`
          : ` Placée ${taux}, la somme grandit moins vite que les prix : le placement réduit la perte de pouvoir d'achat sans l'effacer.`;
  return prix + place;
}

/** Mois où la première dette est soldée (la plus tôt), parmi celles qui restaient dues. */
function firstPayoff(months: (number | null)[]): number | null {
  const done = months.filter((m): m is number => m !== null && m > 0);
  return done.length ? Math.min(...done) : null;
}

/**
 * Plusieurs dettes, en trois lignes courtes : le point de départ (mensualités minimales seules), ce que fait
 * l'avalanche, puis l'arbitrage de la boule de neige (une première dette soldée plus tôt, contre des intérêts en plus).
 * Tous les montants et durées viennent de `comparePayoff`.
 */
export function debtsTakeaway(p: {
  extra: number;
  minimum: { months: number | null; totalInterest: number };
  avalanche: { months: number | null; totalInterest: number; payoffMonths?: (number | null)[] };
  snowball: { months: number | null; totalInterest: number; payoffMonths?: (number | null)[] };
  interestSavedByAvalanche: number | null;
}): string {
  const { minimum: min, avalanche: av, snowball: sn } = p;
  if (av.months === null) return 'Avec ce budget, les dettes ne sont pas soldées en 50 ans : les mensualités ne couvrent pas les intérêts. Augmentez les mensualités ou le versement supplémentaire.';
  if (av.months === 0) return '';
  const lignes: string[] = [];
  if (p.extra > 0) {
    if (min.months !== null) lignes.push(`Sans rien ajouter, vos dettes seraient soldées en ${fmtMonths(min.months)}, avec ${fmtEur(min.totalInterest)} d'intérêts.`);
    lignes.push(`En ajoutant ${fmtEur(p.extra)} par mois, l'avalanche les solde toutes en ${fmtMonths(av.months)}, avec ${fmtEur(av.totalInterest)} d'intérêts.`);
  } else {
    lignes.push(`Avec vos seules mensualités minimales, l'avalanche solde toutes vos dettes en ${fmtMonths(av.months)}, avec ${fmtEur(av.totalInterest)} d'intérêts.`);
  }
  const saved = p.interestSavedByAvalanche;
  if (sn.months !== null && saved !== null) {
    const fa = firstPayoff(av.payoffMonths ?? []);
    const fs = firstPayoff(sn.payoffMonths ?? []);
    const plusTot = fa !== null && fs !== null && fs < fa;
    if (saved > 0.5 && plusTot) {
      lignes.push(`La boule de neige solde une première dette au bout de ${fmtMonths(fs as number)}, contre ${fmtMonths(fa as number)} avec l'avalanche : sa mensualité se libère plus tôt, ce qui peut aider à tenir. En échange, elle coûte ${fmtEur(saved)} d'intérêts de plus.`);
    } else if (saved > 0.5) {
      lignes.push(`La boule de neige coûterait ${fmtEur(saved)} d'intérêts de plus, pour une durée totale de ${fmtMonths(sn.months)}.`);
    } else if (saved < -0.5) {
      lignes.push(`Ici, la boule de neige coûte même ${fmtEur(-saved)} d'intérêts de moins, pour une durée totale de ${fmtMonths(sn.months)}.`);
    } else if (plusTot) {
      lignes.push(`La boule de neige solde une première dette au bout de ${fmtMonths(fs as number)}, contre ${fmtMonths(fa as number)} avec l'avalanche, pour les mêmes intérêts.`);
    } else {
      lignes.push('La boule de neige donne ici le même résultat.');
    }
  }
  return lignes.join('\n');
}

/**
 * Impact des frais : ce que représente l'écart entre le niveau de frais le plus bas et le plus élevé, sans recopier
 * les montants des cases ni des barres : en années de versements mensuels (ou, sans versement, en part du capital de départ),
 * puis pourquoi un petit taux finit par coûter cher.
 */
export function feesTakeaway(p: { years: number; initial: number; monthly: number; lowest: { finalValue: number }; highest: { finalValue: number }; noFees: number }): string {
  const ecart = p.lowest.finalValue - p.highest.finalValue;
  if (!(p.years > 0) || !(ecart > 0.5) || !(p.noFees > 0)) return '';
  let equiv = '';
  if (p.monthly > 0) {
    const ans = ecart / (12 * p.monthly);
    const mois = Math.round(ecart / p.monthly);
    equiv = ans >= 1.5
      ? `l'équivalent d'environ ${Math.round(ans)} ans de vos versements mensuels`
      : mois >= 1
        ? `l'équivalent d'environ ${mois} mois de vos versements mensuels`
        : `moins d'un mois de vos versements mensuels`;
  } else if (p.initial > 0) {
    const ratio = ecart / p.initial;
    equiv = ratio >= 1
      ? `l'équivalent d'environ ${fmtNum(ratio)}\u00a0fois votre capital de départ`
      : `l'équivalent de ${fmtPart(ratio)} de votre capital de départ`;
  }
  const debut = equiv
    ? `Payer les frais les plus élevés plutôt que les plus bas vous coûte ${equiv}.`
    : `Payer les frais les plus élevés plutôt que les plus bas réduit nettement le capital final.`;
  return `${debut} Un taux de frais paraît petit, mais il est prélevé chaque année sur un capital qui grossit : son coût augmente avec la durée.`;
}

/**
 * Patrimoine à long terme : ce que veulent dire les cases, sans les recopier. La part des gains dans le capital final,
 * le temps qu'il faut pour en gagner la seconde moitié, puis ce que l'impôt et la hausse des prix en retirent,
 * en renvoyant à la case qui mesure le pouvoir d'achat.
 */
export function wealthTakeaway(p: { years: number; contributed: number; value: number; gains: number; netValue: number; netRealValue: number; inflation: number; lateHalfYears: number | null }): string {
  if (!(p.years > 0) || !(p.contributed > 0) || !(p.value > 0)) return '';
  const share = p.gains / p.value;
  let gains: string;
  if (p.gains < -0.5) {
    gains = 'Avec ces hypothèses, le capital final reste inférieur à ce que vous versez : le placement vous fait perdre de l\'argent.';
  } else if (p.gains <= 0.5) {
    gains = 'Avec ces hypothèses, le placement ne rapporte rien : le capital final vient uniquement de vos versements.';
  } else if (share >= 1) {
    gains = 'Les gains simulés dépassent le capital restant, car vous retirez de l\'argent en chemin.';
  } else {
    gains = `Les gains simulés font ${fmtPart(share)} du capital final : ce que l'argent placé a rapporté, puis ce que ces gains ont rapporté à leur tour.`;
    const n = p.lateHalfYears;
    if (n !== null && n >= 1 && n < p.years / 2) {
      const ans = n === 1 ? 'la dernière année' : `les ${n}\u00a0dernières années sur ${p.years}`;
      gains += ` Leur seconde moitié arrive pendant ${ans} : la durée pèse lourd.`;
    }
  }
  const loss = 1 - p.netRealValue / p.value;
  const taxed = p.value - p.netValue > 0.5;
  const inflated = p.inflation > 0;
  let pouvoir = '';
  if (loss >= 0.001) {
    if (taxed && inflated) {
      pouvoir = ` L'impôt et la hausse des prix en retirent ensemble ${fmtPart(loss)} : votre pouvoir d'achat réel est la ligne « après fiscalité » de la case « En euros d'aujourd'hui ».`;
    } else if (taxed) {
      pouvoir = ` L'impôt sur les gains en retire ${fmtPart(loss)} : ce qui vous reviendrait est la ligne « après fiscalité » de la case « Capital final ».`;
    } else if (inflated) {
      pouvoir = ` La hausse des prix retire ${fmtPart(loss)} à ce que ce capital permettra d'acheter : voir la case « En euros d'aujourd'hui ».`;
    }
  }
  return gains + pouvoir;
}

/** Entreprise : le chiffre d'affaires n'est pas un gain ; ce qui reste, la trésorerie et le besoin de financement du scénario pessimiste. */
export function businessTakeaway(p: { years: number; revenueFirst: number; revenueLast: number; netResultLast: number; cashLast: number; pessimisticLowestCash: number }): string {
  if (!(p.years > 0) || !(p.revenueLast > 0)) return '';
  const duree = fmtAns(p.years);
  const reste = p.netResultLast >= 0
    ? `il vous reste ${fmtEur(p.netResultLast)} de résultat net la dernière année`
    : `l'entreprise perd ${fmtEur(-p.netResultLast)} la dernière année`;
  const treso = p.cashLast >= 0 ? `la trésorerie finale est de ${fmtEur(p.cashLast)}` : `la trésorerie finale est négative (${fmtEur(p.cashLast)})`;
  const risque = p.pessimisticLowestCash < 0
    ? ` Dans le scénario pessimiste, la trésorerie tombe jusqu'à ${fmtEur(p.pessimisticLowestCash)} : il faudrait trouver ce financement (apport, prêt, délais de paiement négociés).`
    : '';
  return `Dans le scénario central, le chiffre d'affaires passe de ${fmtEur(p.revenueFirst)} à ${fmtEur(p.revenueLast)} en ${duree}, mais ce n'est pas ce que vous gagnez : après charges, rémunération et impôt, ${reste}, et ${treso}.${risque}`;
}

/**
 * Entreprise : explique une « valeur estimée » nulle. La valeur vaut le multiple choisi × le résultat net
 * de la dernière année, s'il est positif ; une perte ou un multiple nul donnent donc 0 €.
 */
export function businessZeroValueNote(p: { multiple: number; scenarios: { label: string; netResultLast: number }[] }): string {
  if (!(p.multiple > 0)) {
    return 'Valeur estimée à 0\u00a0€ : le multiple de valorisation est réglé à 0 (réglages avancés).';
  }
  const enPerte = p.scenarios.filter((s) => s.netResultLast <= 0).map((s) => s.label.toLowerCase());
  if (!enPerte.length) return '';
  const fois = String(p.multiple).replace('.', ',');
  const qui = enPerte.length === 1
    ? `le scénario ${enPerte[0]} finit sans bénéfice`
    : `les scénarios ${enPerte.slice(0, -1).join(', ')} et ${enPerte[enPerte.length - 1]} finissent sans bénéfice`;
  return `Valeur estimée à 0\u00a0€ : ${qui} la dernière année, or la valeur vaut ${fois}\u00a0fois ce bénéfice.`;
}

/** Part d'un tout dite en mots : « les trois quarts », « plus des deux tiers », « plus de la moitié », « la moitié ». */
function partEnMots(w: number): string {
  if (w >= 0.75) return 'au moins les trois quarts';
  if (w > 2 / 3) return 'plus des deux tiers';
  if (w > 0.5) return 'plus de la moitié';
  return 'la moitié';
}

/**
 * Portefeuille : ce que veulent dire les cases, sans recopier leurs montants (valeur, rendement, frais) ni les barres
 * de répartition : le gain annuel en euros, la part de ce gain que mangent les frais, puis le support dont tout dépend.
 */
export function portfolioTakeaway(p: { total: number; grossReturn: number; netReturn: number; annualFeesEuro: number; topLabel: string; topWeight: number }): string {
  if (!(p.total > 0)) return '';
  const gain = p.total * p.netReturn;
  const annuel = gain >= 0
    ? `Si les rendements saisis se réalisent (rien n'est garanti), votre portefeuille rapporterait environ ${fmtEur(gain)} par an, frais déduits.`
    : `Avec les rendements saisis, votre portefeuille perdrait environ ${fmtEur(-gain)} par an, frais déduits.`;
  const brut = p.total * p.grossReturn;
  let frais = '';
  if (p.annualFeesEuro > 0.5 && brut > 0.5) {
    const sur100 = Math.round((p.annualFeesEuro / brut) * 100);
    frais = sur100 >= 1
      ? ` Sur 100\u00a0€ gagnés avant frais, environ ${fmtNum(sur100)}\u00a0€ partent en frais.`
      : ' Les frais en prennent moins de 1\u00a0€ sur 100\u00a0€ gagnés avant frais.';
  }
  const poids = p.topWeight >= 0.5 ? ` ${partEnMots(p.topWeight).replace(/^./, (c) => c.toUpperCase())} de votre argent repose sur « ${p.topLabel} » : si ce support chute, tout le portefeuille en souffre.` : '';
  return `${annuel}${frais}${poids}`;
}

/**
 * Portefeuille : sous la projection, ce que veut dire la valeur finale (la légende du graphique donne déjà les montants) :
 * la part qui viendrait des gains plutôt que de vos versements.
 */
export function portfolioProjectionNote(p: { years: number; contributed: number; value: number }): string {
  if (!(p.years > 0 && p.value > 0)) return '';
  const gains = p.value - p.contributed;
  if (gains <= 0.5) return `En ${fmtAns(p.years)}, la valeur projetée ne dépasse pas vos versements : avec ces rendements, le portefeuille ne vous enrichit pas.`;
  const sur10 = Math.min(9, Math.round((gains / p.value) * 10));
  const part = sur10 >= 1 ? `environ ${fmtNum(sur10)}\u00a0€ sur 10` : 'moins de 1\u00a0€ sur 10';
  return `Au bout de ${fmtAns(p.years)}, ${part} de la valeur projetée viendraient des gains, le reste de vos versements (capital de départ compris).`;
}

/** Portefeuille : ce qu'il faut acheter ou vendre pour revenir à la répartition visée, en une phrase. Les écarts de moins de 1 € sont ignorés. */
export function rebalanceTakeaway(items: { label: string; move: number }[]): string {
  const moves = items.filter((i) => Math.abs(i.move) >= 1);
  if (!items.length) return '';
  if (!moves.length) return 'Votre portefeuille correspond déjà à la répartition visée : rien à acheter ni à vendre.';
  const list = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} et ${xs[xs.length - 1]}` : xs[0]);
  const ventes = moves.filter((i) => i.move < 0).map((i) => `${fmtEur(-i.move)} de « ${i.label} »`);
  const achats = moves.filter((i) => i.move > 0).map((i) => `${fmtEur(i.move)} à « ${i.label} »`);
  const parts = [ventes.length ? `retirer ${list(ventes)}` : '', achats.length ? `ajouter ${list(achats)}` : ''].filter(Boolean);
  const sansVente = ventes.length && achats.length
    ? ' Sans rien vendre, vous pouvez aussi vous en rapprocher en plaçant vos prochains versements sur les supports sous leur part visée.'
    : '';
  return `Pour retrouver la répartition visée, il faudrait ${parts.join(' et ')}.${sansVente}`;
}

/**
 * Investir d'un coup ou progressivement : pourquoi l'une des deux méthodes finit au-dessus, et le poids de l'écart
 * rapporté au capital, sans recopier les montants des cases ni des barres. L'explication suit le parcours de prix
 * supposé et le rendement de la part qui attend d'être investie.
 */
export function lumpGradualTakeaway(p: { amount: number; path: 'steady' | 'dip' | 'rise'; annualReturn: number; cashRate: number; advantageGradual: number }): string {
  if (!(p.amount > 0)) return '';
  const ecart = Math.abs(p.advantageGradual);
  if (Math.round(ecart) === 0) return 'Avec ces hypothèses, les deux méthodes donnent le même résultat.';
  const etale = p.advantageGradual > 0;
  const attente = p.cashRate < p.annualReturn ? 'moins' : 'plus';
  let pourquoi: string;
  if (p.path === 'dip' && etale) pourquoi = 'le prix baisse pendant l\'étalement, donc les tranches suivantes achètent moins cher que la première.';
  else if (p.path === 'rise' && !etale) pourquoi = 'le prix monte pendant l\'étalement, donc les tranches suivantes achètent plus cher que la première.';
  else if (p.path === 'steady') pourquoi = `l'argent qui attend son tour rapporte ${attente} que le placement.`;
  else pourquoi = `le mouvement de prix supposé est trop faible pour l'emporter sur le rendement de l'argent qui attend son tour.`;
  const qui = etale ? 'l\'étalement finit au-dessus' : 'investir tout de suite finit au-dessus';
  const poids = ` L'écart représente ${fmtPart(ecart / p.amount)} du capital placé.`;
  const fin = etale
    ? ' Si le prix avait monté, investir tout de suite aurait été préférable.'
    : ' L\'étalement sert surtout à limiter le regret d\'un achat juste avant une baisse.';
  return `Ici, ${qui} : ${pourquoi}${poids}${fin}`;
}

/**
 * ETF ou immobilier locatif : ce que l'on verse concrètement (apport, puis effort mensuel moyen), puis le verdict
 * en mots, sans recopier les montants déjà affichés dans les cases de résultat et sur les barres.
 * Verdict calculé sur les montants arrondis affichés, comme la case « Écart ».
 */
export function etfImmoTakeaway(p: { horizon: number; etfNet: number; immoNet: number; startCapital: number; avgMonthly: number }): string {
  if (!(p.horizon > 0)) return '';
  const mensuel = Math.round(p.avgMonthly);
  const verse = mensuel > 0
    ? `Vous placez ${fmtEur(p.startCapital)} au départ, puis ${fmtEur(mensuel)} par mois en moyenne : ce que le bien vous coûte après impôt, versé aussi sur les ETF.`
    : `Vous placez ${fmtEur(p.startCapital)} au départ, puis rien chaque mois : les loyers couvrent les dépenses du bien.`;
  const ecart = Math.round(p.etfNet) - Math.round(p.immoNet);
  const fin = `Au bout de ${fmtAns(p.horizon)}, une fois tout vendu, le crédit remboursé et les impôts payés, `;
  const verdict = ecart > 0 ? `${fin}vous auriez davantage avec les ETF qu'avec le bien.`
    : ecart < 0 ? `${fin}vous auriez davantage avec le bien qu'avec les ETF.`
    : `${fin}vous auriez autant des deux côtés.`;
  return `${verse}\n${verdict} Ce n'est pas une prévision : changez le rendement des ETF ou le prix du bien, et le résultat peut s'inverser.`;
}

/**
 * Comparateur ETF / immobilier : d'où vient l'écart. Les versements sont identiques des deux côtés,
 * l'écart est donc la différence entre ce que chaque placement en fait une fois vendu ; le gain de chacun
 * figure déjà sous sa barre, la phrase ne le répète pas.
 */
export function etfImmoGapText(p: { invested: number }): string {
  if (!(p.invested > 0)) return '';
  return `Des deux côtés, vous versez la même somme : ${fmtEur(Math.round(p.invested))}, apport compris. L'écart vient donc seulement de ce que chaque placement en fait, une fois vendu et imposé.`;
}

/** Comparer des durées de crédit : la mensualité baisse, le coût total monte. */
export function loanDurationTakeaway(p: { principal: number; shortYears: number; longYears: number; shortMonthly: number; longMonthly: number; shortCost: number; longCost: number }): string {
  if (!(p.principal > 0) || !(p.shortYears > 0) || !(p.longYears > p.shortYears)) return '';
  const moins = p.shortMonthly - p.longMonthly;
  const plus = p.longCost - p.shortCost;
  if (moins <= 0.5 || plus <= 0.5) return `Pour emprunter ${fmtEur(p.principal)}, la mensualité (assurance comprise) est de ${fmtEur(p.shortMonthly)} sur ${p.shortYears}\u00a0ans et de ${fmtEur(p.longMonthly)} sur ${p.longYears}\u00a0ans ; le coût total est de ${fmtEur(p.shortCost)} contre ${fmtEur(p.longCost)}.`;
  return `Pour emprunter ${fmtEur(p.principal)}, passer de ${p.shortYears} à ${p.longYears}\u00a0ans allège la mensualité de ${fmtEur(moins)} par mois (assurance comprise), mais le crédit coûte ${fmtEur(plus)} de plus au total : vous payez moins chaque mois, plus longtemps.`;
}

/** TAEG : ce que coûte réellement le crédit par rapport au taux affiché. */
export function taegTakeaway(p: { principal: number; nominal: number; taeg: number; totalCost: number }): string {
  if (!(p.principal > 0) || !(p.taeg > 0)) return '';
  const par100 = Math.round((p.totalCost / p.principal) * 100);
  const ecart = p.taeg - p.nominal;
  const base = `Le taux affiché est de ${fmtPct(p.nominal)}, mais une fois l'assurance et les frais comptés, le crédit revient à ${fmtPct(p.taeg)} par an.`;
  const fin = ` Au total, il vous coûte environ ${par100} € pour 100 € empruntés.`;
  return ecart > 0.00005 ? `${base}${fin}` : `Avec ces hypothèses, le taux affiché de ${fmtPct(p.nominal)} et le coût réel du crédit sont identiques.${fin}`;
}

/** Crédit in fine ou amortissable : ce qui change chaque mois et sur le coût net. */
export function inFineTakeaway(p: { principal: number; years: number; savingsReturn: number; annualRate: number; amortizingMonthly: number; inFineMonthly: number; monthlySaving: number; netCostGap: number }): string {
  if (!(p.principal > 0) || !(p.years > 0)) return '';
  const base = `Pour emprunter ${fmtEur(p.principal)} sur ${p.years}\u00a0ans, vous sortez ${fmtEur(p.inFineMonthly)} par mois en in fine (dont ${fmtEur(p.monthlySaving)} d’épargne) contre ${fmtEur(p.amortizingMonthly)} en amortissable.`;
  if (Math.abs(p.netCostGap) <= 0.5) return `${base} Le coût net est le même dans les deux cas.`;
  const fin = p.netCostGap > 0
    ? `L’in fine coûte ${fmtEur(p.netCostGap)} de plus au final : votre épargne (${fmtPct(p.savingsReturn)} supposé) rapporte moins que le crédit ne coûte (${fmtPct(p.annualRate)}).`
    : `L’in fine coûte ${fmtEur(-p.netCostGap)} de moins au final, mais seulement si votre épargne rapporte bien ${fmtPct(p.savingsReturn)} par an, ce que personne ne peut garantir.`;
  return `${base} ${fin}`;
}

/** Renégociation : gain net, point mort et prudence si la durée s’allonge. */
export function renegoTakeaway(p: { monthlyGain: number; netGain: number; breakEvenMonths: number | null; longer: boolean; fees: number }): string {
  if (p.breakEvenMonths === null || p.monthlyGain <= 0.5) return 'Avec ces hypothèses, la mensualité ne baisse pas : l’opération ne vous fait pas économiser de mensualité.';
  const mois = Math.ceil(p.breakEvenMonths);
  const base = p.fees > 0.5
    ? `La mensualité baisse de ${fmtEur(p.monthlyGain)} par mois : il faut environ ${fmtMonths(mois)} pour couvrir ${fmtEur(p.fees)} de frais.`
    : `La mensualité baisse de ${fmtEur(p.monthlyGain)} par mois, sans frais à rattraper.`;
  const fin = p.netGain > 0.5
    ? ` Si vous gardez le prêt jusqu’au bout, vous gagnez ${fmtEur(p.netGain)} net.`
    : ` Si vous gardez le prêt jusqu’au bout, vous perdez ${fmtEur(-p.netGain)} net : la baisse de mensualité ne compense pas l’allongement ou les frais.`;
  return `${base}${fin}${p.longer ? ' Attention : le nouveau prêt dure plus longtemps.' : ''}`;
}

/**
 * Comparateur ETF ou immobilier : rappel, sur le bloc replié des réglages avancés, des hypothèses
 * qui pèsent le plus sur le résultat (régime fiscal, tranche, évolution du prix du bien).
 * Simple reformulation de la saisie : aucun chiffre réglementaire ici.
 */
export function etfImmoAdvancedHint(p: { regimeLabel: string; taxed: boolean; marginalRate: number; appreciation: number }): string {
  const prix = `prix du bien ${p.appreciation > 0 ? '+' : ''}${fmtPct(p.appreciation)}/an`;
  if (!p.taxed) return `Impôt non estimé, ${prix}`;
  return `${p.regimeLabel}, tranche ${fmtPct(p.marginalRate)}, ${prix}`;
}

/** Patrimoine net (calculateur du guide) : ce qui resterait si l'on vendait tout et remboursait toutes ses dettes. */
export function netWorthTakeaway(p: { assets: number; debts: number; net: number }): string {
  if (!(p.assets > 0) && !(p.debts > 0)) return 'Saisissez ce que vous possédez et ce que vous devez : le patrimoine net s’affiche ici.';
  if (p.net < 0) {
    return `Vos dettes dépassent de ${fmtEur(-p.net)} ce que vous possédez. À valeur des biens égale, chaque euro de capital remboursé fait remonter le patrimoine net d’un euro.`;
  }
  return `Si vous vendiez tout au prix estimé et remboursiez vos dettes, il vous resterait ${fmtEur(p.net)}, avant frais et impôts de vente.`;
}

/** Part des dettes rapportée à ce que l'on possède, en pourcentage entier (« 68 % »). */
export function debtShareLabel(p: { assets: number; debts: number }): string {
  if (!(p.assets > 0) || !(p.debts > 0)) return '';
  return `soit ${Math.round((p.debts / p.assets) * 100)}\u00a0% de ce que vous possédez`;
}

/**
 * Patrimoine, bloc « Atteindre un objectif » : où mènent les réglages actuels par rapport au capital visé,
 * et l'épargne mensuelle constante qui l'atteindrait (`requiredMonthly`, même rendement net de frais).
 * L'écart avec l'épargne saisie n'est donné que si le scénario est « simple » (versement constant,
 * sans retrait ni changement d'épargne), sinon les deux montants ne sont pas comparables.
 */
export function wealthGoalTakeaway(p: { target: number; years: number; projected: number; monthly: number; need: number; plain: boolean }): string {
  if (!(p.target > 0) || !(p.years > 0)) return '';
  const ans = fmtAns(p.years);
  const cible = fmtEur(p.target);
  if (p.need <= 0) {
    return `Votre capital de départ suffirait : placé au rendement choisi, il atteindrait au moins ${cible} en ${ans} sans aucun versement.`;
  }
  if (p.projected >= p.target) {
    const marge = p.plain && Math.round(p.monthly) > Math.round(p.need)
      ? ` Vous pourriez épargner ${fmtEur(Math.round(p.monthly) - Math.round(p.need))} de moins par mois.`
      : '';
    return `Objectif atteint : avec vos réglages, le capital simulé (${fmtEur(p.projected)}) dépasse ${cible} au bout de ${ans}.${marge}`;
  }
  const suite = p.plain
    ? ` : il vous manque ${fmtEur(Math.round(p.need) - Math.round(p.monthly))} par mois pour arriver à ${cible} en ${ans}.`
    : `. L'épargne nécessaire ci-dessus suppose un versement constant, sans retrait ni changement d'épargne.`;
  return `Avec vos réglages, le capital simulé atteint ${fmtEur(p.projected)}${suite}`;
}

/** Investir d'un coup ou progressivement : dans quels parcours de prix l'étalement finit au-dessus. */
export function lumpGradualPathsSummary(rows: { name: string; advantageGradual: number }[]): string {
  if (rows.length === 0) return '';
  const wins = rows.filter((r) => r.advantageGradual > 0.005).map((r) => `« ${r.name} »`);
  const loses = rows.filter((r) => r.advantageGradual < -0.005).map((r) => `« ${r.name} »`);
  const list = (l: string[]) => (l.length > 1 ? `${l.slice(0, -1).join(', ')} et ${l[l.length - 1]}` : l[0]);
  if (wins.length === rows.length) return 'Avec ces hypothèses, l’étalement finit au-dessus dans les trois parcours.';
  if (loses.length === rows.length) return 'Avec ces hypothèses, investir d’un coup finit au-dessus dans les trois parcours.';
  if (wins.length === 0) return 'Avec ces hypothèses, l’étalement ne finit au-dessus dans aucun parcours.';
  const tail = loses.length ? ` ; investir d’un coup gagne avec ${list(loses)}` : '';
  return `Avec ces hypothèses, l’étalement ne finit au-dessus qu’avec ${list(wins)}${tail}. Personne ne sait à l’avance quel parcours le prix suivra.`;
}

/**
 * Crédit : résumé du remboursement anticipé, affiché sous le titre du bloc replié.
 * Reformule seulement les résultats de `prepayment` (aucun chiffre réglementaire ici).
 */
export function prepaySummary(p: { year: number; prepaid: number; mode: 'duree' | 'mensualite'; netSaving: number; monthsSaved: number; newMonthlyPayment: number }): string {
  if (!(p.prepaid > 0)) return 'Indiquez une somme à rembourser avant la fin du prêt.';
  const quand = p.year > 0 ? `à la fin de l'année ${p.year}` : 'dès le départ';
  const effet = p.mode === 'duree'
    ? (p.monthsSaved > 0 ? `, ${fmtMonths(p.monthsSaved)} de moins` : '')
    : (p.newMonthlyPayment > 0 ? `, mensualité ramenée à ${fmtEur(p.newMonthlyPayment)}` : ', prêt soldé');
  const gain = p.netSaving >= 0 ? `gain net de ${fmtEur(p.netSaving)}` : `perte nette de ${fmtEur(-p.netSaving)}`;
  return `${fmtEur(p.prepaid)} remboursés ${quand} : ${gain}${effet}.`;
}
