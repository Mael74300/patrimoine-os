import { clamp, monthlyRate, num } from './common';

/**
 * Retraits réguliers : combien de temps un capital tient-il quand on y puise chaque mois ?
 * - Le capital rapporte le rendement annuel saisi (taux mensuel actuariel équivalent), avant frais et impôts.
 * - Le retrait mensuel est prélevé en fin de mois, après le rendement du mois ; il est revalorisé chaque année
 *   du taux d'indexation saisi (0 = retrait constant).
 * - `sustainable` : premier retrait mensuel maximal qui laisse un capital ≥ 0 à la fin de l'horizon (recherche par dichotomie).
 * Tout est fondé sur les hypothèses saisies ; aucune prévision.
 */
export type WithdrawalInput = {
  capital: number;
  /** Premier retrait mensuel. */
  monthly: number;
  annualReturn: number;
  /** Revalorisation annuelle du retrait (inflation supposée). */
  indexation: number;
  /** Horizon d'observation, en années. */
  years: number;
};

export type WithdrawalResult = {
  /** Nombre de mois avant épuisement, ou null si le capital dure au-delà de l'horizon. */
  monthsUntilEmpty: number | null;
  /** Capital restant à l'horizon (0 si épuisé). */
  remaining: number;
  /** Total retiré sur l'horizon (ou jusqu'à l'épuisement). */
  totalWithdrawn: number;
  /** Premier retrait mensuel maximal tenable sur tout l'horizon. */
  sustainable: number;
};

function run(capital: number, monthly: number, mr: number, idx: number, months: number) {
  let cap = capital;
  let total = 0;
  for (let t = 0; t < months; t++) {
    cap *= 1 + mr;
    const w = monthly * Math.pow(1 + idx, Math.floor(t / 12));
    if (cap < w) {
      total += Math.max(0, cap);
      return { empty: t + 1, remaining: 0, total };
    }
    cap -= w;
    total += w;
  }
  return { empty: null as number | null, remaining: cap, total };
}

export function withdrawal(input: WithdrawalInput): WithdrawalResult {
  const capital = Math.max(0, num(input.capital));
  const monthly = Math.max(0, num(input.monthly));
  const mr = monthlyRate(clamp(input.annualReturn, -0.5, 1, 0));
  const idx = clamp(input.indexation, -0.5, 1, 0);
  const months = Math.floor(clamp(input.years, 0, 80, 0) * 12);

  const r = run(capital, monthly, mr, idx, months);

  let lo = 0;
  let hi = capital + 1;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (run(capital, mid, mr, idx, months).empty === null) lo = mid;
    else hi = mid;
  }
  const sustainable = months === 0 ? 0 : lo;

  return { monthsUntilEmpty: r.empty, remaining: r.remaining, totalWithdrawn: r.total, sustainable };
}
