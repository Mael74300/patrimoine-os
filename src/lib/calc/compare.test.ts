import { describe, expect, it } from 'vitest';
import { compareEtfImmo } from './compare';
import { rentalProjection } from './rental';
import { RENTAL } from './fixtures';

const input = {
  rental: RENTAL,
  etf: { annualReturn: 0.05, annualFees: 0.003, exitTaxRate: 0.314 },
  horizon: 20, inflation: 0.02, cashRate: 0.017, saleCostRate: 0.05,
};

describe('comparaison ETF / immobilier sur base identique', () => {
  it('même capital de départ et même effort cumulé des deux côtés', () => {
    const r = compareEtfImmo(input);
    expect(r.startCapital).toBe(22000);
    expect(r.etf.invested).toBe(r.immo.invested);
    const effort = rentalProjection({ ...RENTAL, horizon: 20 }).reduce((s, y) => s + Math.max(0, -y.cashflowAfterTax), 0);
    expect(r.etf.invested).toBeCloseTo(22000 + effort, 6);
  });
  it('ETF à rendement nul et sans impôt : valeur = sommes investies', () => {
    const r = compareEtfImmo({ ...input, etf: { annualReturn: 0, annualFees: 0, exitTaxRate: 0.314 } });
    expect(r.etf.grossValue).toBeCloseTo(r.etf.invested, 6);
    expect(r.etf.exitCosts).toBeCloseTo(0, 6);
  });
  it('à l’échéance du prêt, la dette est nulle', () => {
    expect(compareEtfImmo(input).immo.debtAtHorizon).toBeCloseTo(0, 4);
  });
  it('déterministe et sans NaN', () => {
    const a = compareEtfImmo(input);
    expect(a).toEqual(compareEtfImmo(input));
    expect(Number.isFinite(a.immo.netWealth) && Number.isFinite(a.etf.netWealth)).toBe(true);
  });
  it('horizon nul', () => {
    const r = compareEtfImmo({ ...input, horizon: 0 });
    expect(r.years).toHaveLength(1);
  });
});
