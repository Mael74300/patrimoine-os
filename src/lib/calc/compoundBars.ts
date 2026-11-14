import { num } from './common';
import { futureValue } from './requiredReturn';
import type { PresentValueResult } from './presentValue';
import type { TimeToTargetResult } from './timeToTarget';
import type { RequiredReturnResult } from './requiredReturn';
import type { SimpleVsCompoundResult } from './simpleVsCompound';
import type { DelayResult } from './delay';
import type { StepUpResult } from './stepUp';

/**
 * Barres « d'où vient le capital » du simulateur Intérêts composés : capital de départ, versements, intérêts,
 * et (onglet Simples ou composés) intérêts produits par les intérêts. Chaque barre reprend exactement les résultats
 * affichés dans les cartes, pour que la figure et les chiffres disent la même chose.
 */
export type CompoundBarRow = {
  /** Capital de départ (ou capital placé aujourd'hui). */
  start: number;
  /** Total des versements mensuels. */
  deposits: number;
  /** Intérêts (négatifs en cas de perte). */
  interest: number;
  /** Intérêts produits par les intérêts déjà gagnés (onglet Simples ou composés). */
  extra: number;
  /** Capital à l'arrivée = start + deposits + interest + extra. */
  final: number;
};

export type CompoundBarSplit = { start: number; deposits: number; interest: number; extra: number; lost: number };

const pos = (v: number) => Math.max(0, num(v));

export function compoundRow(start: number, deposits: number, interest: number, extra = 0): CompoundBarRow {
  const s = pos(start);
  const d = pos(deposits);
  const i = num(interest);
  const e = num(extra);
  return { start: s, deposits: d, interest: i, extra: e, final: s + d + i + e };
}

/** Échelle commune : la plus grande somme versée ou le plus grand capital à l'arrivée. */
export function compoundScale(rows: CompoundBarRow[]): number {
  return rows.reduce((m, r) => Math.max(m, r.final, r.start + r.deposits), 0);
}

/**
 * Largeurs en % de l'échelle. Quand le rendement est négatif, la barre mesure ce qui a été versé et la part perdue
 * est prise d'abord sur les versements, puis sur le capital de départ.
 */
export function compoundSplit(row: CompoundBarRow, scale: number): CompoundBarSplit {
  const pct = (v: number) => (scale > 0 ? Math.max(0, (v / scale) * 100) : 0);
  const gain = row.interest + row.extra;
  if (gain >= 0) {
    return { start: pct(row.start), deposits: pct(row.deposits), interest: pct(Math.max(0, row.interest)), extra: pct(Math.max(0, row.extra)), lost: 0 };
  }
  const loss = Math.min(-gain, row.start + row.deposits);
  const fromDeposits = Math.min(loss, row.deposits);
  return { start: pct(row.start - (loss - fromDeposits)), deposits: pct(row.deposits - fromDeposits), interest: 0, extra: 0, lost: pct(loss) };
}

/** Onglet « Combien placer aujourd'hui » : capital à l'arrivée (l'objectif, ou plus si les versements suffisent seuls). */
export function placerRow(r: PresentValueResult, input: { target: number; monthly: number; annualRate: number }): CompoundBarRow {
  const deposits = r.contributed - r.initial;
  const final = r.noInitialNeeded ? futureValue(0, pos(input.monthly), input.annualRate, r.months) : pos(input.target);
  return compoundRow(r.initial, deposits, final - r.contributed);
}

/** Onglet « En combien de temps » : null si l'objectif n'est pas atteint. */
export function dureeRow(r: TimeToTargetResult, initial: number): CompoundBarRow | null {
  if (!r.reached) return null;
  const start = pos(initial);
  return compoundRow(start, r.contributed - start, r.interest);
}

/** Onglet « Quel rendement » : null si aucun rendement ne convient ou si les versements suffisent sans rendement. */
export function rendementRow(r: RequiredReturnResult, input: { initial: number; target: number }): CompoundBarRow | null {
  if (r.annualRate === null || r.alreadyReached) return null;
  const start = pos(input.initial);
  return compoundRow(start, r.contributed - start, pos(input.target) - r.contributed);
}

/**
 * Onglet « Simples ou composés » : deux barres, même capital de départ et mêmes intérêts simples ;
 * la barre des composés y ajoute les intérêts produits par les intérêts (l'écart). Null si le taux n'est pas positif.
 */
export function simpleCompoundRows(r: SimpleVsCompoundResult, initial: number): { simple: CompoundBarRow; compound: CompoundBarRow } | null {
  if (!(r.simpleInterest > 0) || !(r.gap >= 0)) return null;
  const start = pos(initial);
  return { simple: compoundRow(start, 0, r.simpleInterest), compound: compoundRow(start, 0, r.simpleInterest, r.gap) };
}

/** Onglet « Coût d'attendre » : commencer tout de suite ou après le délai. */
export function delayRows(r: DelayResult): { now: CompoundBarRow; later: CompoundBarRow } {
  return { now: compoundRow(0, r.investedNow, r.startNow - r.investedNow), later: compoundRow(0, r.investedLater, r.startLater - r.investedLater) };
}

/** Onglet « Épargne qui augmente » : versement constant ou qui augmente. */
export function stepUpRows(r: StepUpResult): { flat: CompoundBarRow; stepped: CompoundBarRow } {
  return { flat: compoundRow(0, r.flatInvested, r.flatCapital - r.flatInvested), stepped: compoundRow(0, r.steppedInvested, r.steppedCapital - r.steppedInvested) };
}
