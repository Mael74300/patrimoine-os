import { clamp, deflate, monthlyRate, netOfFees, num, years as toYears } from './common';

/** Retrait ponctuel effectué en fin d'année `year`. */
export type Withdrawal = { year: number; amount: number };
/** À partir de l'année `fromYear` (incluse), le versement mensuel devient `monthly`. */
export type SavingsChange = { fromYear: number; monthly: number };

export type GrowthInput = {
  initial: number;
  monthly: number;
  annualReturn: number;
  annualFees: number;
  years: number;
  inflation: number;
  /** Revalorisation annuelle des versements, appliquée depuis le début de chaque phase. */
  contributionGrowth?: number;
  withdrawals?: Withdrawal[];
  savingsChanges?: SavingsChange[];
};

export type YearPoint = {
  year: number;
  contributed: number; // cumul des versements (capital initial inclus)
  withdrawn: number; // cumul des retraits effectivement réalisés
  value: number; // valeur nominale en fin d'année, après retrait
  realValue: number; // valeur en euros d'aujourd'hui
  gains: number; // value + withdrawn − contributed
};

/** Versement mensuel applicable pendant l'année y (1 = première année). */
export function monthlyFor(y: number, input: GrowthInput): number {
  let base = Math.max(0, num(input.monthly));
  let start = 1;
  const changes = [...(input.savingsChanges ?? [])].filter((c) => num(c.fromYear) >= 1).sort((a, b) => a.fromYear - b.fromYear);
  for (const c of changes) {
    if (c.fromYear <= y) {
      base = Math.max(0, num(c.monthly));
      start = Math.floor(c.fromYear);
    }
  }
  return base * Math.pow(1 + clamp(input.contributionGrowth, -0.5, 1, 0), y - start);
}

/**
 * Projection d'un capital : versements en début de mois, capitalisation mensuelle actuarielle
 * au taux net de frais, retraits ponctuels en fin d'année (plafonnés au capital disponible).
 */
export function projectGrowth(input: GrowthInput): YearPoint[] {
  const n = toYears(input.years);
  const rm = monthlyRate(netOfFees(input.annualReturn, input.annualFees));
  const initial = Math.max(0, num(input.initial));
  let value = initial;
  let contributed = initial;
  let withdrawn = 0;
  const points: YearPoint[] = [{ year: 0, contributed, withdrawn, value, realValue: value, gains: 0 }];
  for (let y = 1; y <= n; y++) {
    const payment = monthlyFor(y, input);
    for (let m = 0; m < 12; m++) {
      value = (value + payment) * (1 + rm);
      contributed += payment;
    }
    const wanted = (input.withdrawals ?? []).filter((w) => Math.floor(num(w.year)) === y).reduce((s, w) => s + Math.max(0, num(w.amount)), 0);
    const taken = Math.min(wanted, Math.max(0, value));
    value -= taken;
    withdrawn += taken;
    value = Math.max(0, value);
    points.push({ year: y, contributed, withdrawn, value, realValue: deflate(value, input.inflation, y), gains: value + withdrawn - contributed });
  }
  return points;
}

/** Versement mensuel constant nécessaire pour atteindre une cible (versements en début de mois). */
export function requiredMonthly(target: number, initial: number, annualNetReturn: number, durationYears: number): number {
  const n = Math.round(Math.max(0, num(durationYears)) * 12);
  const t = num(target);
  const i0 = Math.max(0, num(initial));
  if (n === 0) return 0;
  const rm = monthlyRate(annualNetReturn);
  const remaining = t - i0 * Math.pow(1 + rm, n);
  if (remaining <= 0) return 0;
  if (Math.abs(rm) < 1e-12) return remaining / n;
  return remaining / (((Math.pow(1 + rm, n) - 1) / rm) * (1 + rm));
}
