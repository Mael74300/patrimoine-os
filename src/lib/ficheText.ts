/**
 * Texte d'une fiche de l'encyclopédie, dans l'ordre de lecture, pour expliquer le jargon sur place dans
 * toutes les rubriques (et pas seulement Définition, Fonctionnement et Comment investir).
 * Le texte n'est jamais modifié : on ne fait que le découper.
 */
import type { Checked, Investment } from '../data/types';
import { annotateJargon, type JargonSegment } from './jargon';
import { sentenceLead } from './sentenceLead';

/** Découpe un texte en phrases (sans rien modifier au contenu) pour l'afficher ligne par ligne. */
export function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+(?=[A-ZÉÈÀÂÎÔ])/).map((t) => t.trim()).filter(Boolean);
}

/** Morceaux affichés d'une rubrique vérifiable : une ligne par phrase à partir de trois phrases, sinon le texte entier. */
export function checkedParts(c: Checked, split = true): string[] {
  const parts = split ? splitSentences(c.text) : [c.text];
  return parts.length < 3 ? [c.text] : parts;
}

/** Rubriques d'une fiche, dans l'ordre de la page. */
export function ficheSections(inv: Investment) {
  return {
    definition: [inv.definition],
    howItWorks: [inv.howItWorks],
    steps: inv.howToInvest,
    fees: checkedParts(inv.fees),
    tax: checkedParts(inv.tax),
    pros: inv.pros,
    cons: inv.cons,
  };
}
export type FicheSections = ReturnType<typeof ficheSections>;

/** Tous les paragraphes d'une fiche, dans l'ordre de lecture (utilisé par la page et par les tests). */
export const ficheParagraphs = (inv: Investment): string[] => Object.values(ficheSections(inv)).flat();

/**
 * Jargon d'une fiche : la première apparition de chaque notion, sur toute la page, devient explicable ;
 * les segments sont rendus rubrique par rubrique.
 */
export function annotateFiche(inv: Investment): { [K in keyof FicheSections]: JargonSegment[][] } {
  const sections = ficheSections(inv);
  const all = annotateJargon(Object.values(sections).flat(), { path: `/encyclopedie/${inv.slug}`, title: inv.name });
  let i = 0;
  const out = {} as { [K in keyof FicheSections]: JargonSegment[][] };
  for (const key of Object.keys(sections) as (keyof FicheSections)[]) {
    out[key] = sections[key].map(() => all[i++]);
  }
  return out;
}

/**
 * Sépare l'amorce en gras d'une phrase (voir `sentenceLead`) dans des segments déjà annotés.
 * Renvoie null s'il n'y a pas d'amorce, ou si la coupure tomberait au milieu d'un mot souligné.
 */
export function leadOfSegments(segs: JargonSegment[]): { lead: JargonSegment[]; rest: JargonSegment[] } | null {
  const text = segs.map((s) => (typeof s === 'string' ? s : s.text)).join('');
  const l = sentenceLead(text);
  if (!l) return null;
  let pos = 0;
  for (let k = 0; k < segs.length; k++) {
    const s = segs[k];
    const len = typeof s === 'string' ? s.length : s.text.length;
    if (pos + len > l.lead.length) {
      if (typeof s !== 'string') return null;
      const cut = l.lead.length - pos;
      const lead = [...segs.slice(0, k), ...(cut > 0 ? [s.slice(0, cut)] : [])];
      return { lead, rest: [s.slice(cut), ...segs.slice(k + 1)] };
    }
    pos += len;
  }
  return null;
}
