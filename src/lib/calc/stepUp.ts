import { clamp, monthlyRate, num } from './common';

/**
 * Épargne dont le versement mensuel augmente chaque année, comparée au même versement constant.
 * Versements en fin de mois ; le versement est multiplié par (1 + hausse) au début de chaque année (à partir de la 2e).
 * Rendement annuel constant supposé (taux mensuel actuariel), avant frais, impôts et inflation.
 * Le rendement et la hausse sont des hypothèses saisies, jamais des prévisions.
 */
export type StepUpInput = {
  /** Versement mensuel de la première année. */
  monthly: number;
  /** Hausse annuelle du versement (0,03 = 3 %). */
  annualIncrease: number;
  annualReturn: number;
  years: number;
};

export type StepUpResult = {
  months: number;
  /** Capital à l'horizon avec versement constant. */
  flatCapital: number;
  /** Capital à l'horizon avec versement qui augmente. */
  steppedCapital: number;
  flatInvested: number;
  steppedInvested: number;
  /** steppedCapital − flatCapital. */
  extraCapital: number;
  /** Versement mensuel de la dernière année avec hausse. */
  lastMonthly: number;
  /** Versement mensuel constant qui donnerait le même capital que le versement qui augmente. */
  equivalentFlatMonthly: number;
};

export function stepUp(input: StepUpInput): StepUpResult {
  const monthly = Math.max(0, num(input.monthly));
  const increase = clamp(input.annualIncrease, -0.5, 1, 0);
  const months = Math.floor(clamp(input.years, 0, 80, 0) * 12);
  const m = monthlyRate(input.annualReturn);
  let flatCapital = 0;
  let steppedCapital = 0;
  let steppedInvested = 0;
  let current = monthly;
  for (let i = 0; i < months; i++) {
    if (i > 0 && i % 12 === 0) current *= 1 + increase;
    flatCapital = flatCapital * (1 + m) + monthly;
    steppedCapital = steppedCapital * (1 + m) + current;
    steppedInvested += current;
  }
  const flatInvested = monthly * months;
  const flatFactor = monthly > 0 ? flatCapital / monthly : 0;
  return {
    months,
    flatCapital,
    steppedCapital,
    flatInvested,
    steppedInvested,
    extraCapital: steppedCapital - flatCapital,
    lastMonthly: months > 0 ? current : monthly,
    equivalentFlatMonthly: flatFactor > 0 ? steppedCapital / flatFactor : 0,
  };
}
