import { categoryById } from '../data/categories';
import { guides } from '../data/guides';
import { investments } from '../data/investments';

export type SearchHit = { kind: 'Fiche' | 'Guide' | 'Simulateur'; title: string; to: string; excerpt: string; score: number };

export const simulators = [
  { slug: 'patrimoine', title: 'Simulateur de patrimoine à long terme', excerpt: 'Épargne variable, retraits ponctuels, frais, inflation, fiscalité, jusqu’à trois scénarios.', keywords: 'interets composes epargne mensuelle objectif inflation frais scenarios retrait' },
  { slug: 'immobilier', title: 'Calculateur immobilier locatif', excerpt: 'Rendements, flux de trésorerie, fiscalité paramétrable, patrimoine net et scénario défavorable.', keywords: 'location loyer rendement cash flow lmnp nue achat appartement micro foncier reel' },
  { slug: 'etf-immobilier', title: 'Comparateur ETF et immobilier', excerpt: 'Deux stratégies, même capital et même effort d’épargne : patrimoine net estimé.', keywords: 'etf immobilier comparer bourse pierre locatif strategie' },
  { slug: 'credit', title: 'Calculateur de crédit', excerpt: "Mensualité, intérêts, tableau d'amortissement, remboursement anticipé.", keywords: 'pret emprunt mensualite amortissement taux capacite anticipe' },
  { slug: 'portefeuille', title: 'Calculateur de portefeuille', excerpt: 'Allocation, frais pondérés, rendement supposé, rééquilibrage.', keywords: 'allocation etf diversification frais reequilibrage risque' },
  { slug: 'entreprise', title: 'Calculateur entrepreneurial', excerpt: "Chiffre d'affaires, marge, rémunération, trésorerie et valorisation en trois scénarios.", keywords: 'entreprise creation chiffre affaires marge tresorerie valorisation business plan' },
  { slug: 'independance-financiere', title: "Simulateur d'indépendance financière", excerpt: 'Capital visé selon le taux de retrait, délai pour l’atteindre, durée du capital.', keywords: 'fire independance financiere rente taux de retrait retraite anticipee' },
  { slug: 'epargne-de-precaution', title: "Simulateur d'épargne de précaution", excerpt: 'Réserve à garder disponible, délai pour la constituer et répartition sur les livrets réglementés.', keywords: 'precaution urgence imprevu matelas securite livret a ldds lep mois de depenses reserve' },
  { slug: 'budget', title: 'Budget mensuel et taux d’épargne', excerpt: 'Part du revenu consacrée aux besoins, envies et épargne, repère 50/30/20 et effort pour un taux visé.', keywords: 'budget depenses taux epargne 50 30 20 revenu besoins envies capacite epargne' },
  { slug: 'frais', title: 'Impact des frais sur votre capital', excerpt: 'Trois niveaux de frais annuels comparés à rendement brut et versements identiques : capital final et coût des frais.', keywords: 'frais courants gestion cout etf assurance vie rendement net long terme comparaison' },
  { slug: 'rembourser-ou-investir', title: 'Rembourser son crédit ou investir', excerpt: 'Remboursement anticipé ou placement de la même somme : patrimoine net comparé et rendement d’équilibre.', keywords: 'remboursement anticipe pret immobilier investir arbitrage interets economises placer epargne credit' },
  { slug: 'inflation', title: 'Inflation et pouvoir d’achat', excerpt: 'Ce que vaut une somme dans vingt ans, inchangée ou placée : pouvoir d’achat perdu et rendement réel.', keywords: 'inflation pouvoir achat prix hausse rendement reel epargne livret perte valeur euros constants' },
  { slug: 'endettement', title: 'Taux d’endettement et reste à vivre', excerpt: 'Part des revenus consacrée aux crédits, reste à vivre, mensualité maximale et capital empruntable au repère de 35 %.', keywords: 'taux endettement taux effort 35 hcsf reste a vivre capacite emprunt pret immobilier revenus mensualite' },
  { slug: 'objectif-epargne', title: 'Objectif d’épargne : combien verser par mois', excerpt: 'Versement mensuel pour atteindre un montant à une échéance (apport, voyage, travaux) et effet de la durée et du taux.', keywords: 'objectif epargne projet apport voyage travaux versement mensuel echeance economiser combien epargner par mois' },
  { slug: 'taeg', title: 'Calcul du TAEG d’un crédit', excerpt: 'TAEG estimé à partir du taux, de l’assurance et des frais de dossier ou de garantie, pour comparer deux offres de prêt.', keywords: 'taeg calcul taux annuel effectif global credit pret immobilier assurance frais dossier garantie comparer offres cout total' },
  { slug: 'louer-ou-acheter', title: 'Louer ou acheter sa résidence principale', excerpt: 'Patrimoine du propriétaire et du locataire à l’horizon choisi, selon vos hypothèses de prix, de loyer, de frais et de rendement.', keywords: 'louer ou acheter residence principale loyer achat pret immobilier comparer proprietaire locataire horizon frais notaire apport' },
  { slug: 'dettes', title: 'Rembourser plusieurs dettes : avalanche ou boule de neige', excerpt: 'Ordre de remboursement de plusieurs dettes : intérêts et durée selon la méthode avalanche, boule de neige ou mensualités minimales.', keywords: 'rembourser plusieurs dettes avalanche boule de neige snowball credit consommation carte revolving surendettement ordre remboursement interets' },
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
