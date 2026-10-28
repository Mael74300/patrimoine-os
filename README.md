# Patrimoine OS

Plateforme française et gratuite consacrée à la construction du patrimoine : encyclopédie des investissements, comparateurs, vingt-neuf simulateurs et guides pédagogiques. Site statique pré-rendu, sans backend, sans compte, sans cookie ni traceur. Coût d'exploitation : 0 €.

## Contenu

| Rubrique | Détail |
|---|---|
| Encyclopédie | 26 fiches générées depuis `src/data/investments.ts`, filtres et recherche. Chaque fiche affiche ses sources, sa date de vérification, la date de validité fiscale, les données utilisées, les hypothèses et la prochaine révision. |
| Simulateur de patrimoine | Capital initial, épargne variable par phases, retraits ponctuels, frais, inflation, fiscalité de sortie, objectif, jusqu'à 3 scénarios comparés |
| Calculateur immobilier | Mensualité, coût du crédit, rendements, flux avant impôt, fiscalité paramétrable (micro-foncier, réel, micro-BIC, LMNP réel), capital restant dû, patrimoine net, scénario défavorable |
| Comparateur ETF / immobilier | Même capital, même effort d'épargne annuel, patrimoine net après frais et impôts de sortie ; base de calcul expliquée sur la page |
| Crédit | Mensualité, intérêts, amortissement, capacité d'emprunt, remboursement anticipé (durée ou mensualité, indemnités plafonnées) |
| Entreprise | CA, marge, charges, rémunération, IS, besoin en fonds de roulement, trésorerie, valorisation, 3 scénarios |
| Indépendance financière | Capital visé selon le taux de retrait, délai, durée du capital en phase de retrait, plusieurs scénarios |
| Épargne de précaution | Montant visé selon la situation professionnelle (repères de 3, 6 ou 9 mois de dépenses), mois couverts, délai et versement nécessaire, répartition sur LEP, Livret A et LDDS dans la limite des plafonds |
| Budget et taux d'épargne | Part du revenu en besoins, envies et épargne, comparaison au repère pédagogique 50 / 30 / 20, effort mensuel pour atteindre un taux d'épargne visé |
| Impact des frais | Trois niveaux de frais annuels à rendement brut et versements identiques : capital final, coût des frais, part des gains absorbée |
| Rembourser ou investir | Remboursement anticipé d'un crédit (mensualité conservée) ou placement de la même somme : patrimoine net à la fin de la durée restante, intérêts économisés, rendement brut d'équilibre |
| Inflation et pouvoir d'achat | Valeur d'une somme inchangée ou placée en euros d'aujourd'hui, montant pour garder le même pouvoir d'achat, rendement réel, durées de perte de moitié et de doublement |
| Taux d'endettement | Taux d'endettement avant/après un projet, repère de 35 % du HCSF (assurance comprise, source et date de vérification), mensualité maximale, revenu minimal, capital empruntable, reste à vivre par personne |
| Objectif d'épargne | Versement mensuel pour atteindre un montant à une échéance (apport, voyage, travaux), total versé, intérêts, effet de la durée et du taux (repère : taux du Livret A issu des données du site) |
| TAEG d’un crédit | TAEG estimé à partir du taux, de l’assurance et des frais payés au départ, écart avec le taux nominal, effet des frais et de l’assurance, coût total (estimation : seul le TAEG de l’offre fait foi) |
| Louer ou acheter | Patrimoine du propriétaire et du locataire à l’horizon choisi, point d’équilibre, effet de la hausse des prix et de la durée de détention (hypothèses saisies uniquement, aucun chiffre réglementaire) |
| Rembourser plusieurs dettes | Avalanche (taux le plus élevé d’abord) ou boule de neige (plus petit solde d’abord) pour un même budget : durée, intérêts, mois de solde de chaque dette, comparaison aux mensualités minimales seules (hypothèses saisies uniquement, aucun chiffre réglementaire) |
| Investir d’un coup ou progressivement | Même capital placé en une fois ou en tranches égales sur plusieurs mois, selon un parcours de prix supposé (régulier, baisse ou hausse pendant l’étalement) : valeur finale et écart (hypothèses saisies uniquement, aucun chiffre réglementaire) |
| Retraits réguliers : durée du capital | Durée avant épuisement d’un capital dont on retire une somme chaque mois (revalorisée), capital restant à l’horizon et retrait mensuel tenable (hypothèses saisies uniquement, aucun chiffre réglementaire) |
| Rendement réel de mon placement | Taux de rendement interne (rendement annuel équivalent) à partir du versement initial, des versements mensuels, de la durée et de la valeur actuelle, comparé au rendement cumulé (montants saisis uniquement, aucun chiffre réglementaire) |
| Coût d’attendre pour épargner | Capital obtenu en épargnant tout de suite ou après un délai (même versement mensuel, même date d’arrivée) et versement mensuel pour rattraper le retard (hypothèses saisies uniquement, aucun chiffre réglementaire) |
| Doubler son capital | Durée pour doubler (ou multiplier) un capital au rendement supposé : calcul exact, règle de 72 et durée en pouvoir d’achat avec inflation (hypothèses saisies uniquement, aucun chiffre réglementaire) |
| Intérêts simples ou composés | Capital et intérêts d’un même capital sans versement en intérêts simples et composés, écart et rapport, tableau année par année (hypothèses saisies uniquement, aucun chiffre réglementaire) |
| Durée pour atteindre un capital | Nombre de mois pour atteindre un capital visé avec un capital de départ, un versement mensuel et un rendement supposé, total versé, part des intérêts, gain de temps (hypothèses saisies uniquement, aucun chiffre réglementaire) |
| Convertir un taux annuel | Taux mensuel (trimestriel, semestriel) équivalent et proportionnel d’un taux annuel saisi, taux nominal équivalent et écart du taux proportionnel (calcul mathématique, aucun chiffre réglementaire) |
| Augmenter son épargne chaque année | Capital avec un versement mensuel constant ou qui augmente d’un pourcentage chaque année, capital en plus et versement constant équivalent (hypothèses saisies uniquement, aucun chiffre réglementaire) |
| Crédit in fine ou amortissable | Sortie mensuelle, épargne à constituer, gains de l’épargne et coût net d’un crédit in fine comparés à un crédit amortissable (hypothèses saisies uniquement, aucun chiffre réglementaire) |
| Renégocier son crédit | Mensualités, intérêts évités, gain net après frais et point mort d’un nouveau prêt sur le capital restant dû (hypothèses saisies uniquement, aucun chiffre réglementaire) |
| Portefeuille, comparateur de fiches | Allocation, frais pondérés, rééquilibrage ; jusqu'à 3 fiches côte à côte |
| Guides | 17 guides, dont 14 pages répondant à une intention de recherche précise (patrimoine net, rentabilité locative, PEA, frais…) |
| Liens internes | Chaque fiche et chaque guide renvoie vers ses simulateurs liés (table `src/lib/relatedSims.ts`, cohérence testée : cibles existantes, aucun simulateur sans lien entrant) |
| Glossaire | 20 notions expliquées, avec liens vers simulateurs, fiches et guides (liens vérifiés par les tests) |
| Simulations locales | Chaque simulateur permet d'enregistrer, d'exporter et d'importer ses simulations en fichier JSON (local, rien n'est envoyé) |
| Légal | Politique de confidentialité, mentions légales, effacement des données locales |

## Architecture

- **Vite + React + TypeScript**, CSS natif, graphiques SVG sans dépendance.
- **Moteur de calcul** : un module par famille dans `src/lib/calc/` (`growth`, `loan`, `rental`, `compare`, `portfolio`, `business`, `fire`, `precaution`, `budget`, `fees`, `prepayVsInvest`, `purchasingPower`, `debtRatio`, `savingsGoal`, `taeg`, `rentVsBuy`, `debtPayoff`, `lumpVsGradual`, `withdrawal`, `performance`, `delay`, `doubling`, `stepUp`, `simpleVsCompound`, `timeToTarget`, `rateConversion`, `loanDuration`, `inFine`, `renegotiation`, `networth`, `format`), fonctions pures et déterministes. Conventions dans `common.ts` et sur la page « Méthode ». **289 tests** : formules, exemples connus, valeurs nulles, négatives et durées nulles, chaque exemple chiffré cité dans les fiches et guides, métadonnées SEO, contrôle SEO, scripts de surveillance.
- **Pré-rendu statique** (`scripts/prerender.mjs`) : 83 pages HTML complètes avec URL lisibles (`/encyclopedie/pea/`), titre, description, URL canonique, Open Graph (image 1200 × 630 propre à chaque page, générée au build sans dépendance par `scripts/lib/ogimage.mjs` dans `dist/og/`), données structurées (Article, BreadcrumbList, WebApplication, FAQPage sur les guides et sur vingt-neuf simulateurs qui comportent des questions fréquentes (`src/data/simFaq.ts`), DefinedTermSet sur le glossaire), plus `404.html`, `sitemap.xml` (date `lastmod` propre à chaque fiche et guide), `feed.xml` (flux Atom des nouveautés, référencé dans le `<head>`) et `robots.txt`. Le navigateur reprend ensuite la page (hydratation) pour l'interactivité.
- **Contrôle SEO** (`scripts/seo-check.mjs`, lancé par `npm run build`, échec en cas d’erreur) : titre et description présents, uniques et de longueur raisonnable, URL canonique, liens internes cassés, pages orphelines, JSON-LD valide.
- **IndexNow** : la clé (non secrète) est publiée à la racine du site (`public/<clé>.txt`) ; après chaque publication, `scripts/indexnow.mjs` envoie les adresses du sitemap à `api.indexnow.org`. L’étape ne peut pas faire échouer le déploiement.
- **Sécurité** : politique de sécurité du contenu (CSP) dans chaque page, aucune ressource tierce, aucun formulaire envoyé, dépendances auditées à chaque construction et mises à jour par Dependabot.
- **Données locales** : saisies et simulations enregistrées dans le `localStorage`, jamais transmises, non synchronisées entre appareils.

## Mise en ligne (une fois, environ 10 minutes)

1. Compléter les mentions légales dans `src/config.ts` (`legal.publisher`, `publicationDirector`, `contact`).
2. Créer un dépôt **public** `patrimoine-os` sur GitHub et y pousser ce dossier :
   ```bash
   git remote add origin https://github.com/<compte>/patrimoine-os.git
   git push -u origin main
   ```
3. Dans le dépôt : **Settings → Pages → Source : GitHub Actions**.

Le workflow `deploy.yml` teste, audite, construit et publie à chaque `push` sur `main`, à l'adresse `https://<compte>.github.io/patrimoine-os/`, sans configuration : l'adresse est déduite du dépôt. Pour un domaine personnalisé plus tard, définir les variables de dépôt `SITE_URL` et `BASE_PATH`.

4. **Une fois, sur votre ordinateur** (accès internet nécessaire) : `npm ci && npm run sources:accept`, puis commit de `monitoring/sources-state.json`. Cela enregistre les empreintes de référence des pages officielles suivies.

## Maintenance automatisée (GitHub Actions, gratuit)

`maintenance.yml`, chaque lundi :

| Contrôle | Résultat |
|---|---|
| Tests et construction | échec signalé |
| Liens cités | liens cassés signalés |
| Pages sources officielles | page modifiée, disparue ou en erreur signalée, avec les fiches concernées. Respect de robots.txt, une requête toutes les 3 secondes, seule une empreinte du texte est conservée (aucune copie) |
| Fiches à réviser | révision dépassée ou dans les 30 jours, éléments « à vérifier » |

Tout est regroupé dans un ticket GitHub « maintenance ». **La surveillance ne modifie aucune fiche** : après relecture, vous corrigez la fiche, mettez à jour `verifiedOn` et `nextReview`, puis lancez `npm run sources:accept`.

Calendrier indicatif : taux des livrets au 1er février et au 1er août ; loi de finances et de financement de la Sécurité sociale fin décembre. Les `nextReview` des fiches sont réglés en conséquence.

## Fusion automatique et exactitude des informations

`auto-merge.yml` fusionne seules les pull requests des tâches automatiques (branches `feature/*` ouvertes par le propriétaire depuis ce dépôt), puis lance la publication. Les autres pull requests ne sont jamais fusionnées automatiquement. Avant toute fusion :

1. **Vérification des informations** (`scripts/check-pr-facts.mjs`) : la description contient une section `## Vérification des informations` qui liste chaque information factuelle ajoutée ou modifiée (taux, plafond, seuil, règle fiscale, date d'effet…), une ligne par information, avec le lien https de la source officielle consultée et la date de consultation. Sinon, elle indique « Aucune information factuelle ajoutée ni modifiée ». Une description incomplète bloque la fusion.
2. Tests, audit des dépendances, construction pré-rendue et contrôle SEO, sur la version fusionnée avec `main`.

Règles d'exactitude pour toute modification, manuelle ou automatique :

- chaque chiffre réglementaire est confirmé sur une source officielle (Service-Public.fr, impots.gouv.fr, Legifrance, Banque de France, AMF, URSSAF…) consultée au moment de la modification, puis daté (`asOf`, `verifiedOn`) ;
- une information qui ne peut pas être confirmée n'est pas publiée comme vérifiée : elle est retirée ou marquée « à vérifier » ;
- un chiffre déjà présent n'est jamais modifié sans source qui confirme la nouvelle valeur ;
- un même chiffre cité à plusieurs endroits reste identique partout (tests de cohérence) ;
- les exemples chiffrés sont marqués « fictif » et recalculés par les tests.

## Commandes

```bash
npm run dev             # développement
npm test                # tests
npm run build           # construction pré-rendue dans dist/
npm run sources:check   # surveillance des sources (réseau requis)
npm run sources:accept  # valider les sources après relecture
npm run review:check    # fiches à réviser
```

## Ajouter une fiche ou un guide

Ajouter un objet dans `src/data/investments.ts` ou `src/data/guides.ts`. La page, la recherche, les filtres, le sitemap et les métadonnées sont générés automatiquement ; les tests vérifient la cohérence (catégorie, alternatives, sources, mention « fictif », unicité des titres).

## Monétisation future (désactivée)

`src/config.ts` : `ads.enabled`, `affiliates` (liens réels uniquement, affichés « Lien commercial » avec `rel="sponsored"`), `premium.enabled`. Rien n'est requis pour que le site fonctionne. Avant d'activer une publicité ou une mesure d'audience déposant des traceurs, ajouter un recueil du consentement et mettre à jour la politique de confidentialité.

## État d'avancement (section 13 du cahier des charges)

| Étape | État |
|---|---|
| 1. Base fonctionnelle | fait |
| 2. Outils interactifs | fait |
| 3. Qualité et contenu | fait ; familles « en préparation » à documenter |
| 4. Automatisation | fait |
| 5. Préparation à la monétisation | emplacements prêts, aucun service intégré |

Pistes suivantes : fiches des familles restantes (collection, terres et forêts, énergie, levier, autres), chargement différé des simulateurs pour alléger la page d'accueil, export/import JSON des simulations entre appareils.

## Avertissement

Informations générales à visée pédagogique, sans conseil en investissement personnalisé. Données réglementaires vérifiées au 10 octobre 2026 ; les éléments non confirmés sont signalés « à vérifier ».
