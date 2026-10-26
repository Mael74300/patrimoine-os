/**
 * Livrets réglementés utilisés par le simulateur d'épargne de précaution.
 * Mêmes valeurs que les fiches « Livret A et LDDS » et « LEP » de l'encyclopédie (cohérence vérifiée par les tests).
 * Taux fixés par arrêté pour la période du 1er août 2026 au 31 janvier 2027 ; prochaine révision au 1er février 2027.
 */
export type Livret = { id: 'lep' | 'livretA' | 'ldds'; name: string; rate: number; cap: number; slug: string; source: { label: string; url: string } };

export const LIVRETS_AS_OF = '10 octobre 2026';
export const LIVRETS_PERIOD = 'du 1er août 2026 au 31 janvier 2027';

/** Ordre de remplissage : du mieux rémunéré au moins rémunéré (LEP réservé aux foyers éligibles). */
export const LIVRETS: Livret[] = [
  { id: 'lep', name: "Livret d'épargne populaire (LEP)", rate: 0.025, cap: 10000, slug: 'lep', source: { label: "Service-Public.fr — Livret d'épargne populaire", url: 'https://www.service-public.fr/particuliers/vosdroits/F2367' } },
  { id: 'livretA', name: 'Livret A', rate: 0.017, cap: 22950, slug: 'livret-a', source: { label: 'Service-Public.fr — Livret A', url: 'https://www.service-public.fr/particuliers/vosdroits/F2365' } },
  { id: 'ldds', name: 'LDDS', rate: 0.017, cap: 12000, slug: 'livret-a', source: { label: 'Service-Public.fr — LDDS', url: 'https://www.service-public.fr/particuliers/vosdroits/F2368' } },
];
