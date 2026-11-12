import { describe, expect, it } from 'vitest';
import { renegotiation, renegotiationBars } from './renegotiation';
import { loanPayment } from './loan';

// Exemples fictifs.
describe('Renégociation de crédit', () => {
  const base = { remaining: 150000, currentRate: 0.045, currentYearsLeft: 20, newRate: 0.035, newYears: 20, fees: 3000 };

  it('mensualités et intérêts recalculés à partir de la formule d’amortissement', () => {
    const r = renegotiation(base);
    expect(r.currentMonthly).toBeCloseTo(loanPayment(150000, 0.045, 20), 9);
    expect(r.newMonthly).toBeCloseTo(loanPayment(150000, 0.035, 20), 9);
    expect(r.currentRemainingInterest).toBeCloseTo(r.currentMonthly * 240 - 150000, 6);
    expect(r.newInterest).toBeCloseTo(r.newMonthly * 240 - 150000, 6);
    expect(r.monthlyGain).toBeCloseTo(r.currentMonthly - r.newMonthly, 9);
    expect(r.monthlyGain).toBeGreaterThan(0);
  });

  it('gain net = écart d’intérêts − frais ; point mort = frais / gain mensuel', () => {
    const r = renegotiation(base);
    expect(r.netGain).toBeCloseTo(r.currentRemainingInterest - r.newInterest - 3000, 6);
    expect(r.breakEvenMonths as number).toBeCloseTo(3000 / r.monthlyGain, 9);
    expect(r.longer).toBe(false);
  });

  it('même taux : aucun gain de mensualité, pas de point mort, le gain net vaut −frais', () => {
    const r = renegotiation({ ...base, newRate: 0.045 });
    expect(r.monthlyGain).toBeCloseTo(0, 9);
    expect(r.breakEvenMonths).toBeNull();
    expect(r.netGain).toBeCloseTo(-3000, 6);
  });

  it('allonger la durée baisse la mensualité mais peut augmenter le coût total', () => {
    const r = renegotiation({ ...base, newYears: 25, newRate: 0.045, fees: 0 });
    expect(r.longer).toBe(true);
    expect(r.monthlyGain).toBeGreaterThan(0);
    expect(r.netGain).toBeLessThan(0);
  });

  it('taux nul, capital nul ou durée nulle : jamais NaN', () => {
    const z = renegotiation({ ...base, currentRate: 0, newRate: 0 });
    expect(z.currentRemainingInterest).toBeCloseTo(0, 6);
    for (const v of Object.values(renegotiation({ ...base, remaining: 0, newYears: 0, currentYearsLeft: 0 }))) {
      if (typeof v === 'number') expect(Number.isNaN(v)).toBe(false);
    }
  });
});

// Exemples fictifs : barres « ce qu'il reste à payer » du simulateur.
describe('Barres de la renégociation', () => {
  const base = { remaining: 150000, currentRate: 0.045, currentYearsLeft: 20, newRate: 0.035, newYears: 20, fees: 3000 };

  it('opération avantageuse : la barre actuelle vaut 100 et l’écart correspond au gain net', () => {
    const r = renegotiation(base);
    const b = renegotiationBars(r, 3000);
    expect(b.current).toBeCloseTo(100, 9);
    expect(b.newInterest).toBeCloseTo((100 * r.newInterest) / r.currentRemainingInterest, 9);
    expect(b.fees).toBeCloseTo((100 * 3000) / r.currentRemainingInterest, 9);
    expect(b.saved).toBeCloseTo((100 * r.netGain) / r.currentRemainingInterest, 9);
    expect(b.newInterest + b.fees + b.saved).toBeCloseTo(100, 9);
  });

  it('opération perdante : la barre « renégocier » vaut 100 et rien n’est économisé', () => {
    const r = renegotiation({ ...base, newYears: 25, newRate: 0.045, fees: 0 });
    const b = renegotiationBars(r, 0);
    expect(b.newInterest).toBeCloseTo(100, 9);
    expect(b.current).toBeLessThan(100);
    expect(b.saved).toBe(0);
  });

  it('valeurs nulles ou invalides : barres vides, jamais NaN', () => {
    expect(renegotiationBars({ currentRemainingInterest: 0, newInterest: 0 }, 0)).toEqual({ current: 0, newInterest: 0, fees: 0, saved: 0 });
    const b = renegotiationBars({ currentRemainingInterest: NaN, newInterest: NaN }, NaN);
    expect(Object.values(b).every((v) => Number.isFinite(v))).toBe(true);
  });
});
