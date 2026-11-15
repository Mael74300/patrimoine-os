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

/**
 * Durées légales qui bornent une projection : plus de versement après `depositYears` années, puis rémunération
 * au taux du contrat jusqu'à `contractYears` années. PEL ouvert depuis le 1er mars 2011 : versements jusqu'au
 * 10e anniversaire au plus, intérêts au taux du contrat 5 ans de plus, livret ordinaire au taux fixé par la banque
 * à 15 ans (Service-Public F16140, consulté le 15 novembre 2026). Mêmes bornes que la frise de la fiche PEL (test).
 */
export type DurationLimit = { depositYears: number; contractYears: number; afterContract: string };

export const DURATION_LIMITS: Record<string, DurationLimit> = {
  pel: { depositYears: 10, contractYears: 15, afterContract: 'il devient un livret ordinaire, rémunéré au taux fixé librement par la banque et non plus au taux du contrat' },
};

/**
 * Taux réglementés repris tels quels comme hypothèses pré-remplies du comparateur (sans frais) : livrets (`LIVRETS`)
 * et PEL ouvert à partir du 1er janvier 2026 (2,00 %, fixé pour toute la durée du plan ; Service-Public F16140,
 * consulté le 15 novembre 2026 ; même chiffre que la fiche PEL, vérifié par test).
 */
export const REGULATED_RATES: Record<string, number> = {
  'livret-a': LIVRETS.find((l) => l.id === 'livretA')!.rate,
  lep: LIVRETS.find((l) => l.id === 'lep')!.rate,
  pel: 0.02,
};
