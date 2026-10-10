/**
 * Configuration centrale. Tout service commercial est désactivé par défaut :
 * le site fonctionne intégralement sans revenu ni service tiers.
 */
export const config = {
  siteName: 'Patrimoine OS',
  /** Renseigné automatiquement au déploiement (variable SITE_URL), sans barre finale. */
  siteUrl: (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://exemple.github.io/patrimoine-os',
  repoUrl: 'https://github.com/VOTRE-COMPTE/patrimoine-os',

  /** Mentions légales : à compléter avant la mise en ligne publique (loi pour la confiance dans l'économie numérique). */
  legal: {
    publisher: '[À compléter : nom ou raison sociale de l’éditeur]',
    publicationDirector: '[À compléter : directeur ou directrice de la publication]',
    contact: '[À compléter : adresse électronique de contact]',
    host: 'GitHub, Inc., 88 Colin P Kelly Jr Street, San Francisco, CA 94107, États-Unis',
    hostPrivacyUrl: 'https://docs.github.com/fr/site-policy/privacy-policies/github-general-privacy-statement',
  },

  /** Monétisation future : chaque intégration reste optionnelle. */
  ads: { enabled: false },
  /** Liens partenaires réels uniquement, par fiche : toujours affichés comme « Lien commercial ». */
  affiliates: {} as Record<string, { label: string; url: string }>,
  /** Fonctionnalités premium éventuelles : aucune n'est requise pour utiliser le site. */
  premium: { enabled: false },
};
