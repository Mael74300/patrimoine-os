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
