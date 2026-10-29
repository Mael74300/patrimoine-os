import { amortize } from './calc/loan';
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
