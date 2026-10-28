import { simulators } from './search';

/** Simulateurs liés à chaque fiche (clé : slug de fiche) et à chaque guide (clé : slug de guide). Cohérence vérifiée par les tests. */
export const simsForInvestment: Record<string, string[]> = {
  'livret-a': ['epargne-de-precaution', 'objectif-epargne', 'inflation'],
  lep: ['epargne-de-precaution', 'inflation'],
  'compte-a-terme': ['inflation', 'patrimoine'],
  'etf-monde': ['frais', 'portefeuille', 'patrimoine', 'investir-d-un-coup-ou-progressivement', 'rendement-reel-de-mon-placement'],
  'actions-individuelles': ['portefeuille', 'frais'],
  obligations: ['portefeuille', 'inflation'],
  pea: ['frais', 'patrimoine'],
  'compte-titres': ['frais', 'patrimoine'],
  'assurance-vie': ['frais', 'patrimoine', 'retraits-reguliers-duree-du-capital'],
  'fonds-euros': ['inflation', 'frais'],
  'unites-de-compte': ['frais', 'portefeuille'],
  'location-nue': ['immobilier', 'etf-immobilier'],
  lmnp: ['immobilier', 'etf-immobilier'],
  scpi: ['immobilier', 'frais'],
  'foncieres-cotees': ['etf-immobilier', 'portefeuille'],
  'credit-immobilier': ['credit', 'renegocier-son-credit-gain-et-point-mort', 'taeg', 'louer-ou-acheter', 'endettement', 'rembourser-ou-investir', 'immobilier'],
  'creation-entreprise': ['entreprise'],
  'reprise-entreprise': ['entreprise', 'credit'],
  'activite-numerique': ['entreprise', 'budget'],
  per: ['patrimoine', 'independance-financiere', 'retraits-reguliers-duree-du-capital'],
  'capital-humain': ['budget', 'independance-financiere'],
};

export const simsForGuide: Record<string, string[]> = {
  'types-investissements': ['portefeuille'],
  'patrimoine-net': ['patrimoine', 'budget'],
  'immobilier-ou-etf': ['etf-immobilier', 'immobilier'],
  'investir-a-credit': ['credit', 'taeg', 'louer-ou-acheter', 'endettement', 'rembourser-ou-investir'],
  'rentabilite-locative': ['immobilier'],
  'fonctionnement-pea': ['frais', 'patrimoine'],
  'comparer-les-frais': ['frais'],
  'epargne-limitee': ['epargne-de-precaution', 'inflation'],
  'par-ou-commencer': ['budget', 'epargne-de-precaution', 'objectif-epargne', 'cout-d-attendre-pour-epargner'],
  'interets-composes': ['patrimoine', 'inflation', 'investir-d-un-coup-ou-progressivement', 'rendement-reel-de-mon-placement', 'cout-d-attendre-pour-epargner', 'doubler-son-capital-regle-de-72', 'augmenter-son-epargne-chaque-annee', 'interets-simples-ou-composes'],
  'choisir-son-enveloppe': ['frais', 'patrimoine'],
  'combien-epargne-de-precaution': ['epargne-de-precaution', 'inflation', 'budget'],
  'taux-endettement-capacite-emprunt': ['endettement', 'credit', 'dettes'],
  'combien-epargner-par-mois-objectif': ['objectif-epargne', 'budget', 'inflation'],
  'rembourser-credit-par-anticipation-ou-investir': ['rembourser-ou-investir', 'credit', 'renegocier-son-credit-gain-et-point-mort', 'dettes', 'epargne-de-precaution'],
};

const bySlug = Object.fromEntries(simulators.map((s) => [s.slug, s]));

export function relatedSimulators(slugs: string[] | undefined) {
  return (slugs ?? []).map((s) => bySlug[s]).filter(Boolean);
}
