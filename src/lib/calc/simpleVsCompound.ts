import { clamp, num, years } from './common';

/**
 * Intérêts simples et intérêts composés sur un capital sans versement, à taux annuel constant supposé.
 * - Simples : capital × (1 + taux × années). Les intérêts ne produisent pas d'intérêts.
 * - Composés : capital × (1 + taux)^années. Les intérêts sont réinvestis.
 * Le taux est une hypothèse saisie, jamais une prévision.
 */
export type SimpleVsCompoundInput = {
  initial: number;
  /** Taux annuel supposé (0,05 = 5 %). */
  annualRate: number;
  /** Durée en années entières. */
  years: number;
};

export type SimpleVsCompoundRow = { year: number; simple: number; compound: number; gap: number };

export type SimpleVsCompoundResult = {
  simpleFinal: number;
  compoundFinal: number;
  simpleInterest: number;
  compoundInterest: number;
  /** Intérêts composés − intérêts simples. */
  gap: number;
  /** Capital composé / capital simple (1 si le capital simple est nul). */
  ratio: number;
  /** Valeurs année par année, de 0 à la durée. */
  rows: SimpleVsCompoundRow[];
};

export function simpleVsCompound(input: SimpleVsCompoundInput): SimpleVsCompoundResult {
  const initial = Math.max(0, num(input.initial));
  const rate = clamp(input.annualRate, -0.99, 10, 0);
  const n = years(input.years);
  const simpleAt = (t: number) => initial * (1 + rate * t);
  const compoundAt = (t: number) => initial * Math.pow(1 + rate, t);
  const rows: SimpleVsCompoundRow[] = [];
  for (let t = 0; t <= n; t++) {
    const simple = Math.max(0, simpleAt(t));
    const compound = compoundAt(t);
    rows.push({ year: t, simple, compound, gap: compound - simple });
  }
  const last = rows[rows.length - 1];
  return {
    simpleFinal: last.simple,
    compoundFinal: last.compound,
    simpleInterest: last.simple - initial,
    compoundInterest: last.compound - initial,
    gap: last.gap,
    ratio: last.simple > 0 ? last.compound / last.simple : 1,
    rows,
  };
}
