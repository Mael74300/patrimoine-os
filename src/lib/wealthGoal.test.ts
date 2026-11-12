import { describe, expect, it } from 'vitest';
import { netOfFees, projectGrowth, requiredMonthly } from './finance';
import { wealthGoalTakeaway } from './takeaways';

const digits = (t: string) => t.replace(/\s/g, '');
const eur = (n: number) => digits(Math.round(n).toLocaleString('fr-FR'));
const base = { initial: 5000, monthly: 300, annualReturn: 0.05, annualFees: 0.005, inflation: 0.02, years: 25, contributionGrowth: 0, savingsChanges: [], withdrawals: [] };
const final = (inp: typeof base) => { const p = projectGrowth(inp); return p[p.length - 1].value; };

describe('Patrimoine : bloc « Atteindre un objectif »', () => {
  it('le versement nécessaire mène bien à l’objectif avec les conventions du simulateur', () => {
    const need = requiredMonthly(300000, base.initial, netOfFees(base.annualReturn, base.annualFees), base.years);
    expect(final({ ...base, monthly: need })).toBeCloseTo(300000, 4);
  });

  it('réglages par défaut : part de l’objectif, versement nécessaire et écart avec l’épargne saisie', () => {
    const need = requiredMonthly(300000, 5000, netOfFees(0.05, 0.005), 25);
    const projected = final(base);
    const t = wealthGoalTakeaway({ target: 300000, years: 25, projected, monthly: 300, need, plain: true });
    expect(digits(t)).toContain(eur(projected) + '€');
    expect(digits(t)).toContain('manque' + eur(Math.round(need) - 300) + '€parmois');
    expect(digits(t)).toContain('300000€en25ans');
    expect(t).not.toMatch(/\d %/);
  });

  it('objectif dépassé, scénario non simple, capital de départ suffisant, objectif nul', () => {
    const need = requiredMonthly(100000, 5000, netOfFees(0.05, 0.005), 25);
    const ok = wealthGoalTakeaway({ target: 100000, years: 25, projected: final(base), monthly: 300, need, plain: true });
    expect(ok).toContain('Objectif atteint');
    expect(digits(ok)).toContain(eur(300 - Math.round(need)) + '€demoins');
    expect(ok).toContain("Vous pourriez");
    const complexe = wealthGoalTakeaway({ target: 300000, years: 25, projected: 150000, monthly: 300, need: 522, plain: false });
    expect(complexe).not.toContain('manque');
    expect(complexe).toContain('sans retrait');
    expect(wealthGoalTakeaway({ target: 10000, years: 25, projected: 50000, monthly: 0, need: 0, plain: true })).toContain('sans aucun versement');
    expect(wealthGoalTakeaway({ target: 0, years: 25, projected: 1, monthly: 1, need: 0, plain: true })).toBe('');
  });
});
