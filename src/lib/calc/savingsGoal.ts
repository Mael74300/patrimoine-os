import { clamp, monthlyRate, num, safeDiv } from './common';
import { monthlySavingNeeded } from './precaution';

/**
 * Objectif d'épargne : versement mensuel à prévoir pour atteindre un montant (apport, voyage, travaux, véhicule…)
 * à une échéance donnée. Intérêts au taux mensuel équivalent, versements en fin de mois, avant impôt.
 */
export type SavingsGoalInput = {
  target: number;
  current: number;
  years: number;
  annualRate: number;
};

export type SavingsGoalResult = {
  months: number;
  /** Versement mensuel nécessaire (0 si l'objectif est déjà couvert). */
  monthly: number;
  /** Total des versements sur la période, sans l'épargne de départ. */
  deposits: number;
  /** Intérêts cumulés : objectif − épargne de départ − versements (≥ 0). */
  interest: number;
  /** Part de l'objectif apportée par les intérêts (0 à 1). */
  interestShare: number;
  /** Solde à la fin de chaque année (0 = départ), versement mensuel nécessaire appliqué. */
  series: number[];
};

export function savingsGoal(input: SavingsGoalInput): SavingsGoalResult {
  const target = Math.max(0, num(input.target));
  const current = Math.max(0, num(input.current));
  const months = Math.floor(clamp(input.years, 0, 60, 0)) * 12;
  const rate = clamp(input.annualRate, -0.05, 0.2, 0);
  const monthly = monthlySavingNeeded(target, current, months, rate);
  const r = monthlyRate(rate);
  const series: number[] = [current];
  let balance = current;
  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + r) + monthly;
    if (m % 12 === 0) series.push(balance);
  }
  const deposits = monthly * months;
  const reached = Math.max(target, current);
  const interest = months === 0 ? 0 : Math.max(0, balance - current - deposits);
  return { months, monthly, deposits, interest, interestShare: safeDiv(interest, reached), series };
}

/** Versement mensuel nécessaire pour plusieurs taux annuels, à objectif et durée identiques. */
export function monthlyByRate(input: Omit<SavingsGoalInput, 'annualRate'>, rates: number[]): { rate: number; monthly: number }[] {
  const months = Math.floor(clamp(input.years, 0, 60, 0)) * 12;
  return rates.map((rate) => ({ rate, monthly: monthlySavingNeeded(input.target, input.current, months, rate) }));
}

/** Versement mensuel nécessaire pour plusieurs durées (en années), à objectif et taux identiques. */
export function monthlyByDuration(input: Omit<SavingsGoalInput, 'years'>, durations: number[]): { years: number; monthly: number }[] {
  return durations.map((years) => ({ years, monthly: monthlySavingNeeded(input.target, input.current, Math.floor(clamp(years, 0, 60, 0)) * 12, input.annualRate) }));
}

export type GoalDurationRow = {
  years: number;
  monthly: number;
  /** Épargne de départ. */
  current: number;
  /** Total des versements mensuels. */
  deposits: number;
  /** Intérêts cumulés (négatifs si le rendement est négatif). */
  interest: number;
  /** Solde final (objectif atteint, ou plus si l'épargne de départ suffit déjà). */
  final: number;
};

/**
 * Composition du montant final pour plusieurs échéances (en années) : épargne de départ, versements et intérêts.
 * Chaque ligne reprend exactement le calcul de `savingsGoal`, pour rester cohérente avec les cartes de résultat.
 */
export function goalByDuration(input: Omit<SavingsGoalInput, 'years'>, durations: number[]): GoalDurationRow[] {
  const current = Math.max(0, num(input.current));
  return durations.map((years) => {
    const r = savingsGoal({ ...input, years });
    const final = r.series[r.series.length - 1];
    return { years: r.months / 12, monthly: r.monthly, current, deposits: r.deposits, interest: final - current - r.deposits, final };
  });
}

/**
 * Découpe d'une barre en pourcentages d'une échelle commune : épargne de départ, versements, intérêts gagnés,
 * et part perdue quand le rendement est négatif (la barre mesure alors ce qui a été mis, la partie gardée vaut le solde final).
 */
export function goalSplit(row: GoalDurationRow, scale: number): { current: number; deposits: number; interest: number; lost: number } {
  const pct = (v: number) => (scale > 0 ? Math.max(0, (v / scale) * 100) : 0);
  if (row.interest >= 0) return { current: pct(row.current), deposits: pct(row.deposits), interest: pct(row.interest), lost: 0 };
  const loss = Math.min(-row.interest, row.current + row.deposits);
  const fromDeposits = Math.min(loss, row.deposits);
  return { current: pct(row.current - (loss - fromDeposits)), deposits: pct(row.deposits - fromDeposits), interest: 0, lost: pct(loss) };
}

/** Échelle commune des barres : la plus grande somme mise de côté ou le plus grand solde final. */
export function goalScale(rows: GoalDurationRow[]): number {
  return rows.reduce((m, r) => Math.max(m, r.final, r.current + r.deposits), 0);
}
