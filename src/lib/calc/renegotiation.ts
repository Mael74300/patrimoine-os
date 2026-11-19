import { clamp, num } from './common';
import { loanPayment } from './loan';

/**
 * Renégociation ou rachat d'un crédit : comparaison du coût restant du prêt actuel avec celui d'un nouveau prêt
 * sur le capital restant dû, frais ponctuels compris. Hypothèses saisies uniquement.
 * Convention de `loan.ts` : taux mensuel = taux nominal annuel / 12, échéances constantes, assurance non incluse.
 */
export type RenegotiationInput = {
  /** Capital restant dû. */
  remaining: number;
  /** Taux nominal annuel du prêt actuel (0,04 = 4 %). */
  currentRate: number;
  /** Durée restante du prêt actuel, en années. */
  currentYearsLeft: number;
  /** Taux nominal annuel du nouveau prêt. */
  newRate: number;
  /** Durée du nouveau prêt, en années. */
  newYears: number;
  /** Frais ponctuels du nouveau prêt (dossier, garantie, indemnités de remboursement anticipé…), saisis par l'utilisateur. */
  fees: number;
};

export type RenegotiationResult = {
  currentMonthly: number;
  newMonthly: number;
  /** currentMonthly − newMonthly (positif = la mensualité baisse). */
  monthlyGain: number;
  currentRemainingInterest: number;
  newInterest: number;
  /** Intérêts restants du prêt actuel − intérêts du nouveau prêt − frais (positif = opération avantageuse sur le coût total). */
  netGain: number;
  /** Mois d'économie de mensualité nécessaires pour couvrir les frais, ou null si la mensualité ne baisse pas. */
  breakEvenMonths: number | null;
  /** Vrai si le nouveau prêt dure plus longtemps que le prêt actuel (le coût total est alors à lire avec prudence). */
  longer: boolean;
};

export function renegotiation(input: RenegotiationInput): RenegotiationResult {
  const remaining = Math.max(0, num(input.remaining));
  const fees = Math.max(0, num(input.fees));
  const nOld = Math.round(clamp(input.currentYearsLeft, 0, 50) * 12);
  const nNew = Math.round(clamp(input.newYears, 0, 50) * 12);
  const currentMonthly = loanPayment(remaining, input.currentRate, input.currentYearsLeft);
  const newMonthly = loanPayment(remaining, input.newRate, input.newYears);
  const currentRemainingInterest = currentMonthly * nOld - (nOld > 0 ? remaining : 0);
  const newInterest = newMonthly * nNew - (nNew > 0 ? remaining : 0);
  const monthlyGain = currentMonthly - newMonthly;
  return {
    currentMonthly,
    newMonthly,
    monthlyGain,
    currentRemainingInterest,
    newInterest,
    netGain: currentRemainingInterest - newInterest - fees,
    breakEvenMonths: monthlyGain > 1e-9 ? fees / monthlyGain : null,
    longer: nNew > nOld,
  };
}

export type RenegotiationBars = {
  /** Barre « garder le prêt actuel » : intérêts restants, en % de la plus grande barre. */
  current: number;
  /** Barre « renégocier » : intérêts du nouveau prêt, puis frais, en % de la même échelle. */
  newInterest: number;
  fees: number;
  /** Écart en faveur de la renégociation (vide si l'opération coûte plus cher), à la suite de la barre « renégocier ». */
  saved: number;
};

/**
 * Découpe des deux barres « ce qu'il reste à payer » du simulateur de renégociation, sur une même échelle :
 * la plus longue des deux barres vaut 100. L'écart entre les deux longueurs est exactement le gain net (ou la perte).
 */
export function renegotiationBars(r: Pick<RenegotiationResult, 'currentRemainingInterest' | 'newInterest'>, fees: number): RenegotiationBars {
  const cur = Math.max(0, num(r.currentRemainingInterest));
  const ni = Math.max(0, num(r.newInterest));
  const f = Math.max(0, num(fees));
  const scale = Math.max(cur, ni + f);
  if (!(scale > 0)) return { current: 0, newInterest: 0, fees: 0, saved: 0 };
  const pct = (v: number) => clamp((100 * v) / scale, 0, 100, 0);
  const newInterest = pct(ni);
  const feesPct = Math.min(pct(f), 100 - newInterest);
  const current = pct(cur);
  const saved = Math.max(0, current - newInterest - feesPct);
  return { current, newInterest, fees: feesPct, saved };
}

/** Une période de la frise « mois après mois » de la renégociation. */
export type RenegotiationPhase = {
  /**
   * fees : la baisse de mensualité rembourse les frais (avant le point mort) ;
   * gain : la baisse de mensualité est économisée ;
   * freed : le nouveau prêt est fini, toute l'ancienne mensualité est économisée ;
   * extra : le prêt actuel serait fini, mais la nouvelle mensualité reste à payer.
   */
  kind: 'fees' | 'gain' | 'freed' | 'extra';
  /** Début et fin de la période, en mois depuis l'opération. */
  from: number;
  to: number;
  /** Largeur de la période sur la frise, en % de la durée totale représentée. */
  pct: number;
};

export type RenegotiationTimeline = {
  /** Durée totale représentée, en mois : la plus longue des deux durées. */
  span: number;
  /** Point mort en mois (0 sans frais), position en % de la frise. */
  breakEven: number;
  breakEvenPct: number;
  phases: RenegotiationPhase[];
};

/**
 * Frise « mois après mois » : ce que devient chaque mois l'écart de mensualité, de l'opération à la fin du plus long des deux prêts.
 * Mêmes conventions que `renegotiation` (durées arrondies au mois, point mort = frais / baisse de mensualité).
 * Renvoie null si la mensualité ne baisse pas, si une durée est nulle, ou si les frais ne sont pas couverts
 * avant la fin du plus court des deux prêts (le point mort simple n'a alors plus de sens).
 */
export function renegotiationTimeline(p: { currentYearsLeft: number; newYears: number; monthlyGain: number; breakEvenMonths: number | null }): RenegotiationTimeline | null {
  const nOld = Math.round(clamp(p.currentYearsLeft, 0, 50) * 12);
  const nNew = Math.round(clamp(p.newYears, 0, 50) * 12);
  const be = p.breakEvenMonths;
  if (!(num(p.monthlyGain) > 1e-9) || be === null || !Number.isFinite(be) || be < 0 || nOld === 0 || nNew === 0) return null;
  const common = Math.min(nOld, nNew);
  if (be >= common) return null;
  const span = Math.max(nOld, nNew);
  const pct = (m: number) => (100 * m) / span;
  const phases: RenegotiationPhase[] = [];
  const add = (kind: RenegotiationPhase['kind'], from: number, to: number) => { if (to - from > 1e-9) phases.push({ kind, from, to, pct: pct(to - from) }); };
  add('fees', 0, be);
  add('gain', be, common);
  if (nNew < nOld) add('freed', nNew, nOld);
  if (nNew > nOld) add('extra', nOld, nNew);
  return { span, breakEven: be, breakEvenPct: pct(be), phases };
}
