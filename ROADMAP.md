# Feuille de route

Liste de travail de la tâche automatique et des contributions manuelles. **À chaque exécution, la tâche lit ce fichier, prend le premier chantier non coché de la section « À faire », le fait avancer, puis met ce fichier à jour dans la même pull request** : chantier coché quand il est terminé, ou note d'avancement datée quand il demande plusieurs passages.

Le propriétaire peut réordonner, ajouter ou supprimer des chantiers à tout moment : l'ordre de cette liste fait foi.

## Principes

- **Améliorer l'existant avant d'ajouter.** Le site compte 31 simulateurs, 26 fiches et 19 guides (28 octobre 2026). Plusieurs simulateurs se recoupent. La priorité est la cohérence, la qualité et la navigation, pas le nombre de pages.
- **Pas de nouveau simulateur ni de nouveau guide**, sauf si un chantier de cette liste le demande explicitement. Un nouveau sujet passe d'abord par l'ajout d'un chantier ici, avec la raison (besoin réel, absence de doublon avec l'existant).
- **Pas de pages en masse.** Une page doit apporter quelque chose qu'aucune autre page du site n'apporte déjà.
- **Exactitude avant tout** : voir le README, section « Fusion automatique et exactitude des informations ».
- **Varier.** Si les trois dernières pull requests portent sur le même type de travail, passe au chantier suivant de nature différente.

## À faire

1. [ ] **Regrouper les simulateurs d'intérêts composés.** `doubler-son-capital-regle-de-72`, `duree-pour-atteindre-un-capital`, `capital-a-placer-aujourd-hui`, `rendement-necessaire-pour-atteindre-un-objectif`, `interets-simples-ou-composes`, `convertir-un-taux-annuel-en-taux-mensuel`, `augmenter-son-epargne-chaque-annee`, `cout-d-attendre-pour-epargner` et `objectif-epargne` répondent à des variantes d'une même question. Les réunir en un simulateur « Intérêts composés » à onglets (quelle valeur chercher : capital final, durée, versement, capital de départ, rendement), en gardant les calculs et tests existants. Les anciennes adresses restent valides : page courte pré-rendue qui renvoie vers le bon onglet (lien visible, `<link rel="canonical">` vers la nouvelle page, `noindex`), retirée du plan du site et du flux. Un regroupement par exécution si nécessaire.
2. [ ] **Regrouper les simulateurs de crédit.** `credit`, `duree-du-credit-mensualite-et-cout-total`, `credit-in-fine-ou-amortissable`, `renegocier-son-credit-gain-et-point-mort`, `taeg` : une page crédit à onglets, même méthode que le chantier 1.
3. [ ] **Catalogue des simulateurs par thème.** La page `/simulateurs/` et l'accueil listent tout à plat. Classer par thème (Épargne et placements, Crédit, Immobilier, Budget et dettes, Retraite et indépendance, Entreprise), avec un filtre texte, et une sélection courte sur l'accueil.
4. [ ] **Chargement différé des pages.** Le script principal fait 573 kB (168 kB compressé) car tous les simulateurs sont dans un seul fichier. Passer les pages en `React.lazy` par route, sans casser le pré-rendu ni l'hydratation ; mesurer avant et après dans la pull request.
5. [ ] **Fiches des familles vides.** Aucune fiche pour : Actifs de collection, Terres agricoles et forêts, Énergies renouvelables et actifs réels, Crédit et effet de levier, Autres formes documentées. Une fiche par exécution, sourcée sur des sites officiels (AMF, impots.gouv.fr, service-public.gouv.fr…), avec les mêmes rubriques que les fiches existantes.
6. [ ] **Exporter et importer ses données locales.** Fichier JSON téléchargé et rechargé par l'utilisateur, pour passer d'un appareil à l'autre, sans aucun envoi à un serveur ; validation du fichier importé ; tests.
7. [ ] **Accessibilité.** Audit des pages principales : contrastes, ordre de tabulation, focus visible, libellés des champs, alternative textuelle ou tableau pour chaque graphique, annonces des résultats aux lecteurs d'écran. Corriger, puis ajouter un test automatisé qui empêche les régressions.
8. [ ] **Relecture éditoriale d'ensemble.** Repérer les doublons et contradictions entre guides, fiches et simulateurs (par exemple le guide et le simulateur sur la règle de 72), harmoniser le vocabulaire et les liens, raccourcir ce qui se répète.
9. [ ] **Accueil et parcours.** Une entrée « Par où commencer ? » selon la situation (je débute, j'ai une épargne, je veux acheter, je prépare ma retraite), qui oriente vers trois ou quatre pages existantes au plus.
10. [ ] **Test de fumée dans l'intégration continue.** Chaque page pré-rendue se charge sans erreur JavaScript, à 1280 px et 375 px, sans débordement horizontal.

## Fait

(Les chantiers terminés sont déplacés ici avec la date et le numéro de pull request.)
