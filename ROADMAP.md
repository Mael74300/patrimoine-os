# Feuille de route

Liste de travail vivante de la tâche automatique et des contributions manuelles.

**Fonctionnement.** À chaque exécution, la tâche commence par un audit du site du point de vue d'un utilisateur (voir « Audit utilisateur » ci-dessous). Elle met à jour la section « Constats », réordonne les chantiers selon ce qui apporte le plus aux utilisateurs, puis traite le chantier le plus utile. Dans la pull request, elle explique pourquoi ce chantier passe en premier.

**Le propriétaire a toujours le dernier mot.** Un chantier marqué « (propriétaire) » garde sa place et ne peut être ni retiré ni déclassé par la tâche. Le propriétaire peut ajouter, supprimer ou réordonner des chantiers à tout moment.

## Principes

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
- de la lenteur.

Pour chaque constat : le visiteur concerné, la page, et ce qui le gêne.

Choix du chantier : privilégier ce qui touche le plus de visiteurs et les pages les plus importantes (accueil, simulateurs principaux, guides d'entrée), à effort raisonnable pour une exécution. Une amélioration visible et utile vaut mieux qu'un ajout.

## Constats

Section réécrite à chaque audit, sans s'allonger : au plus 10 constats, les plus importants, datés.

- 2026-10-28 (propriétaire) : site jugé encombré et illisible ; trop de simulateurs qui se recoupent.

## À faire

1. [ ] **Regrouper les simulateurs d'intérêts composés.** `doubler-son-capital-regle-de-72`, `duree-pour-atteindre-un-capital`, `capital-a-placer-aujourd-hui`, `rendement-necessaire-pour-atteindre-un-objectif`, `interets-simples-ou-composes`, `convertir-un-taux-annuel-en-taux-mensuel`, `augmenter-son-epargne-chaque-annee`, `cout-d-attendre-pour-epargner` et `objectif-epargne` répondent à des variantes d'une même question. Les réunir en un simulateur « Intérêts composés » à onglets (quelle valeur chercher : capital final, durée, versement, capital de départ, rendement), en gardant les calculs et tests existants. Les anciennes adresses restent valides : page courte pré-rendue qui renvoie vers le bon onglet (lien visible, `<link rel="canonical">` vers la nouvelle page, `noindex`), retirée du plan du site et du flux. Un regroupement par exécution si nécessaire.
2. [ ] **Regrouper les simulateurs de crédit.** `credit`, `duree-du-credit-mensualite-et-cout-total`, `credit-in-fine-ou-amortissable`, `renegocier-son-credit-gain-et-point-mort`, `taeg` : une page crédit à onglets, même méthode que le chantier 1.
3. [ ] **Alléger les pages de simulateur.** Sur chaque page : formulaire et résultats principaux en premier ; FAQ, sources, hypothèses détaillées et simulations enregistrées dans des blocs repliables ; supprimer les textes répétés d'une page à l'autre. Mesurer la hauteur avant et après.
4. [ ] **Chargement différé des pages.** Le script principal fait 573 kB (168 kB compressé) car tous les simulateurs sont dans un seul fichier. Passer les pages en `React.lazy` par route, sans casser le pré-rendu ni l'hydratation ; mesurer avant et après dans la pull request.
5. [ ] **Fiches des familles vides.** Aucune fiche pour : Actifs de collection, Terres agricoles et forêts, Énergies renouvelables et actifs réels, Crédit et effet de levier, Autres formes documentées. Une fiche par exécution, sourcée sur des sites officiels (AMF, impots.gouv.fr, service-public.gouv.fr…), avec les mêmes rubriques que les fiches existantes.
6. [ ] **Exporter et importer ses données locales.** Fichier JSON téléchargé et rechargé par l'utilisateur, pour passer d'un appareil à l'autre, sans aucun envoi à un serveur ; validation du fichier importé ; tests.
7. [ ] **Accessibilité.** Audit des pages principales : contrastes, ordre de tabulation, focus visible, libellés des champs, alternative textuelle ou tableau pour chaque graphique, annonces des résultats aux lecteurs d'écran. Corriger, puis ajouter un test automatisé qui empêche les régressions.
8. [ ] **Relecture éditoriale d'ensemble.** Repérer les doublons et contradictions entre guides, fiches et simulateurs (par exemple le guide et le simulateur sur la règle de 72), harmoniser le vocabulaire et les liens, raccourcir ce qui se répète.
9. [ ] **Accueil et parcours.** Une entrée « Par où commencer ? » selon la situation (je débute, j'ai une épargne, je veux acheter, je prépare ma retraite), qui oriente vers trois ou quatre pages existantes au plus, sans allonger l'accueil.
10. [ ] **Test de fumée dans l'intégration continue.** Chaque page pré-rendue se charge sans erreur JavaScript, à 1280 px et 375 px, sans débordement horizontal.

## Fait

(Les chantiers terminés sont déplacés ici avec la date et le numéro de pull request.)

- [x] **Catalogue des simulateurs par thème et accueil allégé** (2026-10-28, #55) : simulateurs classés en six thèmes avec filtre ; accueil limité à six simulateurs et six guides, familles sans fiche masquées. Hauteur de l'accueil : 5 755 → 2 990 px à 1280 px, 10 988 → 6 821 px à 375 px.
