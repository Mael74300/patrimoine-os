import type { Investment } from '../data/types';

/**
 * Classement du guide « Types d’investissements » : chaque fiche placée selon
 * ses repères maison (risque sur 5, horizon minimal conseillé en années).
 * Aucun chiffre nouveau : uniquement les notes déjà affichées sur les fiches.
 */

/** Enveloppes : leur risque dépend de ce qu’on y place, elles sont présentées à part. */
export const ENVELOPES = ['pea', 'compte-titres', 'assurance-vie', 'per'] as const;
/** Fiches qui ne sont pas un placement (transmission). */
export const NOT_PLACEMENTS = ['donation'] as const;

export const RISK_BANDS = [
  { id: 'faible', label: 'Risque faible', hint: 'repère 1 ou 2 sur 5', min: 1, max: 2 },
  { id: 'modere', label: 'Risque moyen', hint: 'repère 3 sur 5', min: 3, max: 3 },
  { id: 'eleve', label: 'Risque élevé', hint: 'repère 4 ou 5 sur 5', min: 4, max: 5 },
] as const;

export const HORIZONS = [
  { id: 'court', label: 'Moins de 3 ans', min: 0, max: 2 },
  { id: 'moyen', label: '3 à 7 ans', min: 3, max: 7 },
  { id: 'long', label: '8 ans et plus', min: 8, max: Infinity },
] as const;

/** Effort à partir duquel la fiche est signalée « demande du temps » (4 ou 5 sur 5). */
export const HIGH_EFFORT = 4;

export type RiskMapCell = { risk: (typeof RISK_BANDS)[number]['id']; horizon: (typeof HORIZONS)[number]['id']; items: Investment[] };

export function riskMap(list: Investment[]) {
  const excluded = new Set<string>([...ENVELOPES, ...NOT_PLACEMENTS]);
  const placements = list.filter((i) => !excluded.has(i.slug));
  const cells: RiskMapCell[] = [];
  for (const r of RISK_BANDS) {
    for (const h of HORIZONS) {
      const items = placements
        .filter((i) => i.risk >= r.min && i.risk <= r.max && i.horizonYears >= h.min && i.horizonYears <= h.max)
        .sort((a, b) => a.risk - b.risk || a.horizonYears - b.horizonYears || a.name.localeCompare(b.name, 'fr'));
      cells.push({ risk: r.id, horizon: h.id, items });
    }
  }
  const envelopes = ENVELOPES.map((s) => list.find((i) => i.slug === s)).filter((i): i is Investment => !!i);
  return { cells, envelopes };
}
