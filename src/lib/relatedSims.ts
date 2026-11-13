import { guideTitles, investmentNames } from './readingTitles';
import { simulators } from './simulatorsList';

/** Simulateurs liés à chaque fiche (clé : slug de fiche) et à chaque guide (clé : slug de guide). Cohérence vérifiée par les tests. */
export const simsForInvestment: Record<string, string[]> = {
  'livret-a': ['budget', 'epargne-de-precaution', 'objectif-epargne', 'inflation'],
  lep: ['epargne-de-precaution', 'inflation'],
  'compte-a-terme': ['inflation', 'patrimoine'],
  pel: ['inflation', 'objectif-epargne'],
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
  'credit-immobilier': ['credit', 'comparer-des-credits', 'louer-ou-acheter', 'endettement', 'rembourser-ou-investir', 'immobilier'],
  'creation-entreprise': ['entreprise'],
  'reprise-entreprise': ['entreprise', 'credit'],
  'activite-numerique': ['entreprise'],
  per: ['patrimoine', 'independance-financiere', 'retraits-reguliers-duree-du-capital'],
  'capital-humain': ['independance-financiere'],
};

export const simsForGuide: Record<string, string[]> = {
  'types-investissements': ['portefeuille'],
  'patrimoine-net': ['patrimoine', 'budget'],
  'immobilier-ou-etf': ['etf-immobilier', 'immobilier'],
  'investir-a-credit': ['credit', 'comparer-des-credits', 'louer-ou-acheter', 'endettement', 'rembourser-ou-investir'],
  'rentabilite-locative': ['immobilier'],
  'fonctionnement-pea': ['frais', 'patrimoine'],
  'comparer-les-frais': ['frais'],
  'epargne-limitee': ['epargne-de-precaution', 'inflation'],
  'par-ou-commencer': ['budget', 'epargne-de-precaution', 'objectif-epargne', 'interets-composes'],
  'interets-composes': ['interets-composes', 'patrimoine', 'inflation', 'investir-d-un-coup-ou-progressivement', 'rendement-reel-de-mon-placement'],
  'choisir-son-enveloppe': ['frais', 'patrimoine'],
  'combien-epargne-de-precaution': ['epargne-de-precaution', 'inflation', 'budget'],
  'taux-endettement-capacite-emprunt': ['endettement', 'credit', 'dettes'],
  'pret-a-taux-zero-ptz': ['endettement', 'credit', 'louer-ou-acheter'],
  'combien-epargner-par-mois-objectif': ['interets-composes', 'objectif-epargne', 'budget', 'inflation'],
  'rembourser-credit-par-anticipation-ou-investir': ['rembourser-ou-investir', 'credit', 'comparer-des-credits', 'dettes', 'epargne-de-precaution'],
  'diversification-placements': ['portefeuille', 'frais', 'epargne-de-precaution'],
  'inflation-pouvoir-d-achat-epargne': ['inflation', 'rendement-reel-de-mon-placement', 'epargne-de-precaution'],
  'livret-a-calcul-interets-quinzaines': ['epargne-de-precaution', 'inflation'],
  'regle-de-72-doubler-son-capital': ['interets-composes', 'inflation'],
};

const bySlug = Object.fromEntries(simulators.map((s) => [s.slug, s]));

export function relatedSimulators(slugs: string[] | undefined) {
  return (slugs ?? []).map((s) => bySlug[s]).filter(Boolean);
}

export type ReadingLink = { to: string; title: string; kind: 'Guide' | 'Fiche' | 'Simulateur' };

/**
 * « Pour aller plus loin » en bas de chaque simulateur, choisi à la main dans l'ordre d'utilité pour le visiteur :
 * d'abord le guide qui explique le résultat, puis une étape suivante (au plus un autre simulateur), puis la fiche
 * du placement concerné. Préfixes : « g: » guide, « f: » fiche, « s: » simulateur. Cohérence vérifiée par les tests.
 */
export const nextForSimulator: Record<string, string[]> = {
  patrimoine: ['g:interets-composes', 'g:choisir-son-enveloppe', 's:independance-financiere', 'f:etf-monde'],
  immobilier: ['g:rentabilite-locative', 'g:immobilier-ou-etf', 's:etf-immobilier', 'f:location-nue'],
  'etf-immobilier': ['g:immobilier-ou-etf', 's:immobilier', 'f:etf-monde', 'f:location-nue'],
  credit: ['g:taux-endettement-capacite-emprunt', 'g:pret-a-taux-zero-ptz', 's:louer-ou-acheter', 'f:credit-immobilier'],
  portefeuille: ['g:diversification-placements', 's:frais', 'f:etf-monde', 'f:obligations'],
  entreprise: ['f:creation-entreprise', 'f:reprise-entreprise', 'f:activite-numerique', 's:credit'],
  'independance-financiere': ['g:interets-composes', 's:retraits-reguliers-duree-du-capital', 'f:per', 'f:etf-monde'],
  'epargne-de-precaution': ['g:combien-epargne-de-precaution', 'g:livret-a-calcul-interets-quinzaines', 's:budget', 'f:lep'],
  budget: ['g:par-ou-commencer', 'g:combien-epargne-de-precaution', 's:epargne-de-precaution', 'f:livret-a'],
  frais: ['g:comparer-les-frais', 'g:choisir-son-enveloppe', 's:portefeuille', 'f:etf-monde'],
  'rembourser-ou-investir': ['g:rembourser-credit-par-anticipation-ou-investir', 'g:interets-composes', 's:comparer-des-credits', 'f:credit-immobilier'],
  inflation: ['g:inflation-pouvoir-d-achat-epargne', 'g:regle-de-72-doubler-son-capital', 's:rendement-reel-de-mon-placement', 'f:livret-a'],
  endettement: ['g:taux-endettement-capacite-emprunt', 'g:pret-a-taux-zero-ptz', 's:credit', 'f:credit-immobilier'],
  'objectif-epargne': ['g:combien-epargner-par-mois-objectif', 'g:par-ou-commencer', 's:budget', 'f:livret-a'],
  'louer-ou-acheter': ['g:pret-a-taux-zero-ptz', 'g:taux-endettement-capacite-emprunt', 's:credit', 'f:credit-immobilier'],
  dettes: ['g:taux-endettement-capacite-emprunt', 'g:combien-epargne-de-precaution', 's:budget'],
  'investir-d-un-coup-ou-progressivement': ['g:choisir-son-enveloppe', 'g:diversification-placements', 's:frais', 'f:etf-monde'],
  'retraits-reguliers-duree-du-capital': ['g:inflation-pouvoir-d-achat-epargne', 's:independance-financiere', 'f:assurance-vie', 'f:donation'],
  'rendement-reel-de-mon-placement': ['g:inflation-pouvoir-d-achat-epargne', 'g:comparer-les-frais', 's:frais', 'f:etf-monde'],
  'interets-composes': ['g:interets-composes', 'g:regle-de-72-doubler-son-capital', 's:objectif-epargne', 'g:par-ou-commencer'],
  'comparer-des-credits': ['g:taux-endettement-capacite-emprunt', 'g:rembourser-credit-par-anticipation-ou-investir', 's:credit', 'f:credit-immobilier'],
};

/** Pistes de lecture à la fin d'un simulateur (au plus quatre), dans l'ordre choisi ci-dessus. */
export function readingForSimulator(slug: string): ReadingLink[] {
  return (nextForSimulator[slug] ?? []).flatMap((ref): ReadingLink[] => {
    const [k, id] = ref.split(':');
    if (k === 'g' && guideTitles[id]) return [{ to: `/guides/${id}`, title: guideTitles[id], kind: 'Guide' }];
    if (k === 'f' && investmentNames[id]) return [{ to: `/encyclopedie/${id}`, title: investmentNames[id], kind: 'Fiche' }];
    if (k === 's' && bySlug[id]) return [{ to: `/simulateurs/${id}`, title: bySlug[id].title, kind: 'Simulateur' }];
    return [];
  });
}
