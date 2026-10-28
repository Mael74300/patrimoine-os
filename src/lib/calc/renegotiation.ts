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
