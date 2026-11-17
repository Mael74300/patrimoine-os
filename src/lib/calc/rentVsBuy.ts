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
  /** Valeur de revente, frais de revente déduits (finalValue × (1 − frais de revente)). */
  netSaleValue: number;
  /** Épargne du propriétaire : mois où il dépense moins que le loyer, différence placée. */
  buyerSavings: number;
  /** Part du patrimoine du locataire venant de l'apport et des frais d'achat placés dès le départ (gains compris). */
  renterFromStart: number;
  /** Part du patrimoine du locataire venant des économies mensuelles placées (gains compris). */
  renterFromMonthly: number;
  /** Dépense du propriétaire le premier mois : mensualité et charges (taxe foncière, entretien). */
  firstOwnerOutflow: number;
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
  let renterStart = renterPf;
  let firstOwnerOutflow = 0;
  let buyerPf = 0;
  const wealth = (): [number, number] => [value * (1 - sell) - debt + buyerPf, renterPf];
  const series: RentVsBuyResult['series'] = [];
  const diffs: number[] = [];
  for (let m = 1; m <= months; m++) {
    const interest = debt * rLoan;
    const due = m <= loanYears * 12 && debt > 1e-9 ? Math.min(payment, debt + interest) : 0;
    debt = Math.max(0, debt - (due - interest));
    const buyerOutflow = due + value * ownerRate;
    if (m === 1) firstOwnerOutflow = buyerOutflow;
    const d = buyerOutflow - rent;
    renterPf *= 1 + rI;
    renterStart *= 1 + rI;
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
  return {
    months, loanAmount, monthlyPayment: payment, buyerWealth, renterWealth, advantage: buyerWealth - renterWealth, finalValue: value, remainingDebt: debt,
    netSaleValue: value * (1 - sell), buyerSavings: buyerPf, renterFromStart: renterStart, renterFromMonthly: renterPf - renterStart, firstOwnerOutflow, breakEvenMonth, series,
  };
}

/** Écart (acheter − louer) pour plusieurs hypothèses de hausse annuelle du prix du bien. */
export function advantageByPriceGrowth(input: RentVsBuyInput, growths: number[]): { growth: number; advantage: number }[] {
  return growths.map((priceGrowth) => ({ growth: priceGrowth, advantage: rentVsBuy({ ...input, priceGrowth }).advantage }));
}

/** Écart (acheter − louer) pour plusieurs horizons de détention (en années). */
export function advantageByHorizon(input: RentVsBuyInput, horizons: number[]): { years: number; advantage: number }[] {
  return horizons.map((horizonYears) => ({ years: horizonYears, advantage: rentVsBuy({ ...input, horizonYears }).advantage }));
}

/**
 * Zone du graphique « année après année » où l'achat l'emporte pour de bon, en index de la série
 * (index 0 = fin de la 1re année, donc le mois m est à l'index m / 12 − 1). Aucune zone si l'achat
 * ne l'emporte pas ou si la zone serait réduite à un point (dernière année seulement).
 */
export function breakEvenBand(breakEvenMonth: number | null, points: number): { from: number; to: number } | null {
  if (breakEvenMonth === null || !(points >= 2)) return null;
  const from = Math.max(0, breakEvenMonth / 12 - 1);
  const to = points - 1;
  return from < to ? { from, to } : null;
}

/**
 * Liste de scénarios affichée sous les résultats : valeurs de référence plus la valeur saisie
 * (si elle est dans [min, max]), sans doublon (à 1e-9 près), triées par ordre croissant.
 */
export function scenarioValues(base: number[], current: number, min: number, max: number): number[] {
  const all = [...base];
  if (Number.isFinite(current) && current >= min && current <= max && !all.some((v) => Math.abs(v - current) < 1e-9)) all.push(current);
  return all.sort((a, b) => a - b);
}

/**
 * Barres divergentes « acheter ou louer » : pour chaque écart (acheter − louer), le côté qui l'emporte
 * et la longueur de la barre en % de la demi-piste (écart le plus grand en valeur absolue = 100 %).
 * Un écart arrondi à l'euro nul est « égalité » (barre vide) ; un écart non nul garde au moins 2 %.
 */
export function advantageBars(advantages: number[]): { side: 'buy' | 'rent' | 'tie'; pct: number }[] {
  const max = Math.max(0, ...advantages.map((a) => (Number.isFinite(a) ? Math.abs(a) : 0)));
  return advantages.map((a) => {
    if (!Number.isFinite(a) || Math.round(a) === 0 || max === 0) return { side: 'tie' as const, pct: 0 };
    return { side: a > 0 ? ('buy' as const) : ('rent' as const), pct: Math.max(2, (Math.abs(a) / max) * 100) };
  });
}

/**
 * Barres « ce que possède chacun » à l'horizon, en % d'une même échelle (la plus longue des deux barres = 100 %).
 * Propriétaire : logement revendu (frais déduits) découpé en part à lui et part encore due à la banque, plus son
 * épargne éventuelle. Locataire : mise de départ placée, puis économies mensuelles placées.
 * Si le prêt restant dépasse la valeur de revente, toute la barre du logement est due à la banque.
 */
export function wealthBars(r: Pick<RentVsBuyResult, 'netSaleValue' | 'remainingDebt' | 'buyerSavings' | 'renterFromStart' | 'renterFromMonthly'>): {
  owned: number; owed: number; savings: number; start: number; monthly: number;
} {
  const pos = (x: number) => (Number.isFinite(x) ? Math.max(0, x) : 0);
  const sale = pos(r.netSaleValue);
  const owed = Math.min(sale, pos(r.remainingDebt));
  const owned = sale - owed;
  const savings = pos(r.buyerSavings);
  const start = pos(r.renterFromStart);
  const monthly = pos(r.renterFromMonthly);
  const max = Math.max(sale + savings, start + monthly);
  if (!(max > 0)) return { owned: 0, owed: 0, savings: 0, start: 0, monthly: 0 };
  const pct = (x: number) => (x / max) * 100;
  return { owned: pct(owned), owed: pct(owed), savings: pct(savings), start: pct(start), monthly: pct(monthly) };
}
