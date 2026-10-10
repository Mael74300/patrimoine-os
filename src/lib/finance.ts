/**
 * Moteur de calcul de Patrimoine OS.
 * Fonctions pures, exécutées dans le navigateur, couvertes par des tests (finance.test.ts).
 * Conventions : taux exprimés en décimal (0.05 = 5 %), montants en euros,
 * capitalisation mensuelle équivalente au taux annuel (taux actuariel).
 */

export type YearPoint = {
  year: number;
  contributed: number; // cumul des versements (capital initial inclus)
  value: number; // valeur nominale fin d'année
  realValue: number; // valeur en euros d'aujourd'hui (déflatée)
  gains: number; // value - contributed
};

export type GrowthInput = {
  initial: number;
  monthly: number;
  annualReturn: number; // rendement brut annuel attendu
  annualFees: number; // frais annuels (enveloppe + supports)
  years: number;
  inflation: number;
  contributionGrowth?: number; // revalorisation annuelle des versements
};

/** Taux mensuel équivalent à un taux annuel (composition actuarielle). */
export function monthlyRate(annual: number): number {
  return Math.pow(1 + annual, 1 / 12) - 1;
}

/** Rendement net de frais : (1 + r) × (1 − f) − 1. */
export function netOfFees(annualReturn: number, annualFees: number): number {
  return (1 + annualReturn) * (1 - annualFees) - 1;
}

/**
 * Projection d'un capital avec versements mensuels en début de mois.
 * Retourne un point par année, l'année 0 correspondant au capital initial.
 */
export function projectGrowth(input: GrowthInput): YearPoint[] {
  const { initial, monthly, annualReturn, annualFees, years, inflation } = input;
  const growth = input.contributionGrowth ?? 0;
  const rm = monthlyRate(netOfFees(annualReturn, annualFees));
  const points: YearPoint[] = [
    { year: 0, contributed: initial, value: initial, realValue: initial, gains: 0 },
  ];
  let value = initial;
  let contributed = initial;
  let payment = monthly;
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      value = (value + payment) * (1 + rm);
      contributed += payment;
    }
    payment *= 1 + growth;
    const realValue = value / Math.pow(1 + inflation, y);
    points.push({ year: y, contributed, value, realValue, gains: value - contributed });
  }
  return points;
}

/** Versement mensuel constant nécessaire pour atteindre une cible (versements en début de mois). */
export function requiredMonthly(
  target: number,
  initial: number,
  annualNetReturn: number,
  years: number,
): number {
  const n = Math.round(years * 12);
  if (n <= 0) return Math.max(0, target - initial);
  const rm = monthlyRate(annualNetReturn);
  const fvInitial = initial * Math.pow(1 + rm, n);
  const remaining = target - fvInitial;
  if (remaining <= 0) return 0;
  if (rm === 0) return remaining / n;
  const annuityDueFactor = ((Math.pow(1 + rm, n) - 1) / rm) * (1 + rm);
  return remaining / annuityDueFactor;
}

/** Fiscalité simplifiée à la sortie : un taux unique appliqué aux plus-values. */
export function afterTax(value: number, contributed: number, taxRate: number): number {
  const gains = Math.max(0, value - contributed);
  return value - gains * taxRate;
}

// ---------------------------------------------------------------- Crédit

export type LoanInput = {
  principal: number;
  annualRate: number; // taux nominal annuel (convention bancaire : mensuel = annuel / 12)
  years: number;
  insuranceRate?: number; // assurance annuelle sur capital initial
};

export type LoanYear = { year: number; interest: number; principalPaid: number; remaining: number; insurance: number };

export type LoanResult = {
  monthlyPayment: number; // hors assurance
  monthlyInsurance: number;
  totalInterest: number;
  totalInsurance: number;
  totalCost: number; // intérêts + assurance
  schedule: LoanYear[];
};

/** Mensualité d'un prêt amortissable à échéances constantes. */
export function loanPayment(principal: number, annualRate: number, years: number): number {
  const n = Math.round(years * 12);
  if (n <= 0) return 0;
  const r = annualRate / 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export function amortize(input: LoanInput): LoanResult {
  const { principal, annualRate, years } = input;
  const n = Math.round(years * 12);
  const r = annualRate / 12;
  const pay = loanPayment(principal, annualRate, years);
  const monthlyInsurance = (principal * (input.insuranceRate ?? 0)) / 12;
  let remaining = principal;
  const schedule: LoanYear[] = [];
  let yInterest = 0;
  let yPrincipal = 0;
  let totalInterest = 0;
  for (let m = 1; m <= n; m++) {
    const interest = remaining * r;
    const princ = Math.min(pay - interest, remaining);
    remaining = Math.max(0, remaining - princ);
    yInterest += interest;
    yPrincipal += princ;
    totalInterest += interest;
    if (m % 12 === 0 || m === n) {
      schedule.push({
        year: Math.ceil(m / 12),
        interest: yInterest,
        principalPaid: yPrincipal,
        remaining,
        insurance: monthlyInsurance * (m % 12 === 0 ? 12 : m % 12),
      });
      yInterest = 0;
      yPrincipal = 0;
    }
  }
  const totalInsurance = monthlyInsurance * n;
  return {
    monthlyPayment: pay,
    monthlyInsurance,
    totalInterest,
    totalInsurance,
    totalCost: totalInterest + totalInsurance,
    schedule,
  };
}

/** Capacité d'emprunt : capital correspondant à une mensualité maximale (hors assurance). */
export function borrowingCapacity(maxMonthly: number, annualRate: number, years: number): number {
  const n = Math.round(years * 12);
  const r = annualRate / 12;
  if (n <= 0) return 0;
  if (r === 0) return maxMonthly * n;
  return (maxMonthly * (1 - Math.pow(1 + r, -n))) / r;
}

// ---------------------------------------------------------------- Immobilier locatif

export type RentalInput = {
  price: number;
  notaryRate: number; // frais d'acquisition en % du prix
  works: number;
  furniture: number;
  monthlyRent: number; // loyer hors charges
  vacancyMonths: number; // mois de vacance par an
  propertyTax: number; // taxe foncière annuelle
  coOwnership: number; // charges de copropriété non récupérables / an
  insurancePno: number; // assurance propriétaire non occupant / an
  managementRate: number; // gestion locative en % des loyers encaissés
  maintenanceRate: number; // provision entretien en % des loyers
  downPayment: number; // apport
  loanRate: number;
  loanYears: number;
  loanInsuranceRate: number;
};

export type RentalResult = {
  totalCost: number;
  loanAmount: number;
  annualRentCollected: number;
  annualCharges: number;
  grossYield: number; // loyer annuel théorique / prix
  netYield: number; // (loyers encaissés - charges) / coût total
  monthlyLoan: number; // mensualité + assurance
  monthlyCashflow: number; // avant impôt
};

export function rentalAnalysis(i: RentalInput): RentalResult {
  const totalCost = i.price * (1 + i.notaryRate) + i.works + i.furniture;
  const loanAmount = Math.max(0, totalCost - i.downPayment);
  const annualRentCollected = i.monthlyRent * Math.max(0, 12 - i.vacancyMonths);
  const annualCharges =
    i.propertyTax +
    i.coOwnership +
    i.insurancePno +
    annualRentCollected * (i.managementRate + i.maintenanceRate);
  const loan = amortize({
    principal: loanAmount,
    annualRate: i.loanRate,
    years: i.loanYears,
    insuranceRate: i.loanInsuranceRate,
  });
  const monthlyLoan = loanAmount > 0 ? loan.monthlyPayment + loan.monthlyInsurance : 0;
  return {
    totalCost,
    loanAmount,
    annualRentCollected,
    annualCharges,
    grossYield: i.price > 0 ? (i.monthlyRent * 12) / i.price : 0,
    netYield: totalCost > 0 ? (annualRentCollected - annualCharges) / totalCost : 0,
    monthlyLoan,
    monthlyCashflow: (annualRentCollected - annualCharges) / 12 - monthlyLoan,
  };
}

// ---------------------------------------------------------------- Portefeuille

export type PortfolioLine = {
  id: string;
  label: string;
  amount: number;
  expectedReturn: number; // hypothèse de rendement annuel brut
  fees: number; // frais annuels
  risk: number; // échelle 1 à 7 (type indicateur SRI), saisie par l'utilisateur
};

export type PortfolioSummary = {
  total: number;
  weights: { id: string; label: string; weight: number }[];
  grossReturn: number;
  weightedFees: number;
  netReturn: number;
  weightedRisk: number;
  annualFeesEuro: number;
};

export function summarizePortfolio(lines: PortfolioLine[]): PortfolioSummary {
  const total = lines.reduce((s, l) => s + Math.max(0, l.amount), 0);
  if (total === 0) {
    return { total: 0, weights: [], grossReturn: 0, weightedFees: 0, netReturn: 0, weightedRisk: 0, annualFeesEuro: 0 };
  }
  let gross = 0;
  let fees = 0;
  let risk = 0;
  let net = 0;
  const weights = lines.map((l) => {
    const w = Math.max(0, l.amount) / total;
    gross += w * l.expectedReturn;
    fees += w * l.fees;
    risk += w * l.risk;
    net += w * netOfFees(l.expectedReturn, l.fees);
    return { id: l.id, label: l.label, weight: w };
  });
  return {
    total,
    weights,
    grossReturn: gross,
    weightedFees: fees,
    netReturn: net,
    weightedRisk: risk,
    annualFeesEuro: total * fees,
  };
}

/** Montants à acheter/vendre pour revenir à une allocation cible. */
export function rebalance(lines: PortfolioLine[], targets: Record<string, number>): Record<string, number> {
  const total = lines.reduce((s, l) => s + l.amount, 0);
  const out: Record<string, number> = {};
  for (const l of lines) out[l.id] = total * (targets[l.id] ?? 0) - l.amount;
  return out;
}

// ---------------------------------------------------------------- Formatage

const eur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const eur2 = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2, minimumFractionDigits: 2 });
const pct = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 2 });

export const fmtEur = (n: number) => (Number.isFinite(n) ? eur.format(n) : '—');
export const fmtEur2 = (n: number) => (Number.isFinite(n) ? eur2.format(n) : '—');
export const fmtPct = (n: number) => (Number.isFinite(n) ? pct.format(n) : '—');
