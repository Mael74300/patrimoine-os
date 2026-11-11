import { describe, expect, it } from 'vitest';
import { lumpVsGradual, type LumpVsGradualInput } from './lumpVsGradual';

// Exemples fictifs.
const base: LumpVsGradualInput = { amount: 12000, spreadMonths: 12, years: 5, annualReturn: 0.05, cashRate: 0, path: 'steady', move: 0.2 };

describe("Investir d'un coup ou progressivement", () => {
  it('étalement sur 1 mois : mêmes résultats', () => {
    const r = lumpVsGradual({ ...base, spreadMonths: 1 });
    expect(r.gradual).toBeCloseTo(r.lump, 6);
  });

  it('prix constant, trésorerie à 0 % : aucun écart, capital conservé', () => {
    const r = lumpVsGradual({ ...base, annualReturn: 0, move: 0 });
    expect(r.lump).toBeCloseTo(12000, 6);
    expect(r.gradual).toBeCloseTo(12000, 6);
  });

  it('rendement régulier positif : investir d’un coup finit au-dessus', () => {
    const r = lumpVsGradual(base);
    expect(r.lump).toBeCloseTo(12000 * Math.pow(1.05, 5), 4);
    expect(r.advantageGradual).toBeLessThan(0);
  });

  it('baisse initiale : l’étalement finit au-dessus ; hausse initiale : en dessous', () => {
    expect(lumpVsGradual({ ...base, path: 'dip' }).advantageGradual).toBeGreaterThan(0);
    expect(lumpVsGradual({ ...base, path: 'rise' }).advantageGradual).toBeLessThan(0);
  });

  it('trésorerie rémunérée au même taux que le prix régulier : écart nul', () => {
    const r = lumpVsGradual({ ...base, cashRate: 0.05 });
    expect(r.gradual).toBeCloseTo(r.lump, 4);
  });

  it('courbe mois par mois : départ au capital, fin égale aux résultats, un point par mois', () => {
    for (const path of ['steady', 'dip', 'rise'] as const) {
      const r = lumpVsGradual({ ...base, path, cashRate: 0.02 });
      expect(r.series).toHaveLength(r.months + 1);
      expect(r.series.map((p) => p.month)).toEqual(Array.from({ length: r.months + 1 }, (_, i) => i));
      expect(r.series[0].lump).toBeCloseTo(12000, 6);
      expect(r.series[0].gradual).toBeCloseTo(12000, 6);
      expect(r.series[r.months].lump).toBeCloseTo(r.lump, 6);
      expect(r.series[r.months].gradual).toBeCloseTo(r.gradual, 6);
    }
  });

  it('courbe : baisse de 20 % sur 12 mois, le placement en une fois touche 9 600 € au mois 12', () => {
    const r = lumpVsGradual({ ...base, path: 'dip' });
    expect(r.series[12].lump).toBeCloseTo(9600, 6);
    // Trésorerie à 0 % : au mois 6, la moitié est investie (6 tranches de 1 000 €), le reste attend.
    const price = (t: number) => 1 - 0.2 * (t / 12);
    const units = [0, 1, 2, 3, 4, 5].reduce((u, t) => u + 1000 / price(t), 0);
    expect(r.series[6].gradual).toBeCloseTo(units * price(6) + 6000, 6);
  });

  it('entrées aberrantes : aucun NaN', () => {
    const r = lumpVsGradual({ amount: NaN, spreadMonths: -3, years: NaN, annualReturn: NaN, cashRate: Infinity, path: 'dip', move: 5 });
    for (const [k, v] of Object.entries(r)) if (k !== 'series') expect(Number.isFinite(v)).toBe(true);
    for (const p of r.series) expect(Number.isFinite(p.lump) && Number.isFinite(p.gradual)).toBe(true);
  });
});
