import { describe, expect, it } from 'vitest';
import { allocateEnvelopes, monthlySavingNeeded, monthsCovered, precautionPath, precautionTarget } from './precaution';
import { LIVRETS } from '../../data/livrets';
import { investmentBySlug } from '../../data/investments';

const P = { monthlyExpenses: 2000, months: 6, extraReserve: 1500, currentSavings: 3000, monthlySaving: 300, annualRate: 0.017 };

describe('épargne de précaution', () => {
  it('montant visé = dépenses × mois + réserve', () => {
    expect(precautionTarget(P)).toBe(13500);
    expect(precautionTarget({ monthlyExpenses: -500, months: 6, extraReserve: 0 })).toBe(0);
    expect(precautionTarget({ monthlyExpenses: NaN, months: NaN, extraReserve: NaN })).toBe(0);
  });

  it('mois couverts', () => {
    expect(monthsCovered(6000, 2000)).toBe(3);
    expect(monthsCovered(0, 0)).toBe(0);
    expect(monthsCovered(100, 0)).toBe(Infinity);
  });

  it('taux nul : progression linéaire', () => {
    const r = precautionPath({ ...P, annualRate: 0 });
    // 13 500 − 3 000 = 10 500 ; 10 500 / 300 = 35 mois
    expect(r.reachedAt).toBe(35);
    expect(r.series.at(-1)!.balance).toBe(13500);
    expect(r.series.at(-1)!.interest).toBe(0);
  });

  it('les intérêts raccourcissent le délai sans le changer beaucoup', () => {
    const r = precautionPath(P);
    expect(r.reachedAt).toBeGreaterThanOrEqual(34);
    expect(r.reachedAt).toBeLessThanOrEqual(35);
    expect(r.series.at(-1)!.interest).toBeGreaterThan(0);
  });

  it('déjà atteint, ou jamais sans versement', () => {
    expect(precautionPath({ ...P, currentSavings: 20000 }).reachedAt).toBe(0);
    expect(precautionPath({ ...P, monthlySaving: 0, annualRate: 0 }).reachedAt).toBeNull();
  });

  it('versement nécessaire : cohérent avec la trajectoire', () => {
    expect(monthlySavingNeeded(13500, 3000, 35, 0)).toBeCloseTo(300, 9);
    expect(monthlySavingNeeded(13500, 20000, 12, 0.017)).toBe(0);
    expect(monthlySavingNeeded(13500, 3000, 0, 0.017)).toBe(10500);
    const need = monthlySavingNeeded(13500, 3000, 24, 0.017);
    const path = precautionPath({ ...P, monthlySaving: need }, 24);
    expect(path.series.at(-1)!.balance).toBeCloseTo(13500, 6);
  });

  it('répartition sur les livrets plafonnés', () => {
    const r = allocateEnvelopes(40000, LIVRETS);
    expect(r.allocations.map((a) => a.amount)).toEqual([10000, 22950, 7050]);
    expect(r.overflow).toBe(0);
    expect(r.interest).toBeCloseTo(10000 * 0.025 + 30000 * 0.017, 6);
    const over = allocateEnvelopes(50000, LIVRETS.filter((l) => l.id !== 'lep'));
    expect(over.overflow).toBe(50000 - 22950 - 12000);
    expect(allocateEnvelopes(0, LIVRETS).blendedRate).toBe(0);
  });

  it('taux et plafonds identiques aux fiches de l’encyclopédie', () => {
    const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/\s/g, ' ');
    const text = (slug: string) => investmentBySlug[slug].tax.text.replace(/\s/g, ' ');
    for (const l of LIVRETS) {
      expect(text(l.slug)).toContain(`${(l.rate * 100).toFixed(2).replace('.', ',')} %`.replace(/\s/g, ' '));
      expect(text(l.slug)).toContain(`${fmt(l.cap)} €`);
    }
  });
});
