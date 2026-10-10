import { describe, expect, it } from 'vitest';
import {
  afterTax,
  amortize,
  borrowingCapacity,
  loanPayment,
  monthlyRate,
  netOfFees,
  projectGrowth,
  rebalance,
  rentalAnalysis,
  requiredMonthly,
  summarizePortfolio,
} from './finance';

describe('intérêts composés', () => {
  it('le taux mensuel recompose exactement le taux annuel', () => {
    expect(Math.pow(1 + monthlyRate(0.05), 12)).toBeCloseTo(1.05, 12);
  });

  it('sans rendement, la valeur égale les versements', () => {
    const p = projectGrowth({ initial: 1000, monthly: 100, annualReturn: 0, annualFees: 0, years: 10, inflation: 0 });
    expect(p.at(-1)!.value).toBeCloseTo(1000 + 100 * 120, 6);
    expect(p.at(-1)!.contributed).toBeCloseTo(13000, 6);
  });

  it('capital seul : 10 000 € à 5 % pendant 10 ans = 10 000 × 1,05^10', () => {
    const p = projectGrowth({ initial: 10000, monthly: 0, annualReturn: 0.05, annualFees: 0, years: 10, inflation: 0 });
    expect(p.at(-1)!.value).toBeCloseTo(10000 * Math.pow(1.05, 10), 4);
  });

  it('versements en début de mois : formule fermée de la rente à terme échu anticipée', () => {
    const r = monthlyRate(0.06);
    const n = 240;
    const expected = 200 * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const p = projectGrowth({ initial: 0, monthly: 200, annualReturn: 0.06, annualFees: 0, years: 20, inflation: 0 });
    expect(p.at(-1)!.value).toBeCloseTo(expected, 4);
  });

  it('les frais réduisent le rendement multiplicativement', () => {
    expect(netOfFees(0.07, 0.01)).toBeCloseTo(1.07 * 0.99 - 1, 12);
  });

  it("la valeur réelle est déflatée de l'inflation", () => {
    const p = projectGrowth({ initial: 1000, monthly: 0, annualReturn: 0.02, annualFees: 0, years: 5, inflation: 0.02 });
    expect(p.at(-1)!.realValue).toBeCloseTo(1000, 6);
  });

  it('le versement requis atteint exactement la cible', () => {
    const m = requiredMonthly(300000, 5000, 0.05, 25);
    const p = projectGrowth({ initial: 5000, monthly: m, annualReturn: 0.05, annualFees: 0, years: 25, inflation: 0 });
    expect(p.at(-1)!.value).toBeCloseTo(300000, 2);
  });

  it('versement requis nul si le capital initial suffit', () => {
    expect(requiredMonthly(1000, 2000, 0.03, 5)).toBe(0);
  });

  it("l'impôt ne porte que sur les gains", () => {
    expect(afterTax(15000, 10000, 0.314)).toBeCloseTo(15000 - 5000 * 0.314, 8);
    expect(afterTax(9000, 10000, 0.314)).toBe(9000);
  });
});

describe('crédit amortissable', () => {
  it('mensualité de référence : 200 000 € à 3,6 % sur 20 ans', () => {
    // valeur calculée indépendamment : 1 170,22 €
    expect(loanPayment(200000, 0.036, 20)).toBeCloseTo(1170.22, 1);
  });

  it('taux nul : remboursement linéaire', () => {
    expect(loanPayment(120000, 0, 10)).toBeCloseTo(1000, 8);
  });

  it('le tableau rembourse exactement le capital', () => {
    const res = amortize({ principal: 150000, annualRate: 0.04, years: 15, insuranceRate: 0.003 });
    const paid = res.schedule.reduce((s, y) => s + y.principalPaid, 0);
    expect(paid).toBeCloseTo(150000, 4);
    expect(res.schedule.at(-1)!.remaining).toBeCloseTo(0, 4);
    expect(res.totalInterest).toBeCloseTo(res.monthlyPayment * 180 - 150000, 4);
    expect(res.totalInsurance).toBeCloseTo(150000 * 0.003 * 15, 6);
  });

  it("la capacité d'emprunt est l'inverse de la mensualité", () => {
    const cap = borrowingCapacity(1170.22, 0.036, 20);
    expect(cap).toBeCloseTo(200000, -1);
  });
});

describe('immobilier locatif', () => {
  const base = {
    price: 150000, notaryRate: 0.08, works: 10000, furniture: 0, monthlyRent: 750, vacancyMonths: 1,
    propertyTax: 900, coOwnership: 600, insurancePno: 150, managementRate: 0, maintenanceRate: 0.05,
    downPayment: 22000, loanRate: 0.035, loanYears: 20, loanInsuranceRate: 0.003,
  };

  it('rendements brut et net', () => {
    const r = rentalAnalysis(base);
    expect(r.totalCost).toBeCloseTo(172000, 6);
    expect(r.grossYield).toBeCloseTo(9000 / 150000, 10);
    const collected = 750 * 11;
    const charges = 900 + 600 + 150 + collected * 0.05;
    expect(r.netYield).toBeCloseTo((collected - charges) / 172000, 10);
  });

  it('cash-flow = résultat mensuel - mensualité assurance comprise', () => {
    const r = rentalAnalysis(base);
    const loan = amortize({ principal: 150000, annualRate: 0.035, years: 20, insuranceRate: 0.003 });
    const expected = (r.annualRentCollected - r.annualCharges) / 12 - (loan.monthlyPayment + loan.monthlyInsurance);
    expect(r.loanAmount).toBe(150000);
    expect(r.monthlyCashflow).toBeCloseTo(expected, 8);
  });

  it('achat comptant : aucune mensualité', () => {
    const r = rentalAnalysis({ ...base, downPayment: 200000 });
    expect(r.loanAmount).toBe(0);
    expect(r.monthlyLoan).toBe(0);
  });
});

describe('portefeuille', () => {
  const lines = [
    { id: 'a', label: 'ETF actions', amount: 6000, expectedReturn: 0.06, fees: 0.002, risk: 4 },
    { id: 'b', label: 'Fonds euros', amount: 3000, expectedReturn: 0.025, fees: 0.006, risk: 1 },
    { id: 'c', label: 'Livret', amount: 1000, expectedReturn: 0.017, fees: 0, risk: 1 },
  ];

  it('pondérations et moyennes', () => {
    const s = summarizePortfolio(lines);
    expect(s.total).toBe(10000);
    expect(s.weights.map((w) => w.weight)).toEqual([0.6, 0.3, 0.1]);
    expect(s.grossReturn).toBeCloseTo(0.6 * 0.06 + 0.3 * 0.025 + 0.1 * 0.017, 12);
    expect(s.weightedRisk).toBeCloseTo(2.8, 12);
    expect(s.annualFeesEuro).toBeCloseTo(6000 * 0.002 + 3000 * 0.006, 8);
  });

  it('portefeuille vide', () => {
    expect(summarizePortfolio([]).total).toBe(0);
  });

  it('rééquilibrage vers 50/30/20', () => {
    const d = rebalance(lines, { a: 0.5, b: 0.3, c: 0.2 });
    expect(d.a).toBeCloseTo(-1000, 8);
    expect(d.b).toBeCloseTo(0, 8);
    expect(d.c).toBeCloseTo(1000, 8);
  });
});
