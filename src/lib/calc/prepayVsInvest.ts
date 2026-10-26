import { afterTax, clamp, monthlyRate, netOfFees, num } from './common';
import { loanPayment } from './loan';

/**
 * Rembourser un crédit par anticipation ou investir la même somme, sur la durée restante du crédit.
 * - Rembourser : la mensualité est conservée, le crédit s'éteint plus tôt, les mensualités libérées sont investies.
 * - Investir : le crédit suit son échéancier, la somme est placée dès le départ.
 * Même horizon (durée restante), même rendement net de frais, même taux d'imposition des gains.
 * Assurance et indemnités de remboursement anticipé ignorées (voir la page Méthode).
 */
export type PrepayVsInvestInput = {
  balance: number;
  annualRate: number;
  remainingYears: number;
  lump: number;
  annualReturn: number;
  annualFees: number;
  taxRate: number;
};

export type PrepayVsInvestResult = {
  lump: number;
  monthlyPayment: number;
  /** Mois restants avant extinction du crédit si l'on rembourse. */
  monthsIfPrepaid: number;
  monthsSaved: number;
  interestSaved: number;
  /** Patrimoine net à l'horizon (après impôt sur les gains). */
  wealthPrepay: number;
  wealthInvest: number;
  /** Avantage de l'option investir (négatif = rembourser est meilleur). */
  advantageInvest: number;
  /** Rendement brut annuel pour lequel les deux options s'équivalent ; null si hors de 0–30 %. */
  breakEvenReturn: number | null;
};

type Run = { months: number; interest: number; wealth: number };

function run(i: PrepayVsInvestInput, prepay: boolean, annualReturn: number): Run {
  const balance = Math.max(0, num(i.balance));
  const n = Math.round(clamp(i.remainingYears, 0, 50) * 12);
  const lump = Math.min(Math.max(0, num(i.lump)), balance);
  const r = Math.max(0, num(i.annualRate)) / 12;
  const pay = loanPayment(balance, i.annualRate, n / 12);
  const mr = monthlyRate(netOfFees(annualReturn, i.annualFees));
  let bal = prepay ? balance - lump : balance;
  let pot = prepay ? 0 : lump;
  let invested = prepay ? 0 : lump;
  let interest = 0;
  let months = 0;
  for (let m = 1; m <= n; m++) {
    pot *= 1 + mr;
    if (bal > 1e-9) {
      const it = bal * r;
      const paid = Math.min(pay, bal + it);
      interest += it;
      bal = bal + it - paid;
      if (bal < 1e-6) bal = 0;
      months = m;
      const freed = pay - paid;
      pot += freed;
      invested += freed;
    } else {
      pot += pay;
      invested += pay;
    }
  }
  return { months, interest, wealth: afterTax(pot, invested, i.taxRate) - bal };
}

export function prepayVsInvest(input: PrepayVsInvestInput): PrepayVsInvestResult {
  const balance = Math.max(0, num(input.balance));
  const n = Math.round(clamp(input.remainingYears, 0, 50) * 12);
  const lump = Math.min(Math.max(0, num(input.lump)), balance);
  const a = run(input, true, input.annualReturn);
  const b = run(input, false, input.annualReturn);
  const diff = (ret: number) => run(input, false, ret).wealth - run(input, true, ret).wealth;
  let breakEvenReturn: number | null = null;
  if (n > 0 && lump > 0) {
    let lo = 0;
    let hi = 0.3;
    if (diff(lo) < 0 && diff(hi) > 0) {
      for (let k = 0; k < 60; k++) {
        const mid = (lo + hi) / 2;
        if (diff(mid) < 0) lo = mid;
        else hi = mid;
      }
      breakEvenReturn = (lo + hi) / 2;
    }
  }
  return {
    lump,
    monthlyPayment: loanPayment(balance, input.annualRate, n / 12),
    monthsIfPrepaid: a.months,
    monthsSaved: Math.max(0, b.months - a.months),
    interestSaved: Math.max(0, b.interest - a.interest),
    wealthPrepay: a.wealth,
    wealthInvest: b.wealth,
    advantageInvest: b.wealth - a.wealth,
    breakEvenReturn,
  };
}
