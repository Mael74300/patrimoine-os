import type { Guide } from './types';

export const guides: Guide[] = [
  {
    slug: 'par-ou-commencer',
    title: 'Par où commencer pour construire son patrimoine',
    summary: 'Un ordre de priorité simple, de l’épargne de précaution aux investissements de long terme.',
    readingMinutes: 6,
    sections: [
      {
        heading: '1. Connaître sa capacité d’épargne',
        body: [
          'Avant tout placement, il faut savoir combien on peut mettre de côté chaque mois sans se mettre en difficulté. Listez vos revenus nets et vos dépenses fixes sur trois mois.',
          'La capacité d’épargne est souvent un levier plus puissant que le choix du placement : passer de 100 € à 300 € par mois a plus d’effet que gagner un point de rendement.',
        ],
      },
      {
        heading: '2. Constituer une épargne de précaution',
        body: [
          'Une réserve disponible immédiatement évite de vendre des placements au mauvais moment. Un repère courant est de trois à six mois de dépenses, à adapter à la stabilité de vos revenus.',
          'Les livrets réglementés (LEP si vous êtes éligible, puis Livret A et LDDS) sont les supports naturels de cette réserve.',
        ],
      },
      {
        heading: '3. Rembourser les dettes coûteuses',
        body: ['Un crédit à la consommation à taux élevé coûte souvent plus que ce que rapporterait un placement. Le rembourser est un « rendement » certain.'],
      },
      {
        heading: '4. Ouvrir les bonnes enveloppes tôt',
        body: [
          'PEA et assurance-vie bénéficient d’avantages fiscaux qui dépendent de leur ancienneté (5 et 8 ans). Les ouvrir tôt, même avec un petit versement, fait courir ces délais.',
        ],
      },
      {
        heading: '5. Investir régulièrement selon son horizon',
        body: [
          'L’argent nécessaire dans moins de trois ans n’a pas sa place en actions. Pour un horizon long, une allocation diversifiée et peu coûteuse, alimentée chaque mois, est une approche robuste.',
          'Utilisez le simulateur de patrimoine pour tester plusieurs hypothèses, en gardant en tête qu’elles ne sont pas des promesses.',
        ],
      },
    ],
    related: ['livret-a', 'lep', 'pea', 'assurance-vie', 'etf-monde'],
    sources: [
      { label: 'La finance pour tous', url: 'https://www.lafinancepourtous.com', official: true },
      { label: 'AMF — Espace épargnants', url: 'https://www.amf-france.org/fr/espace-epargnants', official: true },
    ],
  },
  {
    slug: 'interets-composes',
    title: 'Comprendre les intérêts composés',
    summary: 'Pourquoi le temps, les frais et la régularité comptent plus que la recherche du meilleur placement.',
    readingMinutes: 5,
    sections: [
      {
        heading: 'Le principe',
        body: [
          'Les intérêts composés consistent à gagner des intérêts sur les intérêts déjà acquis. Avec un taux r pendant n années, un capital C devient C × (1 + r)^n.',
          'Exemple fictif : 10 000 € à 5 % par an deviennent environ 16 289 € après 10 ans et 26 533 € après 20 ans. La seconde décennie rapporte plus que la première.',
        ],
      },
      {
        heading: 'L’effet des frais',
        body: [
          'Des frais annuels de 1 % paraissent faibles, mais ils s’appliquent chaque année à tout le capital. Sur 25 ans, ils peuvent réduire le capital final de plus de 20 %.',
          'Le simulateur de patrimoine vous permet de comparer le même scénario avec et sans frais.',
        ],
      },
      {
        heading: 'L’inflation',
        body: [
          'Un capital nominal ne dit rien du pouvoir d’achat futur. Nos simulateurs affichent aussi la valeur en euros d’aujourd’hui, en divisant par (1 + inflation)^n.',
        ],
      },
    ],
    related: ['etf-monde', 'assurance-vie', 'fonds-euros'],
    sources: [{ label: 'La finance pour tous', url: 'https://www.lafinancepourtous.com', official: true }],
  },
  {
    slug: 'choisir-son-enveloppe',
    title: 'PEA, assurance-vie, PER, compte-titres : choisir son enveloppe',
    summary: 'Ce qui distingue les principales enveloppes et comment les combiner.',
    readingMinutes: 7,
    sections: [
      {
        heading: 'Placement et enveloppe : deux choses différentes',
        body: [
          'Un ETF actions peut être détenu dans un PEA, un compte-titres, une assurance-vie ou un PER. Le support détermine le risque ; l’enveloppe détermine la fiscalité, la disponibilité et la transmission.',
        ],
      },
      {
        heading: 'Les grandes différences',
        body: [
          'PEA : actions européennes, plafond de versements de 150 000 €, exonération d’impôt sur le revenu après 5 ans (prélèvements sociaux dus).',
          'Assurance-vie : supports variés, fiscalité allégée après 8 ans, avantages successoraux.',
          'PER : versements déductibles mais argent bloqué jusqu’à la retraite, sauf exceptions.',
          'Compte-titres : aucune limite, fiscalité standard (PFU de 31,4 % en 2026).',
        ],
      },
      {
        heading: 'Une combinaison fréquente',
        body: [
          'Épargne de précaution sur livrets, investissement actions de long terme en PEA, assurance-vie pour la diversification et la transmission, PER si la tranche marginale d’imposition est élevée. Ce n’est pas un conseil personnalisé : votre situation peut justifier d’autres choix.',
        ],
      },
    ],
    related: ['pea', 'assurance-vie', 'per', 'compte-titres'],
    sources: [
      { label: 'Service-Public.fr — PEA', url: 'https://www.service-public.fr/particuliers/vosdroits/F2385', official: true },
      { label: 'Service-Public.fr — Assurance-vie', url: 'https://www.service-public.fr/particuliers/vosdroits/F22414', official: true },
      { label: 'Service-Public.fr — PER', url: 'https://www.service-public.fr/particuliers/vosdroits/F34982', official: true },
    ],
  },
  {
    slug: 'effet-de-levier',
    title: "L'effet de levier du crédit, sans illusion",
    summary: 'Comment l’emprunt amplifie les gains comme les pertes.',
    readingMinutes: 5,
    sections: [
      {
        heading: 'Le mécanisme',
        body: [
          "Si un bien rapporte 5 % net et que le crédit coûte 3,5 %, chaque euro emprunté crée un supplément de rendement pour l'apport. Si le bien rapporte moins que le crédit, l'emprunt détruit de la valeur.",
        ],
      },
      {
        heading: 'Les risques à intégrer',
        body: [
          'Vacance locative, travaux imprévus, hausse de la taxe foncière, baisse des prix à la revente : le levier amplifie chacun de ces événements.',
          'Le calculateur immobilier affiche le cash-flow mensuel, c’est-à-dire l’effort d’épargne réel une fois la mensualité payée.',
        ],
      },
    ],
    related: ['credit-immobilier', 'location-nue'],
    sources: [{ label: 'ANIL', url: 'https://www.anil.org', official: true }],
  },
];

export const guideBySlug = Object.fromEntries(guides.map((g) => [g.slug, g]));
