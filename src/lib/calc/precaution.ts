import { clamp, monthlyRate, num } from './common';

/**
 * Épargne de précaution : réserve disponible immédiatement pour faire face à un imprévu
 * (perte de revenus, réparation, dépense de santé). Aucune règle officielle n'en fixe le montant :
 * les durées proposées sont des repères pédagogiques à adapter à chaque situation.
 */
export type PrecautionProfile = 'stable' | 'variable' | 'independant';

/** Repères indicatifs, en mois de dépenses (non réglementaires). */
export const PROFILE_MONTHS: Record<PrecautionProfile, { label: string; months: number }> = {
  stable: { label: 'Revenus stables (CDI, fonction publique, retraite)', months: 3 },
  variable: { label: 'Revenus variables (CDD, intérim, primes importantes)', months: 6 },
  independant: { label: 'Indépendant, dirigeant, revenus irréguliers', months: 9 },
};

export type PrecautionInput = {
  monthlyExpenses: number;
  months: number;
  extraReserve: number; // dépenses prévisibles à couvrir en plus : franchise, réparation, appareil…
  currentSavings: number;
  monthlySaving: number;
  annualRate: number;
};

/** Montant visé = dépenses mensuelles × nombre de mois + réserve complémentaire. */
export function precautionTarget(i: Pick<PrecautionInput, 'monthlyExpenses' | 'months' | 'extraReserve'>): number {
  return Math.max(0, num(i.monthlyExpenses)) * clamp(i.months, 0, 120, 0) + Math.max(0, num(i.extraReserve));
}

/** Nombre de mois de dépenses couverts par l'épargne actuelle (Infinity si dépenses nulles et épargne positive). */
export function monthsCovered(savings: number, monthlyExpenses: number): number {
  const e = Math.max(0, num(monthlyExpenses));
  const s = Math.max(0, num(savings));
  if (e === 0) return s > 0 ? Infinity : 0;
  return s / e;
}

export type PrecautionMonth = { month: number; balance: number; interest: number };

/**
 * Constitution mois par mois : intérêts au taux mensuel équivalent puis versement en fin de mois.
 * Approximation : les livrets réglementés calculent les intérêts par quinzaine et les créditent une fois par an.
 */
export function precautionPath(i: PrecautionInput, maxMonths = 600): { series: PrecautionMonth[]; reachedAt: number | null; target: number } {
  const target = precautionTarget(i);
  const r = monthlyRate(clamp(i.annualRate, -0.05, 0.2, 0));
  const s = Math.max(0, num(i.monthlySaving));
  let balance = Math.max(0, num(i.currentSavings));
  const series: PrecautionMonth[] = [{ month: 0, balance, interest: 0 }];
  let reachedAt: number | null = balance >= target ? 0 : null;
  let cumInterest = 0;
  const horizon = Math.floor(clamp(maxMonths, 0, 1200, 0));
  for (let m = 1; m <= horizon && reachedAt === null; m++) {
    const interest = balance * r;
    cumInterest += interest;
    balance += interest + s;
    series.push({ month: m, balance, interest: cumInterest });
    if (balance >= target) reachedAt = m;
  }
  return { series, reachedAt, target };
}

/** Versement mensuel nécessaire pour atteindre la cible en n mois (formule de la valeur future d'une suite de versements). */
export function monthlySavingNeeded(target: number, current: number, months: number, annualRate: number): number {
  const n = Math.floor(clamp(months, 0, 1200, 0));
  const t = Math.max(0, num(target));
  const c = Math.max(0, num(current));
  if (c >= t) return 0;
  if (n === 0) return t - c;
  const r = monthlyRate(clamp(annualRate, -0.05, 0.2, 0));
  const grown = c * Math.pow(1 + r, n);
  if (grown >= t) return 0;
  const factor = r === 0 ? n : (Math.pow(1 + r, n) - 1) / r;
  return (t - grown) / factor;
}

export type Envelope = { id: string; rate: number; cap: number };
export type Allocation = { id: string; amount: number; interest: number };

/**
 * Répartition d'un montant sur des livrets plafonnés, dans l'ordre fourni (du mieux au moins rémunéré).
 * Le reste dépasse les plafonds et est indiqué à part (compte courant, livret bancaire…), sans rémunération supposée.
 */
export function allocateEnvelopes(amount: number, envelopes: Envelope[]) {
  let left = Math.max(0, num(amount));
  const allocations: Allocation[] = envelopes.map((e) => {
    const a = Math.min(left, Math.max(0, num(e.cap)));
    left -= a;
    return { id: e.id, amount: a, interest: a * Math.max(0, num(e.rate)) };
  });
  const placed = allocations.reduce((s, a) => s + a.amount, 0);
  const interest = allocations.reduce((s, a) => s + a.interest, 0);
  return { allocations, overflow: left, interest, blendedRate: placed > 0 ? interest / placed : 0 };
}
