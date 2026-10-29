/** Anciennes adresses de simulateurs regroupés dans une page à onglets : elles restent valides et renvoient vers le bon onglet. */
export const movedSims: { slug: string; title: string; to: string; tab: string }[] = [
  { slug: 'capital-a-placer-aujourd-hui', title: 'Combien placer aujourd’hui pour atteindre un capital', to: '/simulateurs/interets-composes', tab: 'placer' },
  { slug: 'duree-pour-atteindre-un-capital', title: 'Durée pour atteindre un capital', to: '/simulateurs/interets-composes', tab: 'duree' },
  { slug: 'rendement-necessaire-pour-atteindre-un-objectif', title: 'Rendement nécessaire pour atteindre un objectif', to: '/simulateurs/interets-composes', tab: 'rendement' },
  { slug: 'doubler-son-capital-regle-de-72', title: 'Doubler son capital : règle de 72', to: '/simulateurs/interets-composes', tab: 'doubler' },
];
