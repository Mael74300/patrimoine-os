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

/** Barres de l'onglet in fine : coût de chaque crédit et part du capital couverte à mi-parcours (pourcentages de 0 à 100). */
export type InFineBars = {
  /** Coût : longueurs sur une échelle commune aux deux crédits. */
  cost: {
    amortizing: number;
    /** In fine : part nette (intérêts + assurance − gains de l'épargne). */
    inFineNet: number;
    /** In fine : part regagnée par l'épargne (gains positifs). */
    inFineRegained: number;
    /** In fine : pertes de l'épargne (rendement négatif), au-delà des intérêts + assurance. */
    inFineLost: number;
  };
  /** Mi-parcours, en mois entiers (moitié de la durée, arrondie vers le bas). */
  midMonth: number;
  /** Amortissable : capital déjà remboursé au mi-parcours, en euros. */
  amortizingRepaid: number;
  /** In fine : épargne déjà constituée au mi-parcours, en euros. */
  inFineSaved: number;
  /** Mêmes montants en pourcentage du capital emprunté. */
  amortizingRepaidPct: number;
  inFineSavedPct: number;
};

export function inFineBars(input: InFineInput): InFineBars {
  const r = inFine(input);
  const principal = clamp(input.principal, 0, 1e9, 0);
  const annualRate = clamp(input.annualRate, 0, 1, 0);
  const savingsReturn = clamp(input.savingsReturn, -0.5, 1, 0);
  const pct = (v: number, scale: number) => (scale > 0 ? clamp((100 * v) / scale, 0, 100, 0) : 0);

  const gain = r.savingsGain;
  const scale = Math.max(r.amortizingCost, r.inFineCost, r.inFineNetCost, 0);
  const inFineNet = pct(gain >= 0 ? r.inFineNetCost : r.inFineCost, scale);
  const inFineRegained = gain > 0 ? Math.min(pct(gain, scale), 100 - inFineNet) : 0;
  const inFineLost = gain < 0 ? Math.min(pct(-gain, scale), 100 - inFineNet) : 0;

  const midMonth = Math.floor(r.months / 2);
  // Amortissable : capital restant dû après midMonth mensualités (taux mensuel = taux nominal ÷ 12, comme le calculateur de crédit).
  const i = annualRate / 12;
  const remaining = i === 0
    ? principal - r.amortizingPayment * midMonth
    : principal * Math.pow(1 + i, midMonth) - (r.amortizingPayment * (Math.pow(1 + i, midMonth) - 1)) / i;
  const amortizingRepaid = clamp(principal - remaining, 0, principal, 0);
  // In fine : épargne versée en fin de mois, au taux mensuel équivalent au rendement annuel.
  const m = monthlyRate(savingsReturn);
  const saved = Math.abs(m) < 1e-12 ? r.monthlySaving * midMonth : (r.monthlySaving * (Math.pow(1 + m, midMonth) - 1)) / m;
  const inFineSaved = clamp(saved, 0, principal, 0);
  return {
    cost: { amortizing: pct(r.amortizingCost, scale), inFineNet, inFineRegained, inFineLost },
    midMonth,
    amortizingRepaid,
    inFineSaved,
    amortizingRepaidPct: pct(amortizingRepaid, principal),
    inFineSavedPct: pct(inFineSaved, principal),
  };
}
