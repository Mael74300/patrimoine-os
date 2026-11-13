import type { Level } from '../data/types';

/**
 * Repères de 1 à 5 des fiches (Risque, Liquidité, Effort) traduits en un mot, pour qu'un visiteur
 * comprenne la note sans ouvrir « Comment lire ces repères ? ». Ce sont des échelles de la rédaction,
 * indicatives : le mot ne fait que lire le nombre de points, il n'ajoute aucune information.
 */
export type MeterKind = 'risk' | 'liq' | 'effort';

const WORDS: Record<MeterKind, readonly [string, string, string, string, string]> = {
  risk: ['très faible', 'faible', 'modéré', 'élevé', 'très élevé'],
  // Liquidité : plus c'est rempli, plus on récupère son argent vite et sans perte.
  liq: ['très faible', 'faible', 'moyenne', 'bonne', 'très bonne'],
  effort: ['très faible', 'faible', 'modéré', 'élevé', 'très élevé'],
};

export function meterWord(kind: MeterKind, level: Level): string {
  return WORDS[kind][level - 1];
}

const LEVEL_PHRASES: [string, Level[]][] = [
  ['très faible', [1]],
  ['faible à modéré', [2]],
  ['faible', [1, 2]],
  ['modéré à élevé', [3, 4]],
  ['modéré', [3]],
  ['très élevé', [5]],
  ['élevé', [4]],
];

function levelPhrase(text: string): [string, Level[]] | null {
  const t = text.trim().toLowerCase();
  return LEVEL_PHRASES.find(([start]) => t.startsWith(start)) ?? null;
}

/**
 * Niveaux d'effort compatibles avec le début du texte « Temps et compétences » d'une fiche
 * (« Faible à modéré. », « Modéré : analyse de chaque projet. »…). Sert au test de cohérence :
 * les points et la phrase affichés côte à côte ne doivent pas se contredire.
 * Renvoie null si le texte ne commence pas par un niveau (« Quelques minutes pour l'ouvrir… »).
 */
export function effortLevelsFromText(text: string): Level[] | null {
  return levelPhrase(text)?.[1] ?? null;
}

/**
 * Effort affiché sur une ligne : le niveau en mot (repris du texte de la fiche quand il commence par un niveau,
 * « faible à modéré » étant plus précis que « faible »), puis le reste de la phrase en précision, sans redite.
 * « Modéré : analyse de chaque projet. » → { word: 'modéré', note: 'Analyse de chaque projet.' }
 * « Faible si l'on investit en ETF. » → { word: 'faible', note: 'Si l'on investit en ETF.' }
 * « Élevé. » → { word: 'élevé', note: '' } ; « Quelques minutes pour l'ouvrir. » → mot tiré des points, texte entier en précision.
 */
export function effortParts(text: string, level: Level): { word: string; note: string } {
  const found = levelPhrase(text);
  if (!found) return { word: meterWord('effort', level), note: text };
  const word = found[0];
  const rest = text.trim().slice(word.length).replace(/^[\s:.,;]+/, '').trim();
  return { word, note: rest ? rest.charAt(0).toUpperCase() + rest.slice(1) : '' };
}
