import { describe, expect, it } from 'vitest';
import { capacityAtHcsf, debtRatio, HCSF } from './debtRatio';
import { amortize } from './loan';
import { guides } from '../../data/guides';

describe('taux d’endettement', () => {
  const base = { income: 4000, existingPayments: 300, newPayment: 1000, livingCosts: 1500, householdSize: 2 };

  it('ratio avant et après : (300 + 1 000) / 4 000 = 32,5 %', () => {
    const r = debtRatio(base);
    expect(r.ratioBefore).toBeCloseTo(0.075, 10);
    expect(r.ratioAfter).toBeCloseTo(0.325, 10);
    expect(r.withinHcsf).toBe(true);
  });

  it('au-delà de 35 % : hors repère, mensualité maximale et revenu minimal', () => {
    const r = debtRatio({ ...base, newPayment: 1300 });
    expect(r.ratioAfter).toBeCloseTo(0.4, 10);
    expect(r.withinHcsf).toBe(false);
    expect(r.maxNewPayment).toBeCloseTo(1100, 6);
    expect(r.minIncome).toBeCloseTo(1600 / 0.35, 6);
  });

  it('reste à vivre : revenu − crédits − charges, par personne', () => {
    const r = debtRatio(base);
    expect(r.remainingAfter).toBeCloseTo(1200, 6);
    expect(r.remainingPerPerson).toBeCloseTo(600, 6);
  });

  it('revenu nul ou entrées invalides : jamais NaN', () => {
    const r = debtRatio({ income: 0, existingPayments: NaN, newPayment: 500, livingCosts: -3, householdSize: 0 });
    expect(r.ratioAfter).toBe(0);
    expect(r.withinHcsf).toBe(false);
    for (const v of Object.values(r)) expect(Number.isFinite(Number(v))).toBe(true);
  });

  it('capacité à 35 % : le prêt obtenu a une mensualité assurance comprise égale à la mensualité maximale', () => {
    const cap = capacityAtHcsf(4000, 300, 0.036, 20, 0.003);
    const l = amortize({ principal: cap, annualRate: 0.036, years: 20, insuranceRate: 0.003 });
    expect(l.monthlyPayment + l.monthlyInsurance).toBeCloseTo(4000 * 0.35 - 300, 4);
  });

  it('cohérence : le guide cite le même taux d’effort et la même durée que le repère', () => {
    const text = JSON.stringify(guides);
    expect(text).toContain(`${HCSF.maxRatio * 100} %`);
    expect(text).toContain(`${HCSF.maxYears} ans`);
  });
});
