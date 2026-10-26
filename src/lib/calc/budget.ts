import { clamp, num, safeDiv } from './common';
import { projectGrowth } from './growth';

/**
 * Budget mensuel et taux d'épargne. La répartition 50 / 30 / 20 (besoins, envies, épargne) est un repère
 * pédagogique courant, pas une règle officielle : chaque situation (logement, famille, région) est différente.
 */
export type BudgetInput = {
  netIncome: number; // revenu net mensuel du foyer
  needs: number; // dépenses contraintes : logement, énergie, alimentation, transport, assurances, crédits
  wants: number; // dépenses de confort : loisirs, restaurants, abonnements, voyages
  saving: number; // épargne effectivement mise de côté chaque mois
};

/** Repère pédagogique 50 / 30 / 20 (non réglementaire). */
export const BUDGET_BENCHMARK = { needs: 0.5, wants: 0.3, saving: 0.2 } as const;

export type BudgetResult = {
  income: number;
  needs: number;
  wants: number;
  saving: number;
  /** Revenu non affecté : revenu − besoins − envies − épargne (négatif = dépassement). */
  unallocated: number;
  /** Parts du revenu (0 si revenu nul). */
  shares: { needs: number; wants: number; saving: number };
  /** Taux d'épargne = épargne / revenu. */
  savingRate: number;
  /** Écart au repère, en euros par mois (positif = au-dessus du repère). */
  gaps: { needs: number; wants: number; saving: number };
};

export function analyzeBudget(i: BudgetInput): BudgetResult {
  const income = Math.max(0, num(i.netIncome));
  const needs = Math.max(0, num(i.needs));
  const wants = Math.max(0, num(i.wants));
  const saving = Math.max(0, num(i.saving));
  const shares = { needs: safeDiv(needs, income), wants: safeDiv(wants, income), saving: safeDiv(saving, income) };
  return {
    income, needs, wants, saving,
    unallocated: income - needs - wants - saving,
    shares,
    savingRate: shares.saving,
    gaps: {
      needs: needs - income * BUDGET_BENCHMARK.needs,
      wants: wants - income * BUDGET_BENCHMARK.wants,
      saving: saving - income * BUDGET_BENCHMARK.saving,
    },
  };
}

/**
 * Effort d'épargne mensuel nécessaire pour atteindre un taux d'épargne cible,
 * et marge dégageable en réduisant les envies (au plus leur montant actuel).
 */
export function savingForRate(income: number, targetRate: number): number {
  return Math.max(0, num(income)) * clamp(targetRate, 0, 1, 0);
}

/** Montant mensuel qu'il reste à trouver pour atteindre le taux cible, et part qu'une baisse des envies peut couvrir. */
export function catchUp(i: BudgetInput, targetRate: number) {
  const b = analyzeBudget(i);
  const missing = Math.max(0, savingForRate(b.income, targetRate) - b.saving);
  const available = Math.max(0, b.unallocated);
  const fromUnallocated = Math.min(missing, available);
  const fromWants = Math.min(missing - fromUnallocated, b.wants);
  return { missing, fromUnallocated, fromWants, uncovered: missing - fromUnallocated - fromWants };
}

/** Mois de revenu net épargnés en un an (pour situer l'effort : 12 × taux d'épargne). */
export function monthsOfIncomeSavedPerYear(savingRate: number): number {
  return 12 * Math.max(0, num(savingRate));
}

/**
 * Capital constitué en épargnant chaque mois le montant du budget, au rendement net supposé (versements en début de mois).
 * Hypothèse de calcul, pas une prévision : un rendement nul donne la simple somme des versements.
 */
export function projectBudgetSaving(monthlySaving: number, annualNetReturn: number, durationYears: number) {
  const pts = projectGrowth({
    initial: 0, monthly: Math.max(0, num(monthlySaving)), annualReturn: num(annualNetReturn), annualFees: 0,
    years: durationYears, inflation: 0,
  });
  const last = pts[pts.length - 1];
  return { contributed: last ? last.contributed : 0, finalValue: last ? last.value : 0, gains: last ? last.gains : 0 };
}
