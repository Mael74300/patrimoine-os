// Sans dépendance : importé par l'en-tête de page (illustration du thème) sans charger les données de recherche.
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

/** Thème d'un simulateur d'après son adresse (`/simulateurs/<slug>`), ou `undefined`. */
export function simThemeOfPath(path: string): string | undefined {
  const m = /^\/simulateurs\/([^/]+)\/?$/.exec(path);
  return m ? simThemes.find((t) => t.slugs.includes(m[1]))?.id : undefined;
}
