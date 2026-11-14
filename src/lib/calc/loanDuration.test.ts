import { describe, expect, it } from 'vitest';
import { loanDuration, loanDurationBars } from './loanDuration';

// Exemples fictifs.
describe('Effet de la durée du crédit', () => {
  const rows = loanDuration({ principal: 200000, annualRate: 0.03, durations: [15, 20, 25] });

  it('plus la durée est longue, plus la mensualité baisse et plus les intérêts augmentent', () => {
    expect(rows[0].monthlyPayment).toBeGreaterThan(rows[1].monthlyPayment);
    expect(rows[1].monthlyPayment).toBeGreaterThan(rows[2].monthlyPayment);
    expect(rows[0].totalInterest).toBeLessThan(rows[1].totalInterest);
    expect(rows[1].totalInterest).toBeLessThan(rows[2].totalInterest);
  });

  it('200 000 € à 3 % sur 20 ans : mensualité ≈ 1 109,20 €', () => {
    expect(rows[1].monthlyPayment).toBeCloseTo(1109.2, 1);
    expect(rows[1].totalInterest).toBeCloseTo(rows[1].monthlyPayment * 240 - 200000, 4);
  });

  it('taux nul : pas d\'intérêts, mensualité = capital / mois', () => {
    const r = loanDuration({ principal: 120000, annualRate: 0, durations: [10] })[0];
    expect(r.monthlyPayment).toBeCloseTo(1000, 8);
    expect(r.totalInterest).toBeCloseTo(0, 8);
  });

  it('l\'assurance s\'ajoute à la mensualité et au coût total', () => {
    const r = loanDuration({ principal: 200000, annualRate: 0.03, insuranceRate: 0.003, durations: [20] })[0];
    expect(r.monthlyTotal - r.monthlyPayment).toBeCloseTo((200000 * 0.003) / 12, 6);
    expect(r.totalCost).toBeCloseTo(r.totalInterest + 200000 * 0.003 * 20, 4);
  });

  it('entrées invalides : jamais NaN', () => {
    const r = loanDuration({ principal: NaN, annualRate: Infinity, durations: [NaN, 0] });
    for (const x of r) for (const v of Object.values(x)) expect(Number.isFinite(v)).toBe(true);
  });

  it('barres : la mensualité la plus forte et le coût le plus fort valent 100, le reste est proportionnel', () => {
    const r = loanDuration({ principal: 200000, annualRate: 0.03, insuranceRate: 0.003, durations: [10, 20, 30] });
    const b = loanDurationBars(r);
    expect(b[0].monthly).toBeCloseTo(100, 9);
    expect(b[2].monthly).toBeCloseTo((100 * r[2].monthlyTotal) / r[0].monthlyTotal, 9);
    expect(b[2].interest + b[2].insurance).toBeCloseTo(100, 9);
    expect(b[0].interest).toBeCloseTo((100 * r[0].totalInterest) / r[2].totalCost, 9);
    expect(b[0].interest + b[0].insurance).toBeCloseTo((100 * r[0].totalCost) / r[2].totalCost, 9);
  });

  it('barres : capital nul ou taux nul, jamais NaN ni hors de 0 à 100', () => {
    for (const input of [{ principal: 0, annualRate: 0.03 }, { principal: 120000, annualRate: 0 }]) {
      for (const x of loanDurationBars(loanDuration({ ...input, durations: [10, 20] }))) {
        for (const v of [x.monthly, x.interest, x.insurance]) {
          expect(Number.isFinite(v)).toBe(true);
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(100);
        }
      }
    }
  });
});
