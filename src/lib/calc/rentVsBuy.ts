import { clamp, monthlyRate, num } from './common';
import { loanPayment } from './loan';

/**
 * Louer ou acheter sa résidence principale : comparaison du patrimoine net à l'horizon choisi.
 * Hypothèses : prêt à échéances constantes, valeur du bien et loyer indexés au taux saisi, charges de propriété
 * en % de la valeur courante, apport et frais d'acquisition placés par le locataire au taux saisi, écart mensuel
 * entre les deux budgets placé par celui des deux qui paie le moins, avant impôt.
 */
export type RentVsBuyInput = {
  price: number;
  downPayment: number;
  /** Frais d'acquisition, en part du prix (hypothèse saisie). */
  acquisitionRate: number;
  loanRate: number;
  loanYears: number;
  /** Taxe foncière, charges de copropriété non récupérables, entretien : part annuelle de la valeur du bien. */
  ownerCostRate: number;
  priceGrowth: number;
  /** Frais de revente, en part du prix de vente. */
  sellingRate: number;
  monthlyRent: number;
  rentGrowth: number;
  investReturn: number;
  horizonYears: number;
};

export type RentVsBuyResult = {
  months: number;
  loanAmount: number;
  monthlyPayment: number;
  /** Patrimoine net du propriétaire : valeur du bien − frais de revente − capital restant dû + épargne éventuelle. */
  buyerWealth: number;
  /** Patrimoine du locataire : apport, frais et écarts mensuels placés. */
  renterWealth: number;
  /** buyerWealth − renterWealth (positif : acheter l'emporte). */
  advantage: number;
  finalValue: number;
  remainingDebt: number;
  /** Premier mois où acheter l'emporte durablement jusqu'à l'horizon, ou null. */
  breakEvenMonth: number | null;
  /** Écart annuel (fin d'année 1..n). */
  series: { year: number; buyer: number; renter: number }[];
};

export function rentVsBuy(input: RentVsBuyInput): RentVsBuyResult {
  const price = Math.max(0, num(input.price));
  const down = Math.min(price, Math.max(0, num(input.downPayment)));
  const acq = clamp(input.acquisitionRate, 0, 0.3, 0);
  const sell = clamp(input.sellingRate, 0, 0.3, 0);
  const years = Math.floor(clamp(input.horizonYears, 0, 50, 0));
  const months = years * 12;
  const loanYears = Math.floor(clamp(input.loanYears, 0, 50, 0));
  const loanAmount = price - down;
  const rLoan = Math.max(0, num(input.loanRate)) / 12;
  const payment = loanPayment(loanAmount, input.loanRate, loanYears);
  const ownerRate = clamp(input.ownerCostRate, 0, 0.1, 0) / 12;
  const gP = monthlyRate(clamp(input.priceGrowth, -0.1, 0.15, 0));
  const gR = monthlyRate(clamp(input.rentGrowth, -0.1, 0.15, 0));
  const rI = monthlyRate(clamp(input.investReturn, -0.1, 0.2, 0));

  let value = price;
  let rent = Math.max(0, num(input.monthlyRent));
  let debt = loanAmount;
  let renterPf = down + price * acq;
  let buyerPf = 0;
  const wealth = (): [number, number] => [value * (1 - sell) - debt + buyerPf, renterPf];
  const series: RentVsBuyResult['series'] = [];
  const diffs: number[] = [];
  for (let m = 1; m <= months; m++) {
    const interest = debt * rLoan;
    const due = m <= loanYears * 12 && debt > 1e-9 ? Math.min(payment, debt + interest) : 0;
    debt = Math.max(0, debt - (due - interest));
    const buyerOutflow = due + value * ownerRate;
    const d = buyerOutflow - rent;
    renterPf *= 1 + rI;
    buyerPf *= 1 + rI;
    if (d > 0) renterPf += d;
    else buyerPf += -d;
    value *= 1 + gP;
    rent *= 1 + gR;
    const [b, r] = wealth();
    diffs.push(b - r);
    if (m % 12 === 0) series.push({ year: m / 12, buyer: b, renter: r });
  }
  const [buyerWealth, renterWealth] = wealth();
  let breakEvenMonth: number | null = null;
  for (let i = diffs.length - 1; i >= 0 && diffs[i] > 0; i--) breakEvenMonth = i + 1;
  return { months, loanAmount, monthlyPayment: payment, buyerWealth, renterWealth, advantage: buyerWealth - renterWealth, finalValue: value, remainingDebt: debt, breakEvenMonth, series };
}

/** Écart (acheter − louer) pour plusieurs hypothèses de hausse annuelle du prix du bien. */
export function advantageByPriceGrowth(input: RentVsBuyInput, growths: number[]): { growth: number; advantage: number }[] {
  return growths.map((priceGrowth) => ({ growth: priceGrowth, advantage: rentVsBuy({ ...input, priceGrowth }).advantage }));
}

/** Écart (acheter − louer) pour plusieurs horizons de détention (en années). */
export function advantageByHorizon(input: RentVsBuyInput, horizons: number[]): { years: number; advantage: number }[] {
  return horizons.map((horizonYears) => ({ years: horizonYears, advantage: rentVsBuy({ ...input, horizonYears }).advantage }));
}
