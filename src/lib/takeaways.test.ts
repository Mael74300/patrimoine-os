import { describe, expect, it } from 'vitest';
import { amortize, debtRatio, performance } from './finance';
import { creditTakeaway, debtRatioTakeaway, performanceTakeaway } from './takeaways';

describe('phrases « Concrètement »', () => {
  it('crédit : le total rendu = capital + coût total, calculé par amortize', () => {
    const res = amortize({ principal: 200000, annualRate: 0.036, years: 20, insuranceRate: 0.003 });
    const t = creditTakeaway({ principal: 200000, years: 20, monthlyTotal: res.monthlyPayment + res.monthlyInsurance, totalCost: res.totalCost });
    const rendu = Math.round(200000 + res.totalCost).toLocaleString('fr-FR');
    expect(t.replace(/\s/g, '')).toContain(rendu.replace(/\s/g, ''));
    expect(t).toContain('20 ans');
  });
  it('crédit : vide si aucun emprunt', () => {
    expect(creditTakeaway({ principal: 0, years: 20, monthlyTotal: 0, totalCost: 0 })).toBe('');
  });
  it('endettement : signale un reste à vivre négatif et un dépassement', () => {
    const t = debtRatioTakeaway({ income: 2000, ratioAfter: 0.5, remainingAfter: -100, withinRef: false, refLabel: '35 %' });
    expect(t).toContain('50 €');
    expect(t).toContain('il manque');
    expect(t).toContain('dépassez');
  });
  it('endettement : cas favorable', () => {
    const r = debtRatio({ income: 4000, existingPayments: 300, newPayment: 1000, livingCosts: 1500, householdSize: 2 });
    const t = debtRatioTakeaway({ income: 4000, ratioAfter: r.ratioAfter, remainingAfter: r.remainingAfter, withinRef: true, refLabel: '35 %' });
    expect(t).toContain('sous le repère');
  });
  it('rendement : gain ou perte, vide si taux non défini', () => {
    const r = performance({ initial: 5000, monthly: 200, months: 120, finalValue: 34000 });
    expect(performanceTakeaway({ invested: r.invested, gain: r.gain, annualized: r.annualized })).toContain('gagné');
    const p = performance({ initial: 5000, monthly: 200, months: 120, finalValue: 20000 });
    expect(performanceTakeaway({ invested: p.invested, gain: p.gain, annualized: p.annualized })).toContain('perdu');
    expect(performanceTakeaway({ invested: 0, gain: 0, annualized: null })).toBe('');
  });
});
