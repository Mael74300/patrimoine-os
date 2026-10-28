import { clamp, monthlyRate } from './common';
import { amortize } from './loan';

/**
 * Crédit in fine ou amortissable : le in fine ne rembourse que les intérêts pendant la durée, le capital étant remboursé en une fois à
 * l'échéance, grâce à une épargne constituée à côté (rendement net supposé constant). Calcul fondé uniquement sur les hypothèses saisies
 * (taux fixe, assurance sur le capital initial, versements d'épargne en fin de mois).
 */
export type InFineInput = {
  principal: number;
  /** Taux nominal annuel du crédit. */
  annualRate: number;
  years: number;
  insuranceRate?: number;
  /** Rendement annuel net supposé de l'épargne qui reconstitue le capital. */
  savingsReturn: number;
};

export type InFineResult = {
  months: number;
  /** Crédit amortissable : mensualité hors assurance. */
  amortizingPayment: number;
  amortizingMonthlyTotal: number;
  amortizingCost: number;
  /** Crédit in fine : intérêts mensuels hors assurance. */
  inFineInterest: number;
  /** Versement mensuel d'épargne pour reconstituer le capital à l'échéance. */
  monthlySaving: number;
  /** Intérêts + épargne + assurance, par mois. */
  inFineMonthlyTotal: number;
  /** Intérêts + assurance sur la durée, hors capital. */
  inFineCost: number;
  /** Gains de l'épargne : capital reconstitué − total épargné. */
  savingsGain: number;
  /** Coût net de l'in fine : intérêts + assurance − gains de l'épargne. */
  inFineNetCost: number;
  /** Écart de coût net : in fine − amortissable (positif : l'in fine coûte plus). */
  netCostGap: number;
};

export function inFine(input: InFineInput): InFineResult {
  const principal = clamp(input.principal, 0, 1e9, 0);
  const annualRate = clamp(input.annualRate, 0, 1, 0);
  const insuranceRate = clamp(input.insuranceRate, 0, 0.1, 0);
  const years = Math.round(clamp(input.years, 1, 50, 1));
  const savingsReturn = clamp(input.savingsReturn, -0.5, 1, 0);
  const n = years * 12;
  const a = amortize({ principal, annualRate, years, insuranceRate });
  const r = monthlyRate(savingsReturn);
  // Versement d'épargne mensuel (fin de mois) qui reconstitue exactement le capital au bout de n mois.
  const monthlySaving = Math.abs(r) < 1e-12 ? principal / n : (principal * r) / (Math.pow(1 + r, n) - 1);
  const inFineInterest = (principal * annualRate) / 12;
  const monthlyInsurance = (principal * insuranceRate) / 12;
  const inFineCost = (inFineInterest + monthlyInsurance) * n;
  const savingsGain = principal - monthlySaving * n;
  const inFineNetCost = inFineCost - savingsGain;
  return {
    months: n,
    amortizingPayment: a.monthlyPayment,
    amortizingMonthlyTotal: a.monthlyPayment + a.monthlyInsurance,
    amortizingCost: a.totalCost,
    inFineInterest,
    monthlySaving,
    inFineMonthlyTotal: inFineInterest + monthlyInsurance + monthlySaving,
    inFineCost,
    savingsGain,
    inFineNetCost,
    netCostGap: inFineNetCost - a.totalCost,
  };
}
