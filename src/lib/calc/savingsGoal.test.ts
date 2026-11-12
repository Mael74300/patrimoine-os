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

describe('objectif d’épargne : barres selon l’échéance', () => {
  it('exemple fictif de la page (20 000 € visés, 2 000 € déjà épargnés, 1,7 %) : départ + versements + intérêts = objectif', async () => {
    const { goalByDuration, goalSplit, goalScale } = await import('./savingsGoal');
    const rows = goalByDuration({ target: 20000, current: 2000, annualRate: 0.017 }, [2, 5, 15]);
    for (const r of rows) {
      expect(r.current + r.deposits + r.interest).toBeCloseTo(20000, 6);
      expect(r.final).toBeCloseTo(20000, 6);
      expect(r.interest).toBeGreaterThan(0);
    }
    // Même calcul que les cartes de résultat pour l'échéance de 5 ans.
    const five = savingsGoal({ target: 20000, current: 2000, years: 5, annualRate: 0.017 });
    expect(rows[1].monthly).toBeCloseTo(five.monthly, 10);
    expect(rows[1].deposits).toBeCloseTo(five.deposits, 8);
    expect(rows[1].interest).toBeCloseTo(five.interest, 8);
    // Plus l'échéance est lointaine, plus les intérêts pèsent.
    expect(rows[2].interest).toBeGreaterThan(rows[1].interest);
    expect(rows[1].interest).toBeGreaterThan(rows[0].interest);
    const scale = goalScale(rows);
    expect(scale).toBeCloseTo(20000, 6);
    const b = goalSplit(rows[1], scale);
    expect(b.current + b.deposits + b.interest).toBeCloseTo(100, 6);
    expect(b.current).toBeCloseTo(10, 6);
    expect(b.lost).toBe(0);
  });

  it('rendement négatif : la partie perdue est montrée à part, la partie gardée vaut le solde final', async () => {
    const { goalByDuration, goalSplit, goalScale } = await import('./savingsGoal');
    const rows = goalByDuration({ target: 20000, current: 2000, annualRate: -0.02 }, [5]);
    const r = rows[0];
    expect(r.interest).toBeLessThan(0);
    expect(r.final).toBeCloseTo(20000, 6);
    const scale = goalScale(rows);
    expect(scale).toBeCloseTo(r.current + r.deposits, 6);
    const b = goalSplit(r, scale);
    expect(b.interest).toBe(0);
    expect(b.current + b.deposits + b.lost).toBeCloseTo(100, 6);
    expect(((b.current + b.deposits) / 100) * scale).toBeCloseTo(r.final, 6);
  });

  it('épargne de départ suffisante : aucun versement, sans NaN', async () => {
    const { goalByDuration, goalSplit, goalScale } = await import('./savingsGoal');
    const rows = goalByDuration({ target: 1000, current: 5000, annualRate: 0.03 }, [2]);
    expect(rows[0].monthly).toBe(0);
    expect(rows[0].deposits).toBe(0);
    const b = goalSplit(rows[0], goalScale(rows));
    for (const v of Object.values(b)) expect(Number.isFinite(v)).toBe(true);
    expect(goalSplit(rows[0], 0).current).toBe(0);
  });
});
