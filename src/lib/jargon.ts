/**
 * Jargon expliqué sur place : dans les fiches et les guides, la première apparition d'une notion du glossaire
 * devient cliquable et affiche la définition du glossaire, sans quitter la page. Aucune définition nouvelle :
 * le texte affiché est celui de `src/data/glossary.ts`.
 *
 * Seules les notions dont l'expression est sans ambiguïté sont repérées : « action », « obligation » ou
 * « amortissement » (qui a un autre sens en location meublée) sont volontairement absents.
 */
import { glossary, glossaryId, type GlossaryTerm } from '../data/glossary';
import { INLINE_LINKS, linkRegExp, pathOf } from './inlineLinks';

/** Expressions repérées dans le texte, par notion du glossaire (premier mot exact du glossaire). */
export const JARGON_PATTERNS: Record<string, string[]> = {
  'Allocation d’actifs': ['allocation d[’\']actifs'],
  'Capacité d’emprunt': ['capacité d[’\']emprunt'],
  'Cash-flow (flux de trésorerie)': ['cash-flow', 'flux de trésorerie'],
  'Diversification': ['diversification'],
  'Effet de levier': ['effet de levier'],
  'Enveloppe': ['enveloppes? fiscales?', 'enveloppes?'],
  'Épargne de précaution': ['épargne de précaution'],
  'ETF (fonds indiciel coté)': ['ETF'],
  'Frais courants': ['frais courants'],
  'Indépendance financière': ['indépendance financière'],
  'Inflation': ['inflation'],
  'Intérêts composés': ['intérêts composés'],
  'Liquidité': ['liquidité'],
  'Patrimoine net': ['patrimoine net'],
  'Plus-value': ['plus-values?'],
  'Rendement brut et net': ['rendement brut', 'rendement net'],
  'Risque de perte en capital': ['perte en capital', 'perte de capital'],
  'Taux d’endettement': ['taux d[’\']endettement'],
  'Taux d’épargne': ['taux d[’\']épargne'],
  'Taux de retrait': ['taux de retrait'],
  'Volatilité': ['volatilité'],
  'Sensibilité (fonds obligataire)': ['sensibilité'],
  'Dividende': ['dividendes?'],
  'TAEG (taux annuel effectif global)': ['TAEG'],
  'Taux d’usure': ['taux d[’\']usure'],
  'PER (plan d’épargne retraite)': ['PER'],
  'SCPI (société civile de placement immobilier)': ['SCPI'],
  'Assurance-vie': ['assurance-vie'],
  'Fonds en euros': ['fonds en euros', 'fonds euros'],
  'PEA (plan d’épargne en actions)': ['PEA'],
  'PFU (prélèvement forfaitaire unique, « flat tax »)': ['PFU', 'prélèvement forfaitaire unique', 'flat tax'],
  'Prélèvements sociaux': ['prélèvements sociaux'],
  'TMI (tranche marginale d’imposition)': ['TMI', 'tranche marginale d[’\']imposition', 'tranche marginale'],
  'DIC (document d’informations clés)': ['DIC', 'document d[’\']informations clés'],
  'Usufruit et nue-propriété': ['usufruit', 'nue-propriété'],
  'Livret A': ['Livret A'],
  'PSCA (prestataire de services sur crypto-actifs)': ['PSCA', 'prestataires? de services sur crypto-actifs'],
  'FGDR (Fonds de garantie des dépôts et de résolution)': ['FGDR', 'garantie des dépôts'],
};

/** Les sigles (tout en majuscules) sont repérés en respectant la casse ; les expressions, sans. */
const isAcronym = (p: string) => /^[A-Z]+$/.test(p) || p === 'Livret A';

type Matcher = { term: GlossaryTerm; re: RegExp };

const MATCHERS: Matcher[] = Object.entries(JARGON_PATTERNS).flatMap(([name, pats]) => {
  const term = glossary.find((t) => t.term === name);
  if (!term) return [];
  return pats.map((p) => ({ term, re: new RegExp(`(?<![\\p{L}\\d-])(?:${p})(?![\\p{L}\\d-])`, isAcronym(p) ? 'u' : 'iu') }));
});

export type TermSegment = { text: string; term: GlossaryTerm; id: string };
/** Nom d'une autre page du site cité dans le texte, rendu en lien vers cette page. */
export type LinkSegment = { text: string; to: string };
export type JargonSegment = string | TermSegment | LinkSegment;
export const isLink = (s: JargonSegment): s is LinkSegment => typeof s !== 'string' && 'to' in s;
export const isTerm = (s: JargonSegment): s is TermSegment => typeof s !== 'string' && 'term' in s;

const LINK_MATCHERS = INLINE_LINKS.map((l) => ({ to: l.to, re: linkRegExp(l.phrase) }));

/** Au plus six notions soulignées par page : au-delà, le texte deviendrait un champ de liens. */
export const MAX_PER_PAGE = 6;

/**
 * Découpe une suite de paragraphes : la première apparition de chaque notion (sur l'ensemble des paragraphes)
 * devient un segment à expliquer. Une notion n'est pas soulignée si elle figure dans le titre de la page, ou si
 * le glossaire renvoie vers la page courante (sauf `explainOnLinkedPages`) : la page entière l'explique déjà.
 */
export function annotateJargon(paragraphs: string[], page: { path?: string; title?: string } = {}, max = MAX_PER_PAGE): JargonSegment[][] {
  const used = new Set<string>();
  const linked = new Set<string>();
  const here = (page.path ?? '').replace(/\/$/, '');
  const skipped = new Set(MATCHERS.filter(({ term, re }) => (!term.explainOnLinkedPages && term.links.some((l) => l.to.replace(/\/$/, '') === here)) || (page.title && re.test(page.title))).map((m) => m.term.term));
  const skip = (t: GlossaryTerm) => skipped.has(t.term);
  return paragraphs.map((text) => {
    const out: JargonSegment[] = [];
    let rest = text;
    for (;;) {
      type Best = { m: RegExpExecArray; seg: (text: string) => Exclude<JargonSegment, string>; key: string; kind: 'term' | 'link' };
      let best: Best | null = null;
      const consider = (m: RegExpExecArray | null, cand: Omit<Best, 'm'>) => {
        if (m && (!best || m.index < best.m.index || (m.index === best.m.index && m[0].length > best.m[0].length))) best = { m, ...cand };
      };
      // Liens vers les pages citées par leur nom (une fois par cible, jamais vers la page courante).
      for (const { to, re } of LINK_MATCHERS) {
        if (linked.has(pathOf(to)) || pathOf(to) === here) continue;
        consider(re.exec(rest), { seg: (t) => ({ text: t, to }), key: pathOf(to), kind: 'link' });
      }
      // Notions du glossaire (au plus `max` par page).
      if (used.size < max) {
        for (const { term, re } of MATCHERS) {
          if (used.has(term.term) || skip(term)) continue;
          consider(re.exec(rest), { seg: (t) => ({ text: t, term, id: `def-${glossaryId(term.term)}` }), key: term.term, kind: 'term' });
        }
      }
      if (!best) break;
      const { m, seg, key, kind } = best as Best;
      if (m.index > 0) out.push(rest.slice(0, m.index));
      out.push(seg(m[0]));
      (kind === 'link' ? linked : used).add(key);
      rest = rest.slice(m.index + m[0].length);
    }
    if (rest) out.push(rest);
    return out;
  });
}

/** Segments d'un texte court (rubrique de fiche, exemple) : liens vers les pages citées seulement, sans notion du glossaire. */
export const linkOnly = (text: string, path?: string): JargonSegment[] => annotateJargon([text], { path }, 0)[0];

/**
 * Sépare l'amorce d'un point de liste (« Les frais fixes » dans « Les frais fixes : sur un petit… ») du reste,
 * en conservant les notions du glossaire de part et d'autre. Renvoie null s'il n'y a pas de « : ».
 */
export function splitLead(segs: JargonSegment[]): { lead: JargonSegment[]; rest: JargonSegment[] } | null {
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    if (typeof s !== 'string') continue;
    const m = /\s:\s/.exec(s);
    if (!m) continue;
    const before = s.slice(0, m.index);
    const lead = [...segs.slice(0, i), ...(before ? [before] : [])];
    if (lead.length === 0) return null;
    return { lead, rest: [s.slice(m.index), ...segs.slice(i + 1)] };
  }
  return null;
}
