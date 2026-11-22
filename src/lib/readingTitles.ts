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
  "activite-numerique": "Activités en ligne",
  "per": "Plan d'épargne retraite (PER)",
  "pee": "Plan d'épargne entreprise (PEE)",
  "capital-humain": "Formation et compétences",
  "donation": "Donation et transmission",
  "crowdfunding": "Financement participatif",
  "private-equity": "Capital-investissement (private equity)",
  "or": "Or physique et papier",
  "objets-d-art-collection": "Objets d'art et de collection",
  "groupements-forestiers": "Forêt : parts de groupement forestier",
  "cryptomonnaies": "Cryptomonnaies",
};

/**
 * Résumés des fiches citées en bas des simulateurs (copie mot pour mot de `summary`, vérifiée par readingTitles.test.ts) :
 * la carte dit ce qu’est le placement, comme en bas des fiches et des guides.
 */
export const investmentSummaries: Record<string, string> = {
  "etf-monde": "Des fonds de Bourse qui suivent tout un marché d'actions, à frais faibles.",
  "location-nue": "Acheter un logement et le louer vide : les loyers sont des revenus fonciers.",
  "credit-immobilier": "Emprunter pour acheter un logement à louer, dont les loyers paient une partie des mensualités.",
  "obligations": "Prêter à un État ou une entreprise, qui verse des intérêts (le coupon).",
  "creation-entreprise": "Construire une activité dont les bénéfices et la valeur de revente constituent un patrimoine.",
  "reprise-entreprise": "Acquérir une entreprise existante, souvent avec un crédit, pour en percevoir les bénéfices.",
  "activite-numerique": "Logiciels, boutiques en ligne, contenus : des activités sur internet qui peuvent rapporter un revenu régulier.",
  "per": "Épargne bloquée jusqu’à la retraite ; ce que vous y versez peut être déduit de vos revenus imposables.",
  "lep": "Le livret réglementé le mieux rémunéré, réservé aux foyers sous conditions de revenus.",
  "livret-a": "Livrets réglementés, sans risque, disponibles à tout moment et non imposés.",
  "assurance-vie": "Un contrat d’épargne à tout faire : part garantie ou non, moins d’impôt après 8 ans, atout pour transmettre.",
  "donation": "Donner de son vivant : des montants exonérés de droits, renouvelables.",
};
