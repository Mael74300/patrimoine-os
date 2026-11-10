/**
 * Jargon expliqué sur place : dans les fiches et les guides, la première apparition d'une notion du glossaire
 * devient cliquable et affiche la définition du glossaire, sans quitter la page. Aucune définition nouvelle :
 * le texte affiché est celui de `src/data/glossary.ts`.
 *
 * Seules les notions dont l'expression est sans ambiguïté sont repérées : « action », « obligation » ou
 * « amortissement » (qui a un autre sens en location meublée) sont volontairement absents.
 */
import { glossary, glossaryId, type GlossaryTerm } from '../data/glossary';

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
};

/** Les sigles (tout en majuscules) sont repérés en respectant la casse ; les expressions, sans. */
const isAcronym = (p: string) => /^[A-Z]+$/.test(p) || p === 'Livret A';

type Matcher = { term: GlossaryTerm; re: RegExp };

const MATCHERS: Matcher[] = Object.entries(JARGON_PATTERNS).flatMap(([name, pats]) => {
  const term = glossary.find((t) => t.term === name);
  if (!term) return [];
  return pats.map((p) => ({ term, re: new RegExp(`(?<![\\p{L}\\d-])(?:${p})(?![\\p{L}\\d-])`, isAcronym(p) ? 'u' : 'iu') }));
});

export type JargonSegment = string | { text: string; term: GlossaryTerm; id: string };

/** Au plus six notions soulignées par page : au-delà, le texte deviendrait un champ de liens. */
export const MAX_PER_PAGE = 6;

/**
 * Découpe une suite de paragraphes : la première apparition de chaque notion (sur l'ensemble des paragraphes)
 * devient un segment à expliquer. Une notion n'est pas soulignée si le glossaire renvoie vers la page courante
 * ou si elle figure dans son titre : la page entière l'explique déjà.
 */
export function annotateJargon(paragraphs: string[], page: { path?: string; title?: string } = {}, max = MAX_PER_PAGE): JargonSegment[][] {
  const used = new Set<string>();
  const here = (page.path ?? '').replace(/\/$/, '');
  const skipped = new Set(MATCHERS.filter(({ term, re }) => term.links.some((l) => l.to.replace(/\/$/, '') === here) || (page.title && re.test(page.title))).map((m) => m.term.term));
  const skip = (t: GlossaryTerm) => skipped.has(t.term);
  return paragraphs.map((text) => {
    const out: JargonSegment[] = [];
    let rest = text;
    for (;;) {
      if (used.size >= max) break;
      let best: { m: RegExpExecArray; t: GlossaryTerm } | null = null;
      for (const { term, re } of MATCHERS) {
        if (used.has(term.term) || skip(term)) continue;
        const m = re.exec(rest);
        if (m && (!best || m.index < best.m.index || (m.index === best.m.index && m[0].length > best.m[0].length))) best = { m, t: term };
      }
      if (!best) break;
      const { m, t } = best;
      if (m.index > 0) out.push(rest.slice(0, m.index));
      out.push({ text: m[0], term: t, id: `def-${glossaryId(t.term)}` });
      used.add(t.term);
      rest = rest.slice(m.index + m[0].length);
    }
    if (rest) out.push(rest);
    return out;
  });
}
