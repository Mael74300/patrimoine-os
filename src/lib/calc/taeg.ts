import { clamp, num } from './common';
import { loanPayment } from './loan';

/**
 * TAEG (taux annuel effectif global) d'un crédit amortissable : taux annuel qui égalise le capital réellement mis à
 * disposition (capital − frais payés au départ) et la valeur actuelle de toutes les sorties mensuelles (mensualité + assurance).
 * Taux périodique mensuel i trouvé par dichotomie, taux annuel équivalent (1 + i)^12 − 1.
 * Hypothèses : échéances constantes, frais payés à la signature, assurance en % annuel du capital initial, sans garantie ni indemnité de sortie.
 */
export type TaegInput = {
  principal: number;
  annualRate: number;
  years: number;
  /** Assurance : taux annuel sur le capital initial (0,003 = 0,30 %). */
  insuranceRate: number;
  /** Frais de dossier, garantie et autres frais obligatoires payés au départ (€). */
  fees: number;
};

export type TaegResult = {
  months: number;
  monthlyPayment: number;
  monthlyInsurance: number;
  /** Mensualité assurance comprise. */
  monthlyTotal: number;
  /** Intérêts + assurance + frais. */
  totalCost: number;
  totalInterest: number;
  totalInsurance: number;
  /** Capital réellement reçu : capital − frais (≥ 0). */
  netReceived: number;
  /** TAEG annuel équivalent (décimal). */
  taeg: number;
  /** Écart TAEG − taux nominal. */
  gap: number;
};

/** Valeur actuelle de `months` flux mensuels constants `cash` au taux mensuel i. */
function annuity(cash: number, i: number, months: number): number {
  if (i === 0) return cash * months;
  return (cash * (1 - Math.pow(1 + i, -months))) / i;
}

export function taeg(input: TaegInput): TaegResult {
  const P = Math.max(0, num(input.principal));
  const months = Math.round(clamp(input.years, 0, 50) * 12);
  const nominal = clamp(input.annualRate, 0, 1, 0);
  const fees = clamp(input.fees, 0, P, 0);
  const monthlyPayment = loanPayment(P, nominal, months / 12);
  const monthlyInsurance = (P * clamp(input.insuranceRate, 0, 0.1, 0)) / 12;
  const monthlyTotal = monthlyPayment + monthlyInsurance;
  const netReceived = Math.max(0, P - fees);
  const totalInterest = months === 0 ? 0 : monthlyPayment * months - P;
  const totalInsurance = monthlyInsurance * months;
  const totalCost = months === 0 ? 0 : Math.max(0, monthlyTotal * months - P) + fees;
  let rate = 0;
  if (months > 0 && netReceived > 0) {
    // La valeur actuelle des sorties décroît quand le taux monte : dichotomie sur le taux mensuel dans [0, 1].
    let lo = 0;
    let hi = 1;
    if (annuity(monthlyTotal, 0, months) <= netReceived) hi = 0;
    for (let k = 0; k < 200 && hi > lo; k++) {
      const mid = (lo + hi) / 2;
      if (annuity(monthlyTotal, mid, months) > netReceived) lo = mid;
      else hi = mid;
    }
    rate = (lo + hi) / 2;
  }
  const t = months === 0 ? 0 : Math.pow(1 + rate, 12) - 1;
  return { months, monthlyPayment, monthlyInsurance, monthlyTotal, totalCost, totalInterest, totalInsurance, netReceived, taeg: t, gap: t - nominal };
}

/** TAEG pour plusieurs niveaux de frais, à crédit identique (comparaison d'offres). */
export function taegByFees(input: Omit<TaegInput, 'fees'>, feesList: number[]): { fees: number; taeg: number }[] {
  return feesList.map((fees) => ({ fees, taeg: taeg({ ...input, fees }).taeg }));
}

/** TAEG pour plusieurs taux d'assurance, à crédit identique. */
export function taegByInsurance(input: Omit<TaegInput, 'insuranceRate'>, rates: number[]): { insuranceRate: number; taeg: number }[] {
  return rates.map((insuranceRate) => ({ insuranceRate, taeg: taeg({ ...input, insuranceRate }).taeg }));
}

/**
 * Niveaux à comparer : la liste fixe, plus la valeur saisie si elle n'y figure pas (valeur finie et ≥ 0), triés par ordre croissant.
 * Permet de situer l'offre saisie parmi les exemples.
 */
export function taegLevels(list: number[], current: number): number[] {
  const out = list.filter((v) => Number.isFinite(v) && v >= 0);
  if (Number.isFinite(current) && current >= 0 && !out.some((v) => Math.abs(v - current) < 1e-9)) out.push(current);
  return [...new Set(out)].sort((a, b) => a - b);
}

export type TaegBar = {
  /** Largeur du taux nominal, en % de l'échelle. */
  nominal: number;
  /** Largeur de l'écart TAEG − taux nominal, en % de l'échelle (≥ 0). */
  extra: number;
};

/**
 * Barres partant de zéro : taux nominal puis écart jusqu'au TAEG, sur une échelle commune `max` (le plus grand TAEG affiché),
 * pour comparer à l'œil l'effet des frais et celui de l'assurance.
 */
export function taegBars(nominal: number, taegs: number[], max: number): TaegBar[] {
  const pct = (v: number) => (max > 0 && Number.isFinite(v) ? Math.min(100, Math.max(0, (100 * v) / max)) : 0);
  return taegs.map((t) => {
    const n = pct(Math.min(Math.max(0, nominal), Math.max(0, t)));
    return { nominal: n, extra: Math.max(0, pct(t) - n) };
  });
}
