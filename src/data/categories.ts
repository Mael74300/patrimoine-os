import type { Category } from './types';

// Ordre de lecture : du plus courant au plus rare ; la retraite et l’épargne salariale suivent les autres enveloppes (PEA, assurance-vie) pour être comparées ensemble.
// Noms en mots courants : ils s’affichent en tête de chaque fiche, dans l’encyclopédie et le plan du site.
export const categories: Category[] = [
  { id: 'epargne', order: 1, name: 'Épargne et liquidités', short: 'Livrets, comptes à terme : la base de toute stratégie.' },
  { id: 'actions', order: 2, name: 'Actions et ETF', short: 'Devenir copropriétaire des entreprises cotées.' },
  { id: 'obligations', order: 3, name: 'Obligations', short: 'Prêter à des États ou des entreprises contre intérêts.' },
  { id: 'enveloppes', order: 4, name: 'PEA, compte-titres et assurance-vie', short: 'Les comptes qui décident de l’impôt sur vos gains.' },
  { id: 'retraite', order: 5, name: 'Retraite et épargne salariale', short: 'PER et PEE : une épargne bloquée, avec un coup de pouce fiscal ou de l’employeur.' },
  { id: 'immobilier', order: 6, name: 'Immobilier locatif', short: 'Acheter un bien pour le louer, vide ou meublé.' },
  { id: 'pierre-papier', order: 7, name: 'SCPI et foncières cotées', short: "L'immobilier sans gérer de locataire." },
  { id: 'credit-immo', order: 8, name: 'Investissement immobilier à crédit', short: 'Emprunter pour acheter un logement à louer.' },
  { id: 'entreprise', order: 9, name: "Création et acquisition d'entreprise", short: 'Créer, racheter, développer une activité.' },
  { id: 'numerique', order: 10, name: 'Activités en ligne', short: 'Vendre sur internet : logiciels, boutiques, contenus.' },
  { id: 'private', order: 11, name: 'Capital-investissement et financement participatif', short: 'Entreprises hors Bourse et projets financés via des plateformes.' },
  { id: 'metaux', order: 12, name: 'Or et métaux précieux', short: 'Un métal sans intérêts ni loyers, recherché face aux crises.' },
  { id: 'crypto', order: 13, name: 'Cryptomonnaies', short: 'Des monnaies numériques au prix très instable.' },
  { id: 'collection', order: 14, name: 'Objets de collection', short: 'Art, montres, vins : aucun revenu, une revente incertaine.' },
  { id: 'terres', order: 15, name: 'Terres agricoles et forêts', short: 'Foncier rural, groupements forestiers.' },
  { id: 'energie', order: 16, name: 'Énergies renouvelables et actifs réels', short: 'Infrastructures, production d’énergie.' },
  { id: 'levier', order: 17, name: 'Crédit et effet de levier', short: 'Emprunter pour investir : mécanique et risques.' },
  { id: 'capital-humain', order: 18, name: 'Formation et compétences', short: 'Se former pour gagner plus : en début de carrière, souvent ce qui rapporte le plus.' },
  { id: 'transmission', order: 19, name: 'Donner et transmettre', short: 'Donner de son vivant à ses proches.' },
  { id: 'autres', order: 20, name: 'Autres formes documentées', short: 'Placements spécifiques ou de niche.' },
];

export const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));
