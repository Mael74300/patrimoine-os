import { loanPayment } from './loan';

/**
 * Calculs des exemples fictifs des fiches Financement participatif et SCPI.
 * Purs, arrondis à l'euro ; recalculés par `ficheExemples.test.ts` et repris par les schémas des fiches.
 */

export interface CrowdfundingScenario { defaults: number; recovered: number; gain: number; gainPct: number }

/**
 * Prêts participatifs : `projects` prêts de `ticket` € chacun, remboursés en une fois au bout d'un an avec `ratePct` %
 * d'intérêts. Hypothèse simplificatrice : un projet en défaut total ne rend rien (ni capital ni intérêts).
 * Avant impôt et avant frais de plateforme.
 */
export function crowdfundingScenario(projects: number, ticket: number, ratePct: number, defaults: number): CrowdfundingScenario {
  const invested = projects * ticket;
  const recovered = Math.round((projects - defaults) * ticket * (1 + ratePct / 100));
  const gain = recovered - invested;
  return { defaults, recovered, gain, gainPct: Math.round((gain / invested) * 10000) / 100 };
}

export interface ScpiPayback { fees: number; yearly: number; years: number }

/**
 * SCPI : frais d'entrée prélevés sur le montant souscrit, compensés par la distribution annuelle (exprimée en % du montant
 * souscrit), à prix de part constant et avant impôt. `years` = nombre d'années pleines de distribution nécessaires.
 */
export function scpiFeesPayback(amount: number, entryFeePct: number, distributionPct: number): ScpiPayback {
  const fees = Math.round((amount * entryFeePct) / 100);
  const yearly = Math.round((amount * distributionPct) / 100);
  return { fees, yearly, years: Math.ceil(fees / yearly) };
}

/**
 * Or et objets précieux, option pour le régime des plus-values sur biens meubles : abattement de 5 % par année de
 * détention au-delà de la deuxième, exonération totale au bout de la vingt-deuxième année (BOFiP
 * BOI-RPPM-PVBMC-20-20, consulté le 2026-11-14). Renvoie la part de la plus-value effacée, de 0 à 1.
 */
export function abattementDetentionMeubles(fullYears: number): number {
  const years = Math.max(0, Math.floor(fullYears) - 2);
  return Math.min(1, Math.round(years * 5) / 100);
}

export interface MicroFoncier { rents: number; allowance: number; taxable: number; incomeTax: number; incomeTaxPctOfRents: number }

/**
 * Location nue au micro-foncier : un abattement forfaitaire de `allowancePct` % est retiré des loyers bruts annuels, le reste
 * s'ajoute aux autres revenus et est imposé ici entièrement dans la tranche à `marginalRatePct` %. Les prélèvements sociaux
 * s'ajoutent ; ils ne sont pas calculés ici. Service-Public F1991 (abattement de 30 %, loyers jusqu'à 15 000 €) et F1419
 * (tranche à 30 %), consultés le 2026-11-14. Arrondis à l'euro.
 */
export function microFoncierExample(monthlyRent: number, allowancePct: number, marginalRatePct: number): MicroFoncier {
  const rents = monthlyRent * 12;
  const allowance = Math.round((rents * allowancePct) / 100);
  const taxable = rents - allowance;
  const incomeTax = Math.round((taxable * marginalRatePct) / 100);
  return { rents, allowance, taxable, incomeTax, incomeTaxPctOfRents: Math.round((incomeTax / rents) * 1000) / 10 };
}

export interface RepriseDebt { monthly: number; yearly: number; sharePct: number; left: number; leftAfterDrop: number; droppedProfit: number }

/**
 * Racheter une entreprise : `loan` € empruntés sur `years` ans au taux fictif `ratePct` %, remboursés par mensualités
 * constantes (même formule que le simulateur de crédit, sans assurance). Compare le remboursement annuel au résultat annuel
 * `profit`, puis au résultat diminué de `dropPct` %. Calcul simplifié : ni impôt sur les bénéfices ni assurance. Arrondis à l'euro.
 */
export function repriseDebtShare(profit: number, loan: number, ratePct: number, years: number, dropPct: number): RepriseDebt {
  const monthly = Math.round(loanPayment(loan, ratePct / 100, years));
  const yearly = Math.round(loanPayment(loan, ratePct / 100, years) * 12);
  const droppedProfit = Math.round(profit * (1 - dropPct / 100));
  return { monthly, yearly, sharePct: Math.round((yearly / profit) * 100), left: profit - yearly, leftAfterDrop: droppedProfit - yearly, droppedProfit };
}

export interface BondCoupons { coupon: number; totalCoupons: number; received: number }

/**
 * Obligation détenue jusqu'à l'échéance : coupon annuel fixe de `ratePct` % du montant prêté, puis remboursement du montant
 * prêté. Avant impôt et frais, si l'émetteur rembourse. Arrondis à l'euro.
 */
export function bondCoupons(amount: number, ratePct: number, years: number): BondCoupons {
  const coupon = Math.round((amount * ratePct) / 100);
  const totalCoupons = coupon * years;
  return { coupon, totalCoupons, received: amount + totalCoupons };
}

export interface FundFees { yearly: number; total: number }

/** Frais annuels exprimés en % des sommes souscrites (assiette fixe), cumulés sur la durée de blocage. Arrondis à l'euro. */
export function fundFeesOnSubscribed(amount: number, feePct: number, years: number): FundFees {
  const yearly = Math.round((amount * feePct) / 100);
  return { yearly, total: yearly * years };
}

export interface YearlySavings { saved: number; withGrowth: number }

/**
 * Épargne de `yearly` € placée à la fin de chaque année pendant `years` ans à `ratePct` % par an (intérêts composés).
 * `saved` : total versé ; `withGrowth` : valeur finale, arrondie à la centaine d'euros.
 */
export function yearlySavingsValue(yearly: number, ratePct: number, years: number): YearlySavings {
  const r = ratePct / 100;
  const fv = r === 0 ? yearly * years : yearly * ((Math.pow(1 + r, years) - 1) / r);
  return { saved: yearly * years, withGrowth: Math.round(fv / 100) * 100 };
}

export interface ListedPropertyYear { afterDrop: number; dividends: number }

/** Actions de foncières : valeur après une baisse de `dropPct` % du cours, et dividendes de `yieldPct` % du montant investi. */
export function listedPropertyYear(amount: number, dropPct: number, yieldPct: number): ListedPropertyYear {
  return { afterDrop: Math.round(amount * (1 - dropPct / 100)), dividends: Math.round((amount * yieldPct) / 100) };
}
