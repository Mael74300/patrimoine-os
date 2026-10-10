import { clamp, num, safeDiv, years as toYears } from './common';
import { amortize } from './loan';

/**
 * Immobilier locatif.
 * Les résultats « avant impôt » sont des calculs ; les résultats « après impôt » sont des ESTIMATIONS
 * fondées sur un régime fiscal simplifié choisi par l'utilisateur (voir taxableIncome).
 */
export type TaxRegime = 'aucune' | 'micro-foncier' | 'reel-foncier' | 'micro-bic' | 'reel-bic';

export type RentalInput = {
  price: number;
  notaryRate: number;
  works: number;
  furniture: number;
  monthlyRent: number;
  vacancyMonths: number;
  propertyTax: number;
  coOwnership: number; // charges non récupérables / an
  insurancePno: number;
  managementRate: number; // % des loyers encaissés
  maintenanceRate: number; // % des loyers encaissés
  downPayment: number;
  loanRate: number;
  loanYears: number;
  loanInsuranceRate: number;
  // Fiscalité paramétrable
  regime: TaxRegime;
  marginalRate: number; // tranche marginale d'imposition
  socialRate: number; // prélèvements sociaux
  microAllowance: number; // abattement forfaitaire du régime micro choisi
  annualDepreciation: number; // amortissement annuel (LMNP réel)
  // Projection
  appreciation: number; // évolution annuelle du prix du bien
  indexation: number; // évolution annuelle des loyers et charges
  horizon: number;
};

export type RentalSnapshot = {
  totalCost: number;
  loanAmount: number;
  annualRentCollected: number;
  annualCharges: number;
  grossYield: number;
  netYield: number;
  monthlyLoan: number;
  monthlyCashflow: number; // avant impôt, année 1
};

export type RentalYear = {
  year: number;
  rents: number;
  charges: number;
  interest: number;
  insurance: number;
  principalPaid: number;
  cashflowBeforeTax: number;
  taxable: number;
  tax: number;
  cashflowAfterTax: number;
  propertyValue: number;
  remaining: number;
  netEquity: number; // valeur estimée − capital restant dû
  cumulativeCashflowAfterTax: number;
  depreciationUsed: number;
};

const totalCostOf = (i: RentalInput) => Math.max(0, num(i.price)) * (1 + clamp(i.notaryRate, 0, 1)) + Math.max(0, num(i.works)) + Math.max(0, num(i.furniture));

function loanOf(i: RentalInput) {
  const loanAmount = Math.max(0, totalCostOf(i) - Math.max(0, num(i.downPayment)));
  const loan = amortize({ principal: loanAmount, annualRate: i.loanRate, years: i.loanYears, insuranceRate: i.loanInsuranceRate });
  return { loanAmount, loan };
}

function rentsAndCharges(i: RentalInput, y: number) {
  const idx = Math.pow(1 + clamp(i.indexation, -0.2, 0.2, 0), y - 1);
  const occupied = clamp(12 - num(i.vacancyMonths), 0, 12);
  const rents = Math.max(0, num(i.monthlyRent)) * occupied * idx;
  const fixed = (Math.max(0, num(i.propertyTax)) + Math.max(0, num(i.coOwnership)) + Math.max(0, num(i.insurancePno))) * idx;
  const variable = rents * (clamp(i.managementRate, 0, 1) + clamp(i.maintenanceRate, 0, 1));
  return { rents, charges: fixed + variable };
}

/** Indicateurs de la première année, avant impôt. */
export function rentalAnalysis(i: RentalInput): RentalSnapshot {
  const totalCost = totalCostOf(i);
  const { loanAmount, loan } = loanOf(i);
  const { rents, charges } = rentsAndCharges(i, 1);
  const monthlyLoan = loanAmount > 0 ? loan.monthlyPayment + loan.monthlyInsurance : 0;
  return {
    totalCost,
    loanAmount,
    annualRentCollected: rents,
    annualCharges: charges,
    grossYield: safeDiv(Math.max(0, num(i.monthlyRent)) * 12, num(i.price)),
    netYield: safeDiv(rents - charges, totalCost),
    monthlyLoan,
    monthlyCashflow: (rents - charges) / 12 - monthlyLoan,
  };
}

/**
 * Projection année par année.
 * Fiscalité simplifiée (estimation) :
 * - micro-foncier / micro-BIC : base = loyers × (1 − abattement).
 * - réel foncier : base = loyers − charges − intérêts − assurance ; un déficit est reporté sur les revenus
 *   locatifs des années suivantes (l'imputation sur le revenu global n'est pas modélisée).
 * - réel BIC (LMNP) : même base, puis amortissement déductible sans créer de déficit ; l'excédent est reporté.
 * Impôt = base × (tranche marginale + prélèvements sociaux).
 */
export function rentalProjection(i: RentalInput): RentalYear[] {
  const { loan } = loanOf(i);
  const H = toYears(i.horizon, 50);
  const taxRate = clamp(i.marginalRate, 0, 0.6) + clamp(i.socialRate, 0, 0.3);
  const allowance = clamp(i.microAllowance, 0, 1);
  let carryDeficit = 0;
  let carryDepreciation = 0;
  let cumulative = 0;
  const out: RentalYear[] = [];
  for (let y = 1; y <= H; y++) {
    const { rents, charges } = rentsAndCharges(i, y);
    const ly = loan.schedule.find((s) => s.year === y);
    const interest = ly?.interest ?? 0;
    const insurance = ly?.insurance ?? 0;
    const principalPaid = ly?.principalPaid ?? 0;
    const remaining = ly ? ly.remaining : y > (loan.schedule.at(-1)?.year ?? 0) ? 0 : loan.schedule[0]?.remaining ?? 0;
    const cashflowBeforeTax = rents - charges - interest - principalPaid - insurance;

    let taxable = 0;
    let depreciationUsed = 0;
    switch (i.regime) {
      case 'micro-foncier':
      case 'micro-bic':
        taxable = rents * (1 - allowance);
        break;
      case 'reel-foncier':
      case 'reel-bic': {
        let base = rents - charges - interest - insurance - carryDeficit;
        carryDeficit = 0;
        if (base < 0) {
          carryDeficit = -base;
          base = 0;
        }
        if (i.regime === 'reel-bic') {
          const available = Math.max(0, num(i.annualDepreciation)) + carryDepreciation;
          depreciationUsed = Math.min(available, base);
          carryDepreciation = available - depreciationUsed;
          base -= depreciationUsed;
        }
        taxable = base;
        break;
      }
      default:
        taxable = 0;
    }
    const tax = Math.max(0, taxable) * taxRate;
    const cashflowAfterTax = cashflowBeforeTax - tax;
    cumulative += cashflowAfterTax;
    const propertyValue = Math.max(0, num(i.price)) * Math.pow(1 + clamp(i.appreciation, -0.5, 0.5, 0), y);
    out.push({
      year: y, rents, charges, interest, insurance, principalPaid, cashflowBeforeTax, taxable, tax, cashflowAfterTax,
      propertyValue, remaining, netEquity: propertyValue - remaining, cumulativeCashflowAfterTax: cumulative, depreciationUsed,
    });
  }
  return out;
}

/** Hypothèses du scénario défavorable, appliquées à la saisie de l'utilisateur. */
export const ADVERSE = {
  extraVacancyMonths: 2,
  rentFactor: 0.9,
  chargesFactor: 1.2,
  appreciationDelta: -0.02,
};

export function adverseScenario(i: RentalInput): RentalInput {
  return {
    ...i,
    vacancyMonths: Math.min(12, num(i.vacancyMonths) + ADVERSE.extraVacancyMonths),
    monthlyRent: num(i.monthlyRent) * ADVERSE.rentFactor,
    propertyTax: num(i.propertyTax) * ADVERSE.chargesFactor,
    coOwnership: num(i.coOwnership) * ADVERSE.chargesFactor,
    appreciation: num(i.appreciation) + ADVERSE.appreciationDelta,
  };
}

/**
 * Impôt sur la plus-value immobilière d'un particulier (hors résidence principale), barème des abattements
 * pour durée de détention : impôt 19 % (exonération après 22 ans), prélèvements sociaux 17,2 % (exonération après 30 ans).
 * La surtaxe sur les plus-values supérieures à 50 000 € n'est pas modélisée.
 */
export function capitalGainsTaxRealEstate(gain: number, heldYears: number) {
  const g = Math.max(0, num(gain));
  const y = Math.floor(Math.max(0, num(heldYears)));
  let irAbat = 0;
  let psAbat = 0;
  for (let k = 6; k <= y; k++) {
    if (k <= 21) {
      irAbat += 0.06;
      psAbat += 0.0165;
    } else if (k === 22) {
      irAbat += 0.04;
      psAbat += 0.016;
    } else if (k <= 30) {
      psAbat += 0.09;
    }
  }
  irAbat = Math.min(1, irAbat);
  psAbat = Math.min(1, psAbat);
  const ir = g * (1 - irAbat) * 0.19;
  const ps = g * (1 - psAbat) * 0.172;
  return { ir, ps, total: ir + ps, irAllowance: irAbat, psAllowance: psAbat };
}
