import { amortize } from './calc/loan';
import { debtRatio, HCSF } from './calc/debtRatio';
import { simpleVsCompound } from './calc/simpleVsCompound';

/** Exemple fictif du schéma « Intérêts simples ou composés » : toutes les valeurs sont calculées, jamais saisies à la main. */
export const SNOWBALL_EXAMPLE = { initial: 10000, annualRate: 0.05, years: [10, 20] as const };

export type SnowballBar = { kind: 'simple' | 'compound'; capital: number; interest: number; total: number };
export type SnowballGroup = { year: number; simple: SnowballBar; compound: SnowballBar };

export function snowballGroups(): SnowballGroup[] {
  const { initial, annualRate, years } = SNOWBALL_EXAMPLE;
  const r = simpleVsCompound({ initial, annualRate, years: Math.max(...years) });
  return years.map((year) => {
    const row = r.rows[year];
    return {
      year,
      simple: { kind: 'simple', capital: initial, interest: row.simple - initial, total: row.simple },
      compound: { kind: 'compound', capital: initial, interest: row.compound - initial, total: row.compound },
    };
  });
}

/** Exemple fictif du guide « investir à crédit » : 180 000 € à 3,5 % sur 20 ans, hors assurance. */
export const LOAN_EXAMPLE = { principal: 180000, annualRate: 0.035, years: 20, shownYears: [1, 10, 20] as const };

export type LoanSlice = { year: number; interest: number; principal: number; total: number };

/** Répartition des remboursements d'une année entre intérêts et capital, calculée par le simulateur de crédit. */
export function loanSlices(): { monthly: number; slices: LoanSlice[] } {
  const { principal, annualRate, years, shownYears } = LOAN_EXAMPLE;
  const r = amortize({ principal, annualRate, years });
  return {
    monthly: r.monthlyPayment,
    slices: shownYears.map((year) => {
      const row = r.schedule[year - 1];
      return { year, interest: row.interest, principal: row.principalPaid, total: row.interest + row.principalPaid };
    }),
  };
}

/** Exemple fictif du guide « Inflation » : 10 000 € pendant 10 ans, inflation constante de 2 %, placement à 3 %. */
export const INFLATION_EXAMPLE = { initial: 10000, inflation: 0.02, rate: 0.03, years: 10 };

export type InflationBar = { label: string; shown: number; real: number };

/** Montant affiché et pouvoir d'achat (en euros d'aujourd'hui) au bout de la période, calculés avec les formules du guide. */
export function inflationBars(): InflationBar[] {
  const { initial, inflation, rate, years } = INFLATION_EXAMPLE;
  const deflator = Math.pow(1 + inflation, years);
  const placed = initial * Math.pow(1 + rate, years);
  return [
    { label: 'Laissée telle quelle', shown: initial, real: initial / deflator },
    { label: 'Placée à 3 % par an', shown: placed, real: placed / deflator },
  ];
}

/** Exemple fictif du guide « Diversifier » : une année où les actions perdent 20 % et un placement prudent gagne 2 %. */
export const DIVERSIFICATION_EXAMPLE = { stocksReturn: -0.2, safeReturn: 0.02, stocksShares: [1, 0.7] };

export type DiversificationRow = { stocks: number; safe: number; result: number };

/** Rendement de l'année pour chaque répartition : moyenne des rendements pondérée par la part de chaque placement. */
export function diversificationRows(): DiversificationRow[] {
  const { stocksReturn, safeReturn, stocksShares } = DIVERSIFICATION_EXAMPLE;
  return stocksShares.map((s) => ({ stocks: s, safe: 1 - s, result: s * stocksReturn + (1 - s) * safeReturn }));
}

/** Exemple fictif du guide « investir à crédit » : bien de 200 000 €, 20 000 € d'apport, 180 000 € empruntés à 3,5 % sur 20 ans, loyers nets de charges de 5 % ou 3 % du prix. */
export const LEVERAGE_EXAMPLE = { price: 200000, down: 20000, netYields: [0.05, 0.03] as const };

export type LeverageBar = { yieldPct: number; income: number; interestPaid: number; left: number; shortfall: number };

/** Première année : ce que rapporte le bien (net de charges), ce qui part en intérêts, ce qu'il reste (ou ce qui manque) avant impôt. */
export function leverageBars(): { interest: number; down: number; bars: LeverageBar[] } {
  const { price, down, netYields } = LEVERAGE_EXAMPLE;
  const interest = loanSlices().slices[0].interest;
  return {
    interest,
    down,
    bars: netYields.map((y) => {
      const income = price * y;
      return { yieldPct: y * 100, income, interestPaid: Math.min(income, interest), left: Math.max(0, income - interest), shortfall: Math.max(0, interest - income) };
    }),
  };
}

/** Exemple fictif du guide « Rentabilité locative » : bien à 150 000 €, loyer 750 €/mois, frais d'acquisition 8 %, travaux 10 000 €, un mois de vacance, 2 060 € de charges par an. */
export const RENDEMENT_EXAMPLE = { price: 150000, monthlyRent: 750, acquisitionFeesRate: 0.08, works: 10000, vacancyMonths: 1, yearlyCharges: 2060 };

export type RendementStep = { label: string; detail: string; value: number };

/** Les quatre étapes de la chute du rendement, du « brut des annonces » au « net de charges », calculées avec les formules du guide. */
export function rendementSteps(): RendementStep[] {
  const { price, monthlyRent, acquisitionFeesRate, works, vacancyMonths, yearlyCharges } = RENDEMENT_EXAMPLE;
  const cost = price * (1 + acquisitionFeesRate) + works;
  const rents = monthlyRent * (12 - vacancyMonths);
  return [
    { label: 'Rendement brut', detail: 'loyers annuels ÷ prix d’achat', value: (monthlyRent * 12) / price },
    { label: 'En ajoutant frais d’achat et travaux', detail: 'même loyer, mais un coût total plus élevé', value: (monthlyRent * 12) / cost },
    { label: 'En retirant un mois sans locataire', detail: 'seuls 11 loyers sur 12 sont encaissés', value: rents / cost },
    { label: 'Rendement net de charges', detail: 'après taxe foncière, assurance, entretien…', value: (rents - yearlyCharges) / cost },
  ];
}

/** Exemple fictif du guide « Taux d'endettement » : 3 000 € de revenus nets par mois, 200 € de crédit en cours, 850 € de nouvelle mensualité. */
export const ENDETTEMENT_EXAMPLE = { income: 3000, existingPayments: 200, newPayment: 850 };

/** Découpage des revenus de l'exemple, calculé avec le simulateur d'endettement (aucune valeur saisie à la main). */
export function endettementParts() {
  const { income, existingPayments, newPayment } = ENDETTEMENT_EXAMPLE;
  const r = debtRatio({ income, existingPayments, newPayment, livingCosts: 0, householdSize: 1 });
  return {
    income,
    existing: existingPayments,
    added: newPayment,
    rest: income - existingPayments - newPayment,
    ratioAfter: r.ratioAfter,
    limit: income * HCSF.maxRatio,
    maxNewPayment: r.maxNewPayment,
  };
}
