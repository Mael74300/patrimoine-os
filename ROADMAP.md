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

- 2026-10-28 (propriétaire) : site jugé encombré et illisible ; trop de simulateurs qui se recoupent.
- 2026-10-28 (propriétaire) : tout améliorer, y compris l'esthétique et la vulgarisation pour le grand public.
- 2026-10-28 (propriétaire) : ajouter des images créées par la tâche elle-même.
- 2026-10-28 : aucune illustration sur le site ; les guides sont du texte seul, notamment « Comprendre les intérêts composés » (débutant : notion abstraite sans schéma). Schéma ajouté (voir « Fait »).
- 2026-10-29 : pages de simulateur très longues sur mobile (crédit 5 922 px, immobilier 8 537 px) à cause de la FAQ et des tableaux annuels toujours dépliés ; FAQ et tableaux de crédit et d'immobilier repliés (voir « Fait »). Restent les autres tableaux (entreprise…).
- 2026-10-29 : l'accueil n'orientait pas selon la situation du visiteur (débutant, épargnant, futur acheteur, retraite) ; bloc « Par où commencer ? » ajouté (voir « Fait »). Les familles sans icône ni illustration restent à traiter (chantier Illustrations).
- 2026-10-29 : les 31 simulateurs se recoupent encore (chantiers 1 et 2).

## À faire

1. [ ] **Regrouper les simulateurs d'intérêts composés.** `doubler-son-capital-regle-de-72`, `duree-pour-atteindre-un-capital`, `capital-a-placer-aujourd-hui`, `rendement-necessaire-pour-atteindre-un-objectif`, `interets-simples-ou-composes`, `convertir-un-taux-annuel-en-taux-mensuel`, `augmenter-son-epargne-chaque-annee`, `cout-d-attendre-pour-epargner` et `objectif-epargne` répondent à des variantes d'une même question. Les réunir en un simulateur « Intérêts composés » à onglets (quelle valeur chercher : capital final, durée, versement, capital de départ, rendement), en gardant les calculs et tests existants. Les anciennes adresses restent valides : page courte pré-rendue qui renvoie vers le bon onglet (lien visible, `<link rel="canonical">` vers la nouvelle page, `noindex`), retirée du plan du site et du flux. Un regroupement par exécution si nécessaire.
2. [ ] **Regrouper les simulateurs de crédit.** `credit`, `duree-du-credit-mensualite-et-cout-total`, `credit-in-fine-ou-amortissable`, `renegocier-son-credit-gain-et-point-mort`, `taeg` : une page crédit à onglets, même méthode que le chantier 1.
3. [~] **Alléger les pages de simulateur** (étape 1 faite le 2026-10-29 : FAQ et tableaux de crédit et d'immobilier repliés). Sur chaque page : formulaire et résultats principaux en premier ; FAQ, sources, hypothèses détaillées et simulations enregistrées dans des blocs repliables ; supprimer les textes répétés d'une page à l'autre. Mesurer la hauteur avant et après.
4. [ ] **Chargement différé des pages.** Le script principal fait 573 kB (168 kB compressé) car tous les simulateurs sont dans un seul fichier. Passer les pages en `React.lazy` par route, sans casser le pré-rendu ni l'hydratation ; mesurer avant et après dans la pull request.
5. [ ] **Fiches des familles vides.** Aucune fiche pour : Actifs de collection, Terres agricoles et forêts, Énergies renouvelables et actifs réels, Crédit et effet de levier, Autres formes documentées. Une fiche par exécution, sourcée sur des sites officiels (AMF, impots.gouv.fr, service-public.gouv.fr…), avec les mêmes rubriques que les fiches existantes.
6. [ ] **Exporter et importer ses données locales.** Fichier JSON téléchargé et rechargé par l'utilisateur, pour passer d'un appareil à l'autre, sans aucun envoi à un serveur ; validation du fichier importé ; tests.
7. [ ] **Accessibilité.** Audit des pages principales : contrastes, ordre de tabulation, focus visible, libellés des champs, alternative textuelle ou tableau pour chaque graphique, annonces des résultats aux lecteurs d'écran. Corriger, puis ajouter un test automatisé qui empêche les régressions.
8. [ ] **Relecture éditoriale d'ensemble.** Repérer les doublons et contradictions entre guides, fiches et simulateurs (par exemple le guide et le simulateur sur la règle de 72), harmoniser le vocabulaire et les liens, raccourcir ce qui se répète.
9. [ ] **Identité visuelle (propriétaire).** Revoir l'esthétique d'ensemble : palette, typographie (polices système), échelle d'espacements, cartes, boutons, en-tête, pied de page, graphiques. Une refonte cohérente par petites étapes, page par page, en gardant les contrastes accessibles. Captures avant et après dans chaque pull request.
10. [ ] **Vulgarisation (propriétaire).** Réécrire en langage simple, page par page en commençant par les plus visitées (accueil, simulateurs principaux, guides d'entrée) : phrases courtes, jargon expliqué, exemple concret, phrase de synthèse sous chaque résultat de simulateur. Sans changer aucun chiffre ni règle.
11. [ ] **Illustrations maison (propriétaire).** Des images créées par la tâche elle-même, en SVG écrit à la main, pour rendre le site plus agréable et plus facile à comprendre :
   - **schémas explicatifs** qui vulgarisent une notion (intérêts composés, amortissement d'un crédit, effet de levier, diversification, inflation) : priorité, car ils aident à comprendre ;
   - **icônes** cohérentes pour les thèmes de simulateurs et les familles d'investissement ;
   - **illustrations d'en-tête** sobres pour l'accueil, les guides et les rubriques.
   Règles : un seul style pour tout le site (traits, arrondis, palette tirée des variables CSS pour suivre le thème) ; fichiers légers (moins de 15 ko chacun) dans `src/assets/illustrations/` ou en composants ; texte alternatif utile pour les schémas, `aria-hidden` pour les images décoratives ; lisibles à 375 px. Un schéma qui montre des chiffres doit être exact, ou marqué « illustration » s'il est seulement indicatif ; aucune donnée inventée présentée comme réelle. Pas d'image tirée d'une banque d'images ni d'un service externe. Quelques images utiles par exécution, jamais une image sur chaque page par principe ; ne pas allonger les pages sans raison.
12. [ ] **Test de fumée dans l'intégration continue.** Chaque page pré-rendue se charge sans erreur JavaScript, à 1280 px et 375 px, sans débordement horizontal.

## Fait


(Les chantiers terminés sont déplacés ici avec la date et le numéro de pull request.)

- [x] **Accueil et parcours** (2026-10-29) : le bloc « Comment fonctionne le site » est remplacé par « Par où commencer ? », quatre cartes (Je débute, J'ai déjà de l'épargne, Je veux acheter, Je prépare ma retraite) avec icônes SVG maison (`SituationIcon`), chacune vers une seule page existante ; sources de l'accueil sur deux colonnes à 375 px. Hauteur de l'accueil : 375 px 6 821 → 6 705 px ; 1280 px 2 990 → 3 028 px.

- [~] **Alléger les pages de simulateur, étape 1** (2026-10-29) : FAQ des 31 simulateurs en questions repliables, tableaux annuels des simulateurs crédit et immobilier repliés (composant `Fold`). Hauteur à 375 px : crédit 5 922 → 4 413 px, immobilier 8 537 → 6 705 px, budget 4 777 → 4 344 px ; à 1280 px : crédit 3 555 → 2 361 px, immobilier 4 405 → 3 053 px.

- [~] **Illustrations maison, étape 1** (2026-10-28) : premier schéma SVG, « intérêts simples ou composés », dans le guide « Comprendre les intérêts composés » (`src/components/Illustrations.tsx`, chiffres calculés et testés). Reste à illustrer : amortissement d'un crédit, effet de levier, diversification, inflation ; icônes des thèmes ; en-têtes.

- [x] **Catalogue des simulateurs par thème et accueil allégé** (2026-10-28, #55) : simulateurs classés en six thèmes avec filtre ; accueil limité à six simulateurs et six guides, familles sans fiche masquées. Hauteur de l'accueil : 5 755 → 2 990 px à 1280 px, 10 988 → 6 821 px à 375 px.
