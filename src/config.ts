/**
 * Configuration centrale. Tout est désactivé par défaut : le site fonctionne sans aucun service tiers.
 * - ads.enabled : emplacements publicitaires prêts à recevoir un script, invisibles tant que false.
 * - affiliates : liens partenaires optionnels par fiche (slug -> url). Toujours signalés comme tels.
 */
export const config = {
  siteName: 'Patrimoine OS',
  repoUrl: 'https://github.com/VOTRE-COMPTE/patrimoine-os',
  ads: { enabled: false },
  affiliates: {} as Record<string, { label: string; url: string }>,
};
