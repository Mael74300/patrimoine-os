import { describe, expect, it } from 'vitest';
import { withdrawal, type WithdrawalInput } from './withdrawal';

// Exemples fictifs.
const base: WithdrawalInput = { capital: 120000, monthly: 1000, annualReturn: 0, indexation: 0, years: 20 };

describe('Retraits réguliers', () => {
  it('épuisement exact au bout de 120 mois à rendement nul (horizon 20 ans)', () => {
    const r = withdrawal({ ...base, monthly: 1000, capital: 120000 - 1 });
    expect(r.monthsUntilEmpty).toBe(120);
    expect(r.remaining).toBe(0);
  });

  it('horizon plus court que la durée du capital : capital restant et total retiré', () => {
    const r = withdrawal({ ...base, years: 5 });
    expect(r.monthsUntilEmpty).toBeNull();
    expect(r.remaining).toBeCloseTo(120000 - 60000, 6);
    expect(r.totalWithdrawn).toBeCloseTo(60000, 6);
  });

  it('retrait tenable à rendement nul = capital / nombre de mois', () => {
    const r = withdrawal(base);
    expect(r.sustainable).toBeCloseTo(120000 / 240, 3);
  });

  it('retrait tenable avec rendement : annuité de référence', () => {
    const r = withdrawal({ capital: 100000, monthly: 0, annualReturn: 0.05, indexation: 0, years: 10 });
    const mr = Math.pow(1.05, 1 / 12) - 1;
    // retrait en fin de mois après rendement : capital × (1+mr) = w × (1 − (1+mr)^−n)/mr × (1+mr)  ⇒ w = capital × mr / (1 − (1+mr)^−n)
    const w = (100000 * mr) / (1 - Math.pow(1 + mr, -120));
    expect(r.sustainable).toBeCloseTo(w, 2);
  });

  it('le rendement ne peut pas allonger la durée moins que l’indexation ne la raccourcit', () => {
    const a = withdrawal({ ...base, annualReturn: 0.03, years: 40 });
    const b = withdrawal({ ...base, annualReturn: 0.03, indexation: 0.03, years: 40 });
    expect((b.monthsUntilEmpty ?? 480)).toBeLessThanOrEqual(a.monthsUntilEmpty ?? 480);
  });

  it('entrées aberrantes : aucun NaN', () => {
    const r = withdrawal({ capital: NaN, monthly: -5, annualReturn: Infinity, indexation: NaN, years: NaN });
    expect(r.remaining).toBe(0);
    expect(Number.isFinite(r.sustainable)).toBe(true);
  });
});
