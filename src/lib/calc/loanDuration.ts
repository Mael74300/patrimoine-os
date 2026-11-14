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

export type LoanDurationBar = {
  years: number;
  /** Largeur de la barre « mensualité », en % de la plus forte mensualité comparée. */
  monthly: number;
  /** Part « intérêts » de la barre « coût total », en % du plus fort coût total comparé. */
  interest: number;
  /** Part « assurance » de la barre « coût total », même échelle. */
  insurance: number;
};

/**
 * Barres du simulateur « Quelle durée ? » : chaque mensualité sur l'échelle de la plus forte,
 * chaque coût total (intérêts + assurance) sur l'échelle du plus fort. Toujours entre 0 et 100.
 */
export function loanDurationBars(rows: LoanDurationRow[]): LoanDurationBar[] {
  const maxMonthly = Math.max(0, ...rows.map((r) => r.monthlyTotal));
  const maxCost = Math.max(0, ...rows.map((r) => r.totalCost));
  const pct = (v: number, max: number) => (max > 0 && Number.isFinite(v) ? Math.min(100, Math.max(0, (100 * v) / max)) : 0);
  return rows.map((r) => {
    const interest = pct(r.totalInterest, maxCost);
    return {
      years: r.years,
      monthly: pct(r.monthlyTotal, maxMonthly),
      interest,
      insurance: Math.max(0, pct(r.totalCost, maxCost) - interest),
    };
  });
}
