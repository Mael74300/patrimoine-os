/**
 * Typographie des nombres : une espace ordinaire entre les milliers (« 37 680 ») ou avant une unité
 * (« 35 % », « 540 € ») laisse le navigateur couper la ligne au milieu du nombre (« 37 » en fin de ligne,
 * « 680 € » au début de la suivante). On la remplace par une espace insécable (U+00A0), comme le fait
 * déjà le formatage des résultats (`lib/calc/format.ts`). Le texte et les chiffres ne changent pas.
 */
export const NBSP = ' ';

/** Espace ordinaire après un chiffre, suivie d'un groupe de trois chiffres, de « € », de « % » ou de « k€ ». */
const BREAKABLE = /(\d) (?=\d{3}(?!\d)|€|%|k€)/g;

export function keepNumbersTogether(s: string): string {
  return s.replace(BREAKABLE, `$1${NBSP}`);
}

/** Vrai si le texte contient encore un nombre coupable en fin de ligne. */
export function hasBreakableNumber(s: string): boolean {
  return new RegExp(BREAKABLE.source).test(s);
}

/** Applique `keepNumbersTogether` à toutes les chaînes d'une donnée (tableaux et objets simples). */
export function deepKeepNumbers<T>(v: T): T {
  if (typeof v === 'string') return keepNumbersTogether(v) as T;
  if (Array.isArray(v)) return v.map(deepKeepNumbers) as T;
  if (v && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype) {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deepKeepNumbers(x)])) as T;
  }
  return v;
}
