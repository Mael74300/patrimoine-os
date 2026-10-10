# Patrimoine OS

Plateforme française et gratuite consacrée à la construction du patrimoine : encyclopédie des investissements, comparateur, simulateurs et guides. Site 100 % statique, sans backend, sans compte, sans cookie ni traceur. Coût d'exploitation : 0 €.

## Ce qui est livré

| Rubrique | Contenu |
|---|---|
| Accueil | Recherche, accès rapides, exemple de simulation (marqué fictif), 20 familles, sources officielles |
| Encyclopédie | 26 fiches générées depuis `src/data/investments.ts`, filtres (famille, risque, liquidité, texte) |
| Fiche | Définition, fonctionnement, comment investir, capital, horizon, liquidité, risque, frais, fiscalité datée, avantages/inconvénients, temps et compétences, exemple chiffré, sources, alternatives. Chaque information porte un statut « vérifié au … » ou « à vérifier ». |
| Simulateurs | Patrimoine long terme (frais, inflation, fiscalité de sortie, objectif, scénarios ±2 pts), immobilier locatif (rendements, cash-flow, crédit), crédit (amortissement, capacité d'emprunt), portefeuille (pondérations, frais, rééquilibrage, projection) |
| Comparateur | Jusqu'à 3 placements côte à côte + projection selon vos hypothèses |
| Entrepreneuriat, guides, méthode | Contenus pédagogiques, formules documentées, confidentialité, effacement des données locales |

Les simulations sont mémorisées dans le `localStorage` du navigateur uniquement (non synchronisées entre appareils).

## Choix techniques

- **Vite + React + TypeScript**, CSS natif (pas de Tailwind : il n'aurait rien simplifié ici).
- **Graphiques en SVG maison** (`src/components/ui.tsx`) : zéro dépendance, accessibles au clavier (flèches gauche/droite).
- **Moteur de calcul** dans `src/lib/finance.ts`, fonctions pures couvertes par 52 tests (`npm test`), dont la vérification de chaque exemple chiffré cité dans les fiches.
- **Hébergement : GitHub Pages**, retenu face à Cloudflare Pages car le code et l'hébergement restent au même endroit (un seul service), gratuit pour un dépôt public, déploiement automatique par GitHub Actions. Le sous-domaine `<compte>.github.io/patrimoine-os` suffit au lancement.
- **Routage par hash** (`/#/encyclopedie`) : fonctionne sur tout hébergement statique sans configuration. Contrepartie : référencement moins bon qu'avec des pages pré-rendues (voir feuille de route).
- Dépendances de production : `react`, `react-dom`, `react-router-dom`. Poids : ~87 ko gzip.

## Mise en ligne (une seule fois, environ 10 minutes)

1. Créer un dépôt **public** `patrimoine-os` sur GitHub et y pousser ce dossier :
   ```bash
   git init && git add . && git commit -m "Patrimoine OS"
   git branch -M main
   git remote add origin https://github.com/<compte>/patrimoine-os.git
   git push -u origin main
   ```
2. Dans le dépôt : **Settings → Pages → Source : GitHub Actions**.
3. Le workflow `deploy.yml` lance les tests, construit et publie à chaque `push` sur `main`. Si un test échoue, rien n'est publié.

## Maintenance automatisée

- `check-links.yml` vérifie chaque mois les liens des sources et ouvre une issue si l'un est cassé.
- Calendrier de mise à jour manuelle (quelques minutes, dans `src/data/investments.ts`, puis modifier `AS_OF`) :
  - **1er février et 1er août** : taux Livret A, LDDS, LEP.
  - **Janvier** : loi de finances et loi de financement de la Sécurité sociale (PFU, prélèvements sociaux, plafonds).

## Ajouter une fiche

Ajouter un objet dans `src/data/investments.ts` (le type `Investment` guide la saisie). Les tests vérifient automatiquement catégorie, alternatives, sources en `https` et la mention « fictif » dans l'exemple. La fiche, la recherche, les filtres et le comparateur l'intègrent sans autre modification.

## Publicité et affiliation (désactivées)

`src/config.ts` : `ads.enabled` active les emplacements `<AdSlot>` ; `affiliates` associe un lien partenaire à une fiche, affiché avec la mention de commission et `rel="sponsored"`.

## Feuille de route

1. Pré-rendu statique des fiches (par ex. `vite-react-ssg`) pour le référencement.
2. Fiches des familles « en préparation » : collection, terres et forêts, énergie, crédit et levier, autres.
3. Fiscalité détaillée par enveloppe dans le simulateur (abattements de l'assurance-vie, historique des taux du PEA).
4. Export / import JSON des simulations pour passer d'un appareil à l'autre, sans serveur.

## Avertissement

Informations générales à visée pédagogique, sans conseil en investissement personnalisé. Données réglementaires vérifiées au 10 octobre 2026 ; les éléments non confirmés sont signalés « à vérifier » sur le site.
