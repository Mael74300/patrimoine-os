import { clamp, num, years as toYears } from './common';

/**
 * Calculateur entrepreneurial.
 * Distinctions explicites :
 * - chiffre d'affaires : ventes encaissables, avant toute charge ;
 * - résultat (bénéfice) : ce qui reste après charges, rémunération et impôt sur les sociétés ;
 * - flux de trésorerie : variation réelle de la trésorerie (résultat − hausse du besoin en fonds de roulement − investissements) ;
 * - valeur de l'entreprise : estimation par multiple du résultat, qui n'est ni de la trésorerie ni un revenu.
 * Les amortissements comptables ne sont pas modélisés (résultat assimilé à un résultat avant amortissements).
 */
export type BusinessInput = {
  revenueY1: number;
  revenueGrowth: number;
  grossMarginRate: number; // marge brute en % du CA
  fixedCosts: number; // charges fixes annuelles (hors rémunération du dirigeant)
  fixedCostsGrowth: number;
  founderPay: number; // rémunération nette annuelle du dirigeant
  socialRate: number; // charges sociales en % de la rémunération nette
  corporateTaxRate: number; // taux normal de l'impôt sur les sociétés
  /** Taux réduit des PME (IS_RATES) sur la première tranche de bénéfice ; absent ou faux : taux normal sur tout le bénéfice. */
  smallBusinessRate?: boolean;
  receivableDays: number; // délai moyen d'encaissement clients
  initialCash: number;
  initialInvestment: number;
  valuationMultiple: number; // multiple du résultat net
  years: number;
};

/**
 * Impôt sur les sociétés (article 219 du CGI) : taux normal de 25 % ; taux réduit de 15 % sur la fraction du bénéfice
 * n'excédant pas 42 500 € (exercices clos depuis le 31 décembre 2022, période de douze mois), réservé aux sociétés dont
 * le chiffre d'affaires ne dépasse pas 10 M€ et dont le capital, entièrement libéré, est détenu pour 75 % au moins par
 * des personnes physiques. Sources consultées le 16 novembre 2026 : impots.gouv.fr et BOFiP (BOI-IS-LIQ-20-20230621).
 */
export const IS_RATES = {
  normal: 0.25,
  reduced: 0.15,
  reducedCap: 42500,
  maxTurnover: 10_000_000,
  source: { label: 'impots.gouv.fr — Impôt sur les sociétés', url: 'https://www.impots.gouv.fr/international-professionnel/impot-sur-les-societes' },
  doctrine: { label: 'BOFiP — Taux réduit applicable au bénéfice des PME', url: 'https://bofip.impots.gouv.fr/bofip/2063-PGP.html/identifiant=BOI-IS-LIQ-20-20230621' },
  verifiedOn: '2026-11-16',
};

/**
 * Impôt sur un bénéfice imposable : taux réduit sur les premiers 42 500 € si la société y a droit
 * (option choisie et chiffre d'affaires de l'année au plus égal à 10 M€), taux normal saisi au-delà.
 */
export function corporateTaxAmount(base: number, normalRate: number, smallBusiness: boolean, revenue = 0): number {
  const b = Math.max(0, num(base));
  if (!smallBusiness || revenue > IS_RATES.maxTurnover) return b * normalRate;
  const low = Math.min(b, IS_RATES.reducedCap);
  return low * IS_RATES.reduced + (b - low) * normalRate;
}

export type BusinessYear = {
  year: number;
  revenue: number;
  grossMargin: number;
  fixedCosts: number;
  payrollCost: number;
  operatingResult: number;
  corporateTax: number;
  netResult: number;
  workingCapital: number;
  cashFlow: number;
  cash: number;
  valuation: number;
};

export type ScenarioAdjust = { revenueFactor: number; growthDelta: number; marginDelta: number };

export const BUSINESS_SCENARIOS: Record<'pessimiste' | 'central' | 'optimiste', ScenarioAdjust> = {
  pessimiste: { revenueFactor: 0.8, growthDelta: -0.05, marginDelta: -0.05 },
  central: { revenueFactor: 1, growthDelta: 0, marginDelta: 0 },
  optimiste: { revenueFactor: 1.15, growthDelta: 0.05, marginDelta: 0.03 },
};

export function projectBusiness(input: BusinessInput, adj: ScenarioAdjust = BUSINESS_SCENARIOS.central): BusinessYear[] {
  const n = toYears(input.years, 30);
  const growth = clamp(num(input.revenueGrowth) + adj.growthDelta, -0.9, 5);
  const margin = clamp(num(input.grossMarginRate) + adj.marginDelta, 0, 1);
  const tax = clamp(input.corporateTaxRate, 0, 0.6);
  const payroll = Math.max(0, num(input.founderPay)) * (1 + clamp(input.socialRate, 0, 2));
  const days = clamp(input.receivableDays, 0, 365);
  let cash = num(input.initialCash) - Math.max(0, num(input.initialInvestment));
  let prevWC = 0;
  let lossCarry = 0;
  const out: BusinessYear[] = [];
  for (let y = 1; y <= n; y++) {
    const revenue = Math.max(0, num(input.revenueY1)) * adj.revenueFactor * Math.pow(1 + growth, y - 1);
    const grossMargin = revenue * margin;
    const fixedCosts = Math.max(0, num(input.fixedCosts)) * Math.pow(1 + clamp(input.fixedCostsGrowth, -0.5, 1), y - 1);
    const operatingResult = grossMargin - fixedCosts - payroll;
    let base = operatingResult - lossCarry;
    lossCarry = 0;
    if (base < 0) {
      lossCarry = -base;
      base = 0;
    }
    const corporateTax = corporateTaxAmount(base, tax, input.smallBusinessRate === true, revenue);
    const netResult = operatingResult - corporateTax;
    const workingCapital = (revenue * days) / 365;
    const cashFlow = netResult - (workingCapital - prevWC);
    prevWC = workingCapital;
    cash += cashFlow;
    out.push({
      year: y, revenue, grossMargin, fixedCosts, payrollCost: payroll, operatingResult, corporateTax, netResult,
      workingCapital, cashFlow, cash, valuation: Math.max(0, netResult) * Math.max(0, num(input.valuationMultiple)),
    });
  }
  return out;
}

/** Trésorerie la plus basse atteinte : un montant négatif est un besoin de financement. */
export const lowestCash = (rows: BusinessYear[], start: number) => Math.min(start, ...rows.map((r) => r.cash));
