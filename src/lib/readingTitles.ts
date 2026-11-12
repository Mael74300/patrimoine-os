/**
 * Titres des guides et noms des fiches cités dans « Pour aller plus loin » (bas des simulateurs).
 * Copie volontairement légère : elle évite que chaque page de simulateur télécharge tout le contenu
 * des guides et des fiches. Un test (readingTitles.test.ts) vérifie qu'elle reste identique aux données.
 */
export const guideTitles: Record<string, string> = {
  "types-investissements": "Tous les types d’investissements accessibles aux particuliers",
  "patrimoine-net": "Comment calculer son patrimoine net",
  "immobilier-ou-etf": "Comment comparer immobilier et ETF",
  "investir-a-credit": "Comment fonctionne un investissement à crédit",
  "rentabilite-locative": "Comment calculer la rentabilité locative",
  "fonctionnement-pea": "Comment fonctionne le PEA",
  "comparer-les-frais": "Comment comparer les frais d’investissement",
  "epargne-limitee": "Construire un patrimoine avec une épargne limitée",
  "par-ou-commencer": "Par où commencer pour construire son patrimoine",
  "interets-composes": "Comprendre les intérêts composés",
  "choisir-son-enveloppe": "PEA, assurance-vie, PER, compte-titres : choisir son enveloppe",
  "combien-epargne-de-precaution": "Combien mettre en épargne de précaution ?",
  "taux-endettement-capacite-emprunt": "Taux d’endettement : quel repère pour emprunter ?",
  "pret-a-taux-zero-ptz": "Le prêt à taux zéro (PTZ) : pour qui, pour quel logement ?",
  "combien-epargner-par-mois-objectif": "Combien épargner par mois pour atteindre un objectif ?",
  "rembourser-credit-par-anticipation-ou-investir": "Rembourser son crédit par anticipation ou investir ?",
  "diversification-placements": "Diversifier ses placements : à quoi ça sert, comment faire ?",
  "inflation-pouvoir-d-achat-epargne": "Inflation : que devient le pouvoir d’achat de votre épargne ?",
  "livret-a-calcul-interets-quinzaines": "Livret A : comment sont calculés les intérêts (quinzaines)",
  "regle-de-72-doubler-son-capital": "La règle de 72 : en combien de temps un capital double-t-il ?",
};

export const investmentNames: Record<string, string> = {
  "livret-a": "Livret A et LDDS",
  "lep": "Livret d'épargne populaire (LEP)",
  "compte-a-terme": "Livrets bancaires et comptes à terme",
  "pel": "Plan d'épargne logement (PEL)",
  "etf-monde": "ETF actions diversifiés",
  "actions-individuelles": "Actions en direct",
  "obligations": "Obligations et fonds obligataires",
  "pea": "Plan d'épargne en actions (PEA)",
  "compte-titres": "Compte-titres ordinaire (CTO)",
  "assurance-vie": "Assurance-vie",
  "fonds-euros": "Fonds en euros",
  "unites-de-compte": "Unités de compte",
  "location-nue": "Location nue",
  "lmnp": "Location meublée (LMNP)",
  "scpi": "SCPI",
  "foncieres-cotees": "Foncières cotées (SIIC, REIT)",
  "credit-immobilier": "Investir à crédit dans l’immobilier",
  "creation-entreprise": "Créer son entreprise",
  "reprise-entreprise": "Racheter une entreprise",
  "activite-numerique": "SaaS, e-commerce et produits numériques",
  "per": "Plan d'épargne retraite (PER)",
  "capital-humain": "Formation et compétences",
  "donation": "Donation et transmission",
};
