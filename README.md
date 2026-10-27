# Patrimoine OS

Plateforme française et gratuite consacrée à la construction du patrimoine : encyclopédie des investissements, comparateurs, quatorze simulateurs et guides pédagogiques. Site statique pré-rendu, sans backend, sans compte, sans cookie ni traceur. Coût d'exploitation : 0 €.

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
| Portefeuille, comparateur de fiches | Allocation, frais pondérés, rééquilibrage ; jusqu'à 3 fiches côte à côte |
| Guides | 13 guides, dont 10 pages répondant à une intention de recherche précise (patrimoine net, rentabilité locative, PEA, frais…) |
| Liens internes | Chaque fiche et chaque guide renvoie vers ses simulateurs liés (table `src/lib/relatedSims.ts`, cohérence testée : cibles existantes, aucun simulateur sans lien entrant) |
| Glossaire | 20 notions expliquées, avec liens vers simulateurs, fiches et guides (liens vérifiés par les tests) |
| Simulations locales | Chaque simulateur permet d'enregistrer, d'exporter et d'importer ses simulations en fichier JSON (local, rien n'est envoyé) |
| Légal | Politique de confidentialité, mentions légales, effacement des données locales |

## Architecture

- **Vite + React + TypeScript**, CSS natif, graphiques SVG sans dépendance.
- **Moteur de calcul** : un module par famille dans `src/lib/calc/` (`growth`, `loan`, `rental`, `compare`, `portfolio`, `business`, `fire`, `precaution`, `budget`, `fees`, `prepayVsInvest`, `purchasingPower`, `debtRatio`, `savingsGoal`, `networth`, `format`), fonctions pures et déterministes. Conventions dans `common.ts` et sur la page « Méthode ». **186 tests** : formules, exemples connus, valeurs nulles, négatives et durées nulles, chaque exemple chiffré cité dans les fiches et guides, métadonnées SEO, contrôle SEO, scripts de surveillance.
- **Pré-rendu statique** (`scripts/prerender.mjs`) : 64 pages HTML complètes avec URL lisibles (`/encyclopedie/pea/`), titre, description, URL canonique, Open Graph, données structurées (Article, BreadcrumbList, WebApplication, FAQPage sur les guides qui comportent des questions fréquentes), plus `404.html`, `sitemap.xml`, `feed.xml` (flux Atom des nouveautés, référencé dans le `<head>`) et `robots.txt`. Le navigateur reprend ensuite la page (hydratation) pour l'interactivité.
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

Tout est regroupé dans un ticket GitHub « maintenance ». **Aucune fiche n'est modifiée automatiquement** : après relecture, vous corrigez la fiche, mettez à jour `verifiedOn` et `nextReview`, puis lancez `npm run sources:accept`.

Calendrier indicatif : taux des livrets au 1er février et au 1er août ; loi de finances et de financement de la Sécurité sociale fin décembre. Les `nextReview` des fiches sont réglés en conséquence.

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
