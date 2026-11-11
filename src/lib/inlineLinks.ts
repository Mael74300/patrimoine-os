/**
 * Liens dans le texte : quand un guide ou une fiche cite une autre page du site par son nom
 * (« le simulateur de budget », « la fiche Livret A »), ce nom devient un lien vers la page citée.
 * Le texte affiché ne change pas : seule l'expression exacte ci-dessous devient cliquable.
 *
 * Chaque page citée n'est liée qu'une fois par page, jamais vers la page courante.
 */
export type InlineLink = { phrase: string; to: string };

export const INLINE_LINKS: InlineLink[] = [
  { phrase: 'fiche de l’encyclopédie', to: '/encyclopedie' },
  { phrase: 'fiche Livret A', to: '/encyclopedie/livret-a' },
  { phrase: 'fiche PEA', to: '/encyclopedie/pea' },
  { phrase: 'fiche Compte-titres', to: '/encyclopedie/compte-titres' },
  { phrase: 'fiche Donation', to: '/encyclopedie/donation' },
  { phrase: 'simulateur de budget', to: '/simulateurs/budget' },
  { phrase: 'simulateur de frais', to: '/simulateurs/frais' },
  { phrase: 'simulateur d’inflation', to: '/simulateurs/inflation' },
  { phrase: 'calculateur immobilier', to: '/simulateurs/immobilier' },
  { phrase: 'Inflation et pouvoir d’achat', to: '/simulateurs/inflation' },
  { phrase: 'Rendement réel de mon placement', to: '/simulateurs/rendement-reel-de-mon-placement' },
  { phrase: 'Doubler son capital', to: '/simulateurs/interets-composes#doubler' },
];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Expression régulière d'une expression : apostrophe droite ou typographique, espace ordinaire ou insécable.
 * Un nom propre de simulateur (« Doubler son capital ») respecte la casse ; une expression courante, non.
 */
export function linkRegExp(phrase: string): RegExp {
  const src = escape(phrase).replace(/’/g, '[’\']').replace(/ /g, '[ \\u00a0]');
  return new RegExp(`(?<![\\p{L}\\d-])${src}(?![\\p{L}\\d-])`, /^\p{Lu}/u.test(phrase) ? 'u' : 'iu');
}

/** Chemin sans ancre ni barre finale, pour comparer une cible à la page courante. */
export const pathOf = (to: string) => to.split('#')[0].replace(/\/$/, '');
