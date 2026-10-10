import { describe, expect, it } from 'vitest';
import { amortize, borrowingCapacity, loanPayment, prepayment } from './loan';

describe('crédit amortissable', () => {
  it('mensualité de référence : 200 000 € à 3,6 % sur 20 ans = 1 170,22 €', () => {
    expect(loanPayment(200000, 0.036, 20)).toBeCloseTo(1170.22, 1);
  });
  it('taux nul : linéaire', () => expect(loanPayment(120000, 0, 10)).toBeCloseTo(1000, 8));
  it('durée ou montant nuls : mensualité nulle, pas de division par zéro', () => {
    expect(loanPayment(100000, 0.03, 0)).toBe(0);
    expect(loanPayment(0, 0.03, 20)).toBe(0);
    expect(amortize({ principal: 0, annualRate: 0.03, years: 20 }).schedule).toHaveLength(0);
  });
  it('le tableau rembourse exactement le capital', () => {
    const r = amortize({ principal: 150000, annualRate: 0.04, years: 15, insuranceRate: 0.003 });
    expect(r.schedule.reduce((s, y) => s + y.principalPaid, 0)).toBeCloseTo(150000, 4);
    expect(r.schedule.at(-1)!.remaining).toBeCloseTo(0, 4);
    expect(r.totalInterest).toBeCloseTo(r.monthlyPayment * 180 - 150000, 4);
    expect(r.totalInsurance).toBeCloseTo(150000 * 0.003 * 15, 6);
  });
  it("capacité d'emprunt inverse de la mensualité", () => {
    expect(borrowingCapacity(1170.22, 0.036, 20)).toBeCloseTo(200000, -1);
    expect(borrowingCapacity(1000, 0, 10)).toBe(120000);
  });
});

describe('remboursement anticipé', () => {
  const loan = { principal: 200000, annualRate: 0.036, years: 20, insuranceRate: 0 };
  it('montant nul : aucun changement', () => {
    const r = prepayment({ ...loan, atMonth: 60, amount: 0, mode: 'duree', withPenalty: false });
    expect(r.interestSaved).toBeCloseTo(0, 6);
    expect(r.monthsSaved).toBe(0);
  });
  it('réduction de durée : même mensualité, durée et intérêts réduits', () => {
    const r = prepayment({ ...loan, atMonth: 60, amount: 30000, mode: 'duree', withPenalty: false });
    expect(r.newMonthlyPayment).toBeCloseTo(r.base.monthlyPayment, 8);
    expect(r.monthsSaved).toBeGreaterThan(0);
    expect(r.interestSaved).toBeGreaterThan(0);
  });
  it('réduction de mensualité : durée conservée et mensualité recalculée sur le capital restant', () => {
    const r = prepayment({ ...loan, atMonth: 60, amount: 30000, mode: 'mensualite', withPenalty: false });
    expect(r.newTotalMonths).toBe(240);
    const expected = loanPayment(r.remainingBefore - 30000, 0.036, 15);
    expect(r.newMonthlyPayment).toBeCloseTo(expected, 6);
  });
  it('indemnités plafonnées : min(6 mois d’intérêts, 3 % du capital restant dû)', () => {
    const r = prepayment({ ...loan, atMonth: 60, amount: 30000, mode: 'duree', withPenalty: true });
    expect(r.penalty).toBeCloseTo(Math.min(30000 * (0.036 / 12) * 6, 0.03 * r.remainingBefore), 8);
  });
  it('remboursement total : plus aucune mensualité', () => {
    const r = prepayment({ ...loan, atMonth: 12, amount: 1e9, mode: 'duree', withPenalty: false });
    expect(r.newTotalMonths).toBe(12);
    expect(r.newMonthlyPayment).toBe(0);
  });
});
