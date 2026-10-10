import { clamp, num } from './common';

/**
 * Crédit amortissable à échéances constantes.
 * Convention : taux mensuel = taux nominal annuel / 12. Assurance calculée sur le capital initial.
 */
export type LoanInput = {
  principal: number;
  annualRate: number;
  years: number;
  insuranceRate?: number;
};

export type LoanYear = { year: number; interest: number; principalPaid: number; insurance: number; remaining: number };

export type LoanResult = {
  monthlyPayment: number;
  monthlyInsurance: number;
  months: number;
  totalInterest: number;
  totalInsurance: number;
  totalCost: number;
  schedule: LoanYear[];
};

const months = (y: number) => Math.round(clamp(y, 0, 50) * 12);

/** Mensualité hors assurance. */
export function loanPayment(principal: number, annualRate: number, durationYears: number): number {
  const n = months(durationYears);
  const P = Math.max(0, num(principal));
  if (n === 0 || P === 0) return 0;
  const r = Math.max(0, num(annualRate)) / 12;
  if (r === 0) return P / n;
  return (P * r) / (1 - Math.pow(1 + r, -n));
}

/** Simulation mois par mois d'un capital remboursé par une mensualité fixe. */
function simulate(principal: number, r: number, payment: number, maxMonths: number, monthlyInsurance: number, startMonth = 0) {
  let remaining = principal;
  let totalInterest = 0;
  const rows: { month: number; interest: number; principal: number; insurance: number; remaining: number }[] = [];
  for (let m = 1; m <= maxMonths && remaining > 1e-9; m++) {
    const interest = remaining * r;
    const princ = Math.min(Math.max(0, payment - interest), remaining);
    remaining -= princ;
    totalInterest += interest;
    rows.push({ month: startMonth + m, interest, principal: princ, insurance: monthlyInsurance, remaining: Math.max(0, remaining) });
    if (payment <= interest && r > 0) break; // mensualité insuffisante : on arrête pour éviter une boucle infinie
  }
  return { rows, totalInterest, remaining };
}

function toYears(rows: { month: number; interest: number; principal: number; insurance: number; remaining: number }[]): LoanYear[] {
  const out: LoanYear[] = [];
  for (const row of rows) {
    const y = Math.ceil(row.month / 12);
    let cur = out[out.length - 1];
    if (!cur || cur.year !== y) {
      cur = { year: y, interest: 0, principalPaid: 0, insurance: 0, remaining: 0 };
      out.push(cur);
    }
    cur.interest += row.interest;
    cur.principalPaid += row.principal;
    cur.insurance += row.insurance;
    cur.remaining = row.remaining;
  }
  return out;
}

export function amortize(input: LoanInput): LoanResult {
  const P = Math.max(0, num(input.principal));
  const n = months(input.years);
  const r = Math.max(0, num(input.annualRate)) / 12;
  const pay = loanPayment(P, input.annualRate, input.years);
  const monthlyInsurance = (P * clamp(input.insuranceRate, 0, 0.1, 0)) / 12;
  const sim = simulate(P, r, pay, n, monthlyInsurance);
  const totalInsurance = monthlyInsurance * sim.rows.length;
  return {
    monthlyPayment: pay,
    monthlyInsurance,
    months: sim.rows.length,
    totalInterest: sim.totalInterest,
    totalInsurance,
    totalCost: sim.totalInterest + totalInsurance,
    schedule: toYears(sim.rows),
  };
}

/** Capital empruntable pour une mensualité maximale hors assurance. */
export function borrowingCapacity(maxMonthly: number, annualRate: number, durationYears: number): number {
  const n = months(durationYears);
  const M = Math.max(0, num(maxMonthly));
  const r = Math.max(0, num(annualRate)) / 12;
  if (n === 0) return 0;
  if (r === 0) return M * n;
  return (M * (1 - Math.pow(1 + r, -n))) / r;
}

// ------------------------------------------------------------------ Remboursement anticipé

export type PrepaymentInput = LoanInput & {
  /** Mois (depuis le début du prêt) à la fin duquel le remboursement est effectué. */
  atMonth: number;
  amount: number;
  /** 'duree' : mensualité conservée, durée réduite. 'mensualite' : durée conservée, mensualité réduite. */
  mode: 'duree' | 'mensualite';
  /** Appliquer le plafond légal des indemnités de remboursement anticipé (crédit immobilier). */
  withPenalty: boolean;
};

export type PrepaymentResult = {
  base: LoanResult;
  remainingBefore: number;
  prepaid: number;
  /** Indemnités : min(6 mois d'intérêts sur la somme remboursée, 3 % du capital restant dû avant remboursement). */
  penalty: number;
  newMonthlyPayment: number;
  newTotalMonths: number;
  monthsSaved: number;
  totalInterestAfter: number;
  interestSaved: number;
  netSaving: number;
  schedule: LoanYear[];
};

export function prepayment(input: PrepaymentInput): PrepaymentResult {
  const base = amortize(input);
  const P = Math.max(0, num(input.principal));
  const n = months(input.years);
  const r = Math.max(0, num(input.annualRate)) / 12;
  const at = Math.round(clamp(input.atMonth, 0, n, 0));
  const monthlyInsurance = base.monthlyInsurance;

  const first = simulate(P, r, base.monthlyPayment, at, monthlyInsurance);
  const remainingBefore = first.remaining;
  const prepaid = Math.min(Math.max(0, num(input.amount)), remainingBefore);
  const penalty = input.withPenalty ? Math.min(prepaid * r * 6, 0.03 * remainingBefore) : 0;
  const rest = remainingBefore - prepaid;
  const monthsLeft = n - at;

  let newPayment = base.monthlyPayment;
  if (input.mode === 'mensualite' && monthsLeft > 0) {
    newPayment = r === 0 ? rest / monthsLeft : (rest * r) / (1 - Math.pow(1 + r, -monthsLeft));
  }
  const second = simulate(rest, r, newPayment, monthsLeft, monthlyInsurance, at);
  const rows = [...first.rows, ...second.rows];
  const totalInterestAfter = first.totalInterest + second.totalInterest;
  const interestSaved = base.totalInterest - totalInterestAfter;
  // L'assurance sur capital initial cesse avec le prêt : les mois supprimés économisent aussi l'assurance.
  const insuranceSaved = monthlyInsurance * (base.months - rows.length);
  return {
    base,
    remainingBefore,
    prepaid,
    penalty,
    newMonthlyPayment: rest > 0 ? newPayment : 0,
    newTotalMonths: rows.length,
    monthsSaved: base.months - rows.length,
    totalInterestAfter,
    interestSaved,
    netSaving: interestSaved + insuranceSaved - penalty,
    schedule: toYears(rows),
  };
}
