import type { Checked } from '../data/types';
import { DONATION_ABATTEMENTS, fmtEuros } from '../data/donationAbattements';
import { checkedParts } from './ficheText';

/** Lignes visibles d'une case Frais ou Fiscalité du comparateur avant le repli « autres points ». */
export const CMP_VISIBLE_LINES = 3;

/**
 * Le comparateur reprend le texte des fiches, sans leurs schémas ni leur tableau : une phrase qui renvoie
 * à un schéma de la fiche (« voir le schéma « Décès de l’assuré » ») renvoie ici à la fiche elle-même.
 */
export function standaloneSentence(text: string): string {
  return text
    .replace(/voir le schéma « [^»]+ »/g, 'règles détaillées dans la fiche')
    .replace(/\(voir le schéma\)/g, '(détail dans la fiche)');
}

/**
 * Fiche Donation : l’abattement principal figure dans le tableau de la fiche, pas dans le texte de la
 * rubrique, qui commence par « en plus de… ». Le comparateur l’annonce d’abord, depuis la même donnée.
 */
export function donationLead(): string {
  const enfant = DONATION_ABATTEMENTS.find((a) => a.lien === 'Enfant')!.montant;
  return `Abattement : ${fmtEuros(enfant)} d’un parent à un enfant, renouvelable tous les 15 ans (autres liens de parenté dans la fiche).`;
}

/**
 * Case du comparateur : les premières lignes restent visibles, la suite est repliée.
 * Rien n’est replié s’il n’y aurait qu’une ligne derrière le repli (autant l’afficher).
 */
export function compareCell(c: Checked, slug: string, key: 'minCapital' | 'fees' | 'tax'): { shown: string[]; more: string[] } {
  const parts = checkedParts(c, true).map(standaloneSentence);
  if (slug === 'donation' && key === 'tax') parts.unshift(donationLead());
  if (parts.length <= CMP_VISIBLE_LINES + 1) return { shown: parts, more: [] };
  return { shown: parts.slice(0, CMP_VISIBLE_LINES), more: parts.slice(CMP_VISIBLE_LINES) };
}
