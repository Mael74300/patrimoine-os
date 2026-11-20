import { describe, expect, it } from 'vitest';
import { projectGrowth, afterTax, netOfFees, purchasingPower, analyzeBudget, catchUp, delayCost, doubling, presentValue, rateConversion, requiredReturn, simpleVsCompound, stepUp, timeToTarget, amortize, debtRatio, fmtPct, fmtEur, rentalAnalysis, rentalBalance, rentalProjection, type RentalInput, fireTarget, drawdown, performance, precautionPath, prepayVsInvest, rentVsBuy, withdrawal, savingsGoal, yearsToTarget } from './finance';
import { BUSINESS_SCENARIOS, lowestCash, projectBusiness, summarizePortfolio, fmtMonths, monthlySavingNeeded, lateHalfGainsYears, fmtPart, monthlyByRate } from './finance';
import { feeImpact } from './calc/fees';
import { comparePayoff } from './calc/debtPayoff';
import { capacityForPayment } from './calc/debtRatio';
import { prepayment } from './calc/loan';
import { precautionTarget } from './calc/precaution';
import { interestShareLabel, rebalanceTakeaway, portfolioProjectionNote, businessTakeaway, businessZeroValueNote, portfolioTakeaway, wealthTakeaway, feesTakeaway, debtsTakeaway, inflationTakeaway, budgetTakeaway, budgetGapPhrase, delayCostTakeaway, doublingTakeaway, presentValueTakeaway, rateConversionTakeaway, requiredReturnTakeaway, simpleVsCompoundTakeaway, stepUpTakeaway, timeToTargetTakeaway, creditTakeaway, capacityTakeaway, debtRatioTakeaway, fireTakeaway, performanceTakeaway, precautionTakeaway, precautionPlacementTakeaway, precautionTargetSub, prepayTakeaway, prepaySummary, rentalCashflowSub, rentalTakeaway, rentVsBuyTakeaway, savingsGoalTakeaway, withdrawalChartNote, withdrawalTakeaway } from './takeaways';

describe('phrases « Concrètement »', () => {
  it('crédit : le total rendu = capital + coût total, calculé par amortize', () => {
    const res = amortize({ principal: 200000, annualRate: 0.036, years: 20, insuranceRate: 0.003 });
    const t = creditTakeaway({ principal: 200000, years: 20, monthlyTotal: res.monthlyPayment + res.monthlyInsurance, totalCost: res.totalCost });
    const rendu = Math.round(200000 + res.totalCost).toLocaleString('fr-FR');
    expect(t.replace(/\s/g, '')).toContain(rendu.replace(/\s/g, ''));
    expect(t).toContain('20\u00a0ans');
  });
  it('crédit : le résumé du remboursement anticipé reprend les résultats de prepayment', () => {
    const base = { principal: 200000, annualRate: 0.036, years: 20, insuranceRate: 0.003, atMonth: 60, amount: 30000, withPenalty: true };
    const d = prepayment({ ...base, mode: 'duree' });
    const t = prepaySummary({ year: 5, prepaid: d.prepaid, mode: 'duree', netSaving: d.netSaving, monthsSaved: d.monthsSaved, newMonthlyPayment: d.newMonthlyPayment });
    expect(t.startsWith(`${fmtEur(30000)} remboursés à la fin de l'année 5 : gain net de ${fmtEur(d.netSaving)}`)).toBe(true);
    expect(d.monthsSaved).toBeGreaterThan(0);
    expect(t).toContain('de moins');
    const m = prepayment({ ...base, mode: 'mensualite' });
    const tm = prepaySummary({ year: 5, prepaid: m.prepaid, mode: 'mensualite', netSaving: m.netSaving, monthsSaved: m.monthsSaved, newMonthlyPayment: m.newMonthlyPayment });
    expect(tm).toContain(`mensualité ramenée à ${fmtEur(m.newMonthlyPayment)}`);
    expect(prepaySummary({ year: 5, prepaid: 0, mode: 'duree', netSaving: 0, monthsSaved: 0, newMonthlyPayment: 0 })).toMatch(/^Indiquez/);
    expect(prepaySummary({ year: 5, prepaid: 1000, mode: 'duree', netSaving: -20, monthsSaved: 0, newMonthlyPayment: 900 })).toContain('perte nette');
  });
  it('crédit : vide si aucun emprunt', () => {
    expect(creditTakeaway({ principal: 0, years: 20, monthlyTotal: 0, totalCost: 0 })).toBe('');
  });
  it('capacité d’emprunt : d’où vient la mensualité maximale, et marge ou dépassement du projet', () => {
    const cap = capacityForPayment(1400, 0.036, 20, 0.003);
    const t = capacityTakeaway({ income: 4000, debtRatio: 0.35, years: 20, capacity: cap, principal: 200000 }).replace(/\u00a0/g, ' ');
    expect(t).toContain('35 % de vos revenus');
    expect(t).toContain('(20 ans)');
    expect(t).toContain(`${Math.round(cap - 200000).toLocaleString('fr-FR').replace(/\s/g, ' ')} € de marge`);
    const over = capacityTakeaway({ income: 4000, debtRatio: 0.35, years: 20, capacity: cap, principal: 300000 }).replace(/\u00a0/g, ' ');
    expect(over).toContain(`le dépasse de ${Math.round(300000 - cap).toLocaleString('fr-FR').replace(/\s/g, ' ')} €`);
    expect(capacityTakeaway({ income: 0, debtRatio: 0.35, years: 20, capacity: 0, principal: 200000 })).toBe('');
  });
  it('endettement : signale un reste à vivre négatif et un dépassement', () => {
    const t = debtRatioTakeaway({ income: 2000, ratioAfter: 0.5, remainingAfter: -100, withinRef: false, refLabel: '35 %' });
    expect(t.replace(/\u00a0/g, ' ')).toContain('50 €');
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

  it('objectif d’épargne : ce que veulent dire les cases, sans recopier leurs montants (exemple fictif par défaut)', () => {
    const input = { target: 20000, current: 2000, years: 5, annualRate: 0.017 };
    const r = savingsGoal(input);
    const zero = monthlyByRate(input, [0])[0].monthly;
    const brut = savingsGoalTakeaway({ ...input, monthly: r.monthly, interest: r.interest, monthlyWithoutReturn: zero });
    const t = digits(brut);
    // Les montants des cases (versement, total versé, intérêts) ne sont pas recopiés.
    for (const v of [r.monthly, r.deposits, r.interest]) expect(t).not.toContain(eur(v) + '€');
    // Intérêts sous 15 % de l'objectif : c'est l'effort qui fait le travail.
    expect(r.interest / input.target).toBeLessThan(0.15);
    expect(brut).toContain('surtout votre effort qui compte');
    // L'écart avec un argent qui ne rapporte rien, recalculé : 300 € − 285 € ≈ 15 € par mois.
    expect(Math.round(zero)).toBe(300);
    expect(t).toContain(`allègel'effortde${eur(zero - r.monthly)}€parmois`);
    expect(brut).toContain('5\u00a0ans');
  });
  it('objectif d’épargne : part des intérêts, taux nul ou négatif, objectif déjà couvert, échéance nulle', () => {
    const longue = { target: 100000, current: 0, years: 30, annualRate: 0.05 };
    const l = savingsGoal(longue);
    expect(savingsGoalTakeaway({ ...longue, monthly: l.monthly, interest: l.interest, monthlyWithoutReturn: monthlyByRate(longue, [0])[0].monthly })).toContain('le temps travaille pour vous');
    const z = savingsGoal({ target: 12000, current: 0, years: 5, annualRate: 0 });
    const tz = savingsGoalTakeaway({ target: 12000, current: 0, years: 5, monthly: z.monthly, interest: z.interest, monthlyWithoutReturn: z.monthly });
    expect(tz).toContain('pas d\'intérêts');
    expect(tz).not.toContain('allège');
    const neg = { target: 12000, current: 0, years: 5, annualRate: -0.02 };
    const n = savingsGoal(neg);
    expect(savingsGoalTakeaway({ ...neg, monthly: n.monthly, interest: n.interest, monthlyWithoutReturn: z.monthly })).toContain('alourdit');
    expect(savingsGoalTakeaway({ target: 1000, current: 5000, years: 3, monthly: 0, interest: 0, monthlyWithoutReturn: 0 })).toContain('sans rien verser');
    expect(savingsGoalTakeaway({ target: 1000, current: 0, years: 0, monthly: 0, interest: 0, monthlyWithoutReturn: 0 })).toBe('');
  });
  it('louer ou acheter : sens de l’écart et mise en garde sur les hypothèses', () => {
    const base = { price: 250000, downPayment: 50000, acquisitionRate: 0.08, loanRate: 0.035, loanYears: 20, ownerCostRate: 0.015, priceGrowth: 0.02, sellingRate: 0.05, monthlyRent: 900, rentGrowth: 0.02, investReturn: 0.04, horizonYears: 15 };
    const buy = rentVsBuy({ ...base, priceGrowth: 0.06 });
    expect(buy.advantage).toBeGreaterThan(0);
    const tb = rentVsBuyTakeaway({ horizonYears: 15, advantage: buy.advantage, breakEvenMonth: buy.breakEvenMonth });
    expect(digits(tb)).toContain(eur(buy.advantage));
    expect(tb).toContain('en achetant');
    // durée en années et mois, plus de « à partir du mois 145 »
    const be = buy.breakEvenMonth as number;
    expect(be).toBeGreaterThan(12);
    expect(tb).toContain(`au bout de ${Math.floor(be / 12)}\u00a0an`);
    expect(tb).not.toMatch(/du mois \d/);
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
    expect(t).toContain('eurosd’aujourd’hui');
    // Durée du capital en retrait : même calcul que la barre « le vôtre » du simulateur.
    const lasts = drawdown(target, fi, 60).depletedAt;
    expect(lasts).not.toBeNull();
    const tl = digits(fireTakeaway({ gap: 30000, withdrawalRate: 0.035, target, currentWealth: 80000, annualSavings: 15000, years, nominalReturn: 0.05, lastsYears: lasts, horizon: 60 }));
    expect(tl).toContain(`épuiséauboutde${lasts}ans`);
    expect(digits(fireTakeaway({ gap: 30000, withdrawalRate: 0.035, target, currentWealth: 80000, annualSavings: 15000, years, nominalReturn: 0.07, lastsYears: null, horizon: 60 }))).toContain("plusde60ans");
    expect(t).not.toContain('Ensuite');
    expect(fireTakeaway({ gap: 30000, withdrawalRate: 0.035, target, currentWealth: 900000, annualSavings: 0, years: 0 })).toContain('atteint déjà');
    expect(fireTakeaway({ gap: 30000, withdrawalRate: 0.035, target, currentWealth: 0, annualSavings: 0, years: null }).replace(/\u00a0/g, ' ')).toContain('100 ans');
    expect(fireTakeaway({ gap: 0, withdrawalRate: 0.035, target: 0, currentWealth: 0, annualSavings: 0, years: 0 })).toContain('aucun capital');
    expect(fireTakeaway({ gap: 30000, withdrawalRate: 0, target: Infinity, currentWealth: 0, annualSavings: 0, years: null })).toBe('');
  });
  it('retraits : légende du graphique à deux courbes issue du calcul', () => {
    const base = { capital: 200000, monthly: 1000, annualReturn: 0.03, indexation: 0.02, years: 25 };
    const ko = withdrawal(base);
    const t = withdrawalChartNote({ monthly: 1000, years: 25, ...ko });
    expect(t).toContain('25\u00a0ans');
    expect(t).not.toContain(fmtEur(ko.sustainable));
    expect(t).toContain('Pointillés : le retrait tenable');
    const ok = withdrawal({ ...base, monthly: 500 });
    const t2 = withdrawalChartNote({ monthly: 500, years: 25, ...ok });
    expect(t2).toContain('au plus haut');
    expect(withdrawalChartNote({ monthly: ko.sustainable, years: 25, ...ko })).toBe('');
    expect(withdrawalChartNote({ monthly: 0, years: 25, ...ko })).toBe('');
  });
  it('retraits : ce que signifient les cases, sans recopier leurs montants (exemple fictif)', () => {
    const base = { capital: 200000, monthly: 1000, annualReturn: 0.03, indexation: 0.02, years: 25 };
    const ko = withdrawal(base);
    expect(ko.monthsUntilEmpty).not.toBeNull();
    const m = ko.monthsUntilEmpty as number;
    const t = withdrawalTakeaway({ capital: 200000, monthly: 1000, years: 25, ...ko });
    // Écart à l'horizon et baisse du premier retrait, recalculés ; ni la durée ni le retrait tenable des cases.
    expect(t).toContain(`${fmtMonths(25 * 12 - m)} avant l'horizon`);
    const gap = 1000 - Math.round(ko.sustainable);
    expect(digits(t)).toContain(`${eur(gap)}€plusbas`);
    expect(t).toContain(`(environ ${Math.round((gap / 1000) * 100)}\u00a0% de moins)`);
    expect(digits(t)).toContain(eur(ko.totalWithdrawn));
    expect(ko.totalWithdrawn).toBeGreaterThan(200000);
    expect(t).toContain('plus que le capital placé');
    expect(t).not.toContain(fmtMonths(m));
    expect(digits(t)).not.toContain(eur(ko.sustainable));
    // Capital qui tient : marge sur le premier retrait, sans recopier le capital restant ni le retrait tenable.
    const ok = withdrawal({ ...base, monthly: 500 });
    expect(ok.monthsUntilEmpty).toBeNull();
    const t2 = withdrawalTakeaway({ capital: 200000, monthly: 500, years: 25, ...ok });
    expect(t2).toContain('tient jusqu');
    expect(digits(t2)).toContain(`${eur(Math.round(ok.sustainable) - 500)}€parmois`);
    expect(digits(t2)).not.toContain(eur(ok.remaining));
    expect(digits(t2)).not.toContain(eur(ok.sustainable));
    // Rendement négatif : on retire moins que le capital de départ, la phrase ne dit pas « plus que ».
    const neg = withdrawal({ ...base, annualReturn: -0.02 });
    expect(withdrawalTakeaway({ capital: 200000, monthly: 1000, years: 25, ...neg })).not.toContain('plus que le capital');
    expect(withdrawalTakeaway({ capital: 0, monthly: 100, years: 5, ...ok })).toBe('');
  });
  it('épargne de précaution : avance ou retard sur le délai souhaité, sans recopier les cases (exemple fictif)', () => {
    const input = { profile: 'stable' as const, monthlyExpenses: 2000, months: 3, extraReserve: 1000, currentSavings: 2500, monthlySaving: 250, annualRate: 0.017, deadline: 24 };
    const path = precautionPath(input);
    const needed = Math.ceil(monthlySavingNeeded(path.target, 2500, 24, 0.017));
    expect(path.reachedAt).not.toBeNull();
    const reached = path.reachedAt as number;
    expect(reached).toBeLessThan(24);
    const t = precautionTakeaway({ target: path.target, savings: 2500, monthlySaving: 250, reachedAt: reached, deadline: 24, needed });
    expect(t).toContain('suffit');
    expect(t).toContain(`${fmtMonths(24 - reached)} avant`);
    for (const shown of [path.target, path.target - 2500, 250, needed]) expect(digits(t)).not.toContain(eur(shown));
    // Versement trop faible : retard et versement à ajouter, égal à l'écart entre les deux cases.
    const slow = precautionPath({ ...input, monthlySaving: 100 });
    const late = precautionTakeaway({ target: slow.target, savings: 2500, monthlySaving: 100, reachedAt: slow.reachedAt, deadline: 24, needed });
    expect(late).toContain('ne suffit pas');
    expect(late).toContain(`${fmtMonths((slow.reachedAt as number) - 24)} plus tard`);
    expect(digits(late)).toContain(`${eur(needed - 100)}€deplus`);
    expect(precautionTakeaway({ target: 7000, savings: 2500, monthlySaving: 200, reachedAt: 24, deadline: 24, needed: 200 })).toContain('juste dans le délai');
    expect(precautionTakeaway({ target: 7000, savings: 8000, monthlySaving: 0, reachedAt: 0, deadline: 24, needed: 0 })).toContain('couvre déjà');
    expect(precautionTakeaway({ target: 7000, savings: 0, monthlySaving: 0, reachedAt: null, deadline: 24, needed: 300 })).toContain('ne se comble pas');
    expect(precautionTakeaway({ target: 7000, savings: 0, monthlySaving: 1, reachedAt: null, deadline: 24, needed: 300 }).replace(/\u00a0/g, ' ')).toContain('50 ans');
    expect(precautionTakeaway({ target: 0, savings: 0, monthlySaving: 0, reachedAt: 0, deadline: 24, needed: 0 })).toBe('');
  });
  it('épargne de précaution : part des intérêts en mots, toujours strictement au-dessus de la part réelle', () => {
    expect(interestShareLabel(118 / 7118).replace(/\u00a0/g, ' ')).toBe('moins de 2 %');
    expect(interestShareLabel(0.02).replace(/\u00a0/g, ' ')).toBe('moins de 3 %');
    expect(interestShareLabel(0.004).replace(/\u00a0/g, ' ')).toBe('moins de 1 %');
  });
  it('épargne de précaution : sous-titre du montant visé en mots, réserve nommée et égal au calcul', () => {
    const sub = digits(precautionTargetSub(3, 1000));
    expect(sub).toContain('3moisdedépenses');
    expect(sub).toContain('1000€deréserve(réglagesavancés)');
    expect(3 * 2000 + 1000).toBe(precautionTarget({ monthlyExpenses: 2000, months: 3, extraReserve: 1000 }));
    expect(precautionTargetSub(6, 0)).not.toContain('réserve');
  });
  it('épargne de précaution : intérêts d’une année pleine distingués de ceux de la constitution (exemple fictif)', () => {
    const one = digits(precautionPlacementTakeaway({ yearlyInterest: 119, blendedRate: 0.017, overflow: 0, livrets: 1, building: true }));
    expect(one).not.toContain('119€');
    expect(one).toContain('annéepleine');
    expect(one).toContain('constitution');
    expect(one).not.toContain('plafonds');
    const two = digits(precautionPlacementTakeaway({ yearlyInterest: 200, blendedRate: 0.02, overflow: 5000, livrets: 2, building: false }));
    expect(two).toContain('200€paran');
    expect(two).toContain('2%');
    expect(two).toContain('horsles5000€');
    expect(two).not.toContain('constitution');
    expect(precautionPlacementTakeaway({ yearlyInterest: 0, blendedRate: 0, overflow: 0, livrets: 1, building: true })).toBe('');
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
    const b = rentalBalance(i, proj);
    return { totalCost: r.totalCost, netYield: r.netYield, monthlyCashflow: r.monthlyCashflow, monthlyCashflowAfterTax: proj[0].cashflowAfterTax / 12, horizon: i.horizon, gap: Math.round(b.got) - Math.round(b.putIn) };
  };
  it('reprend le solde mensuel calculé, sans recopier les montants du bilan', () => {
    const a = args(base);
    const b = rentalBalance(base);
    expect(a.monthlyCashflow).toBeLessThan(0);
    const t = digits(rentalTakeaway(a));
    expect(t).toContain(eur(-a.monthlyCashflow));
    expect(t).toContain('devotrepoche');
    expect(t).not.toContain(eur(b.putIn));
    expect(t).not.toContain(eur(b.got));
  });
  it('verdict du bilan selon le signe des écarts central et défavorable', () => {
    const c = { totalCost: 100000, netYield: 0.04, monthlyCashflow: -100, monthlyCashflowAfterTax: null, horizon: 20 };
    expect(args(base).gap).toBeGreaterThan(0);
    expect(rentalTakeaway({ ...c, gap: 23291, badGap: -75152 })).toContain("vous détiendriez plus que ce que vous auriez sorti de votre poche ; dans le scénario défavorable, ce serait l'inverse.");
    expect(rentalTakeaway({ ...c, gap: 5000, badGap: 10 })).toContain('même dans le scénario défavorable');
    expect(rentalTakeaway({ ...c, gap: 5000 })).not.toContain('défavorable');
    expect(rentalTakeaway({ ...c, gap: 0, badGap: -10 })).toContain('à peu près ce que vous auriez sorti');
    expect(rentalTakeaway({ ...c, gap: -1, badGap: -10 })).toContain('vous auriez sorti de votre poche plus que ce que vous détiendriez');
  });
  it('flux positif : le loyer couvre mensualité et charges', () => {
    const a = args({ ...base, monthlyRent: 1500 });
    expect(a.monthlyCashflow).toBeGreaterThan(0);
    const t = digits(rentalTakeaway(a));
    expect(t).toContain('leloyercouvre');
    expect(t).toContain(eur(a.monthlyCashflow));
  });
  it('carte « Solde mensuel » : le sous-titre suit le signe du montant affiché', () => {
    expect(rentalCashflowSub(args(base).monthlyCashflow, false)).toBe('à ajouter de votre poche, avant impôt');
    expect(rentalCashflowSub(args({ ...base, monthlyRent: 1500 }).monthlyCashflow, true)).toBe('en plus dans votre poche, après impôt');
    expect(rentalCashflowSub(-0.4, false)).toBe("loyer et dépenses s'équilibrent, avant impôt");
    expect(rentalCashflowSub(Number.NaN, true)).toBe("loyer et dépenses s'équilibrent, après impôt");
  });
  it('avant et après impôt dans une même phrase, « mais » quand le signe s’inverse', () => {
    const c = { totalCost: 100000, netYield: 0.04, horizon: 20, gap: 5000 };
    expect(digits(rentalTakeaway({ ...c, monthlyCashflow: -392.4, monthlyCashflowAfterTax: -619.2 }))).toContain(digits('il faut ajouter environ 392 € de votre poche avant impôt, et environ 619 € après l’impôt estimé').replace('’', "'"));
    expect(rentalTakeaway({ ...c, monthlyCashflow: 120, monthlyCashflowAfterTax: -30 })).toContain(', mais il faut ajouter environ');
    expect(rentalTakeaway({ ...c, monthlyCashflow: 120, monthlyCashflowAfterTax: 80 })).toContain('avant impôt, et environ');
    expect(rentalTakeaway({ ...c, monthlyCashflow: -50, monthlyCashflowAfterTax: 20 })).toContain(', mais il reste environ');
    expect(rentalTakeaway({ ...c, monthlyCashflow: -50, monthlyCashflowAfterTax: null }).split('\n')).toHaveLength(2);
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
    expect(t.replace(/\u00a0/g, " ")).toContain("environ 11 ans et 11 mois pour doubler");
    expect(t).not.toMatch(/\d,\d+[\s\u00a0]ans/);
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
  it('budget : le « Concrètement » ne recopie ni les cases ni la répartition de la barre', () => {
    const run = (inp: { netIncome: number; needs: number; wants: number; saving: number }, target = 0.2) => {
      const b = analyzeBudget(inp);
      const c = catchUp(inp, target);
      return { b, c, t: digits(budgetTakeaway({ income: b.income, shares: b.shares, unallocated: b.unallocated, targetRate: target, missing: c.missing, wants: b.wants, fromUnallocated: c.fromUnallocated, fromWants: c.fromWants, uncovered: c.uncovered })) };
    };
    // Exemple fictif par défaut : 250 € manquants = 200 € non affectés + 50 € d'envies.
    const d = run({ netIncome: 2500, needs: 1400, wants: 650, saving: 250 });
    expect(d.c).toMatchObject({ missing: 250, fromUnallocated: 200, fromWants: 50, uncovered: 0 });
    expect(d.t).toContain('toutl\'argentquevousn\'avezaffectéàrien');
    expect(d.t).toContain(`retirez${eur(50)}€parmoisauxenvies`);
    expect(d.t).toContain(`passeraientà${eur(600)}€`);
    // Aucun montant des cases ni part de la barre recopié.
    for (const v of [`${eur(250)}€`, `${eur(200)}€`, '56', '26', '10%']) expect(d.t).not.toContain(v);
    // Non affecté plus grand que l'effort : une partie seulement est prise, le reste libre est dit.
    const big = run({ netIncome: 3000, needs: 1400, wants: 650, saving: 250 });
    expect(big.c).toMatchObject({ missing: 350, fromUnallocated: 350, fromWants: 0 });
    expect(big.t).toContain(`unepartie`);
    expect(big.t).toContain(`resterait${eur(350)}€parmois`);
    expect(big.t).not.toContain(`${eur(700)}€`);
    // Non affecté exactement égal à l'effort.
    const exact = run({ netIncome: 2500, needs: 1400, wants: 600, saving: 250 });
    expect(exact.c).toMatchObject({ missing: 250, fromUnallocated: 250, fromWants: 0 });
    expect(exact.t).toContain('suffitdemettredecôtétoutl\'argent');
    // Rien de libre : tout l'effort sur les envies.
    const wantsOnly = run({ netIncome: 2500, needs: 1400, wants: 850, saving: 250 });
    expect(wantsOnly.c).toMatchObject({ fromUnallocated: 0, fromWants: 250 });
    expect(wantsOnly.t).toContain(`toutl'effortsurlesenvies(ellespasseraientà${eur(600)}€parmois)`);
    // Envies insuffisantes : la part non couverte est signalée.
    const short = run({ netIncome: 2500, needs: 2200, wants: 50, saving: 250 });
    expect(short.c).toMatchObject({ missing: 250, fromUnallocated: 0, fromWants: 50, uncovered: 200 });
    expect(short.t).toContain(`renonçantàtouteslesenvies,ilmanquerait${eur(200)}€parmois`);
    const none = run({ netIncome: 2500, needs: 2250, wants: 0, saving: 250 });
    expect(none.t).toContain('niargentnonaffecténienviesàréduire');
    // Dépassement du revenu : le budget est déclaré déséquilibré, sans viser de taux.
    const over = run({ netIncome: 2500, needs: 1400, wants: 1200, saving: 250 });
    expect(over.t).toContain('dépassentvotrerevenu');
    expect(over.t).not.toContain('Pourépargner');
    // Taux visé déjà atteint.
    const ok = run({ netIncome: 2500, needs: 1200, wants: 500, saving: 600 });
    expect(ok.t).toContain('déjà');
    expect(ok.t).toContain('affectéàrien');
    expect(run({ netIncome: 2500, needs: 1300, wants: 600, saving: 600 }).t).not.toContain('affectéàrien');
    expect(budgetTakeaway({ income: 0, shares: { needs: 0, wants: 0, saving: 0 }, unallocated: 0, targetRate: 0.2, missing: 0 })).toBe('');
  });
  it('budget : écart de chaque poste au repère, en mots, issu de analyzeBudget', () => {
    const b = analyzeBudget({ netIncome: 2500, needs: 1400, wants: 650, saving: 250 });
    expect(digits(budgetGapPhrase(b.gaps.needs, 0.5))).toBe(digits(`${eur(150)} € de plus que le repère de 50 %`));
    expect(digits(budgetGapPhrase(b.gaps.wants, 0.3))).toBe(digits(`${eur(100)} € de moins que le repère de 30 %`));
    expect(digits(budgetGapPhrase(b.gaps.saving, 0.2))).toBe(digits(`${eur(250)} € de moins que le repère de 20 %`));
    expect(digits(budgetGapPhrase(0.3, 0.2))).toBe(digits('au niveau du repère de 20 %'));
  });
  it('inflation : un panier de 100 € au lieu des montants des cases, puis le rôle du placement', () => {
    const inp = { amount: 10000, years: 20, inflation: 0.02, annualReturn: 0.03 };
    const mk = (i: typeof inp) => {
      const r = purchasingPower(i);
      const basket = purchasingPower({ ...i, amount: 100 });
      return { r, basket, t: inflationTakeaway({ ...i, realReturn: r.realReturn, basketLater: basket.nominalToKeepPower }) };
    };
    const { r, basket, t } = mk(inp);
    // Panier de courses recalculé par le moteur : 100 € × 1,02^20 ≈ 149 € (exemple fictif).
    expect(Math.round(basket.nominalToKeepPower)).toBe(149);
    expect(digits(t)).toContain('100€aujourd\'huiencoûteraitenviron' + eur(basket.nominalToKeepPower) + '€');
    // Aucun montant des trois cases n'est recopié.
    for (const v of [r.idleRealValue, r.nominalToKeepPower, r.investedRealValue, r.investedValue]) expect(digits(t)).not.toContain(eur(v));
    expect(t).toContain('plus vite que les prix');
    expect(mk({ ...inp, annualReturn: 0.01 }).t).toContain('moins vite que les prix');
    expect(mk({ ...inp, annualReturn: 0.02 }).t).toContain('au même rythme');
    expect(mk({ ...inp, annualReturn: 0 }).t).toContain('ne rapporte rien');
    expect(mk({ ...inp, annualReturn: -0.01 }).t).toContain('pire que la laisser');
    expect(mk({ ...inp, inflation: 0 }).t).toMatch(/^Sans inflation/);
    expect(mk({ ...inp, inflation: -0.01 }).t).toContain('baissent de 1');
    expect(inflationTakeaway({ ...inp, amount: 0, realReturn: 0, basketLater: 0 })).toBe('');
  });
  it('dettes : valeurs issues de comparePayoff', () => {
    const D = [{ name: 'a', balance: 2000, rate: 0.2, minPayment: 60 }, { name: 'b', balance: 6000, rate: 0.05, minPayment: 150 }, { name: 'c', balance: 1000, rate: 0.03, minPayment: 50 }];
    const c = comparePayoff(D, 100);
    const t = digits(debtsTakeaway({ extra: 100, ...c }));
    expect(t).toContain(eur(c.avalanche.totalInterest) + '€d\'intérêts');
    expect(t).toContain(eur(c.minimum.totalInterest) + '€d\'intérêts');
    expect(t).toContain(eur(c.interestSavedByAvalanche!) + '€d\'intérêtsdeplus');
    // Trois lignes courtes ; l'atout de la boule de neige (première dette soldée plus tôt) est dit, mois tirés de comparePayoff.
    const brut = debtsTakeaway({ extra: 100, ...c });
    expect(brut.split('\n')).toHaveLength(3);
    const first = (m: (number | null)[]) => Math.min(...(m.filter((x) => x !== null) as number[]));
    expect(first(c.snowball.payoffMonths)).toBeLessThan(first(c.avalanche.payoffMonths));
    expect(brut).toContain(`au bout de ${fmtMonths(first(c.snowball.payoffMonths))}, contre ${fmtMonths(first(c.avalanche.payoffMonths))} avec l'avalanche`);
    // Sans versement supplémentaire : pas de comparaison avec lui-même.
    const c0 = comparePayoff(D, 0);
    expect(debtsTakeaway({ extra: 0, ...c0 })).toMatch(/^Avec vos seules mensualités minimales/);
    // Une seule dette : les deux méthodes se confondent.
    const one = comparePayoff([D[0]], 50);
    expect(debtsTakeaway({ extra: 50, ...one })).toContain('même résultat');
    const stuck = comparePayoff([{ name: 'a', balance: 1000, rate: 0.5, minPayment: 1 }], 0);
    expect(debtsTakeaway({ extra: 0, ...stuck })).toContain('ne sont pas soldées');
    const none = comparePayoff([{ name: 'a', balance: 0, rate: 0.1, minPayment: 10 }], 0);
    expect(debtsTakeaway({ extra: 0, ...none })).toBe('');
  });
  it('frais : l\'écart en années de versements, sans recopier les cases ni les barres', () => {
    const inp = { initial: 10000, monthly: 300, annualReturn: 0.06, years: 25, inflation: 0.02 };
    const [a, b, c] = feeImpact(inp, [0.002, 0.01, 0.02]);
    const base = feeImpact(inp, [0])[0];
    const run = (i: typeof inp) => feesTakeaway({ years: 25, initial: i.initial, monthly: i.monthly, lowest: a, highest: c, noFees: base.finalValue });
    const t = run(inp);
    // Écart (≈ 61 990 €, exemple fictif) ÷ 3 600 € versés par an ≈ 17 ans.
    const ans = Math.round((a.finalValue - c.finalValue) / 3600);
    expect(ans).toBe(17);
    expect(t).toContain(`environ ${ans}\u00a0ans de vos versements mensuels`);
    for (const v of [a.finalValue, c.finalValue, a.finalValue - c.finalValue, c.cost, base.finalValue]) expect(digits(t)).not.toContain(eur(v));
    expect(t).not.toMatch(/\d,\d %/);
    // Sans versement : en part du capital de départ.
    const [a0, , c0] = feeImpact({ ...inp, monthly: 0 }, [0.002, 0.01, 0.02]);
    const ratio = (a0.finalValue - c0.finalValue) / 10000;
    // Sans versement, 10 000 € placés 25 ans : l'écart (≈ 1,5 fois le capital, exemple fictif) est dit en nombre de fois.
    expect(Math.round(ratio * 10)).toBe(15);
    expect(feesTakeaway({ years: 25, initial: 10000, monthly: 0, lowest: a0, highest: c0, noFees: 1 })).toContain(`environ ${(Math.round(ratio * 10) / 10).toLocaleString('fr-FR')}\u00a0fois votre capital de départ`);
    expect(feesTakeaway({ years: 5, initial: 10000, monthly: 0, lowest: { finalValue: 12000 }, highest: { finalValue: 9000 }, noFees: 1 }).replace(/[\u00a0\u202f]/g, ' ')).toContain('30 % de votre capital de départ');
    // Écart de moins d'un an et demi : en mois.
    expect(feesTakeaway({ years: 5, initial: 0, monthly: 1000, lowest: { finalValue: 10000 }, highest: { finalValue: 4000 }, noFees: 11000 })).toContain('environ 6\u00a0mois');
    expect(b.finalValue).toBeGreaterThan(c.finalValue);
    expect(feesTakeaway({ years: 25, initial: 1, monthly: 1, lowest: a, highest: a, noFees: base.finalValue })).toBe('');
  });

  it('patrimoine : part des gains, seconde moitié des gains et pouvoir d\'achat, sans recopier les cases', () => {
    // Valeurs par défaut du simulateur (fictives) : 5 000 € puis 300 € par mois, 5 % moins 0,5 % de frais, 25 ans.
    const inp = { initial: 5000, monthly: 300, annualReturn: 0.05, annualFees: 0.005, inflation: 0.02, years: 25 };
    const pts = projectGrowth(inp);
    const l = pts[pts.length - 1];
    const net = afterTax(l.value, l.contributed - l.withdrawn, 0.314);
    const netReal = net / Math.pow(1.02, 25);
    const late = lateHalfGainsYears(pts);
    expect(late).toBe(6);
    const t = wealthTakeaway({ years: 25, contributed: l.contributed, value: l.value, gains: l.gains, netValue: net, netRealValue: netReal, inflation: 0.02, lateHalfYears: late });
    expect(digits(t)).toContain(digits(fmtPart(l.gains / l.value)) + 'ducapitalfinal');
    expect(digits(t)).toContain('46,8%');
    expect(t).toContain('6\u00a0dernières années sur 25');
    expect(digits(t)).toContain(digits(fmtPart(1 - netReal / l.value)));
    expect(t).toContain('« En euros d\'aujourd\'hui »');
    // Aucun montant des cases n'est recopié.
    for (const v of [l.contributed, l.gains, l.value, l.realValue, net, netReal]) expect(digits(t)).not.toContain(eur(v) + '€');
    // Sans impôt ni inflation : pas de phrase sur le pouvoir d'achat.
    const sansImpot = wealthTakeaway({ years: 25, contributed: l.contributed, value: l.value, gains: l.gains, netValue: l.value, netRealValue: l.value, inflation: 0, lateHalfYears: late });
    expect(sansImpot).not.toContain('impôt');
    expect(sansImpot).not.toContain('prix');
    // Impôt seul, inflation seule.
    expect(wealthTakeaway({ years: 25, contributed: l.contributed, value: l.value, gains: l.gains, netValue: net, netRealValue: net, inflation: 0, lateHalfYears: late })).toContain('« Capital final »');
    expect(wealthTakeaway({ years: 25, contributed: l.contributed, value: l.value, gains: l.gains, netValue: l.value, netRealValue: l.realValue, inflation: 0.02, lateHalfYears: late })).toContain('La hausse des prix retire');
    // Perte, gain nul, retraits qui dépassent le capital restant.
    expect(wealthTakeaway({ years: 10, contributed: 1000, value: 900, gains: -100, netValue: 900, netRealValue: 900, inflation: 0, lateHalfYears: null })).toContain('perdre');
    expect(wealthTakeaway({ years: 10, contributed: 1000, value: 1000, gains: 0, netValue: 1000, netRealValue: 1000, inflation: 0, lateHalfYears: null })).toContain('ne rapporte rien');
    expect(wealthTakeaway({ years: 10, contributed: 1000, value: 300, gains: 400, netValue: 300, netRealValue: 300, inflation: 0, lateHalfYears: 3 })).toContain('dépassent le capital restant');
    expect(wealthTakeaway({ years: 0, contributed: 1, value: 1, gains: 0, netValue: 1, netRealValue: 1, inflation: 0, lateHalfYears: null })).toBe('');
  });
  it('entreprise : CA, résultat, trésorerie et besoin de financement viennent de projectBusiness', () => {
    const inp = { revenueY1: 120000, revenueGrowth: 0.1, grossMarginRate: 0.6, fixedCosts: 30000, fixedCostsGrowth: 0.02, founderPay: 24000, socialRate: 0.45, corporateTaxRate: 0.25, receivableDays: 30, initialCash: 15000, initialInvestment: 10000, valuationMultiple: 5, years: 5 };
    const c = projectBusiness(inp, BUSINESS_SCENARIOS.central);
    const low = lowestCash(projectBusiness(inp, BUSINESS_SCENARIOS.pessimiste), 5000);
    const l = c[c.length - 1];
    const t = digits(businessTakeaway({ years: 5, revenueFirst: c[0].revenue, revenueLast: l.revenue, netResultLast: l.netResult, cashLast: l.cash, pessimisticLowestCash: low }));
    expect(t).toContain(eur(c[0].revenue) + '€');
    expect(t).toContain(eur(l.revenue) + '€');
    expect(t).toContain(eur(l.netResult) + '€');
    expect(t).toContain(eur(l.cash) + '€');
    expect(t.includes('scénariopessimiste')).toBe(low < 0);
    const perte = businessTakeaway({ years: 1, revenueFirst: 1000, revenueLast: 1000, netResultLast: -500, cashLast: -200, pessimisticLowestCash: -900 });
    expect(perte).toContain('perd');
    expect(perte).toContain('négative');
    expect(businessTakeaway({ years: 0, revenueFirst: 0, revenueLast: 0, netResultLast: 0, cashLast: 0, pessimisticLowestCash: 0 })).toBe('');
  });
  it('entreprise : la note « valeur estimée à 0 € » suit exactement les valeurs nulles de projectBusiness', () => {
    const inp = { revenueY1: 120000, revenueGrowth: 0.1, grossMarginRate: 0.6, fixedCosts: 30000, fixedCostsGrowth: 0.02, founderPay: 24000, socialRate: 0.45, corporateTaxRate: 0.25, receivableDays: 30, initialCash: 15000, initialInvestment: 10000, valuationMultiple: 5, years: 5 };
    const labels = ['Pessimiste', 'Central', 'Optimiste'];
    const note = (i: typeof inp) => {
      const runs = (['pessimiste', 'central', 'optimiste'] as const).map((k) => projectBusiness(i, BUSINESS_SCENARIOS[k]));
      const lasts = runs.map((r) => r[r.length - 1]);
      return { lasts, t: businessZeroValueNote({ multiple: i.valuationMultiple, scenarios: lasts.map((l, j) => ({ label: labels[j], netResultLast: l.netResult })) }) };
    };
    // Valeurs par défaut (fictives) : seul le scénario pessimiste finit en perte, sa valeur est nulle.
    const d = note(inp);
    expect(d.lasts.map((l) => l.valuation === 0)).toEqual([true, false, false]);
    expect(d.t).toContain('le scénario pessimiste finit sans bénéfice');
    expect(d.t).toContain('5\u00a0fois');
    // Aucune perte : aucune note.
    const ok = note({ ...inp, fixedCosts: 0 });
    expect(ok.lasts.every((l) => l.valuation > 0)).toBe(true);
    expect(ok.t).toBe('');
    // Deux scénarios en perte.
    const deux = note({ ...inp, fixedCosts: 75000 });
    expect(deux.lasts.map((l) => l.valuation === 0)).toEqual([true, true, false]);
    expect(deux.t).toContain('les scénarios pessimiste et central finissent');
    // Multiple nul : toutes les valeurs sont nulles, la note le dit.
    const zero = note({ ...inp, valuationMultiple: 0 });
    expect(zero.lasts.every((l) => l.valuation === 0)).toBe(true);
    expect(zero.t).toContain('multiple de valorisation est réglé à 0');
    expect(businessZeroValueNote({ multiple: 2.5, scenarios: [{ label: 'Central', netResultLast: -1 }] })).toContain('2,5\u00a0fois');
  });

  it('portefeuille : gain annuel, frais, support dominant et projection viennent de summarizePortfolio et projectGrowth', () => {
    const lines = [
      { id: 'a', label: 'ETF monde', amount: 12000, expectedReturn: 0.06, fees: 0.002, risk: 4 },
      { id: 'b', label: 'Livret', amount: 8000, expectedReturn: 0.02, fees: 0, risk: 1 },
    ];
    const sum = summarizePortfolio(lines);
    const proj = projectGrowth({ initial: sum.total, monthly: 300, annualReturn: sum.netReturn, annualFees: 0, years: 20, inflation: 0 });
    const f = proj[proj.length - 1];
    const brut = portfolioTakeaway({ total: sum.total, grossReturn: sum.grossReturn, netReturn: sum.netReturn, annualFeesEuro: sum.annualFeesEuro, topLabel: 'ETF monde', topWeight: 0.6 });
    const t = digits(brut);
    // Le gain annuel en euros (absent des cases) est dit ; la valeur, le rendement et les frais des cases ne sont pas recopiés.
    expect(t).toContain(eur(sum.total * sum.netReturn) + '€');
    expect(t).not.toContain(eur(sum.total) + '€');
    expect(t).not.toContain(eur(sum.annualFeesEuro) + '€');
    expect(brut).not.toContain('%');
    // Frais rapportés au gain avant frais : 12 000 × 0,2 % = 24 € sur 12 000 × 6 % + 8 000 × 2 % = 880 €, soit environ 3 € sur 100 €.
    expect(Math.round((sum.annualFeesEuro / (sum.total * sum.grossReturn)) * 100)).toBe(3);
    expect(t).toContain('Sur100€gagnésavantfrais,environ3€partentenfrais');
    expect(brut).toContain('Plus de la moitié de votre argent repose sur « ETF monde »');
    const n = portfolioProjectionNote({ years: 20, contributed: f.contributed, value: f.value });
    // La légende du graphique donne déjà les montants : la note dit la part des gains, recalculée.
    expect(digits(n)).not.toContain(eur(f.value) + '€');
    expect(digits(n)).not.toContain(eur(f.contributed) + '€');
    expect(n).toContain(`environ ${Math.round(((f.value - f.contributed) / f.value) * 10)}\u00a0€ sur 10`);
    expect(portfolioProjectionNote({ years: 10, contributed: 1000, value: 900 })).toContain('ne vous enrichit pas');
    expect(portfolioProjectionNote({ years: 10, contributed: 0, value: 0 })).toBe('');
    expect(portfolioTakeaway({ total: 1000, grossReturn: 0.02, netReturn: 0.02, annualFeesEuro: 0, topLabel: 'X', topWeight: 0.4 })).not.toContain('repose');
    expect(portfolioTakeaway({ total: 1000, grossReturn: 0.05, netReturn: 0.04, annualFeesEuro: 10, topLabel: 'X', topWeight: 0.8 })).toContain('Au moins les trois quarts');
    expect(portfolioTakeaway({ total: 0, grossReturn: 0, netReturn: 0, annualFeesEuro: 0, topLabel: '', topWeight: 0 })).toBe('');
  });
});

describe('phrase « Concrètement » : investir d’un coup ou progressivement', () => {
  const digits = (t: string) => t.replace(/\s/g, '');
  const eur = (n: number) => digits(Math.round(n).toLocaleString('fr-FR'));
  const base = { amount: 12000, spreadMonths: 12, years: 5, annualReturn: 0.05, cashRate: 0, move: 0.2 };
  const say = (r: { advantageGradual: number }, path: 'steady' | 'dip' | 'rise', extra: Partial<typeof base> = {}) => {
    const x = { ...base, ...extra };
    return import('./takeaways').then((m) => m.lumpGradualTakeaway({ amount: x.amount, path, annualReturn: x.annualReturn, cashRate: x.cashRate, advantageGradual: r.advantageGradual }));
  };
  it('rendement régulier : investir tout de suite gagne, sans recopier les montants des cases', async () => {
    const f = await import('./finance');
    const r = f.lumpVsGradual({ ...base, path: 'steady' });
    expect(r.advantageGradual).toBeLessThan(0);
    const t = await say(r, 'steady');
    expect(t).toContain('investir tout de suite finit au-dessus');
    expect(t).toContain('rapporte moins que le placement');
    for (const v of [r.lump, r.gradual, Math.abs(r.advantageGradual)]) expect(digits(t)).not.toContain(eur(v));
    // Poids de l'écart dans le capital, recalculé (≈ 337 € sur 12 000 €, exemple fictif).
    expect(t.replace(/[\u00a0\u202f]/g, ' ')).toContain(`${(Math.round(Math.abs(r.advantageGradual) / 12000 * 1000) / 10).toLocaleString('fr-FR')} % du capital placé`);
  });
  it('baisse pendant l’étalement : l’étalement gagne, tranches achetées moins cher', async () => {
    const f = await import('./finance');
    const r = f.lumpVsGradual({ ...base, path: 'dip' });
    expect(r.advantageGradual).toBeGreaterThan(0);
    const t = await say(r, 'dip');
    expect(t).toContain('l\'étalement finit au-dessus');
    expect(t).toContain('achètent moins cher');
  });
  it('hausse, mouvement trop faible et argent en attente mieux payé : explications cohérentes avec le calcul', async () => {
    const f = await import('./finance');
    const rise = f.lumpVsGradual({ ...base, path: 'rise' });
    expect(rise.advantageGradual).toBeLessThan(0);
    expect(await say(rise, 'rise')).toContain('achètent plus cher');
    const smallDip = f.lumpVsGradual({ ...base, path: 'dip', move: 0.005, cashRate: -0.2 });
    expect(smallDip.advantageGradual).toBeLessThan(0);
    expect(await say(smallDip, 'dip', { move: 0.005, cashRate: -0.2 })).toContain('trop faible');
    const cash = f.lumpVsGradual({ ...base, path: 'steady', annualReturn: -0.05 });
    expect(cash.advantageGradual).toBeGreaterThan(0);
    expect(await say(cash, 'steady', { annualReturn: -0.05 })).toContain('rapporte plus que le placement');
  });
  it('vide sans capital, égalité dite en mots', async () => {
    const { lumpGradualTakeaway } = await import('./takeaways');
    expect(lumpGradualTakeaway({ amount: 0, path: 'steady', annualReturn: 0.05, cashRate: 0, advantageGradual: 0 })).toBe('');
    expect(lumpGradualTakeaway({ amount: 1000, path: 'steady', annualReturn: 0.05, cashRate: 0.05, advantageGradual: 0.2 })).toContain('même résultat');
  });
  it('trois parcours : la phrase nomme les parcours où l’étalement gagne, d’après le calcul', async () => {
    const f = await import('./finance');
    const { lumpGradualPathsSummary } = await import('./takeaways');
    const names = { steady: 'Régulière', dip: 'Baisse d’abord', rise: 'Hausse d’abord' } as const;
    const rows = f.lumpVsGradualByPath(base).map((r) => ({ name: names[r.path], advantageGradual: r.advantageGradual }));
    expect(lumpGradualPathsSummary(rows)).toBe('Avec ces hypothèses, l’étalement ne finit au-dessus qu’avec « Baisse d’abord » ; investir d’un coup gagne avec « Régulière » et « Hausse d’abord ». Personne ne sait à l’avance quel parcours le prix suivra.');
    // Part en attente rémunérée bien au-dessus du placement : l'étalement gagne partout.
    const all = f.lumpVsGradualByPath({ ...base, annualReturn: 0, cashRate: 0.5, move: 0 }).map((r) => ({ name: names[r.path], advantageGradual: r.advantageGradual }));
    expect(all.every((r) => r.advantageGradual > 0)).toBe(true);
    expect(lumpGradualPathsSummary(all)).toContain('dans les trois parcours');
    // Sans variation de prix ni rendement : égalité partout.
    const eq = f.lumpVsGradualByPath({ ...base, annualReturn: 0, move: 0 }).map((r) => ({ name: names[r.path], advantageGradual: r.advantageGradual }));
    expect(lumpGradualPathsSummary(eq)).toBe('Avec ces hypothèses, l’étalement ne finit au-dessus dans aucun parcours.');
    expect(lumpGradualPathsSummary([])).toBe('');
  });
});

describe('etfImmoTakeaway', () => {
  const digits = (t: string) => t.replace(/\s/g, '');
  const eur = (n: number) => digits(Math.round(n).toLocaleString('fr-FR'));
  it('dit l’effort mensuel recalculé et le gagnant en mots, sans recopier les patrimoines', async () => {
    const f = await import('./finance');
    const { etfImmoTakeaway } = await import('./takeaways');
    const r = f.compareEtfImmo({
      rental: { ...(await import('../pages/SimImmobilier')).RENTAL_DEFAULTS },
      etf: { annualReturn: 0.06, annualFees: 0.003, exitTaxRate: 0.314 },
      horizon: 20, inflation: 0.02, cashRate: 0.017, saleCostRate: 0.05,
    });
    const avgMonthly = (r.etf.invested - r.startCapital) / (20 * 12);
    const raw = etfImmoTakeaway({ horizon: 20, etfNet: r.etf.netWealth, immoNet: r.immo.netWealth, startCapital: r.startCapital, avgMonthly });
    const t = digits(raw);
    expect(avgMonthly).toBeGreaterThan(0);
    expect(t).toContain(eur(r.startCapital));
    expect(t).toContain(eur(avgMonthly));
    expect(t).not.toContain(eur(r.etf.netWealth));
    expect(t).not.toContain(eur(r.immo.netWealth));
    expect(t).not.toContain(eur(Math.abs(r.etf.netWealth - r.immo.netWealth)));
    expect(raw).toContain(r.etf.netWealth > r.immo.netWealth ? "davantage avec les ETF qu'avec le bien" : "davantage avec le bien qu'avec les ETF");
  });
  it('verdict selon l’écart arrondi, effort nul dit en mots', async () => {
    const { etfImmoTakeaway } = await import('./takeaways');
    const c = { horizon: 20, startCapital: 22000, avgMonthly: 300 };
    expect(etfImmoTakeaway({ ...c, etfNet: 100000, immoNet: 120000 })).toContain("davantage avec le bien qu'avec les ETF");
    expect(etfImmoTakeaway({ ...c, etfNet: 100000.2, immoNet: 99999.9 })).toContain('autant des deux côtés');
    const z = etfImmoTakeaway({ ...c, avgMonthly: 0.3, etfNet: 1, immoNet: 2 });
    expect(z).toContain('puis rien chaque mois : les loyers couvrent les dépenses du bien');
    expect(z).toContain('\n');
  });
  it('vide sans horizon', async () => {
    const { etfImmoTakeaway } = await import('./takeaways');
    expect(etfImmoTakeaway({ horizon: 0, etfNet: 0, immoNet: 0, startCapital: 0, avgMonthly: 0 })).toBe('');
  });
});

describe('etfImmoGapText', () => {
  const digits = (t: string) => t.replace(/\s/g, '');
  const eur = (n: number) => digits(Math.round(n).toLocaleString('fr-FR'));
  it('versements communs recalculés par compareEtfImmo, sans répéter les gains des barres', async () => {
    const f = await import('./finance');
    const { etfImmoGapText } = await import('./takeaways');
    const r = f.compareEtfImmo({
      rental: { ...(await import('../pages/SimImmobilier')).RENTAL_DEFAULTS },
      etf: { annualReturn: 0.06, annualFees: 0.003, exitTaxRate: 0.314 },
      horizon: 20, inflation: 0.02, cashRate: 0.017, saleCostRate: 0.05,
    });
    const t = digits(etfImmoGapText({ invested: r.etf.invested }));
    const inv = Math.round(r.etf.invested);
    expect(t).toContain(eur(inv));
    expect(t).toContain('apportcompris');
    expect(t).not.toContain(eur(Math.round(r.etf.netWealth) - inv));
    expect(etfImmoGapText({ invested: 0 })).toBe('');
  });
});

describe('phrases « Concrètement » : comparer des crédits', () => {
  const digits = (t: string) => t.replace(/\s/g, '');
  const eur = (n: number) => digits(Math.round(n).toLocaleString('fr-FR'));
  it('durée : écarts de mensualité et de coût recalculés par loanDuration', async () => {
    const f = await import('./finance');
    const { loanDurationTakeaway } = await import('./takeaways');
    const rows = f.loanDuration({ principal: 200000, annualRate: 0.03, insuranceRate: 0.003, durations: [10, 30] });
    const [a, b] = rows;
    const t = digits(loanDurationTakeaway({ principal: 200000, shortYears: 10, longYears: 30, shortMonthly: a.monthlyTotal, longMonthly: b.monthlyTotal, shortCost: a.totalCost, longCost: b.totalCost }));
    expect(t).toContain(eur(a.monthlyTotal - b.monthlyTotal));
    expect(t).toContain(eur(b.totalCost - a.totalCost));
    expect(t).toContain('de10à30ans');
  });
  it('durée : vide sans capital', async () => {
    const { loanDurationTakeaway } = await import('./takeaways');
    expect(loanDurationTakeaway({ principal: 0, shortYears: 10, longYears: 30, shortMonthly: 0, longMonthly: 0, shortCost: 0, longCost: 0 })).toBe('');
  });
  it('TAEG : taux affiché, TAEG et coût pour 100 € recalculés par taeg', async () => {
    const f = await import('./finance');
    const { taegTakeaway } = await import('./takeaways');
    const r = f.taeg({ principal: 200000, annualRate: 0.036, years: 20, insuranceRate: 0.003, fees: 2500 });
    const t = taegTakeaway({ principal: 200000, nominal: 0.036, taeg: r.taeg, totalCost: r.totalCost });
    expect(t).toContain(f.fmtPct(r.taeg));
    expect(t.replace(/\u00a0/g, ' ')).toContain(`${Math.round((r.totalCost / 200000) * 100)} € pour 100 €`);
  });
  it('TAEG : vide sans emprunt', async () => {
    const { taegTakeaway } = await import('./takeaways');
    expect(taegTakeaway({ principal: 0, nominal: 0.03, taeg: 0, totalCost: 0 })).toBe('');
  });
  it('in fine : mensualités et écart de coût net recalculés par inFine', async () => {
    const { inFine } = await import('./calc/inFine');
    const { inFineTakeaway } = await import('./takeaways');
    const input = { principal: 200000, annualRate: 0.03, years: 20, insuranceRate: 0.003, savingsReturn: 0.02 };
    const r = inFine(input);
    const t = inFineTakeaway({ principal: 200000, years: 20, savingsReturn: 0.02, annualRate: 0.03, amortizingMonthly: r.amortizingMonthlyTotal, inFineMonthly: r.inFineMonthlyTotal, monthlySaving: r.monthlySaving, netCostGap: r.netCostGap });
    const d = (n: string) => n.replace(/\s/g, '');
    expect(d(t)).toContain(d(fmtEur(r.inFineMonthlyTotal)));
    expect(d(t)).toContain(d(fmtEur(r.amortizingMonthlyTotal)));
    expect(d(t)).toContain(d(fmtEur(Math.abs(r.netCostGap))));
    expect(d(t)).toContain(r.netCostGap > 0 ? 'deplus' : 'demoins');
  });
  it('in fine : vide sans capital', async () => {
    const { inFineTakeaway } = await import('./takeaways');
    expect(inFineTakeaway({ principal: 0, years: 20, savingsReturn: 0.02, annualRate: 0.03, amortizingMonthly: 0, inFineMonthly: 0, monthlySaving: 0, netCostGap: 0 })).toBe('');
  });
  it('renégociation : baisse de mensualité, point mort et gain net recalculés par renegotiation', async () => {
    const { renegotiation } = await import('./calc/renegotiation');
    const { renegoTakeaway } = await import('./takeaways');
    const r = renegotiation({ remaining: 150000, currentRate: 0.045, currentYearsLeft: 20, newRate: 0.035, newYears: 20, fees: 3000 });
    const t = renegoTakeaway({ monthlyGain: r.monthlyGain, netGain: r.netGain, breakEvenMonths: r.breakEvenMonths, longer: r.longer, fees: 3000 });
    const d = (n: string) => n.replace(/\s/g, '');
    expect(d(t)).toContain(d(fmtEur(r.monthlyGain)));
    const m = Math.ceil(r.breakEvenMonths as number);
    // point mort dit en années et mois (38 mois → « 3 ans et 2 mois »)
    expect(t).toContain(`environ ${Math.floor(m / 12)}\u00a0ans et ${m % 12}\u00a0mois`);
    expect(d(t)).toContain(d(fmtEur(Math.abs(r.netGain))));
  });
  it('renégociation : mensualité qui ne baisse pas', async () => {
    const { renegoTakeaway } = await import('./takeaways');
    expect(renegoTakeaway({ monthlyGain: 0, netGain: -3000, breakEvenMonths: null, longer: false, fees: 3000 })).toContain('ne baisse pas');
  });
});

describe('etfImmoAdvancedHint', () => {
  it('rappelle régime, tranche et évolution du prix', async () => {
    const { etfImmoAdvancedHint } = await import('./takeaways');
    const t = etfImmoAdvancedHint({ regimeLabel: 'Micro-foncier', taxed: true, marginalRate: 0.3, appreciation: 0.01 });
    expect(t).toBe(`Micro-foncier, tranche ${fmtPct(0.3)}, prix du bien +${fmtPct(0.01)}/an`);
  });
  it('sans impôt estimé, ne cite pas de tranche ; une baisse garde son signe', async () => {
    const { etfImmoAdvancedHint } = await import('./takeaways');
    const t = etfImmoAdvancedHint({ regimeLabel: 'Ne pas estimer l’impôt', taxed: false, marginalRate: 0.3, appreciation: -0.01 });
    expect(t).toBe(`Impôt non estimé, prix du bien ${fmtPct(-0.01)}/an`);
    expect(t).not.toContain('tranche');
  });
});

describe('phrase de rééquilibrage du portefeuille', () => {
  const digits = (t: string) => t.replace(/\s/g, '');
  it('les montants viennent de rebalance (exemple fictif : 12 000 / 5 000 / 3 000 € visés à 50 / 30 / 20 %)', async () => {
    const { rebalance } = await import('./calc/portfolio');
    const lines = [
      { id: 'a', label: 'ETF actions monde', amount: 12000, expectedReturn: 0.06, fees: 0.002, risk: 4 },
      { id: 'b', label: 'Fonds euros', amount: 5000, expectedReturn: 0.025, fees: 0.006, risk: 1 },
      { id: 'c', label: 'Livret A', amount: 3000, expectedReturn: 0.017, fees: 0, risk: 1 },
    ];
    const m = rebalance(lines, { a: 0.5, b: 0.3, c: 0.2 });
    expect(m.a).toBeCloseTo(-2000, 8);
    expect(m.b).toBeCloseTo(1000, 8);
    expect(m.c).toBeCloseTo(1000, 8);
    const t = rebalanceTakeaway(lines.map((l) => ({ label: l.label, move: m[l.id] })));
    expect(digits(t)).toContain(digits('retirer 2 000 € de « ETF actions monde » et ajouter 1 000 € à « Fonds euros » et 1 000 € à « Livret A »'));
    expect(t).toContain('Sans rien vendre');
  });
  it('déjà à la cible, achats seuls, liste vide', () => {
    expect(rebalanceTakeaway([{ label: 'A', move: 0.4 }, { label: 'B', move: -0.4 }])).toContain('rien à acheter ni à vendre');
    const t = rebalanceTakeaway([{ label: 'A', move: 500 }, { label: 'B', move: 0 }]);
    expect(t).toContain('ajouter');
    expect(t).not.toContain('retirer');
    expect(t).not.toContain('Sans rien vendre');
    expect(rebalanceTakeaway([])).toBe('');
  });
});
