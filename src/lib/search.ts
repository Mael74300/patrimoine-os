import { categoryById } from '../data/categories';
import { glossary, glossaryId } from '../data/glossary';
import { guides } from '../data/guides';
import { investments } from '../data/investments';

export type SearchHit = { kind: 'Fiche' | 'Guide' | 'Simulateur' | 'Glossaire'; title: string; to: string; excerpt: string; score: number };

import { simulators } from './simulatorsList';
export { simulators };

/** Minuscule, sans accents, pour une recherche tolérante. */
export const norm = (s: string) => s.replace(/[\u00a0\u202f]/g, ' ').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Racine approximative d'un mot, pour que la forme tapée trouve ses voisines :
 * « livrets » trouve « livret », « placer » trouve « placement », « emprunter » trouve « emprunt »,
 * « retraite » trouve « retraits ». On retire le pluriel, puis une terminaison courante
 * sur les mots longs, sans descendre sous quatre lettres.
 */
export const stem = (t: string) => {
  if (t.length <= 3) return t;
  let s = t.replace(/[sx]$/, '');
  if (s.length >= 6) {
    for (const end of ['issement', 'ement', 'er', 'ir', 'ez', 'ee', 'e']) {
      if (s.endsWith(end) && s.length - end.length >= 4) {
        s = s.slice(0, -end.length);
        break;
      }
    }
  }
  return s;
};

/** Petits mots d'une question (« comment placer mon argent », « meilleur placement ») ignorés par la recherche. */
export const stopWords = new Set(
  'le la les l de du des d un une et au aux en pour par sur dans avec sans mon ma mes ton ta tes son sa ses notre nos votre vos leur leurs je j tu il elle on nous vous ils elles me m se s ce c cet cette ces ca cela qui que qu quoi quel quelle quels quelles comment combien est sont suis faut peut puis dois doit ai as avoir etre faire fait y ne n pas quand ou si euro euros premier premiere premiers premieres meilleur meilleure meilleurs meilleures bon bonne bien mieux tres'.split(' '),
);

/** Mots utiles de la recherche, ramenés à leur racine (les petits mots sont gardés s'il n'y a qu'eux). */
export function searchTerms(query: string): string[] {
  const words = norm(query).split(/[\s'’]+/).map((w) => w.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '')).filter((t) => t.length > 1);
  const useful = words.filter((w) => !stopWords.has(w));
  return [...new Set((useful.length ? useful : words).map(stem))];
}

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
  maison: ['maison', 'logement', 'immobili', 'residence'],
  appartement: ['appartement', 'logement', 'immobili', 'residence'],
  logement: ['logement', 'immobili', 'residence'],
  acheter: ['achat', 'achet', 'acquer', 'acquisition'],
  achat: ['achat', 'achet', 'acquer', 'acquisition'],
  impot: ['impot', 'impos', 'fiscal', 'prelevement'],
  fiscalite: ['fiscal', 'impot', 'impos', 'prelevement'],
  taxe: ['taxe', 'impot', 'impos', 'fiscal'],
  retraite: ['retrait', 'pension'],
  debuter: ['debut', 'commenc'],
  debutant: ['debut', 'commenc'],
  commencer: ['commenc', 'debut'],
  salaire: ['salaire', 'revenu', 'budget', 'commenc'],
  rente: ['rente', 'retrait', 'independance'],
  rentier: ['rente', 'retrait', 'independance'],
  enfant: ['enfant', 'donation', 'transmission'],
  transmettre: ['transm', 'donation'],
  pret: ['pret', 'credit', 'emprunt'],
  credit: ['credit', 'pret', 'emprunt'],
  argent: ['argent', 'epargn', 'placement'],
  economiser: ['econom', 'epargn'],
  notaire: ['notaire', 'acquisition'],
};

/** Synonymes rangés par racine, pour retrouver « impôts », « acheter » ou « crédits » sous toutes leurs formes. */
const aliasByStem: Record<string, string[]> = {};
for (const [k, v] of Object.entries(searchAliases)) aliasByStem[stem(k)] = [...new Set([...(aliasByStem[stem(k)] ?? []), ...v])];

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Un mot de la recherche doit commencer un mot du texte (« bourse » ne trouve plus « rembourser »). */
const wordStart = (text: string, term: string) => new RegExp(`(^|[^a-z0-9])${escapeRe(term)}`).test(text);

export type SearchResult = { hits: SearchHit[]; partial: boolean };

/**
 * Cherche dans les fiches, guides, simulateurs et le glossaire.
 * Un mot trouvé dans le titre compte 5, dans le résumé ou les mots-clés 2, dans le reste du texte 1.
 * Les pages qui contiennent tous les mots passent en premier ; s'il y en a moins de cinq, on ajoute
 * celles qui en contiennent au moins la moitié. `partial` : aucune page ne contient tous les mots.
 */
export function searchDetailed(query: string): SearchResult {
  const terms = searchTerms(query);
  if (!terms.length) return { hits: [], partial: false };
  // Deux mots tapés côte à côte et présents tels quels dans le titre (« livret a », « flat tax ») : bonus.
  const raw = norm(query).split(/[\s'’]+/).filter((w) => w && !stopWords.has(w));
  const pairs = raw.slice(1).map((w, k) => `${raw[k]} ${w}`);
  type Scored = SearchHit & { found: number };
  const all: Scored[] = [];
  const add = (kind: SearchHit['kind'], title: string, to: string, excerpt: string, lead: string, body: string, bonus: number) => {
    const t = norm(title);
    const l = norm(lead);
    const b = norm(body);
    let s = 0;
    let found = 0;
    for (const term of terms) {
      const variants = [term, ...(aliasByStem[term] ?? [])];
      const w = variants.some((v) => wordStart(t, v)) ? 5 : variants.some((v) => wordStart(l, v)) ? 2 : variants.some((v) => wordStart(b, v)) ? 1 : 0;
      if (w) found++;
      s += w;
    }
    if (!found) return;
    for (const p of pairs) if (wordStart(t, p)) s += 3;
    all.push({ kind, title, to, excerpt, score: s + bonus, found });
  };
  for (const i of investments) {
    const lead = ['fiche', i.summary, i.tags.join(' '), categoryById[i.category]?.name].join(' ');
    const body = [i.definition, i.howItWorks, i.howToInvest.join(' '), i.minCapital.text, i.fees.text, i.tax.text, i.pros.join(' '), i.cons.join(' '), i.timeSkills].join(' ');
    add('Fiche', i.name, `/encyclopedie/${i.slug}`, i.summary, lead, body, 1);
  }
  for (const g of guides) {
    const body = g.sections.map((s) => s.heading + ' ' + s.body.join(' ')).join(' ');
    add('Guide', g.title, `/guides/${g.slug}`, g.summary, 'guide ' + g.summary, body, 0);
  }
  for (const sim of simulators) add('Simulateur', sim.title, `/simulateurs/${sim.slug}`, sim.excerpt, `simulateur calculateur ${sim.excerpt} ${sim.keywords}`, '', 0);
  for (const t of glossary) add('Glossaire', t.term, `/glossaire#${glossaryId(t.term)}`, t.definition, '', t.definition, -0.5);
  const byRank = (a: Scored, b: Scored) => b.found - a.found || b.score - a.score;
  const complete = all.filter((h) => h.found === terms.length);
  // Peu de pages contiennent tous les mots : on ajoute à la suite celles qui en contiennent au moins la moitié.
  const kept = complete.length >= 5 ? complete : all.filter((h) => h.found >= Math.ceil(terms.length / 2));
  return { hits: kept.sort(byRank).map(({ found: _f, ...h }) => h), partial: !complete.length && kept.length > 0 };
}

export function search(query: string): SearchHit[] {
  return searchDetailed(query).hits;
}
