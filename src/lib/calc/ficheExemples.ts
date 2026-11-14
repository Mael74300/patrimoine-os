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
