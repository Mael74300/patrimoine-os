import { describe, expect, it } from 'vitest';
import { compareBalance, compareEtfImmo } from './compare';
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

describe('bilan « d’où vient l’écart »', () => {
  it('versements récupérés + gain net + frais de sortie = patrimoine avant sortie', () => {
    const r = compareEtfImmo(input);
    for (const side of [r.etf, r.immo]) {
      const b = compareBalance(side);
      expect(b.invested).toBe(side.invested);
      expect(b.kept + b.gain + b.exitCosts).toBeCloseTo(b.beforeExit, 6);
      expect(b.kept + b.gain - b.shortfall).toBeCloseTo(side.netWealth, 6);
      expect(b.net).toBe(side.netWealth);
    }
  });
  it('les deux côtés reçoivent les mêmes versements : l’écart est la différence des gains nets', () => {
    const r = compareEtfImmo(input);
    const e = compareBalance(r.etf);
    const i = compareBalance(r.immo);
    expect(e.invested).toBe(i.invested);
    expect((e.gain - e.shortfall) - (i.gain - i.shortfall)).toBeCloseTo(r.etf.netWealth - r.immo.netWealth, 6);
  });
  it('perte : gain nul, versements en partie perdus', () => {
    const b = compareBalance({ invested: 100000, grossValue: 80000, exitCosts: 0, netWealth: 80000, netWealthReal: 0, debtAtHorizon: 0 });
    expect(b).toMatchObject({ kept: 80000, gain: 0, shortfall: 20000, beforeExit: 80000 });
  });
  it('patrimoine net négatif : rien de récupéré, pas de valeur négative', () => {
    const b = compareBalance({ invested: 50000, grossValue: 0, exitCosts: 4000, netWealth: -10000, netWealthReal: 0, debtAtHorizon: 0 });
    expect(b.kept).toBe(0);
    expect(b.gain).toBe(0);
    expect(b.shortfall).toBe(50000);
  });
});
