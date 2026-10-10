import { describe, expect, it } from 'vitest';
import { amortize } from './loan';
import { ADVERSE, adverseScenario, capitalGainsTaxRealEstate, rentalAnalysis, rentalProjection } from './rental';

import { RENTAL } from './fixtures';

describe('indicateurs avant impôt', () => {
  it('rendements brut et net', () => {
    const r = rentalAnalysis(RENTAL);
    expect(r.totalCost).toBeCloseTo(172000, 6);
    expect(r.grossYield).toBeCloseTo(9000 / 150000, 10);
    const collected = 750 * 11;
    expect(r.netYield).toBeCloseTo((collected - (1650 + collected * 0.05)) / 172000, 10);
  });
  it('cash-flow = résultat − mensualité assurance comprise', () => {
    const r = rentalAnalysis(RENTAL);
    const l = amortize({ principal: 150000, annualRate: 0.035, years: 20, insuranceRate: 0.003 });
    expect(r.monthlyCashflow).toBeCloseTo((r.annualRentCollected - r.annualCharges) / 12 - l.monthlyPayment - l.monthlyInsurance, 8);
  });
  it('achat comptant et prix nul : aucune division par zéro', () => {
    expect(rentalAnalysis({ ...RENTAL, downPayment: 1e6 }).monthlyLoan).toBe(0);
    const z = rentalAnalysis({ ...RENTAL, price: 0, works: 0 });
    expect(z.grossYield).toBe(0);
    expect(z.netYield).toBe(0);
  });
  it('vacance supérieure à 12 mois bornée', () => {
    expect(rentalAnalysis({ ...RENTAL, vacancyMonths: 20 }).annualRentCollected).toBe(0);
  });
});

describe('projection et fiscalité paramétrable', () => {
  it('sans fiscalité, après impôt = avant impôt', () => {
    for (const y of rentalProjection(RENTAL)) expect(y.cashflowAfterTax).toBeCloseTo(y.cashflowBeforeTax, 8);
  });
  it('le cash-flow annuel de l’année 1 égale 12 × le cash-flow mensuel', () => {
    expect(rentalProjection(RENTAL)[0].cashflowBeforeTax).toBeCloseTo(rentalAnalysis(RENTAL).monthlyCashflow * 12, 6);
  });
  it('micro-foncier : 70 % des loyers × (TMI + PS)', () => {
    const y1 = rentalProjection({ ...RENTAL, regime: 'micro-foncier' })[0];
    expect(y1.tax).toBeCloseTo(8250 * 0.7 * 0.472, 6);
  });
  it('réel foncier : charges, intérêts et assurance déduits ; déficit reporté', () => {
    const p = rentalProjection({ ...RENTAL, regime: 'reel-foncier' });
    const y1 = p[0];
    const base = y1.rents - y1.charges - y1.interest - y1.insurance;
    expect(y1.taxable).toBeCloseTo(Math.max(0, base), 6);
    const big = rentalProjection({ ...RENTAL, regime: 'reel-foncier', coOwnership: 10000 });
    expect(big[0].tax).toBe(0);
  });
  it("LMNP réel : l'amortissement ne crée pas de déficit et l'excédent est reporté", () => {
    const p = rentalProjection({ ...RENTAL, regime: 'reel-bic', annualDepreciation: 100000 });
    for (const y of p) {
      expect(y.taxable).toBeGreaterThanOrEqual(0);
      expect(y.tax).toBe(0);
    }
  });
  it('capital restant dû et patrimoine net', () => {
    const p = rentalProjection({ ...RENTAL, appreciation: 0.01 });
    expect(p[19].remaining).toBeCloseTo(0, 4);
    expect(p[19].netEquity).toBeCloseTo(150000 * 1.01 ** 20, 4);
    expect(p[0].netEquity).toBeCloseTo(150000 * 1.01 - p[0].remaining, 6);
  });
  it('horizon au-delà du prêt : plus de mensualité', () => {
    const p = rentalProjection({ ...RENTAL, horizon: 25 });
    expect(p[22].interest).toBe(0);
    expect(p[22].cashflowBeforeTax).toBeCloseTo(p[22].rents - p[22].charges, 8);
  });
  it('horizon nul', () => expect(rentalProjection({ ...RENTAL, horizon: 0 })).toHaveLength(0));
});

describe('scénario défavorable', () => {
  it('applique les hypothèses annoncées', () => {
    const a = adverseScenario(RENTAL);
    expect(a.vacancyMonths).toBe(1 + ADVERSE.extraVacancyMonths);
    expect(a.monthlyRent).toBeCloseTo(750 * ADVERSE.rentFactor, 8);
    expect(rentalAnalysis(a).monthlyCashflow).toBeLessThan(rentalAnalysis(RENTAL).monthlyCashflow);
  });
});

describe('plus-value immobilière', () => {
  it('moins de 6 ans : aucun abattement', () => {
    expect(capitalGainsTaxRealEstate(100000, 5).total).toBeCloseTo(36200, 6);
  });
  it('22 ans : exonération d’impôt, prélèvements sociaux réduits de 28 %', () => {
    const t = capitalGainsTaxRealEstate(100000, 22);
    expect(t.ir).toBeCloseTo(0, 8);
    expect(t.ps).toBeCloseTo(100000 * 0.72 * 0.172, 6);
  });
  it('30 ans : exonération totale', () => expect(capitalGainsTaxRealEstate(100000, 30).total).toBeCloseTo(0, 8));
  it('moins-value : aucun impôt', () => expect(capitalGainsTaxRealEstate(-5000, 10).total).toBe(0));
});
