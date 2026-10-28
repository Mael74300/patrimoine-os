import { clamp } from './common';
import { amortize } from './loan';

/**
 * Effet de la durée d'un crédit : pour un même capital et un même taux, mensualité, intérêts et coût total (intérêts + assurance, hors capital)
 * pour plusieurs durées. Calcul fondé uniquement sur les hypothèses saisies (taux fixe, assurance sur capital initial).
 */
export type LoanDurationInput = {
  principal: number;
  annualRate: number;
  insuranceRate?: number;
  /** Durées comparées, en années. */
  durations: number[];
};

export type LoanDurationRow = {
  years: number;
  monthlyPayment: number;
  /** Mensualité assurance comprise. */
  monthlyTotal: number;
  totalInterest: number;
  totalCost: number;
  /** Intérêts (hors assurance) en centimes par euro emprunté. */
  interestPerEuro: number;
};

export function loanDuration(input: LoanDurationInput): LoanDurationRow[] {
  const principal = clamp(input.principal, 0, 1e9, 0);
  const annualRate = clamp(input.annualRate, 0, 1, 0);
  const insuranceRate = clamp(input.insuranceRate, 0, 1, 0);
  return input.durations.map((d) => {
    const years = Math.round(clamp(d, 1, 50, 1));
    const a = amortize({ principal, annualRate, years, insuranceRate });
    return {
      years,
      monthlyPayment: a.monthlyPayment,
      monthlyTotal: a.monthlyPayment + a.monthlyInsurance,
      totalInterest: a.totalInterest,
      totalCost: a.totalCost,
      interestPerEuro: principal > 0 ? a.totalInterest / principal : 0,
    };
  });
}
