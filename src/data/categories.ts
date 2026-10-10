import type { Category } from './types';

export const categories: Category[] = [
  { id: 'epargne', order: 1, name: 'Épargne et liquidités', short: 'Livrets, comptes à terme : la base de toute stratégie.' },
  { id: 'actions', order: 2, name: 'Actions et ETF', short: 'Devenir copropriétaire des entreprises cotées.' },
  { id: 'obligations', order: 3, name: 'Obligations', short: 'Prêter à des États ou des entreprises contre intérêts.' },
  { id: 'enveloppes', order: 4, name: 'PEA, compte-titres et assurance-vie', short: 'Les enveloppes qui déterminent la fiscalité.' },
  { id: 'immobilier', order: 5, name: 'Immobilier locatif', short: 'Acheter un bien pour le louer, vide ou meublé.' },
  { id: 'pierre-papier', order: 6, name: 'SCPI et foncières cotées', short: "L'immobilier sans gérer de locataire." },
  { id: 'credit-immo', order: 7, name: 'Investissement immobilier à crédit', short: "Financer un bien grâce à l'effet de levier bancaire." },
  { id: 'entreprise', order: 8, name: "Création et acquisition d'entreprise", short: 'Créer, racheter, développer une activité.' },
  { id: 'numerique', order: 9, name: 'SaaS, e-commerce et activités numériques', short: 'Actifs numériques générant un revenu.' },
  { id: 'private', order: 10, name: 'Capital-investissement et financement participatif', short: 'Entreprises non cotées et plateformes de crowdfunding.' },
  { id: 'metaux', order: 11, name: 'Or et métaux précieux', short: 'Actifs tangibles sans rendement, valeur refuge.' },
  { id: 'crypto', order: 12, name: 'Cryptomonnaies', short: 'Actifs numériques très volatils.' },
  { id: 'collection', order: 13, name: 'Actifs de collection', short: 'Art, montres, vins : marchés peu liquides.' },
  { id: 'terres', order: 14, name: 'Terres agricoles et forêts', short: 'Foncier rural, groupements forestiers.' },
  { id: 'energie', order: 15, name: 'Énergies renouvelables et actifs réels', short: 'Infrastructures, production d’énergie.' },
  { id: 'retraite', order: 16, name: 'Retraite et enveloppes fiscales', short: 'PER et dispositifs de long terme.' },
  { id: 'levier', order: 17, name: 'Crédit et effet de levier', short: 'Emprunter pour investir : mécanique et risques.' },
  { id: 'capital-humain', order: 18, name: 'Développement du capital humain', short: 'Compétences et formation : le premier actif.' },
  { id: 'transmission', order: 19, name: 'Transmission et structuration', short: 'Donations, démembrement, sociétés.' },
  { id: 'autres', order: 20, name: 'Autres formes documentées', short: 'Placements spécifiques ou de niche.' },
];

export const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));
