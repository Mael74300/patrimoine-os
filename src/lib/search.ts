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
  { slug: 'investir-d-un-coup-ou-progressivement', title: 'Investir d’un coup ou progressivement', excerpt: 'Un capital placé en une fois ou en tranches égales sur plusieurs mois : valeur finale selon le parcours de prix que vous supposez.', keywords: 'investir d un coup ou progressivement versements programmes dca lump sum etalement capital placement bourse etf moment entrer marche' },
  { slug: 'retraits-reguliers-duree-du-capital', title: 'Retraits réguliers : combien de temps le capital tient-il ?', excerpt: 'Un capital dont on retire chaque mois une somme : durée avant épuisement, capital restant et retrait mensuel tenable selon vos hypothèses.', keywords: 'retraits reguliers capital duree epuisement decumulation retrait mensuel rente complement retraite combien de temps tient mon capital' },
  { slug: 'rendement-reel-de-mon-placement', title: 'Rendement réel de mon placement', excerpt: 'Le taux de rendement annuel équivalent d’un placement à partir de ce que vous avez versé et de sa valeur actuelle.', keywords: 'rendement reel placement tri taux de rendement interne performance annualisee calculer rendement versements mensuels gain perte' },
  { slug: 'cout-d-attendre-pour-epargner', title: 'Coût d’attendre pour épargner', excerpt: 'Capital obtenu en épargnant tout de suite ou après un délai, à versement et date d’arrivée identiques, et versement pour rattraper le retard.', keywords: 'commencer epargner plus tot ou plus tard retard cout attendre interets composes versement mensuel rattraper debuter jeune investir' },
  { slug: 'renegocier-son-credit-gain-et-point-mort', title: 'Renégocier son crédit : gain et point mort', excerpt: 'Un nouveau taux vaut-il le coup ? Économie de mensualité, gain net sur le coût total et point mort des frais, à partir de vos hypothèses.', keywords: 'renegocier credit immobilier rachat de pret nouveau taux gain point mort frais indemnites remboursement anticipe economie mensualite' },
  { slug: 'doubler-son-capital-regle-de-72', title: 'Doubler son capital : règle de 72', excerpt: 'Combien d’années faut-il pour doubler un capital au rendement que vous supposez ? Règle de 72 comparée au calcul exact, avec inflation.', keywords: 'doubler son capital regle de 72 combien de temps doubler argent interets composes rendement annee multiplier tripler calcul' },
  { slug: 'interets-simples-ou-composes', title: 'Intérêts simples ou composés', excerpt: 'Même capital, même taux : ce que rapportent des intérêts simples et des intérêts composés au fil des années.', keywords: 'interets simples interets composes difference capitalisation formule calcul comparer placement taux annuel reinvestir' },
  { slug: 'duree-pour-atteindre-un-capital', title: 'Durée pour atteindre un capital', excerpt: 'En combien de temps atteindre un capital visé avec un versement mensuel et un rendement supposé ? Durée, total versé et part des intérêts.', keywords: 'combien de temps pour atteindre capital objectif epargne duree versement mensuel 100000 euros mois annees interets composes' },
  { slug: 'convertir-un-taux-annuel-en-taux-mensuel', title: 'Convertir un taux annuel en taux mensuel', excerpt: 'Taux mensuel équivalent ou proportionnel : convertissez un taux annuel et mesurez l’écart quand on divise simplement par douze.', keywords: 'convertir taux annuel en taux mensuel equivalent proportionnel actuariel formule calcul taux trimestriel semestriel capitalisation' },
  { slug: 'augmenter-son-epargne-chaque-annee', title: 'Augmenter son épargne chaque année', excerpt: 'Versement mensuel constant ou qui augmente chaque année : capital obtenu, capital en plus et versement constant équivalent.', keywords: 'augmenter epargne chaque annee versement croissant indexe salaire hausse versement mensuel progressif capital interets composes epargne progressive' },
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
