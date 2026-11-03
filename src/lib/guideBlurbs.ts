import { guides } from '../data/guides';

/**
 * Phrase d'accroche de la liste des guides : la question que se pose le visiteur, en mots simples.
 * Aucun chiffre ni règle : le résumé détaillé (`summary`) reste utilisé en tête de page et pour la recherche.
 */
export const guideBlurbs: Record<string, string> = {
  'types-investissements': 'Quelles familles de placements un particulier peut-il choisir ?',
  'patrimoine-net': 'Ce que je possède moins ce que je dois : comment le calculer ?',
  'immobilier-ou-etf': 'Comment comparer un bien locatif et un ETF sans se tromper ?',
  'investir-a-credit': 'Emprunter pour investir : quand cela enrichit, quand cela appauvrit.',
  'rentabilite-locative': 'Rendement brut, net, après impôt : lequel regarder ?',
  'fonctionnement-pea': 'Comment utiliser le PEA : versements, retraits, impôts ?',
  'comparer-les-frais': 'Pourquoi de petits frais pèsent lourd à long terme ?',
  'epargne-limitee': 'Que faire quand on ne peut mettre que peu d’argent de côté ?',
  'par-ou-commencer': 'Dans quel ordre s’y prendre quand on débute ?',
  'interets-composes': 'Pourquoi le temps compte plus que le placement choisi ?',
  'choisir-son-enveloppe': 'Quel compte choisir, et comment les combiner ?',
  'combien-epargne-de-precaution': 'Combien de mois de dépenses garder de côté, et où ?',
  'taux-endettement-capacite-emprunt': 'Quelle part de mes revenus puis-je consacrer à un crédit ?',
  'combien-epargner-par-mois-objectif': 'Quel versement mensuel pour réussir un projet à une date ?',
  'rembourser-credit-par-anticipation-ou-investir': 'Rembourser plus vite ou placer : comment trancher ?',
  'diversification-placements': 'Pourquoi ne pas tout mettre au même endroit ?',
  'inflation-pouvoir-d-achat-epargne': 'Mon épargne perd-elle de la valeur quand les prix montent ?',
  'regle-de-72-doubler-son-capital': 'Comment estimer de tête quand un capital double ?',
  'livret-a-calcul-interets-quinzaines': 'À partir de quand mon argent rapporte-t-il des intérêts ?',
};

/** Accroche d'un guide, ou à défaut son résumé. */
export const guideBlurb = (slug: string) => guideBlurbs[slug] ?? guides.find((g) => g.slug === slug)?.summary ?? '';
