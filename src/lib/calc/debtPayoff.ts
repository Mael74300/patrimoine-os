import { clamp, num } from './common';

/**
 * Rembourser plusieurs dettes : méthode « avalanche » (taux le plus élevé d'abord) ou « boule de neige » (plus petit solde d'abord).
 * Hypothèses : intérêts mensuels = solde × taux nominal / 12 (convention des crédits), mensualités minimales payées chaque mois,
 * budget total constant = somme des mensualités minimales + versement supplémentaire ; les mensualités libérées par une dette soldée
 * sont reportées sur la dette prioritaire suivante. Aucun frais ni pénalité.
 */
export type Debt = { name: string; balance: number; rate: number; minPayment: number };
export type PayoffMethod = 'avalanche' | 'snowball' | 'minimum';

export type PayoffResult = {
  method: PayoffMethod;
  /** Nombre de mois jusqu'à la dernière dette soldée, ou null si les dettes ne sont pas soldées dans 50 ans. */
  months: number | null;
  totalInterest: number;
  totalPaid: number;
  /** Mois de solde de chaque dette (même ordre que l'entrée), null si non soldée. */
  payoffMonths: (number | null)[];
};

const MAX_MONTHS = 600;
const EPS = 0.005;

export function payoffPlan(debtsIn: Debt[], extraMonthly: number, method: PayoffMethod): PayoffResult {
  const debts = debtsIn
    .map((d) => ({ balance: clamp(d.balance, 0, 1e9), rate: clamp(d.rate, 0, 1), min: clamp(d.minPayment, 0, 1e9) }))
    .map((d, i) => ({ ...d, i }));
  const extra = method === 'minimum' ? 0 : clamp(extraMonthly, 0, 1e9);
  const budget = debts.reduce((s, d) => s + d.min, 0) + extra;
  const payoffMonths: (number | null)[] = debts.map((d) => (d.balance <= EPS ? 0 : null));
  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;

  const priority = (a: (typeof debts)[number], b: (typeof debts)[number]) =>
    method === 'snowball' ? a.balance - b.balance || b.rate - a.rate || a.i - b.i : b.rate - a.rate || a.balance - b.balance || a.i - b.i;

  while (debts.some((d) => d.balance > EPS) && month < MAX_MONTHS) {
    month += 1;
    for (const d of debts) {
      if (d.balance <= EPS) continue;
      const interest = (d.balance * d.rate) / 12;
      d.balance += interest;
      totalInterest += interest;
    }
    let available = budget;
    // mensualités minimales d'abord
    for (const d of debts) {
      if (d.balance <= EPS) continue;
      const pay = Math.min(d.min, d.balance, available);
      d.balance -= pay;
      available -= pay;
      totalPaid += pay;
    }
    // le reste du budget va à la dette prioritaire, puis à la suivante
    for (const d of [...debts].filter((x) => x.balance > EPS).sort(priority)) {
      if (available <= 0) break;
      const pay = Math.min(d.balance, available);
      d.balance -= pay;
      available -= pay;
      totalPaid += pay;
    }
    for (const d of debts) if (d.balance <= EPS && payoffMonths[d.i] === null) payoffMonths[d.i] = month;
  }
  const done = debts.every((d) => d.balance <= EPS);
  return { method, months: done ? month : null, totalInterest: num(totalInterest), totalPaid: num(totalPaid), payoffMonths };
}

export type PayoffComparison = { avalanche: PayoffResult; snowball: PayoffResult; minimum: PayoffResult; interestSavedByAvalanche: number | null };

export function comparePayoff(debts: Debt[], extraMonthly: number): PayoffComparison {
  const avalanche = payoffPlan(debts, extraMonthly, 'avalanche');
  const snowball = payoffPlan(debts, extraMonthly, 'snowball');
  const minimum = payoffPlan(debts, extraMonthly, 'minimum');
  const both = avalanche.months !== null && snowball.months !== null;
  return { avalanche, snowball, minimum, interestSavedByAvalanche: both ? snowball.totalInterest - avalanche.totalInterest : null };
}

export type PayoffBar = {
  /** Position de la dette dans la saisie (0, 1, 2…). */
  index: number;
  /** Mois de solde, ou null si la dette n'est pas soldée dans 50 ans. */
  months: number | null;
  /** Longueur de la barre en % de la plus longue durée des deux méthodes (100 % si non soldée). */
  width: number;
};

/**
 * Frise « quand chaque dette est soldée » : pour chaque méthode, les dettes à rembourser (solde > 0) dans l'ordre où elles sont soldées
 * (non soldées en dernier). Les deux méthodes partagent la même échelle pour être comparables d'un coup d'œil.
 */
export function payoffTimeline(debts: Debt[], c: Pick<PayoffComparison, 'avalanche' | 'snowball'>): { avalanche: PayoffBar[]; snowball: PayoffBar[] } {
  const owed = debts.map((d, i) => ({ d, i })).filter((x) => x.d.balance > EPS).map((x) => x.i);
  const all = [...c.avalanche.payoffMonths, ...c.snowball.payoffMonths].filter((m, k) => owed.includes(k % debts.length) && m !== null) as number[];
  const scale = Math.max(1, ...all);
  const bars = (r: PayoffResult): PayoffBar[] =>
    owed
      .map((i) => {
        const m = r.payoffMonths[i] ?? null;
        return { index: i, months: m, width: m === null ? 100 : (m / scale) * 100 };
      })
      .sort((a, b) => (a.months ?? Infinity) - (b.months ?? Infinity) || a.index - b.index);
  return { avalanche: bars(c.avalanche), snowball: bars(c.snowball) };
}
