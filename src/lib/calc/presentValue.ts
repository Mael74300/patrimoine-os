import { clamp, monthlyRate, num } from './common';

/**
 * Capital à placer aujourd'hui pour atteindre un capital visé à une échéance, à un rendement annuel supposé constant,
 * avec éventuellement un versement mensuel (fin de mois). Même modèle que « Durée pour atteindre un capital » :
 * capital = capital × (1 + taux mensuel équivalent) + versement. Calcul direct (valeur actualisée), sans itération.
 */
export type PresentValueInput = {
  target: number;
  /** Durée en années (arrondie au mois). */
  years: number;
  /** Rendement annuel supposé (0,05 = 5 %). */
  annualRate: number;
  /** Versement mensuel prévu (0 si aucun). */
  monthly: number;
};

export type PresentValueResult = {
  /** Capital à placer aujourd'hui (≥ 0). */
  initial: number;
  /** Part de l'objectif apportée par les versements mensuels et leurs intérêts. */
  fromMonthly: number;
  /** Total versé (capital à placer + versements). */
  contributed: number;
  /** Gain attendu dans l'hypothèse : objectif − total versé (peut être négatif si le rendement est négatif). */
  gain: number;
  /** Vrai si les versements seuls atteignent déjà l'objectif (aucun capital de départ nécessaire). */
  noInitialNeeded: boolean;
  months: number;
};

export function presentValue(input: PresentValueInput): PresentValueResult {
  const target = Math.max(0, num(input.target));
  const monthly = Math.max(0, num(input.monthly));
  const months = Math.round(clamp(input.years, 0, 100, 0) * 12);
  const i = monthlyRate(clamp(input.annualRate, -0.5, 1, 0));
  // Capital final des seuls versements : somme de v × (1 + i)^k pour k = 0 … n − 1.
  const growth = Math.pow(1 + i, months);
  const fromMonthly = i === 0 ? monthly * months : (monthly * (growth - 1)) / i;
  const needed = Math.max(0, (target - fromMonthly) / growth);
  const initial = months === 0 ? target : needed;
  const contributed = initial + monthly * months;
  return {
    initial,
    fromMonthly: months === 0 ? 0 : Math.min(fromMonthly, target),
    contributed,
    gain: target - contributed,
    noInitialNeeded: months > 0 && fromMonthly >= target,
    months,
  };
}
