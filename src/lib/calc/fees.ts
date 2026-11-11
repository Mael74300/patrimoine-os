import { clamp, num, safeDiv } from './common';
import { projectGrowth } from './growth';

/**
 * Impact des frais annuels sur un capital à long terme. Les frais sont prélevés chaque année en proportion du capital
 * (convention de `netOfFees`) ; le rendement brut et les versements sont identiques d'un niveau de frais à l'autre.
 */
export type FeeImpactInput = {
  initial: number;
  monthly: number;
  annualReturn: number;
  years: number;
  inflation: number;
};

export type FeeLevelResult = {
  fees: number;
  finalValue: number;
  realValue: number;
  /** Capital perdu par rapport à une situation sans frais. */
  cost: number;
  /** Part des gains bruts absorbée par les frais (0 si aucun gain). */
  shareOfGains: number;
  /** Valeur finale par année (0 = départ), pour le graphique. */
  series: number[];
  /** Total versé (capital initial et versements), identique pour tous les niveaux de frais. */
  contributed: number;
};

export function feeImpact(input: FeeImpactInput, levels: number[]): FeeLevelResult[] {
  const run = (fees: number) =>
    projectGrowth({ ...input, annualFees: fees, contributionGrowth: 0, withdrawals: [], savingsChanges: [] });
  const zero = run(0);
  const zeroFinal = zero.length ? zero[zero.length - 1].value : 0;
  const contributed = zero.length ? zero[zero.length - 1].contributed : 0;
  const grossGains = Math.max(0, zeroFinal - contributed);
  return levels.map((raw) => {
    const fees = clamp(raw, 0, 0.2, 0);
    const pts = run(fees);
    const last = pts[pts.length - 1];
    const finalValue = last ? last.value : Math.max(0, num(input.initial));
    const cost = Math.max(0, zeroFinal - finalValue);
    return {
      fees,
      finalValue,
      realValue: last ? last.realValue : finalValue,
      cost,
      shareOfGains: Math.min(1, safeDiv(cost, grossGains)),
      series: pts.map((p) => p.value),
      contributed,
    };
  });
}

export type FeeSplit = {
  /** Parts de la barre, en % de la plus grande valeur affichée (capital sans frais, ou total versé s'il est plus grand). */
  paid: number;
  kept: number;
  lost: number;
};

/**
 * Découpe d'une barre « ce que deviennent vos versements » : versements conservés, gains conservés, part prise par les frais.
 * `scale` est la plus grande valeur à représenter (capital sans frais ou total versé) ; la somme des parts ne dépasse jamais 100.
 */
export function feeSplit(r: Pick<FeeLevelResult, 'finalValue' | 'cost' | 'contributed'>, scale: number): FeeSplit {
  const s = num(scale);
  if (!(s > 0)) return { paid: 0, kept: 0, lost: 0 };
  const final = Math.max(0, num(r.finalValue));
  const contributed = Math.max(0, num(r.contributed));
  const pct = (v: number) => clamp((100 * v) / s, 0, 100, 0);
  const paid = pct(Math.min(contributed, final));
  const kept = Math.min(pct(Math.max(0, final - contributed)), 100 - paid);
  const lost = Math.min(pct(Math.max(0, num(r.cost))), 100 - paid - kept);
  return { paid, kept, lost };
}
