/** Anciennes adresses de simulateurs regroupés dans une page à onglets : elles restent valides et renvoient vers le bon onglet. */
export const movedSims: { slug: string; title: string; to: string; tab: string; dest: string }[] = [
  { slug: 'capital-a-placer-aujourd-hui', title: 'Combien placer aujourd’hui pour atteindre un capital', to: '/simulateurs/interets-composes', tab: 'placer', dest: 'Intérêts composés' },
  { slug: 'duree-pour-atteindre-un-capital', title: 'Durée pour atteindre un capital', to: '/simulateurs/interets-composes', tab: 'duree', dest: 'Intérêts composés' },
  { slug: 'rendement-necessaire-pour-atteindre-un-objectif', title: 'Rendement nécessaire pour atteindre un objectif', to: '/simulateurs/interets-composes', tab: 'rendement', dest: 'Intérêts composés' },
  { slug: 'doubler-son-capital-regle-de-72', title: 'Doubler son capital : règle de 72', to: '/simulateurs/interets-composes', tab: 'doubler', dest: 'Intérêts composés' },
  { slug: 'duree-du-credit-mensualite-et-cout-total', title: 'Durée du crédit : mensualité et coût total', to: '/simulateurs/comparer-des-credits', tab: 'duree', dest: 'Comparer des crédits' },
  { slug: 'taeg', title: 'Calcul du TAEG d’un crédit', to: '/simulateurs/comparer-des-credits', tab: 'taeg', dest: 'Comparer des crédits' },
  { slug: 'credit-in-fine-ou-amortissable', title: 'Crédit in fine ou amortissable', to: '/simulateurs/comparer-des-credits', tab: 'infine', dest: 'Comparer des crédits' },
  { slug: 'renegocier-son-credit-gain-et-point-mort', title: 'Renégocier son crédit : gain et point mort', to: '/simulateurs/comparer-des-credits', tab: 'renegocier', dest: 'Comparer des crédits' },
];
