import { clamp, deflate, num, realRate, safeDiv } from './common';

/**
 * Inflation et pouvoir d'achat. Une somme gardée telle quelle perd en pouvoir d'achat ; placée à un rendement net,
 * elle le conserve ou le gagne si le rendement dépasse l'inflation (rendement réel = (1 + r) / (1 + i) − 1).
 */
export type PurchasingPowerInput = {
  amount: number;
  years: number;
  inflation: number;
  /** Rendement annuel net de frais du placement comparé (0 pour une somme laissée sans rémunération). */
  annualReturn: number;
};

export type PurchasingPowerResult = {
  /** Valeur de la somme inchangée, en euros d'aujourd'hui, à l'horizon. */
  idleRealValue: number;
  /** Perte de pouvoir d'achat de la somme inchangée (0 à 1). */
  idleLoss: number;
  /** Montant à détenir à l'horizon pour acheter autant qu'aujourd'hui. */
  nominalToKeepPower: number;
  /** Capital du placement à l'horizon, en euros courants. */
  investedValue: number;
  /** Capital du placement à l'horizon, en euros d'aujourd'hui. */
  investedRealValue: number;
  realReturn: number;
  /** Années pour que la somme inchangée perde la moitié de son pouvoir d'achat (null si inflation nulle). */
  yearsToHalve: number | null;
  /** Années pour doubler le capital placé en euros courants (null si rendement ≤ 0). */
  yearsToDouble: number | null;
  /** Par année (0 = départ), en euros d'aujourd'hui. */
  idleSeries: number[];
  investedSeries: number[];
};

export function purchasingPower(input: PurchasingPowerInput): PurchasingPowerResult {
  const amount = Math.max(0, num(input.amount));
  const n = Math.floor(clamp(input.years, 0, 80, 0));
  const inflation = clamp(input.inflation, -0.5, 1, 0);
  const r = clamp(input.annualReturn, -0.9, 1, 0);
  const idleSeries: number[] = [];
  const investedSeries: number[] = [];
  for (let y = 0; y <= n; y++) {
    idleSeries.push(deflate(amount, inflation, y));
    investedSeries.push(deflate(amount * Math.pow(1 + r, y), inflation, y));
  }
  const idleRealValue = idleSeries[n];
  return {
    idleRealValue,
    idleLoss: amount > 0 ? Math.max(0, 1 - idleRealValue / amount) : 0,
    nominalToKeepPower: amount * Math.pow(1 + inflation, n),
    investedValue: amount * Math.pow(1 + r, n),
    investedRealValue: investedSeries[n],
    realReturn: realRate(r, inflation),
    yearsToHalve: inflation > 0 ? safeDiv(Math.log(2), Math.log(1 + inflation)) : null,
    yearsToDouble: r > 0 ? safeDiv(Math.log(2), Math.log(1 + r)) : null,
    idleSeries,
    investedSeries,
  };
}
