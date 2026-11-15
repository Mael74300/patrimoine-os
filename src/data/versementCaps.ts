import { fmtEur } from '../lib/finance';
import { LIVRETS } from './livrets';

/**
 * Plafonds de versements utilisés par le comparateur pour signaler une projection irréalisable
 * (versements supposés au-delà de ce que la loi permet de verser sur le placement).
 * Mêmes valeurs que les fiches (cohérence vérifiée par les tests) ; livrets repris de `LIVRETS`.
 * Vérifiés le 15 novembre 2026 sur Service-Public (pages Livret A, LDDS, LEP, PEL et PEA).
 */
export const VERSEMENT_CAPS_AS_OF = '2026-11-15';

export type VersementCap = { cap: number; detail?: string };

const livret = (id: (typeof LIVRETS)[number]['id']) => LIVRETS.find((l) => l.id === id)!.cap;

export const VERSEMENT_CAPS: Record<string, VersementCap> = {
  'livret-a': {
    cap: livret('livretA') + livret('ldds'),
    detail: `${fmtEur(livret('livretA'))} sur le Livret A et ${fmtEur(livret('ldds'))} sur le LDDS`,
  },
  lep: { cap: livret('lep') },
  pel: { cap: 61200 },
  pea: { cap: 150000 },
};

/** Taux réglementés des livrets, repris tels quels comme hypothèses pré-remplies du comparateur (sans frais). */
export const REGULATED_RATES: Record<string, number> = {
  'livret-a': LIVRETS.find((l) => l.id === 'livretA')!.rate,
  lep: LIVRETS.find((l) => l.id === 'lep')!.rate,
};
