# Feuille de route

Liste de travail vivante de la tâche automatique et des contributions manuelles.

**Fonctionnement.** À chaque exécution, la tâche commence par un audit du site du point de vue d'un utilisateur (voir « Audit utilisateur » ci-dessous). Elle met à jour la section « Constats », réordonne les chantiers selon ce qui apporte le plus aux utilisateurs, puis traite le chantier le plus utile. Dans la pull request, elle explique pourquoi ce chantier passe en premier.

**Le propriétaire a toujours le dernier mot.** Un chantier marqué « (propriétaire) » garde sa place et ne peut être ni retiré ni déclassé par la tâche. Le propriétaire peut ajouter, supprimer ou réordonner des chantiers à tout moment.

## Principes

- **Tout est améliorable (propriétaire, 28 octobre 2026).** Le but est que le site soit meilleur partout, pas seulement plus fourni. Toutes les dimensions comptent et doivent tourner d'une exécution à l'autre :
  - **esthétique** : mise en page, typographie, couleurs, espacements, hiérarchie visuelle, cohérence entre pages, graphiques, cartes, boutons, états de survol et de focus, rendu mobile, impression soignée d'un site de confiance ;
  - **vulgarisation** : phrases courtes, mots simples, jargon expliqué au premier usage (ou lien vers le glossaire), exemples concrets du quotidien, résultats de simulateur traduits en une phrase claire (« concrètement, cela veut dire… ») ; viser un lecteur qui n'y connaît rien, sans jamais sacrifier l'exactitude ;
  - **ergonomie et navigation** : trouver vite, comprendre où l'on est, savoir quoi faire ensuite ;
  - **contenu** : justesse, clarté, cohérence, utilité réelle ;
  - **technique** : vitesse, accessibilité, robustesse, absence de bogue.
  - **illustrations maison** : images dessinées par la tâche elle-même en SVG (voir le chantier « Illustrations maison ») ;
  Aucun service externe pour l'esthétique : pas de police, d'image ni de script tiers (la politique de sécurité du contenu l'interdit) ; uniquement du CSS, du SVG et des polices système.

- **Améliorer l'existant avant d'ajouter.** Le site compte 21 simulateurs (30 octobre 2026, après trois regroupements), 26 fiches et 19 guides. Plusieurs simulateurs se recoupent. La priorité est la cohérence, la qualité et la navigation, pas le nombre de pages.
- **Pas de nouveau simulateur ni de nouveau guide** sans chantier qui le justifie par un besoin utilisateur constaté (question fréquente sans réponse sur le site, parcours bloqué) et l'absence de doublon avec l'existant.
- **Lisibilité d'abord.** Le propriétaire trouve le site encombré (28 octobre 2026). Une modification ne doit pas allonger l'accueil, les listes ni les pages existantes sans en retirer autant ailleurs. Préférer : regrouper, raccourcir, replier, hiérarchiser. Mesurer la hauteur des pages touchées avant et après (Playwright, 1280 px et 375 px) et l'indiquer dans la pull request.
- **Pas de pages en masse.** Une page doit apporter quelque chose qu'aucune autre page du site n'apporte déjà.
- **Exactitude avant tout** : voir le README, section « Fusion automatique et exactitude des informations ».
- **Varier.** Si les trois dernières pull requests portent sur le même type de travail, choisis un chantier de nature différente.

## Audit utilisateur

À chaque exécution, avant de choisir quoi faire, ouvrir le site construit (`npx vite preview`) avec Playwright, à 375 px puis à 1280 px, et le parcourir comme le feraient ces visiteurs. Les captures d'écran sont regardées, pas seulement mesurées.

| Visiteur | Ce qu'il cherche |
|---|---|
| Débutant, 25 ans, premier salaire | Par où commencer, combien épargner, où placer ses premiers euros |
| Futur acheteur | Combien emprunter, mensualité, louer ou acheter |
| Épargnant de 45 ans | Diversifier, comparer PEA, assurance-vie, PER, réduire ses frais |
| Proche de la retraite | Combien de temps durera son capital, comment le transmettre |
| Visiteur arrivé depuis Google sur une page profonde | Comprendre la page seule, trouver la suite logique |

Pour chacun, noter ce qui gêne vraiment :
- une page introuvable ou mal placée dans la navigation ;
- une page trop longue ou un écran surchargé ;
- un jargon non expliqué ;
- un résultat de simulateur difficile à interpréter ;
- une impasse sans lien vers la suite ;
- des contenus qui se contredisent ou se répètent ;
- un bogue, un affichage cassé sur mobile ;
- de la lenteur ;
- une page laide, terne, déséquilibrée ou incohérente avec le reste du site ;
- un texte difficile à comprendre pour quelqu'un qui n'y connaît rien.

Pour chaque constat : le visiteur concerné, la page, et ce qui le gêne.

Choix du chantier : privilégier ce qui touche le plus de visiteurs et les pages les plus importantes (accueil, simulateurs principaux, guides d'entrée), à effort raisonnable pour une exécution. Une amélioration visible et utile vaut mieux qu'un ajout.

## Constats

Section réécrite à chaque audit, sans s'allonger : au plus 10 constats, les plus importants, datés.

- 2026-10-28 (propriétaire) : site jugé encombré et illisible ; trop de simulateurs qui se recoupent (31, chantiers 1 et 2).
- 2026-10-28 (propriétaire) : tout améliorer, y compris l'esthétique et la vulgarisation pour le grand public ; ajouter des images créées par la tâche elle-même.
- 2026-10-30 : épargnant sur le catalogue des simulateurs : « Épargne et placements » alignait 13 simulateurs, dont huit variantes d'intérêts composés ; réunies en une page à 8 onglets (31 → 21 simulateurs, voir « Fait »). Catalogue : 375 px 4 589 → 4 202 px. Reste dans cette rubrique : 8 simulateurs distincts (patrimoine, précaution, objectif, portefeuille, frais, inflation, rendement réel, investir d'un coup).
- 2026-10-30 : épargnant sur plusieurs appareils : ses simulations enregistrées restaient bloquées dans un navigateur ; export et import ajoutés (voir « Fait »). Audit de l'accueil : aucune erreur de console, pas de débordement (375 px : 6 605 px de haut).
- 2026-10-30 : débutant sur la page Guides : plusieurs titres rejetaient le « ? » seul sur la ligne suivante (« …double-t-il / ? ») ; titres équilibrés en CSS (voir « Fait »). Audit des pages d'accueil, guides, encyclopédie, simulateurs à 375 et 1280 px : aucune erreur de console.
- 2026-10-30 : débutant sur « Intérêts composés » (8 onglets, la page de départ des épargnants) : résultats en chiffres bruts, et le titre rejetait le « : » seul en début de ligne à 375 px ; phrases « Concrètement » ajoutées aux 8 onglets, espace insécable avant le « : » (voir « Fait »). Audit des 8 onglets à 375 et 1280 px : aucune erreur de console, pas de débordement.
- 2026-10-30 : débutant sur « Par où commencer » (le guide d'entrée) : cinq étapes ordonnées présentées comme cinq blocs de texte identiques, sans repère visuel de progression ; schéma « escalier » numéroté ajouté (voir « Fait »). Audit des guides, fiche assurance-vie, glossaire à 375 et 1280 px : aucune erreur de console, pas de débordement. Reste pour les illustrations : en-têtes de rubriques.
- 2026-10-30 : visiteur arrivé par Google sur « Méthodologie » (la page la plus longue du site : 14 302 px à 375 px, dont 12 000 px de formules toutes ouvertes) ; formules repliées une par une (voir « Fait »). Audit technique des 77 pages à 375 et 1280 px : aucune erreur de console, aucun débordement, un seul h1 partout.
- 2026-10-30 : épargnant de 45 ans sur le comparateur (page d'entrée des comparaisons) : à 375 px, le tableau défilait latéralement et la 3e colonne était coupée (« Assurance-vie » tronqué, ETF invisible sans glisser) ; critères empilés avec le nom du placement devant chaque valeur (voir « Fait »). Audit de l'entrepreneuriat, du glossaire et du plan du site à 375 et 1280 px : aucune erreur de console, pas de débordement.
- 2026-10-30 : débutant sur le simulateur de budget (son premier outil) : résultats en tableau de pourcentages sans phrase de synthèse ; phrase « Concrètement » ajoutée (voir « Fait »). Audit à 375 et 1280 px : aucune erreur de console, pas de débordement.

## À faire

1. [x] **Regrouper les simulateurs d'intérêts composés** : terminé le 2026-10-30 (étape 2 : simples ou composés, coût d'attendre, épargne qui augmente, conversion de taux, voir « Fait »). Historique : (étape 1 faite le 2026-10-29 : `capital-a-placer-aujourd-hui`, `duree-pour-atteindre-un-capital`, `rendement-necessaire-pour-atteindre-un-objectif` et `doubler-son-capital-regle-de-72` réunis dans `/simulateurs/interets-composes/`). Reste à intégrer : `doubler-son-capital-regle-de-72`, `duree-pour-atteindre-un-capital`, `capital-a-placer-aujourd-hui`, `rendement-necessaire-pour-atteindre-un-objectif`, `interets-simples-ou-composes`, `convertir-un-taux-annuel-en-taux-mensuel`, `augmenter-son-epargne-chaque-annee`, `cout-d-attendre-pour-epargner` et `objectif-epargne` répondent à des variantes d'une même question. Les réunir en un simulateur « Intérêts composés » à onglets (quelle valeur chercher : capital final, durée, versement, capital de départ, rendement), en gardant les calculs et tests existants. Les anciennes adresses restent valides : page courte pré-rendue qui renvoie vers le bon onglet (lien visible, `<link rel="canonical">` vers la nouvelle page, `noindex`), retirée du plan du site et du flux. Un regroupement par exécution si nécessaire.
2. [x] **Regrouper les simulateurs de crédit** : fait le 2026-10-29, voir « Fait ».
3. [~] **Alléger les pages de simulateur** (étape 1 faite le 2026-10-29 : FAQ et tableaux de crédit et d'immobilier repliés). Étape 2 faite le 2026-10-29 pour le crédit. Étape 3 faite le 2026-10-29 : tableaux annuels de patrimoine et d'entreprise repliés. Étape suivante : formulaires longs (patrimoine, entreprise : résultats à 1 100 px et plus à 375 px). Sur chaque page : formulaire et résultats principaux en premier ; FAQ, sources, hypothèses détaillées et simulations enregistrées dans des blocs repliables ; supprimer les textes répétés d'une page à l'autre. Mesurer la hauteur avant et après.
4. [ ] **Fiches des familles vides.** Aucune fiche pour : Actifs de collection, Terres agricoles et forêts, Énergies renouvelables et actifs réels, Crédit et effet de levier, Autres formes documentées. Une fiche par exécution, sourcée sur des sites officiels (AMF, impots.gouv.fr, service-public.gouv.fr…), avec les mêmes rubriques que les fiches existantes.
5. [x] **Exporter et importer ses données locales** : fait le 2026-10-30, voir « Fait ».
6. [~] **Accessibilité** (étape 1 faite le 2026-10-29 : contrastes, tableaux, en-têtes, test automatisé). Étape 2 faite le 2026-10-29 (graphiques). Étape 3 faite le 2026-10-30 (annonce des résultats). Étape suivante : libellés des champs, ordre de tabulation.
7. [ ] **Relecture éditoriale d'ensemble.** Repérer les doublons et contradictions entre guides, fiches et simulateurs (par exemple le guide et le simulateur sur la règle de 72), harmoniser le vocabulaire et les liens, raccourcir ce qui se répète.
8. [ ] **Identité visuelle (propriétaire).** Revoir l'esthétique d'ensemble : palette, typographie (polices système), échelle d'espacements, cartes, boutons, en-tête, pied de page, graphiques. Une refonte cohérente par petites étapes, page par page, en gardant les contrastes accessibles. Captures avant et après dans chaque pull request.
9. [~] **Vulgarisation (propriétaire).** (étapes 1 à 4 faites le 2026-10-29 : 10 simulateurs ; étape 5 le 2026-10-30 : intérêts composés, 8 onglets ; étape 6 le 2026-10-30 : budget ; restent patrimoine, entreprise, dettes, frais, inflation, portefeuille) Réécrire en langage simple, page par page en commençant par les plus visitées (accueil, simulateurs principaux, guides d'entrée) : phrases courtes, jargon expliqué, exemple concret, phrase de synthèse sous chaque résultat de simulateur. Sans changer aucun chiffre ni règle.
10. [ ] **Illustrations maison (propriétaire).** Des images créées par la tâche elle-même, en SVG écrit à la main, pour rendre le site plus agréable et plus facile à comprendre :
   - **schémas explicatifs** qui vulgarisent une notion (intérêts composés, amortissement d'un crédit, effet de levier, diversification, inflation) : priorité, car ils aident à comprendre ;
   - **icônes** cohérentes pour les thèmes de simulateurs et les familles d'investissement ;
   - **illustrations d'en-tête** sobres pour l'accueil, les guides et les rubriques.
   Règles : un seul style pour tout le site (traits, arrondis, palette tirée des variables CSS pour suivre le thème) ; fichiers légers (moins de 15 ko chacun) dans `src/assets/illustrations/` ou en composants ; texte alternatif utile pour les schémas, `aria-hidden` pour les images décoratives ; lisibles à 375 px. Un schéma qui montre des chiffres doit être exact, ou marqué « illustration » s'il est seulement indicatif ; aucune donnée inventée présentée comme réelle. Pas d'image tirée d'une banque d'images ni d'un service externe. Quelques images utiles par exécution, jamais une image sur chaque page par principe ; ne pas allonger les pages sans raison.
11. [ ] **Test de fumée dans l'intégration continue.** Chaque page pré-rendue se charge sans erreur JavaScript, à 1280 px et 375 px, sans débordement horizontal.

## Fait

(Les chantiers terminés sont déplacés ici avec la date et le numéro de pull request.)

- [~] **Vulgarisation, étape 6** (2026-10-30) : phrase « Concrètement » (`budgetTakeaway`, testée contre `analyzeBudget` et `catchUp`) sous les résultats du simulateur de budget, premier outil du débutant : sur 100 € de revenu, part des besoins, des envies et de l'épargne ; revenu non affecté ou dépassement ; effort mensuel pour le taux visé. Aucun chiffre réglementaire ni nouveau (le repère 50 / 30 / 20 existait déjà). Hauteur de `/simulateurs/budget/` : 375 px 4 344 → 4 558 px ; 1280 px 2 153 → 2 270 px. Reste : patrimoine, entreprise, dettes, frais, inflation, portefeuille, puis les guides.

- [~] **Accessibilité, étape 3** (2026-10-30) : la phrase « Concrètement » (11 simulateurs, 8 onglets d'intérêts composés) est une zone de statut (`role="status"`, lue en entier) : un lecteur d'écran annonce le nouveau résultat quand les champs changent. Aucun changement visible ni texte modifié. Reste : libellés des champs, ordre de tabulation.

- [x] **Comparateur lisible sur mobile** (2026-10-30) : sous 700 px, le tableau de comparaison est empilé (un bloc par critère, le nom du placement devant chaque valeur, liens vers les fiches en tête) au lieu de défiler latéralement ; CSS seul, aucun texte ni chiffre modifié. Hauteur de `/comparateur/` : 375 px 5 488 → 6 406 px (le contenu qui était caché à droite est désormais visible) ; 1280 px 2 838 px inchangé. Reste : replier Avantages et Inconvénients sur mobile.

- [x] **Méthodologie : formules repliées** (2026-10-30) : tous les blocs de formules de `/methodologie/` sont repliables (`Fold`), le contenu reste dans le HTML ; aucun texte ni chiffre modifié. Hauteur : 375 px 14 302 → 5 006 px ; 1280 px → 3 774 px.

- [~] **Illustrations maison, étape 8** (2026-10-30) : schéma « escalier » (`SchemaEscalier`) en tête du guide « Par où commencer » : les cinq étapes numérotées, reprises des titres du guide (testé, aucun chiffre ajouté), titres de section numérotés. Hauteur du guide : 375 px 4 004 → 4 252 px ; 1280 px 2 568 → 2 898 px. Reste : en-têtes de rubriques.

- [~] **Vulgarisation, étape 5** (2026-10-30) : phrases « Concrètement » (`src/lib/takeaways.ts`, testées contre les fonctions de calcul) sous les résultats des 8 onglets de `/simulateurs/interets-composes/` ; elles reformulent les chiffres affichés (sans aucun chiffre réglementaire ni nouveau) ; espace insécable avant le « : » du titre. Hauteur à 375 px : +162 à +235 px selon l'onglet (3 524 → 3 735 px pour « Combien placer », 3 914 → 4 116 px pour « Simples ou composés ») ; à 1280 px : 0 à +130 px (le formulaire est plus haut que les résultats sur la plupart des onglets). Reste : patrimoine, entreprise, budget, dettes, frais, inflation, portefeuille, puis les guides.

- [x] **Typographie : plus de « ? » orphelin** (2026-10-30) : `text-wrap: balance` sur les titres et `text-wrap: pretty` sur les paragraphes et listes (`src/styles.css`) ; aucun texte ni chiffre modifié. Hauteurs inchangées : `/guides/` 375 px 4 260 px, 1280 px 2 094 px ; accueil 6 605 / 3 189 px ; `/simulateurs/` 4 254 / 2 988 px ; `/encyclopedie/` 5 813 / 3 528 px.

- [~] **Illustrations maison, étape 7** (2026-10-30) : icônes SVG `SimThemeIcon` pour les six thèmes de simulateurs (même trait et même grille que `FamilyIcon`), dans les boutons de thème et les titres de rubrique (titres : écran large seulement) ; rangées de simulateurs sur deux colonnes dès 900 px. Aucun chiffre ni texte modifié. Hauteur de `/simulateurs/` : 1280 px 3 146 → 2 988 px ; 375 px 4 202 → 4 254 px. Reste : en-têtes.

- [x] **Regroupement des simulateurs d'intérêts composés, étape 2** (2026-10-30) : quatre onglets ajoutés à `/simulateurs/interets-composes/` (simples ou composés, coût d'attendre, épargne qui augmente, taux annuel → mensuel), soit 8 onglets ; calculs, tests et clés d'enregistrement locaux inchangés ; FAQ affichée par onglet (`interetsComposesFaq`). Les 4 anciennes adresses restent valides (page de renvoi pré-rendue `noindex`, canonique vers la nouvelle page, redirection vers le bon onglet, hors plan du site et flux). Hauteur des onglets : 1 797 à 2 312 px (1280 px) et 3 381 à 4 032 px (375 px) ; catalogue `/simulateurs/` : 375 px 4 589 → 4 202 px ; 1280 px 3 469 → 3 146 px.

- [x] **Exporter et importer ses données locales** (2026-10-30) : sur la page Confidentialité, boutons « Exporter mes données » (fichier JSON téléchargé), « Importer un fichier » et « Effacer » ; le fichier est validé avant import (format, version, noms de données, 2 Mo maximum) par `parseImport` (`src/lib/storage.ts`, testé) ; rien n'est envoyé à un serveur. Parcours vérifié avec Playwright (export, effacement, import, refus d'un fichier étranger). Hauteur de `/confidentialite/` hors messages : 375 px 3 331 → environ 3 600 px ; 1280 px 2 119 → environ 2 250 px.

- [x] **Bogue : débordement horizontal du simulateur de portefeuille sur mobile** (2026-10-29) : le texte réservé aux lecteurs d'écran (`.sr-only`, position absolue) ajouté dans les en-têtes vides du tableau défilant échappait à son cadre et élargissait la page à 1 000 px à 375 px ; `.table-wrap` devient `position: relative`, avec un test. Audit des 81 pages à 375 et 1280 px : plus aucun débordement ni erreur de console. Hauteurs inchangées (portefeuille 3 543 px à 375 px).

- [~] **Vulgarisation, étape 4** (2026-10-29) : phrase « Concrètement » (`rentalTakeaway`, testée contre `rentalAnalysis` et `rentalProjection`) sous les résultats du calculateur immobilier locatif : rendement net, flux mensuel avant et après impôt (« il faut sortir X € de votre poche »), patrimoine à l'horizon avec mise en garde sur les hypothèses ; aucun chiffre réglementaire ni nouveau. Hauteur à 375 px : 6 819 → 7 224 px ; à 1280 px : 3 053 → 3 246 px. Reste : patrimoine, entreprise, simulateurs à onglets, puis les guides.

- [~] **Alléger les pages de simulateur, étape 3** (2026-10-29) : tableaux annuels des simulateurs patrimoine et entreprise repliés (`Fold`), notes de conventions incluses ; aucun chiffre ni texte réglementaire modifié. Hauteur à 375 px : patrimoine 5 656 → 4 291 px, entreprise 5 573 → 5 185 px ; à 1280 px : 3 459 → 2 164 px et 2 809 → 2 466 px.

- [~] **Illustrations maison, étape 6** (2026-10-29) : schéma « effet de levier » (`SchemaLevier`) dans le guide « investir à crédit » : première année du bien fictif de 200 000 € (20 000 € d'apport, 3,5 % sur 20 ans) avec loyers nets de 5 % ou 3 % du prix ; intérêts, reste (3 801 €, 19 % de l'apport) ou manque (199 €) calculés et testés contre les chiffres du guide. Les deux schémas du guide sont placés après le paragraphe qu'ils illustrent. Hauteur du guide : 375 px 4 149 → 4 670 px ; 1280 px 2 885 → 3 403 px. Reste : icônes des thèmes de simulateurs ; en-têtes.

- [x] **Regroupement des simulateurs de crédit** (2026-10-29) : page `/simulateurs/comparer-des-credits/` à quatre onglets (quelle durée, quel TAEG, in fine ou amortissable, renégocier), calculs et tests inchangés, enregistrements locaux conservés (mêmes clés), FAQ propre à l'onglet affiché. Les 4 anciennes adresses restent valides (page de renvoi pré-rendue `noindex`, canonique vers la nouvelle page, redirection vers le bon onglet, hors plan du site et flux). `credit` reste le calculateur principal. Hauteur : 4 pages de 1 767 à 2 246 px à 1280 px et de 3 428 à 3 893 px à 375 px → 1 page de 2 068 à 2 302 px et de 3 603 à 4 068 px selon l'onglet.

- [~] **Vulgarisation, étape 3** (2026-10-29) : phrases « Concrètement » (`src/lib/takeaways.ts`, testées contre les fonctions de calcul) sous les résultats de retraits réguliers, d'épargne de précaution et de « rembourser ou investir » ; elles reformulent les chiffres affichés, sans aucun chiffre réglementaire ni nouveau. Hauteur à 375 px : retraits 3 228 → 3 414 px, précaution 5 104 → 5 294 px, rembourser 4 010 → 4 298 px ; à 1280 px : 1 612 → 1 725, 2 726 → 2 842, 1 868 → 2 033 px. Reste : immobilier, patrimoine, entreprise, puis les guides.

- [~] **Accessibilité, étape 2** (2026-10-29) : chaque `LineChart` (15 pages) porte un résumé lu par les lecteurs d'écran (début, fin et maximum de chaque courbe, `src/lib/chartSummary.ts`, testé) et un tableau complet de ses valeurs masqué visuellement. Aucun changement visible : hauteurs de page inchangées (crédit 4 572 px à 375 px, 2 856 px à 1280 px). Reste : annonces des résultats, libellés des champs, ordre de tabulation.

- [~] **Illustrations maison, étape 5** (2026-10-29) : icônes SVG `FamilyIcon` pour les 20 familles d'investissement (même grille 48 × 48 et même trait que `SituationIcon`), affichées sur les cartes de l'accueil ; la case grise vide de la grille est supprimée (cartes séparées), l'effectif « N fiches » est masqué sur mobile. Hauteur de l'accueil : 375 px 6 833 → 6 605 px ; 1280 px 3 121 → 3 189 px. Reste : icônes des thèmes de simulateurs ; en-têtes ; schéma effet de levier.

- [x] **Guides par parcours** (2026-10-29) : la page « Guides » regroupe les 19 guides en quatre parcours (Pour démarrer, Comprendre les mécanismes, Choisir ses placements, Immobilier et crédit ; `guideGroups`, testé : chaque guide dans un seul groupe), deux colonnes sur écran large, résumés limités à deux lignes sur mobile ; « Autres guides » en bas de chaque guide propose d'abord le même groupe (`otherGuides`). Hauteur de `/guides/` : 375 px 4 411 → 4 260 px ; 1280 px 2 254 → 2 094 px.

- [~] **Regroupement des simulateurs d'intérêts composés, étape 1** (2026-10-29) : page `/simulateurs/interets-composes/` à quatre onglets (combien placer, en combien de temps, quel rendement, doubler son capital), calculs et tests inchangés, enregistrements locaux conservés, FAQ regroupée (18 questions sans doublon). Les 4 anciennes adresses restent valides : page de renvoi pré-rendue (`noindex`, canonique vers la nouvelle page, hors plan du site et flux) puis redirection vers le bon onglet. Hauteur : 4 pages de 1 672 à 1 707 px à 1280 px et de 3 103 à 3 210 px à 375 px → 1 page de 2 522 px et 4 185 px. Reste : les cinq autres simulateurs de la famille.

- [x] **Catalogue de l'encyclopédie par famille** (2026-10-29) : placements regroupés sous un titre par famille avec leur nombre (le libellé répété sur chaque ligne disparaît), lignes resserrées, filtres risque et liquidité repliés (ouverts s'ils sont actifs). Hauteur de `/encyclopedie/` : 375 px 6 160 → 5 813 px ; 1280 px 3 539 → 3 528 px.

- [~] **Vulgarisation, étape 2** (2026-10-29) : phrases « Concrètement » (`src/lib/takeaways.ts`, testées contre les fonctions de calcul) sous les résultats de l'objectif d'épargne, de louer ou acheter et de l'indépendance financière ; elles reformulent les chiffres affichés, sans aucun chiffre réglementaire ni nouveau. Hauteur à 375 px : objectif 4 238 → 4 452 px, louer ou acheter 4 731 → 4 966 px, indépendance 4 338 → environ 4 560 px ; à 1280 px : 2 716 → 2 833, 2 362 → 2 500, 2 378 → environ 2 520 px. Reste : immobilier, précaution, patrimoine, retraits, puis les guides.

- [~] **Accessibilité, étape 1** (2026-10-29) : `--ink-3` (texte secondaire) assombri de #6b727a à #5f666e (contraste 4,46 → 5,33 sur le fond de page) ; tableaux défilants atteignables au clavier (`tabIndex`) ; en-têtes de colonnes vides remplacés par un texte réservé aux lecteurs d'écran (`.sr-only`) ; titre masqué « Liste des placements » dans l'encyclopédie ; noms de placements du comparateur non colorés (le point seul l'est). Test `src/accessibility.test.ts` (contrastes de la palette, tableaux, en-têtes). Audit axe-core (WCAG 2.1 AA et bonnes pratiques, 87 pages, 375 et 1280 px) : 1 176 éléments en défaut de contraste sur 85 pages avant, aucune violation après. Hauteurs de page inchangées.

- [~] **Catalogue des simulateurs sur mobile** (2026-10-29) : thèmes en boutons d'au moins 44 px de haut avec nombre de simulateurs, descriptions limitées à deux lignes et rangées resserrées sous 600 px. Hauteur de `/simulateurs/` : 375 px 6 023 → 5 170 px ; 1280 px 3 882 → 3 955 px. Reste : catalogue de l'encyclopédie.

- [x] **Fiches : résumé en haut sur mobile** (2026-10-29) : le bloc « En bref » est affiché sous le titre sous 900 px (colonne latérale masquée), avec les boutons Comparer et Simuler ; « Données utilisées » et « Hypothèses » repliées (`Fold`). Hauteur de la fiche PEA : 375 px 4 575 → 4 123 px ; 1280 px 2 936 → 2 757 px.

- [~] **Illustrations maison, étape 4** (2026-10-29) : schéma « diversification » (`SchemaDiversification`) dans le guide « Diversifier ses placements » : part de chaque placement et perte de l’année pour l’exemple fictif déjà présent (actions −20 %, placement prudent +2 % ; 100 % actions : −20 % ; 70/30 : −13,4 %), chiffres calculés et testés. Hauteur du guide : 375 px 4 679 → 5 110 px ; 1280 px 3 050 → 3 472 px. Reste : effet de levier ; icônes des thèmes ; en-têtes.

- [~] **Illustrations maison, étape 3** (2026-10-29) : schéma « inflation » (`SchemaInflation`) dans le guide « Inflation : que devient le pouvoir d’achat de votre épargne ? » : montant affiché et valeur en euros d’aujourd’hui après 10 ans, avec ou sans placement, sur l’exemple fictif déjà présent dans le guide (10 000 €, 2 %, 3 %), chiffres calculés et testés. Hauteur du guide : 375 px 4 543 → 4 992 px ; 1280 px 3 044 → 3 532 px. Reste : diversification, effet de levier ; icônes des thèmes ; en-têtes.

- [~] **Alléger les pages de simulateur, étape 2** (2026-10-29) : sur le crédit, le formulaire ne contient plus que le prêt ; la capacité d'emprunt (repliée) et le remboursement anticipé ont leurs champs à côté de leurs résultats. Mensualité visible à 862 px au lieu de 1 565 px à 375 px ; hauteur à 375 px : 4 718 → 4 572 px ; à 1280 px : 2 494 → 2 856 px.

- [x] **Graphiques lisibles sur mobile** (2026-10-29) : `LineChart` dessine à la largeur réelle du conteneur (mesurée, rendu serveur à 720 px) au lieu d'un dessin 720 px réduit ; légendes à 12 px réelles, repères de l'axe horizontal adaptés à la largeur, hauteur limitée à 240 px sous 480 px. Hauteurs à 375 px : crédit 4 603 → 4 718 px, accueil 6 705 → 6 833 px ; à 1280 px : crédit 2 478 → 2 494 px.

- [~] **Vulgarisation, étape 1** (2026-10-29) : composant `Takeaway` et phrases « Concrètement » (`src/lib/takeaways.ts`, testées) sous les résultats des simulateurs crédit, taux d'endettement et rendement réel : elles reformulent les chiffres calculés, sans aucun chiffre nouveau. Hauteur du crédit à 1280 px : 2 478 px ; à 375 px : 4 603 px (+ environ 170 px). Reste : les autres simulateurs (immobilier, indépendance, précaution, patrimoine…), puis les guides.

- [~] **Illustrations maison, étape 2** (2026-10-29) : schéma « que contient une mensualité » (`SchemaMensualite`) dans le guide « investir à crédit » : à total annuel constant, part d'intérêts et part de capital aux années 1, 10 et 20 de l'exemple fictif du guide (180 000 € à 3,5 % sur 20 ans), chiffres calculés par `amortize` et testés. Hauteur du guide : 375 px 3 640 → 4 094 px ; 1280 px 2 391 → 2 855 px. Reste : diversification, inflation, effet de levier ; icônes des thèmes ; en-têtes.

- [x] **Chargement différé des pages** (2026-10-29) : une page = un fichier JavaScript (`src/routes.tsx`) ; le pré-rendu embarque toutes les pages, le navigateur charge celle de l'adresse avant l'hydratation. JavaScript chargé sur la page crédit : 576 → 295 ko (166 → 96 ko compressé) ; accueil : 576 → 357 ko (166 → 116 ko compressé). Hauteurs de page inchangées.

- [x] **Accueil et parcours** (2026-10-29) : le bloc « Comment fonctionne le site » est remplacé par « Par où commencer ? », quatre cartes (Je débute, J'ai déjà de l'épargne, Je veux acheter, Je prépare ma retraite) avec icônes SVG maison (`SituationIcon`), chacune vers une seule page existante ; sources de l'accueil sur deux colonnes à 375 px. Hauteur de l'accueil : 375 px 6 821 → 6 705 px ; 1280 px 2 990 → 3 028 px.

- [~] **Alléger les pages de simulateur, étape 1** (2026-10-29) : FAQ des 31 simulateurs en questions repliables, tableaux annuels des simulateurs crédit et immobilier repliés (composant `Fold`). Hauteur à 375 px : crédit 5 922 → 4 413 px, immobilier 8 537 → 6 705 px, budget 4 777 → 4 344 px ; à 1280 px : crédit 3 555 → 2 361 px, immobilier 4 405 → 3 053 px.

- [~] **Illustrations maison, étape 1** (2026-10-28) : premier schéma SVG, « intérêts simples ou composés », dans le guide « Comprendre les intérêts composés » (`src/components/Illustrations.tsx`, chiffres calculés et testés). Reste à illustrer : amortissement d'un crédit, effet de levier, diversification, inflation ; icônes des thèmes ; en-têtes.

- [x] **Catalogue des simulateurs par thème et accueil allégé** (2026-10-28, #55) : simulateurs classés en six thèmes avec filtre ; accueil limité à six simulateurs et six guides, familles sans fiche masquées. Hauteur de l'accueil : 5 755 → 2 990 px à 1280 px, 10 988 → 6 821 px à 375 px.
