import { simulators } from './search';
import { simThemes } from './simThemeList';
import { simBlurbs } from './simBlurbs';

export { simThemes, simBlurbs };

/** Sélection courte affichée sur l'accueil. */
export const featuredSims = ['patrimoine', 'epargne-de-precaution', 'credit', 'immobilier', 'budget', 'independance-financiere'];

const bySlug = Object.fromEntries(simulators.map((s) => [s.slug, s]));
export const simBySlug = (slug: string) => bySlug[slug];

/** Simulateurs absents de tout thème : affichés à la fin pour qu'aucun ne disparaisse (le test signale l'oubli). */
export const unthemedSims = () => {
  const themed = new Set(simThemes.flatMap((t) => t.slugs));
  return simulators.filter((s) => !themed.has(s.slug));
};

/** Accroche d'un simulateur, ou à défaut son descriptif. */
export const simBlurb = (slug: string) => simBlurbs[slug] ?? simBySlug(slug).excerpt;
