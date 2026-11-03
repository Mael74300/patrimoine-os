import { simulators } from './search';

/** Classement des simulateurs par thème, dans l'ordre d'affichage. Chaque simulateur appartient à un seul thème. */
export const simThemes: { id: string; title: string; slugs: string[] }[] = [
  {
    id: 'epargne',
    title: 'Épargne et placements',
    slugs: [
      'patrimoine', 'epargne-de-precaution', 'objectif-epargne', 'portefeuille', 'frais', 'inflation', 'rendement-reel-de-mon-placement',
      'investir-d-un-coup-ou-progressivement', 'interets-composes',
    ],
  },
  {
    id: 'credit',
    title: 'Crédit',
    slugs: ['credit', 'comparer-des-credits', 'rembourser-ou-investir'],
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

/**
 * Phrase d'accroche de la liste des simulateurs : la question que se pose le visiteur, en mots simples.
 * Aucun chiffre ni règle : le descriptif détaillé (`excerpt`) reste utilisé pour la recherche et les métadonnées.
 */
export const simBlurbs: Record<string, string> = {
  patrimoine: 'Que vaudra mon épargne dans 10, 20 ou 30 ans ?',
  'epargne-de-precaution': 'Combien mettre de côté pour faire face aux imprévus ?',
  'objectif-epargne': 'Combien verser par mois pour atteindre un montant à une date ?',
  portefeuille: 'Mes placements sont-ils bien répartis, et à quel coût ?',
  frais: 'Combien les frais annuels me coûtent-ils sur la durée ?',
  inflation: 'Que vaudra une somme dans 20 ans, prix en hausse ?',
  'rendement-reel-de-mon-placement': 'Quel rendement annuel mon placement a-t-il vraiment eu ?',
  'investir-d-un-coup-ou-progressivement': 'Tout placer d’un coup ou petit à petit : quelle différence ?',
  'interets-composes': 'Comment une somme grossit avec le temps, en plusieurs calculs.',
  credit: 'Mensualité, coût total et remboursement anticipé d’un prêt.',
  'comparer-des-credits': 'Quelle offre de prêt est la plus avantageuse ?',
  'rembourser-ou-investir': 'Rembourser un crédit plus vite ou placer la même somme ?',
  budget: 'Où part mon argent chaque mois, et combien puis-je épargner ?',
  endettement: 'Quelle mensualité et quel emprunt mes revenus permettent-ils ?',
  dettes: 'Dans quel ordre rembourser plusieurs dettes ?',
  immobilier: 'Que rapporte un investissement locatif, tout compris ?',
  'etf-immobilier': 'À effort égal : placer en ETF ou acheter un bien ?',
  'louer-ou-acheter': 'Louer ou acheter : quel choix laisse le plus de patrimoine ?',
  'independance-financiere': 'Quel capital pour vivre de ses placements, et en combien de temps ?',
  'retraits-reguliers-duree-du-capital': 'Combien de temps un capital peut-il financer des retraits ?',
  entreprise: 'Que rapportera mon activité : marge, trésorerie, valeur ?',
};

/** Accroche d'un simulateur, ou à défaut son descriptif. */
export const simBlurb = (slug: string) => simBlurbs[slug] ?? simBySlug(slug).excerpt;
