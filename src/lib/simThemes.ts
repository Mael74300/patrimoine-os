import { simulators } from './search';

/** Classement des simulateurs par thème, dans l'ordre d'affichage. Chaque simulateur appartient à un seul thème. */
export const simThemes: { id: string; title: string; slugs: string[] }[] = [
  {
    id: 'epargne',
    title: 'Épargne et placements',
    slugs: [
      'patrimoine', 'epargne-de-precaution', 'objectif-epargne', 'portefeuille', 'frais', 'inflation', 'rendement-reel-de-mon-placement',
      'investir-d-un-coup-ou-progressivement', 'interets-simples-ou-composes', 'doubler-son-capital-regle-de-72', 'duree-pour-atteindre-un-capital',
      'capital-a-placer-aujourd-hui', 'rendement-necessaire-pour-atteindre-un-objectif', 'augmenter-son-epargne-chaque-annee',
      'cout-d-attendre-pour-epargner', 'convertir-un-taux-annuel-en-taux-mensuel',
    ],
  },
  {
    id: 'credit',
    title: 'Crédit',
    slugs: ['credit', 'taeg', 'duree-du-credit-mensualite-et-cout-total', 'credit-in-fine-ou-amortissable', 'renegocier-son-credit-gain-et-point-mort', 'rembourser-ou-investir'],
  },
  { id: 'budget', title: 'Budget et dettes', slugs: ['budget', 'endettement', 'dettes'] },
  { id: 'immobilier', title: 'Immobilier', slugs: ['immobilier', 'etf-immobilier', 'louer-ou-acheter'] },
  { id: 'retraite', title: 'Retraite et indépendance financière', slugs: ['independance-financiere', 'retraits-reguliers-duree-du-capital'] },
  { id: 'entreprise', title: 'Entreprise', slugs: ['entreprise'] },
];

/** Sélection courte affichée sur l'accueil. */
export const featuredSims = ['patrimoine', 'epargne-de-precaution', 'credit', 'immobilier', 'budget', 'independance-financiere'];

const bySlug = Object.fromEntries(simulators.map((s) => [s.slug, s]));
export const simBySlug = (slug: string) => bySlug[slug];

/** Simulateurs absents de tout thème : affichés à la fin pour qu'aucun ne disparaisse (le test signale l'oubli). */
export const unthemedSims = () => {
  const themed = new Set(simThemes.flatMap((t) => t.slugs));
  return simulators.filter((s) => !themed.has(s.slug));
};
