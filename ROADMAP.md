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

- **Améliorer l'existant avant d'ajouter.** Le site compte 31 simulateurs, 26 fiches et 19 guides (28 octobre 2026). Plusieurs simulateurs se recoupent. La priorité est la cohérence, la qualité et la navigation, pas le nombre de pages.
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
- 2026-10-29 : les résultats des simulateurs ne sont que des chiffres bruts (débutant : « 92 854 € d'intérêts », et alors ?). Phrase « Concrètement » ajoutée sous les résultats de 6 simulateurs : crédit, endettement, rendement, objectif d'épargne, louer ou acheter, indépendance financière (voir « Fait »). Restent les autres simulateurs (immobilier, précaution, patrimoine, retraits…).
- 2026-10-29 : schémas SVG ajoutés aux guides intérêts composés, investir à crédit, inflation et diversification (voir « Fait ») ; reste sans schéma : effet de levier. Les familles et thèmes sans icône ni illustration restent à traiter.
- 2026-10-29 : pages de simulateur longues sur mobile (FAQ et tableaux annuels) ; repliés pour le crédit et l'immobilier ; la mensualité du crédit remontée. Restent les simulateurs à formulaire long (entreprise, indépendance, patrimoine).
- 2026-10-29 : sur mobile, graphiques et résumé « En bref » des fiches illisibles ou trop bas ; corrigés (voir « Fait »). Catalogue de l'encyclopédie regroupé par famille (6 160 → 5 813 px à 375 px).
- 2026-10-29 : audit d'accessibilité automatisé (87 pages) : contrastes, tableaux au clavier, en-têtes corrigés ; restent les annonces des résultats aux lecteurs d'écran et l'alternative textuelle des graphiques.
- 2026-10-29 : audit automatisé de 87 pages à 375 px : aucun débordement horizontal, aucune erreur de console.

## À faire

1. [ ] **Regrouper les simulateurs d'intérêts composés.** `doubler-son-capital-regle-de-72`, `duree-pour-atteindre-un-capital`, `capital-a-placer-aujourd-hui`, `rendement-necessaire-pour-atteindre-un-objectif`, `interets-simples-ou-composes`, `convertir-un-taux-annuel-en-taux-mensuel`, `augmenter-son-epargne-chaque-annee`, `cout-d-attendre-pour-epargner` et `objectif-epargne` répondent à des variantes d'une même question. Les réunir en un simulateur « Intérêts composés » à onglets (quelle valeur chercher : capital final, durée, versement, capital de départ, rendement), en gardant les calculs et tests existants. Les anciennes adresses restent valides : page courte pré-rendue qui renvoie vers le bon onglet (lien visible, `<link rel="canonical">` vers la nouvelle page, `noindex`), retirée du plan du site et du flux. Un regroupement par exécution si nécessaire.
2. [ ] **Regrouper les simulateurs de crédit.** `credit`, `duree-du-credit-mensualite-et-cout-total`, `credit-in-fine-ou-amortissable`, `renegocier-son-credit-gain-et-point-mort`, `taeg` : une page crédit à onglets, même méthode que le chantier 1.
3. [~] **Alléger les pages de simulateur** (étape 1 faite le 2026-10-29 : FAQ et tableaux de crédit et d'immobilier repliés). Étape 2 faite le 2026-10-29 pour le crédit. Étape suivante : même méthode pour les simulateurs à formulaire long (immobilier, entreprise, indépendance…). Sur chaque page : formulaire et résultats principaux en premier ; FAQ, sources, hypothèses détaillées et simulations enregistrées dans des blocs repliables ; supprimer les textes répétés d'une page à l'autre. Mesurer la hauteur avant et après.
4. [ ] **Fiches des familles vides.** Aucune fiche pour : Actifs de collection, Terres agricoles et forêts, Énergies renouvelables et actifs réels, Crédit et effet de levier, Autres formes documentées. Une fiche par exécution, sourcée sur des sites officiels (AMF, impots.gouv.fr, service-public.gouv.fr…), avec les mêmes rubriques que les fiches existantes.
5. [ ] **Exporter et importer ses données locales.** Fichier JSON téléchargé et rechargé par l'utilisateur, pour passer d'un appareil à l'autre, sans aucun envoi à un serveur ; validation du fichier importé ; tests.
6. [~] **Accessibilité** (étape 1 faite le 2026-10-29 : contrastes, tableaux, en-têtes, test automatisé). Étape suivante : alternative textuelle ou tableau pour chaque graphique, annonces des résultats aux lecteurs d'écran, libellés des champs, ordre de tabulation.
7. [ ] **Relecture éditoriale d'ensemble.** Repérer les doublons et contradictions entre guides, fiches et simulateurs (par exemple le guide et le simulateur sur la règle de 72), harmoniser le vocabulaire et les liens, raccourcir ce qui se répète.
8. [ ] **Identité visuelle (propriétaire).** Revoir l'esthétique d'ensemble : palette, typographie (polices système), échelle d'espacements, cartes, boutons, en-tête, pied de page, graphiques. Une refonte cohérente par petites étapes, page par page, en gardant les contrastes accessibles. Captures avant et après dans chaque pull request.
9. [~] **Vulgarisation (propriétaire).** (étapes 1 et 2 faites le 2026-10-29 : 6 simulateurs) Réécrire en langage simple, page par page en commençant par les plus visitées (accueil, simulateurs principaux, guides d'entrée) : phrases courtes, jargon expliqué, exemple concret, phrase de synthèse sous chaque résultat de simulateur. Sans changer aucun chiffre ni règle.
10. [ ] **Illustrations maison (propriétaire).** Des images créées par la tâche elle-même, en SVG écrit à la main, pour rendre le site plus agréable et plus facile à comprendre :
   - **schémas explicatifs** qui vulgarisent une notion (intérêts composés, amortissement d'un crédit, effet de levier, diversification, inflation) : priorité, car ils aident à comprendre ;
   - **icônes** cohérentes pour les thèmes de simulateurs et les familles d'investissement ;
   - **illustrations d'en-tête** sobres pour l'accueil, les guides et les rubriques.
   Règles : un seul style pour tout le site (traits, arrondis, palette tirée des variables CSS pour suivre le thème) ; fichiers légers (moins de 15 ko chacun) dans `src/assets/illustrations/` ou en composants ; texte alternatif utile pour les schémas, `aria-hidden` pour les images décoratives ; lisibles à 375 px. Un schéma qui montre des chiffres doit être exact, ou marqué « illustration » s'il est seulement indicatif ; aucune donnée inventée présentée comme réelle. Pas d'image tirée d'une banque d'images ni d'un service externe. Quelques images utiles par exécution, jamais une image sur chaque page par principe ; ne pas allonger les pages sans raison.
11. [ ] **Test de fumée dans l'intégration continue.** Chaque page pré-rendue se charge sans erreur JavaScript, à 1280 px et 375 px, sans débordement horizontal.

## Fait

(Les chantiers terminés sont déplacés ici avec la date et le numéro de pull request.)

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
