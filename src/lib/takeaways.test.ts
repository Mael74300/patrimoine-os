import { describe, expect, it } from 'vitest';
import { amortize, debtRatio, fireTarget, performance, rentVsBuy, savingsGoal, yearsToTarget } from './finance';
import { creditTakeaway, debtRatioTakeaway, fireTakeaway, performanceTakeaway, rentVsBuyTakeaway, savingsGoalTakeaway } from './takeaways';

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

  const digits = (t: string) => t.replace(/\s/g, '');
  const eur = (n: number) => digits(Math.round(n).toLocaleString('fr-FR'));

  it('objectif d’épargne : versement, versements totaux et intérêts calculés', () => {
    const input = { target: 20000, current: 2000, years: 5, annualRate: 0.02 };
    const r = savingsGoal(input);
    const t = digits(savingsGoalTakeaway({ ...input, monthly: r.monthly, deposits: r.deposits, interest: r.interest }));
    expect(t).toContain(eur(r.monthly));
    expect(t).toContain(eur(r.deposits));
    expect(t).toContain(eur(r.interest));
    expect(t).toContain('5ans');
  });
  it('objectif d’épargne : taux nul, objectif déjà couvert, échéance nulle', () => {
    const z = savingsGoal({ target: 12000, current: 0, years: 5, annualRate: 0 });
    expect(savingsGoalTakeaway({ target: 12000, current: 0, years: 5, monthly: z.monthly, deposits: z.deposits, interest: z.interest })).toContain('pas d\'intérêts');
    expect(savingsGoalTakeaway({ target: 1000, current: 5000, years: 3, monthly: 0, deposits: 0, interest: 0 })).toContain('sans rien verser');
    expect(savingsGoalTakeaway({ target: 1000, current: 0, years: 0, monthly: 0, deposits: 0, interest: 0 })).toBe('');
  });
  it('louer ou acheter : sens de l’écart et mise en garde sur les hypothèses', () => {
    const base = { price: 250000, downPayment: 50000, acquisitionRate: 0.08, loanRate: 0.035, loanYears: 20, ownerCostRate: 0.015, priceGrowth: 0.02, sellingRate: 0.05, monthlyRent: 900, rentGrowth: 0.02, investReturn: 0.04, horizonYears: 15 };
    const buy = rentVsBuy({ ...base, priceGrowth: 0.06 });
    expect(buy.advantage).toBeGreaterThan(0);
    const tb = rentVsBuyTakeaway({ horizonYears: 15, advantage: buy.advantage, breakEvenMonth: buy.breakEvenMonth });
    expect(digits(tb)).toContain(eur(buy.advantage));
    expect(tb).toContain('en achetant');
    expect(tb).toContain('hypothèses');
    const rent = rentVsBuy({ ...base, priceGrowth: -0.03, horizonYears: 5 });
    expect(rent.advantage).toBeLessThan(0);
    const tr = rentVsBuyTakeaway({ horizonYears: 5, advantage: rent.advantage, breakEvenMonth: rent.breakEvenMonth });
    expect(digits(tr)).toContain(eur(-rent.advantage));
    expect(tr).toContain('en louant');
    expect(rentVsBuyTakeaway({ horizonYears: 0, advantage: 1, breakEvenMonth: null })).toBe('');
  });
  it('indépendance financière : capital visé et délai issus du calcul', () => {
    const fi = { annualExpenses: 30000, currentWealth: 80000, recurringIncome: 0, annualSavings: 15000, nominalReturn: 0.05, inflation: 0.02, withdrawalRate: 0.035 };
    const target = fireTarget(fi.annualExpenses, fi.recurringIncome, fi.withdrawalRate);
    const years = yearsToTarget(fi);
    expect(years).not.toBeNull();
    const t = digits(fireTakeaway({ gap: 30000, withdrawalRate: 0.035, target, currentWealth: 80000, annualSavings: 15000, years }));
    expect(t).toContain(eur(target));
    expect(t).toContain(`${years}ans`);
    expect(fireTakeaway({ gap: 30000, withdrawalRate: 0.035, target, currentWealth: 900000, annualSavings: 0, years: 0 })).toContain('atteint déjà');
    expect(fireTakeaway({ gap: 30000, withdrawalRate: 0.035, target, currentWealth: 0, annualSavings: 0, years: null })).toContain('100 ans');
    expect(fireTakeaway({ gap: 0, withdrawalRate: 0.035, target: 0, currentWealth: 0, annualSavings: 0, years: 0 })).toContain('aucun capital');
    expect(fireTakeaway({ gap: 30000, withdrawalRate: 0, target: Infinity, currentWealth: 0, annualSavings: 0, years: null })).toBe('');
  });
});
