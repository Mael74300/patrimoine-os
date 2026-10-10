import { categoryById } from '../data/categories';
import { guides } from '../data/guides';
import { investments } from '../data/investments';

export type SearchHit = { kind: 'Fiche' | 'Guide' | 'Simulateur'; title: string; to: string; excerpt: string; score: number };

export const simulators = [
  { slug: 'patrimoine', title: 'Simulateur de patrimoine à long terme', excerpt: 'Intérêts composés, versements mensuels, frais, inflation, objectif.', keywords: 'interets composes epargne mensuelle objectif retraite fire inflation frais' },
  { slug: 'immobilier', title: 'Calculateur immobilier locatif', excerpt: 'Rendement brut et net, cash-flow, coût du crédit.', keywords: 'location loyer rendement cash flow lmnp nue achat appartement' },
  { slug: 'credit', title: 'Calculateur de crédit', excerpt: "Mensualité, coût total, tableau d'amortissement, capacité d'emprunt.", keywords: 'pret emprunt mensualite amortissement taux capacite' },
  { slug: 'portefeuille', title: 'Calculateur de portefeuille', excerpt: 'Allocation, frais pondérés, rendement attendu, rééquilibrage.', keywords: 'allocation etf diversification frais reequilibrage risque' },
];

/** Minuscule, sans accents, pour une recherche tolérante. */
export const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function search(query: string): SearchHit[] {
  const terms = norm(query).split(/\s+/).filter((t) => t.length > 1);
  if (!terms.length) return [];
  const hits: SearchHit[] = [];
  const score = (title: string, body: string) => {
    const t = norm(title);
    const b = norm(body);
    let s = 0;
    for (const term of terms) {
      if (t.includes(term)) s += 5;
      else if (b.includes(term)) s += 1;
      else return 0; // tous les termes doivent être présents
    }
    return s;
  };
  for (const i of investments) {
    const body = [i.summary, i.definition, i.tags.join(' '), categoryById[i.category]?.name, i.howItWorks].join(' ');
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
  return hits.sort((a, b) => b.score - a.score);
}
