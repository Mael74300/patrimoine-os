import type { GlossaryTerm } from '../data/glossary';

const norm = (s: string) => s.replace(/[\u00a0\u202f]/g, ' ').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' ');

/** Notions dont le nom ou la définition contient tous les mots saisis (sans tenir compte des accents ni de la casse). */
export function filterGlossary(terms: GlossaryTerm[], query: string): GlossaryTerm[] {
  const words = norm(query).split(/\s+/).filter(Boolean);
  if (!words.length) return terms;
  return terms.filter((t) => {
    const hay = norm(`${t.term} ${t.definition}`);
    return words.every((w) => hay.includes(w));
  });
}
