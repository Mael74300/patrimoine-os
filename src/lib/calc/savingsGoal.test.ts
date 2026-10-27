import { describe, expect, it } from 'vitest';
import { monthlyByDuration, monthlyByRate, savingsGoal } from './savingsGoal';
import { LIVRETS } from '../../data/livrets';

const G = { target: 20000, current: 2000, years: 5, annualRate: 0 };

describe('objectif d’épargne', () => {
  it('taux nul : versement linéaire, (20 000 − 2 000) / 60 = 300 €', () => {
    const r = savingsGoal(G);
    expect(r.monthly).toBeCloseTo(300, 8);
    expect(r.deposits).toBeCloseTo(18000, 6);
    expect(r.interest).toBeCloseTo(0, 6);
    expect(r.series).toHaveLength(6);
    expect(r.series.at(-1)).toBeCloseTo(20000, 6);
  });

  it('avec un taux positif, le versement baisse et le solde final atteint l’objectif', () => {
    const r = savingsGoal({ ...G, annualRate: 0.03 });
    expect(r.monthly).toBeLessThan(300);
    expect(r.series.at(-1)).toBeCloseTo(20000, 4);
    expect(r.interest).toBeGreaterThan(0);
    expect(r.deposits + r.interest + 2000).toBeCloseTo(20000, 4);
    expect(r.interestShare).toBeCloseTo(r.interest / 20000, 10);
  });

  it('objectif déjà couvert : aucun versement', () => {
    const r = savingsGoal({ ...G, current: 25000 });
    expect(r.monthly).toBe(0);
    expect(r.deposits).toBe(0);
  });

  it('durée nulle : le manque est à verser tout de suite ; entrées invalides sans NaN', () => {
    expect(savingsGoal({ ...G, years: 0 }).monthly).toBe(18000);
    const r = savingsGoal({ target: NaN, current: -5, years: NaN, annualRate: NaN });
    for (const v of [r.monthly, r.deposits, r.interest, r.interestShare]) expect(Number.isFinite(v)).toBe(true);
  });

  it('plus de temps ou un taux plus élevé réduit le versement', () => {
    const byD = monthlyByDuration({ target: 20000, current: 2000, annualRate: 0.02 }, [2, 5, 10]);
    expect(byD[0].monthly).toBeGreaterThan(byD[1].monthly);
    expect(byD[1].monthly).toBeGreaterThan(byD[2].monthly);
    const byR = monthlyByRate({ target: 20000, current: 2000, years: 5 }, [0, 0.02, 0.05]);
    expect(byR[0].monthly).toBeGreaterThan(byR[1].monthly);
    expect(byR[1].monthly).toBeGreaterThan(byR[2].monthly);
  });

  it('le taux de repère du Livret A de la page vient des données', () => {
    expect(LIVRETS.find((l) => l.id === 'livretA')!.rate).toBeGreaterThan(0);
  });
});
