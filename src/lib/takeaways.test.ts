import { describe, expect, it } from 'vitest';
import { delayCost, doubling, presentValue, rateConversion, requiredReturn, simpleVsCompound, stepUp, timeToTarget, amortize, debtRatio, fmtPct, rentalAnalysis, rentalProjection, type RentalInput, fireTarget, performance, precautionPath, prepayVsInvest, rentVsBuy, withdrawal, savingsGoal, yearsToTarget } from './finance';
import { delayCostTakeaway, doublingTakeaway, presentValueTakeaway, rateConversionTakeaway, requiredReturnTakeaway, simpleVsCompoundTakeaway, stepUpTakeaway, timeToTargetTakeaway, creditTakeaway, debtRatioTakeaway, fireTakeaway, performanceTakeaway, precautionTakeaway, prepayTakeaway, rentalTakeaway, rentVsBuyTakeaway, savingsGoalTakeaway, withdrawalTakeaway } from './takeaways';

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
  it('retraits : durée, capital restant et retrait tenable issus du calcul', () => {
    const base = { capital: 200000, monthly: 1000, annualReturn: 0.03, indexation: 0.02, years: 25 };
    const ok = withdrawal(base);
    const t = digits(withdrawalTakeaway({ capital: 200000, monthly: 1000, years: 25, ...ok }));
    expect(t).toContain(eur(ok.remaining));
    expect(t).toContain(eur(ok.totalWithdrawn));
    expect(t).toContain(eur(ok.sustainable));
    const out = withdrawal({ ...base, monthly: 2500 });
    expect(out.monthsUntilEmpty).not.toBeNull();
    const m = out.monthsUntilEmpty as number;
    const t2 = withdrawalTakeaway({ capital: 200000, monthly: 2500, years: 25, ...out });
    expect(t2).toContain(`${Math.floor(m / 12)} an`);
    expect(digits(t2)).toContain(eur(out.sustainable));
    expect(withdrawalTakeaway({ capital: 0, monthly: 100, years: 5, ...ok })).toBe('');
  });
  it('épargne de précaution : manque et délai issus du calcul, cas atteint et non atteint', () => {
    const input = { profile: 'stable' as const, monthlyExpenses: 2000, months: 3, extraReserve: 1000, currentSavings: 2500, monthlySaving: 250, annualRate: 0.017, deadline: 24 };
    const path = precautionPath(input);
    const t = digits(precautionTakeaway({ target: path.target, savings: 2500, monthlySaving: 250, reachedAt: path.reachedAt }));
    expect(t).toContain(eur(path.target));
    expect(t).toContain(eur(path.target - 2500));
    expect(path.reachedAt).not.toBeNull();
    expect(precautionTakeaway({ target: 7000, savings: 8000, monthlySaving: 0, reachedAt: 0 })).toContain('couvre déjà');
    expect(precautionTakeaway({ target: 7000, savings: 0, monthlySaving: 0, reachedAt: null })).toContain('ne se comble pas');
    expect(precautionTakeaway({ target: 7000, savings: 0, monthlySaving: 1, reachedAt: null })).toContain('50 ans');
    expect(precautionTakeaway({ target: 0, savings: 0, monthlySaving: 0, reachedAt: 0 })).toBe('');
  });
  it('rembourser ou investir : sens de l’écart, intérêts économisés et seuil', () => {
    const base = { balance: 150000, annualRate: 0.035, remainingYears: 15, lump: 20000, annualReturn: 0.05, annualFees: 0.005, taxRate: 0.314 };
    const inv = prepayVsInvest({ ...base, annualReturn: 0.1 });
    expect(inv.advantageInvest).toBeGreaterThan(0);
    const ti = prepayTakeaway(inv);
    expect(digits(ti)).toContain(eur(inv.advantageInvest));
    expect(digits(ti)).toContain(eur(inv.interestSaved));
    expect(ti).toContain('placer');
    const rep = prepayVsInvest({ ...base, annualReturn: 0.0 });
    expect(rep.advantageInvest).toBeLessThan(0);
    const tr = prepayTakeaway(rep);
    expect(digits(tr)).toContain(eur(-rep.advantageInvest));
    expect(tr).toContain('pour rembourser');
    expect(prepayTakeaway({ ...rep, lump: 0 })).toBe('');
  });
});

describe('phrase « Concrètement » : immobilier locatif', () => {
  const digits = (t: string) => t.replace(/\s/g, '');
  const eur = (n: number) => digits(Math.round(n).toLocaleString('fr-FR'));
  const base: RentalInput = {
    price: 150000, notaryRate: 0.08, works: 10000, furniture: 0,
    monthlyRent: 750, vacancyMonths: 1, propertyTax: 900, coOwnership: 600, insurancePno: 150,
    managementRate: 0, maintenanceRate: 0.05,
    downPayment: 22000, loanRate: 0.035, loanYears: 20, loanInsuranceRate: 0.003,
    regime: 'micro-foncier', marginalRate: 0.3, socialRate: 0.172, microAllowance: 0.3, annualDepreciation: 4000,
    appreciation: 0.01, indexation: 0.015, horizon: 20,
  };
  const args = (i: RentalInput) => {
    const r = rentalAnalysis(i);
    const proj = rentalProjection(i);
    return { totalCost: r.totalCost, netYield: r.netYield, monthlyCashflow: r.monthlyCashflow, monthlyCashflowAfterTax: proj[0].cashflowAfterTax / 12, horizon: i.horizon, netEquity: proj[proj.length - 1].netEquity };
  };
  it('reprend rendement net, flux mensuels et patrimoine calculés', () => {
    const a = args(base);
    expect(a.monthlyCashflow).toBeLessThan(0);
    const t = digits(rentalTakeaway(a));
    expect(t).toContain(digits(fmtPct(a.netYield)));
    expect(t).toContain(eur(-a.monthlyCashflow));
    expect(t).toContain('devotrepoche');
    expect(t).toContain(eur(a.netEquity));
  });
  it('flux positif : le loyer couvre mensualité et charges', () => {
    const a = args({ ...base, monthlyRent: 1500 });
    expect(a.monthlyCashflow).toBeGreaterThan(0);
    const t = digits(rentalTakeaway(a));
    expect(t).toContain('leloyercouvre');
    expect(t).toContain(eur(a.monthlyCashflow));
  });
  it('sans estimation d’impôt, aucune phrase sur l’impôt ; entrées vides : texte vide', () => {
    expect(rentalTakeaway({ ...args(base), monthlyCashflowAfterTax: null })).not.toContain('impôt estimé');
    expect(rentalTakeaway({ ...args(base), totalCost: 0 })).toBe('');
  });
  it('intérêts composés : combien placer, chiffres issus du calcul', () => {
    const i = { target: 30000, years: 10, annualRate: 0.04, monthly: 100 };
    const r = presentValue(i);
    const t = digits(presentValueTakeaway({ target: 30000, years: 10, monthly: 100, ...r }));
    expect(t).toContain(eur(r.initial));
    expect(t).toContain(eur(r.gain));
    expect(t).toContain(eur(r.contributed));
    const z = presentValue({ target: 1000, years: 10, annualRate: 0.04, monthly: 500 });
    expect(presentValueTakeaway({ target: 1000, years: 10, monthly: 500, ...z })).toContain('sans placer');
    expect(presentValueTakeaway({ target: 0, years: 10, monthly: 0, ...z })).toBe('');
  });
  it('intérêts composés : durée, intérêts et temps gagné', () => {
    const r = timeToTarget({ initial: 2000, monthly: 300, annualRate: 0.04, target: 30000 });
    const t = digits(timeToTargetTakeaway({ target: 30000, months: r.months, interest: r.interest, contributed: r.contributed, monthsWithoutReturn: r.monthsWithoutReturn }));
    expect(t).toContain(eur(r.interest));
    expect(t).toContain(eur(r.contributed));
    expect(t).toContain('gagne');
    expect(timeToTargetTakeaway({ target: 30000, months: null, interest: 0, contributed: 0, monthsWithoutReturn: null })).toBe('');
  });
  it('intérêts composés : rendement nécessaire', () => {
    const r = requiredReturn({ initial: 5000, monthly: 200, years: 15, target: 60000 });
    const t = digits(requiredReturnTakeaway({ target: 60000, years: 15, ...r }));
    expect(t).toContain(eur(r.contributed));
    expect(t).toContain(eur(60000 - r.withoutReturn));
    expect(t).toContain(digits(fmtPct(r.annualRate as number)));
    const easy = requiredReturn({ initial: 5000, monthly: 500, years: 15, target: 20000 });
    expect(requiredReturnTakeaway({ target: 20000, years: 15, ...easy })).toContain('aucun rendement');
    expect(requiredReturnTakeaway({ target: 1, years: 15, annualRate: null, contributed: 0, withoutReturn: 0, alreadyReached: false })).toBe('');
  });
  it('intérêts composés : doubler son capital, en euros puis en pouvoir d’achat', () => {
    const r = doubling({ initial: 10000, annualReturn: 0.06, inflation: 0.02, multiple: 2 });
    const t = doublingTakeaway({ multiple: 2, exactYears: r.exactYears, realYears: r.realYears, realReturn: r.realReturn });
    expect(t).toContain(`${(Math.round((r.exactYears as number) * 10) / 10).toString().replace('.', ',')} ans`);
    expect(t).toContain('inflation');
    const flat = doubling({ initial: 10000, annualReturn: 0.02, inflation: 0.03, multiple: 2 });
    expect(doublingTakeaway({ multiple: 2, exactYears: flat.exactYears, realYears: flat.realYears, realReturn: flat.realReturn })).toContain('pouvoir d\'achat n\'augmente pas');
    expect(doublingTakeaway({ multiple: 1, exactYears: null, realYears: null, realReturn: 0 })).toBe('');
  });
  it('intérêts composés : simples ou composés', () => {
    const r = simpleVsCompound({ initial: 10000, annualRate: 0.05, years: 20 });
    const t = digits(simpleVsCompoundTakeaway({ initial: 10000, years: 20, ...r }));
    expect(t).toContain(eur(r.simpleFinal));
    expect(t).toContain(eur(r.compoundFinal));
    expect(t).toContain(eur(r.gap));
    expect(simpleVsCompoundTakeaway({ initial: 0, years: 20, simpleFinal: 0, compoundFinal: 0, gap: 0 })).toBe('');
  });
  it('intérêts composés : coût d’attendre et rattrapage', () => {
    const r = delayCost({ monthly: 200, annualReturn: 0.05, years: 25, delayYears: 5 });
    const t = digits(delayCostTakeaway({ monthly: 200, years: 25, delayYears: 5, ...r }));
    expect(t).toContain(eur(r.startNow));
    expect(t).toContain(eur(r.startLater));
    expect(t).toContain(eur(r.cost));
    expect(t).toContain(eur(r.catchUpMonthly as number));
    expect(delayCostTakeaway({ monthly: 200, years: 5, delayYears: 5, startNow: 0, startLater: 0, cost: 0, catchUpMonthly: null })).toBe('');
  });
  it('intérêts composés : épargne qui augmente', () => {
    const r = stepUp({ monthly: 200, annualIncrease: 0.03, annualReturn: 0.05, years: 25 });
    const t = digits(stepUpTakeaway({ monthly: 200, years: 25, ...r }));
    expect(t).toContain(eur(r.steppedCapital));
    expect(t).toContain(eur(r.flatCapital));
    expect(t).toContain(eur(r.extraCapital));
    expect(t).toContain(eur(r.lastMonthly));
    expect(stepUpTakeaway({ monthly: 0, years: 25, ...r })).toBe('');
  });
  it('intérêts composés : conversion de taux', () => {
    const r = rateConversion({ annualRate: 0.05, periods: 12 });
    const t = rateConversionTakeaway({ annualRate: 0.05, periods: 12, equivalentRate: r.equivalentRate, proportionalRate: r.proportionalRate, gap: r.gap });
    expect(t).toContain('mensuel');
    expect(t).toContain((r.equivalentRate * 100).toFixed(4).replace('.', ','));
    expect(t).toContain((r.proportionalRate * 100).toFixed(4).replace('.', ','));
    expect(rateConversionTakeaway({ annualRate: 0.05, periods: 7, equivalentRate: r.equivalentRate, proportionalRate: r.proportionalRate, gap: r.gap })).toBe('');
  });
});
