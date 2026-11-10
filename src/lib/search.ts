import { categoryById } from '../data/categories';
import { glossary, glossaryId } from '../data/glossary';
import { guides } from '../data/guides';
import { investments } from '../data/investments';

export type SearchHit = { kind: 'Fiche' | 'Guide' | 'Simulateur' | 'Glossaire'; title: string; to: string; excerpt: string; score: number };

import { simulators } from './simulatorsList';
export { simulators };

/** Minuscule, sans accents, pour une recherche tolérante. */
export const norm = (s: string) => s.replace(/[\u00a0\u202f]/g, ' ').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** « livrets » trouve « livret » : on retire le pluriel d'un mot de plus de trois lettres. */
export const stem = (t: string) => (t.length > 3 ? t.replace(/[sx]$/, '') : t);

/** Points d'entrée proposés quand la recherche est vide ou sans résultat (pages existantes). */
export const searchSuggestions: { label: string; to: string }[] = [
  { label: 'Par où commencer ?', to: '/guides/par-ou-commencer' },
  { label: 'Combien épargner par mois ?', to: '/simulateurs/objectif-epargne' },
  { label: 'Combien puis-je emprunter ?', to: '/simulateurs/endettement' },
  { label: 'Louer ou acheter ?', to: '/simulateurs/louer-ou-acheter' },
  { label: 'Livret A et LDDS', to: '/encyclopedie/livret-a' },
  { label: 'PEA', to: '/encyclopedie/pea' },
  { label: 'Assurance-vie', to: '/encyclopedie/assurance-vie' },
  { label: 'PER', to: '/encyclopedie/per' },
];

/**
 * Mots que les visiteurs tapent sans qu'ils figurent tels quels dans nos pages :
 * ils renvoient vers le vocabulaire du site (simple aiguillage de recherche, sans information factuelle).
 */
export const searchAliases: Record<string, string[]> = {
  bitcoin: ['crypto'],
  btc: ['crypto'],
  ethereum: ['crypto'],
  stablecoin: ['crypto'],
  heritage: ['donation', 'transmission'],
  heritier: ['donation', 'transmission'],
  succession: ['donation', 'transmission'],
  defiscaliser: ['deductible'],
  defiscalisation: ['deductible'],
  pierre: ['immobilier'],
  papier: ['scpi'],
  hypotheque: ['credit', 'pret'],
  emprunter: ['emprunt'],
  bourse: ['action', 'etf'],
  tmi: ['tranche'],
  crowdfunding: ['participatif'],
};

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Un mot de la recherche doit commencer un mot du texte (« bourse » ne trouve plus « rembourser »). */
const wordStart = (text: string, term: string) => new RegExp(`(^|[^a-z0-9])${escapeRe(term)}`).test(text);

export function search(query: string): SearchHit[] {
  const terms = norm(query).split(/\s+/).filter((t) => t.length > 1).map(stem);
  if (!terms.length) return [];
  const hits: SearchHit[] = [];
  const score = (title: string, body: string) => {
    const t = norm(title);
    const b = norm(body);
    let s = 0;
    for (const term of terms) {
      const variants = [term, ...(searchAliases[term] ?? [])];
      if (variants.some((v) => wordStart(t, v))) s += 5;
      else if (variants.some((v) => wordStart(b, v))) s += 1;
      else return 0; // tous les termes doivent être présents
    }
    return s;
  };
  for (const i of investments) {
    const body = [i.summary, i.definition, i.tags.join(' '), categoryById[i.category]?.name, i.howItWorks, i.howToInvest.join(' '), i.minCapital.text, i.fees.text, i.tax.text, i.pros.join(' '), i.cons.join(' '), i.timeSkills].join(' ');
    const s = score(i.name, body);
    if (s) hits.push({ kind: 'Fiche', title: i.name, to: `/encyclopedie/${i.slug}`, excerpt: i.summary, score: s + 1 });
  }
  for (const g of guides) {
    const body = g.summary + ' ' + g.sections.map((s) => s.heading + ' ' + s.body.join(' ')).join(' ');
    const s = score(g.title, body);
    if (s) hits.push({ kind: 'Guide', title: g.title, to: `/guides/${g.slug}`, excerpt: g.summary, score: s });
  }
  for (const sim of simulators) {
    const s = score(sim.title, sim.excerpt + ' ' + sim.keywords);
    if (s) hits.push({ kind: 'Simulateur', title: sim.title, to: `/simulateurs/${sim.slug}`, excerpt: sim.excerpt, score: s });
  }
  for (const t of glossary) {
    const s = score(t.term, t.definition);
    if (s) hits.push({ kind: 'Glossaire', title: t.term, to: `/glossaire#${glossaryId(t.term)}`, excerpt: t.definition, score: s - 0.5 });
  }
  return hits.sort((a, b) => b.score - a.score);
}
