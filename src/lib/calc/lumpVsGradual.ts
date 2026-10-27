import { clamp, monthlyRate, num } from './common';

/**
 * Investir d'un coup ou progressivement : un même capital placé en une fois au départ, ou en tranches égales sur plusieurs mois.
 * Le résultat dépend entièrement du parcours de prix supposé, qui est une hypothèse (aucune prévision) :
 * - « steady » : prix qui évolue au rendement annuel saisi, mois après mois ;
 * - « dip » : prix qui baisse linéairement de `move` pendant la période d'étalement, puis évolue au rendement saisi ;
 * - « rise » : prix qui monte linéairement de `move` pendant la période d'étalement, puis évolue au rendement saisi.
 * Les tranches sont investies en début de mois ; la part non encore investie rapporte le taux de trésorerie saisi (équivalent mensuel).
 * Avant frais et impôts. Les deux stratégies sont évaluées au même horizon.
 */
export type PricePath = 'steady' | 'dip' | 'rise';

export type LumpVsGradualInput = {
  amount: number;
  /** Nombre de mois d'étalement (1 = tout investir tout de suite). */
  spreadMonths: number;
  /** Horizon d'évaluation, en années (au moins la durée d'étalement). */
  years: number;
  annualReturn: number;
  /** Rendement annuel de la part non encore investie. */
  cashRate: number;
  path: PricePath;
  /** Ampleur du mouvement initial (0,2 = 20 %), pour « dip » et « rise ». */
  move: number;
};

export type LumpVsGradualResult = {
  months: number;
  spreadMonths: number;
  lump: number;
  gradual: number;
  /** gradual − lump : positif si l'étalement a fini mieux placé. */
  advantageGradual: number;
};

export function lumpVsGradual(input: LumpVsGradualInput): LumpVsGradualResult {
  const amount = Math.max(0, num(input.amount));
  const spread = Math.floor(clamp(input.spreadMonths, 1, 120, 1));
  const months = Math.max(spread, Math.floor(clamp(input.years, 0, 50, 0) * 12));
  const mr = monthlyRate(clamp(input.annualReturn, -0.5, 1, 0));
  const mc = monthlyRate(clamp(input.cashRate, -0.5, 1, 0));
  const move = clamp(input.move, 0, 0.9, 0);

  const price = (t: number): number => {
    if (input.path === 'steady') return Math.pow(1 + mr, t);
    const sign = input.path === 'dip' ? -1 : 1;
    const t1 = Math.min(t, spread);
    const base = 1 + sign * move * (t1 / spread);
    return base * Math.pow(1 + mr, t - t1);
  };

  const lump = (amount / price(0)) * price(months);

  let cash = amount;
  let units = 0;
  for (let t = 0; t < spread; t++) {
    const tranche = cash / (spread - t);
    units += tranche / price(t);
    cash -= tranche;
    cash *= 1 + mc;
  }
  const gradual = units * price(months) + cash * Math.pow(1 + mc, months - spread);

  return { months, spreadMonths: spread, lump, gradual, advantageGradual: gradual - lump };
}
