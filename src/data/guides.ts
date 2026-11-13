import type { Guide, Source } from './types';
import { deepKeepNumbers } from '../lib/nbsp';

const SP = (label: string, id: string): Source => ({ label: `Service-Public.fr — ${label}`, url: `https://www.service-public.fr/particuliers/vosdroits/${id}`, official: true });
const IFP: Source = { label: 'La finance pour tous (IEFP)', url: 'https://www.lafinancepourtous.com', official: true };
const AMF: Source = { label: 'AMF — Espace épargnants', url: 'https://www.amf-france.org/fr/espace-epargnants', official: true };
const ANIL: Source = { label: 'ANIL — Information logement', url: 'https://www.anil.org', official: true };
const IMPOTS: Source = { label: 'impots.gouv.fr — Particuliers', url: 'https://www.impots.gouv.fr/particulier', official: true };
const BDF: Source = { label: 'Banque de France', url: 'https://www.banque-france.fr', official: true };

/**
 * Guides pédagogiques. Chacun répond à une intention de recherche précise,
 * avec un contenu original, des exemples fictifs vérifiés par les tests et des liens internes.
 */
export const guides: Guide[] = deepKeepNumbers<Guide[]>([
  {
    slug: 'types-investissements',
    title: 'Tous les types d’investissements accessibles aux particuliers',
    summary: 'Panorama des familles de placements ouvertes à un particulier en France, classées par risque, horizon et effort.',
    readingMinutes: 6,
    updatedOn: '2026-10-10',
    sections: [
      {
        heading: 'Trois questions pour s’y retrouver',
        body: [
          'Avant de comparer des rendements, situez chaque placement sur trois axes. Quand aurai-je besoin de cet argent ? Quelle baisse temporaire puis-je supporter sans vendre ? Combien de temps suis-je prêt à y consacrer ?',
          'Un livret, un ETF et un appartement locatif ne répondent pas du tout de la même façon à ces questions. C’est pourquoi chaque fiche de l’encyclopédie affiche une note de risque, de liquidité et d’effort.',
        ],
      },
      {
        heading: 'Placement et enveloppe : ne pas confondre',
        body: [
          'Un même ETF peut être logé dans un PEA, un compte-titres, une assurance-vie ou un PER. Le placement détermine le risque ; l’enveloppe détermine la fiscalité, la disponibilité et la transmission. Dans le classement ci-dessous, les enveloppes sont donc à part.',
        ],
      },
      {
        heading: 'Le classement',
        body: ['Choisissez d’abord la durée de votre projet, puis le niveau de risque que vous acceptez. Chaque nom mène à sa fiche, avec fiscalité datée et sources.'],
      },
    ],
    related: ['livret-a', 'etf-monde', 'assurance-vie', 'scpi'],
    sources: [AMF, IFP],
    cta: { to: '/encyclopedie', label: 'Filtrer l’encyclopédie' },
  },
  {
    slug: 'patrimoine-net',
    title: 'Comment calculer son patrimoine net',
    summary: 'La méthode pour additionner ses actifs, retrancher ses dettes et obtenir un chiffre utile, avec un calculateur.',
    readingMinutes: 4,
    updatedOn: '2026-11-13',
    widget: 'patrimoine-net',
    sections: [
      {
        heading: 'La définition',
        body: [
          'Le patrimoine net est la valeur de tout ce que vous possédez, moins tout ce que vous devez. Un ménage propriétaire d’un logement estimé 250 000 € avec 180 000 € de crédit restant dû et 15 000 € d’épargne a un patrimoine net de 85 000 €.',
        ],
      },
      {
        heading: 'Ce qu’il faut compter',
        points: true,
        body: [
          'Comptes et livrets : le solde du jour.',
          'Assurance-vie : la valeur de rachat (l’épargne disponible moins les éventuels frais de retrait), pas la somme versée.',
          'PEA, compte-titres : la valeur actuelle des titres et des fonds, plus les espèces.',
          'Immobilier : le prix de vente estimé aujourd’hui, pas le prix d’achat.',
          'Entreprise, véhicule : seulement à une valeur de revente raisonnable.',
          'Crédits : le capital restant dû (voir le tableau d’amortissement), pas la somme des mensualités restantes, qui inclut des intérêts futurs.',
        ],
      },
      {
        heading: 'Les erreurs fréquentes',
        points: true,
        body: [
          'Oublier les frais de vente : frais et impôts réduisent ce qu’il vous resterait.',
          'Compter un crédit deux fois : déjà déduit de la valeur d’un bien, il ne va pas aussi dans les dettes.',
          'Compter sa retraite : des droits à la retraite ne sont pas un capital disponible.',
          'Changer de méthode : refaites le calcul une ou deux fois par an, de la même façon, pour suivre la tendance.',
        ],
      },
    ],
    related: ['credit-immobilier', 'assurance-vie'],
    sources: [IFP, BDF],
    cta: { to: '/simulateurs/patrimoine', label: 'Projeter mon patrimoine' },
  },
  {
    slug: 'immobilier-ou-etf',
    title: 'Comment comparer immobilier et ETF',
    summary: 'Pourquoi comparer un rendement locatif à la performance d’un ETF est trompeur, et la méthode pour le faire sur une base identique.',
    readingMinutes: 7,
    updatedOn: '2026-10-10',
    sections: [
      {
        heading: 'Pourquoi la comparaison directe est fausse',
        body: [
          'Un rendement locatif brut de 6 % se calcule sur le prix du bien, avant charges, impôts et crédit. La performance d’un ETF se mesure sur la somme investie, frais du fonds déduits. Mettre ces deux chiffres côte à côte compare des grandeurs qui ne sont pas calculées sur la même base.',
          'L’immobilier locatif est presque toujours financé à crédit : le résultat dépend de l’effet de levier, du coût du crédit et de l’effort d’épargne mensuel. Un ETF est généralement acheté comptant.',
        ],
      },
      {
        heading: 'La méthode utilisée par notre comparateur',
        body: [
          'Même capital de départ : l’apport immobilier est investi en ETF dans l’autre scénario.',
          'Même effort d’épargne chaque année : si le bien demande de compléter la mensualité (cash-flow négatif après impôt), la même somme est versée sur les ETF. Si le bien dégage un excédent, il est placé sur un support prudent.',
          'Même horizon, puis comparaison du patrimoine net estimé : valeur du bien moins capital restant dû, frais de revente et impôt sur la plus-value, contre valeur des ETF après imposition des gains.',
        ],
      },
      {
        heading: 'Ce que les chiffres ne disent pas',
        body: [
          'Liquidité : des ETF se vendent en quelques jours, un bien en plusieurs mois. Temps : la gestion locative demande des heures chaque année. Risques : vacance, impayés, travaux et réglementation d’un côté ; baisses de marché parfois supérieures à 30 % de l’autre.',
          'Le résultat dépend surtout de vos hypothèses de rendement et de revalorisation. Testez plusieurs jeux d’hypothèses plutôt que de retenir un seul chiffre.',
        ],
      },
    ],
    related: ['etf-monde', 'location-nue', 'credit-immobilier'],
    sources: [AMF, ANIL],
    cta: { to: '/simulateurs/etf-immobilier', label: 'Ouvrir le comparateur ETF / immobilier' },
  },
  {
    slug: 'investir-a-credit',
    title: 'Comment fonctionne un investissement à crédit',
    summary: 'L’effet de levier expliqué par un exemple chiffré : quand il enrichit, quand il appauvrit, et ce que la banque regarde.',
    readingMinutes: 6,
    updatedOn: '2026-10-10',
    sections: [
      {
        heading: 'Le principe',
        body: [
          'Investir à crédit, c’est acheter un actif avec de l’argent emprunté. Si l’actif rapporte davantage que le coût du crédit, la différence revient à l’emprunteur, en plus du rendement de son apport. Dans le cas contraire, elle est à sa charge.',
        ],
      },
      {
        heading: 'Un exemple fictif',
        body: [
          'Un bien de 200 000 € est acheté avec 20 000 € d’apport et 180 000 € empruntés à 3,5 % sur 20 ans. La première année, les intérêts représentent environ 6 200 €.',
          'S’il rapporte 10 000 € par an nets de charges (5 % de son prix), il reste environ 3 800 € avant impôt, soit près de 19 % de l’apport. S’il ne rapporte que 6 000 € (3 %), il manque environ 200 € pour couvrir les seuls intérêts. Dans les deux cas, il faut aussi rembourser le capital, ce qui pèse sur la trésorerie mensuelle.',
        ],
      },
      {
        heading: 'Les risques',
        body: [
          'Le levier amplifie tout : une vacance prolongée, des travaux imprévus, une hausse de la taxe foncière ou une baisse des prix à la revente pèsent sur l’apport, qui est faible.',
          'En France, les banques appliquent la recommandation du Haut Conseil de stabilité financière : un taux d’effort maximal de 35 % des revenus, assurance comprise, et une durée de 25 ans au plus, sauf dérogations.',
        ],
      },
    ],
    related: ['credit-immobilier', 'location-nue', 'scpi'],
    sources: [ANIL, BDF],
    cta: { to: '/simulateurs/credit', label: 'Calculer une mensualité' },
  },
  {
    slug: 'rentabilite-locative',
    title: 'Comment calculer la rentabilité locative',
    summary: 'Rendement brut, net de charges, après impôt et cash-flow : quatre indicateurs, quatre usages.',
    readingMinutes: 6,
    updatedOn: '2026-11-13',
    sections: [
      {
        heading: 'Le rendement brut',
        body: [
          'C’est le loyer d’une année, hors charges, comparé au prix d’achat. Exemple fictif : un bien de 150 000 € loué 750 € par mois rapporte 9 000 € de loyers par an, soit 6 % de son prix. C’est l’indicateur des annonces : il ignore les frais d’achat, les mois sans locataire, les charges et les impôts.',
        ],
      },
      {
        heading: 'Le rendement net de charges',
        body: [
          'Loyers réellement encaissés (après vacance), moins taxe foncière, charges non récupérables, assurance, gestion et entretien, divisés par le coût total (prix, frais d’acquisition, travaux).',
          'Sur le même exemple fictif, avec 8 % de frais d’acquisition, 10 000 € de travaux, un mois de vacance et environ 2 060 € de charges annuelles, le rendement net tombe à environ 3,6 %.',
        ],
      },
      {
        heading: 'Le cash-flow : ce qui sort de votre poche',
        body: [
          'Le cash-flow, c’est ce qui reste chaque mois une fois tout payé, crédit compris. Négatif, c’est votre effort : la somme à ajouter de votre poche. Avec 150 000 € empruntés à 3,5 % sur 20 ans, assurance emprunteur comprise, l’exemple demande un effort d’environ 390 € par mois avant impôt.',
          'L’impôt s’ajoute ensuite : il dépend du régime (micro-foncier, réel, location meublée) et de votre tranche marginale d’imposition.',
        ],
      },
    ],
    related: ['location-nue', 'lmnp', 'credit-immobilier'],
    sources: [ANIL, IMPOTS],
    cta: { to: '/simulateurs/immobilier', label: 'Calculer ma rentabilité' },
  },
  {
    slug: 'fonctionnement-pea',
    title: 'Comment fonctionne le PEA',
    summary: 'Plafond, règles de retrait, fiscalité et choix des supports du plan d’épargne en actions.',
    readingMinutes: 3,
    updatedOn: '2026-11-13',
    sections: [
      {
        heading: 'Les règles de base',
        points: true,
        body: [
          'Qui peut l’ouvrir : toute personne majeure fiscalement domiciliée en France, avec un seul PEA par personne (dans un couple, chacun le sien).',
          'Combien y verser : jusqu’à 150 000 €, en euros uniquement. Les gains ne comptent pas dans ce plafond.',
          'Le PEA PME-ETI : un second plan, pour les titres de PME et d’entreprises de taille intermédiaire ; les deux plans réunis acceptent au plus 225 000 € de versements.',
          'Ce qu’on peut y mettre : des actions de sociétés ayant leur siège dans l’Union européenne ou l’Espace économique européen, et des fonds ou ETF éligibles, dont certains répliquent des indices mondiaux.',
          'Les frais : courtage et tenue de compte varient fortement d’un établissement à l’autre ; comparez-les avant d’ouvrir.',
        ],
      },
      {
        heading: 'Retraits et fiscalité',
        points: true,
        body: [
          'Tant que l’argent reste dans le plan : les dividendes et les plus-values ne sont pas imposés.',
          'Avant 5 ans : un retrait entraîne en principe la clôture du plan et l’imposition des gains au prélèvement forfaitaire unique (31,4 % en 2026), sauf exceptions (création ou reprise d’entreprise, par exemple).',
          'Après 5 ans : un retrait partiel est possible sans clôturer le plan, et les versements peuvent continuer ; seul un retrait total clôture le plan.',
          'L’impôt après 5 ans : les gains sont exonérés d’impôt sur le revenu ; seuls les prélèvements sociaux restent dus, au taux de 18,6 % en 2026.',
        ],
      },
    ],
    related: ['pea', 'etf-monde', 'compte-titres'],
    sources: [
      SP('PEA', 'F2385'),
      { label: 'impots.gouv.fr — Retraits du PEA', url: 'https://www.impots.gouv.fr/particulier/questions/jai-un-plan-depargne-en-actions-pea-les-retraits-sont-ils-imposables', official: true },
      SP('Prélèvements sociaux', 'F2329'),
    ],
    faq: [
      { q: 'Quel est le plafond de versement du PEA ?', a: 'Les versements, uniquement en euros, sont plafonnés à 150 000 €. Avec un PEA PME-ETI, les versements sur les deux plans réunis ne peuvent pas dépasser 225 000 €.' },
      { q: 'Combien de PEA peut-on détenir ?', a: 'Un seul par personne, à condition d’être majeur et fiscalement domicilié en France. Dans un couple, chacun peut ouvrir le sien.' },
    ],
    cta: { to: '/simulateurs/patrimoine', label: 'Simuler une épargne en PEA' },
  },
  {
    slug: 'comparer-les-frais',
    title: 'Comment comparer les frais d’investissement',
    summary: 'Les différents frais, comment les additionner et pourquoi un écart d’un point pèse lourd sur 25 ans.',
    readingMinutes: 6,
    updatedOn: '2026-10-10',
    sections: [
      {
        heading: 'Les familles de frais',
        body: [
          'Deux sortes de frais s’additionnent : ceux payés une fois, à chaque opération (versement, ordre de bourse, changement de support, retrait), et ceux prélevés chaque année, sur l’enveloppe comme sur chaque fonds.',
          'Où les lire : le document d’informations clés (DIC), obligatoire pour les fonds, indique les coûts des supports ; les frais de l’enveloppe figurent dans les conditions du contrat ou la grille tarifaire.',
        ],
      },
      {
        heading: 'Additionner pour comparer',
        body: [
          'Pour une assurance-vie investie en fonds : frais de gestion du contrat + frais courants du fonds. Pour un PEA : frais courants de l’ETF, plus les frais de courtage rapportés à vos montants investis chaque année.',
          'Comparez toujours le coût total annuel, en pourcentage, à montant et durée identiques.',
        ],
      },
      {
        heading: 'L’effet sur le long terme',
        body: [
          'Exemple fictif : 10 000 € placés 25 ans avec un rendement brut supposé de 6 % deviennent environ 40 800 € avec 0,2 % de frais annuels, mais environ 29 400 € avec 1,5 %. L’écart dépasse le montant investi au départ.',
          'Des frais élevés peuvent se justifier par un service réel, comme une gestion conseillée. Ils doivent alors être connus et acceptés.',
        ],
      },
    ],
    related: ['etf-monde', 'unites-de-compte', 'assurance-vie'],
    sources: [AMF, IFP],
    cta: { to: '/comparateur', label: 'Comparer des placements' },
  },
  {
    slug: 'epargne-limitee',
    title: 'Construire un patrimoine avec une épargne limitée',
    summary: 'Les leviers qui comptent vraiment quand on ne peut épargner que quelques dizaines d’euros par mois.',
    readingMinutes: 6,
    updatedOn: '2026-11-11',
    sections: [
      {
        heading: 'Commencer petit, mais commencer',
        body: [
          'Exemple fictif : 50 € par mois pendant 30 ans, avec un rendement supposé de 4 %, représentent environ 34 400 € pour 18 000 € versés.',
          'Si les versements passent à 100 € au bout de 5 ans puis à 150 € au bout de 10 ans, le total atteint environ 78 200 € pour 45 000 € versés. Augmenter progressivement son effort pèse davantage que chercher le placement miracle.',
        ],
      },
      {
        heading: 'Les priorités',
        points: true,
        body: [
          'Le LEP, si vous y avez droit : c’est le meilleur taux sans risque, et ses intérêts ne sont pas imposés.',
          'Une épargne de précaution, même modeste : elle évite le découvert ou le crédit renouvelable, dont le coût annule tout rendement.',
          'Un virement automatique le jour de la paie : l’épargne devient régulière sans effort de volonté. Certains PEA et contrats d’assurance-vie acceptent de petits versements programmés.',
          'Vos revenus : une formation qui les augmente durablement peut accroître votre capacité d’épargne plus que n’importe quel placement (capital humain).',
        ],
      },
      {
        heading: 'Les pièges',
        points: true,
        body: [
          'Les frais fixes : sur un petit versement, ils pèsent lourd. Exemple fictif : 2 € de frais sur un versement de 50 €, c’est déjà 4 % de perdu.',
          'Les promesses de rendement élevé sans risque : rendement et risque vont toujours ensemble, rappelle l’AMF. Avant tout placement proposé par un inconnu, consultez ses listes noires.',
        ],
      },
    ],
    related: ['lep', 'livret-a', 'etf-monde', 'capital-humain'],
    sources: [
      SP('LEP', 'F2367'),
      { label: 'AMF — Risques et rendements des placements', url: 'https://www.amf-france.org/fr/espace-epargnants/savoir-bien-investir/cadrer-son-projet/risques-et-rendements-des-placements', official: true },
      { label: 'AMF — Listes noires et mises en garde', url: 'https://www.amf-france.org/fr/espace-epargnants/proteger-son-epargne/listes-noires-et-mises-en-garde', official: true },
    ],
    faq: [
      { q: 'Peut-on se constituer un patrimoine en épargnant 50 € par mois ?', a: 'Exemple fictif : 50 € par mois pendant 30 ans, avec un rendement supposé de 4 %, représentent environ 34 400 € pour 18 000 € versés. Ce n’est pas une prévision : les rendements réels varient.' },
    ],
    cta: { to: '/simulateurs/patrimoine', label: 'Simuler une épargne progressive' },
  },
  {
    slug: 'par-ou-commencer',
    title: 'Par où commencer pour construire son patrimoine',
    summary: 'Un ordre de priorité simple, de l’épargne de précaution aux investissements de long terme.',
    readingMinutes: 6,
    updatedOn: '2026-10-10',
    sections: [
      { heading: 'Connaître sa capacité d’épargne', body: ['Listez vos revenus nets et vos dépenses fixes sur trois mois. Passer de 100 € à 300 € d’épargne mensuelle a souvent plus d’effet que gagner un point de rendement.'] },
      { heading: 'Constituer une épargne de précaution', body: ['Un repère courant est de trois à six mois de dépenses, à adapter à la stabilité de vos revenus. Les livrets réglementés (LEP si vous êtes éligible, puis Livret A et LDDS) sont les supports naturels de cette réserve.'] },
      { heading: 'Rembourser les dettes coûteuses', body: ['Un crédit à la consommation à taux élevé coûte souvent plus que ce que rapporterait un placement. Le rembourser est un gain certain.'] },
      { heading: 'Ouvrir les bonnes enveloppes tôt', body: ['PEA et assurance-vie bénéficient d’avantages fiscaux qui dépendent de leur ancienneté (5 et 8 ans). Les ouvrir tôt, même avec un petit versement, fait courir ces délais.'] },
      { heading: 'Investir régulièrement selon son horizon', body: ['L’argent nécessaire dans moins de trois ans n’a pas sa place en actions. Pour un horizon long, une allocation diversifiée et peu coûteuse, alimentée chaque mois, est une approche robuste.'] },
    ],
    related: ['livret-a', 'lep', 'pea', 'assurance-vie', 'etf-monde'],
    sources: [IFP, AMF],
    cta: { to: '/simulateurs/patrimoine', label: 'Voir ce que deviendra mon épargne' },
  },
  {
    slug: 'interets-composes',
    title: 'Comprendre les intérêts composés',
    summary: 'Pourquoi le temps, les frais et la régularité comptent plus que la recherche du meilleur placement.',
    readingMinutes: 4,
    updatedOn: '2026-11-12',
    sections: [
      { heading: 'Le principe', body: ['Les intérêts composés, ce sont des intérêts qui rapportent à leur tour des intérêts. Chaque année, les gains restent placés et s’ajoutent au capital : la somme grossit donc de plus en plus vite.', 'Exemple fictif : 10 000 € à 5 % par an deviennent environ 16 289 € après 10 ans et 26 533 € après 20 ans. La seconde décennie rapporte plus que la première : c’est pourquoi la durée compte autant que le taux.'] },
      { heading: 'L’effet des frais', body: ['Des frais annuels de 1 % sont prélevés chaque année sur tout le capital, gains compris : eux aussi s’accumulent avec le temps.', 'Exemple fictif : 10 000 € placés en une fois à 5 % par an pendant 25 ans deviennent environ 33 864 € sans frais, mais 26 340 € avec 1 % de frais par an, soit environ 22 % de moins.'] },
      { heading: 'L’inflation', body: ['Les prix montent avec le temps : une somme reçue dans 20 ans achètera moins que la même somme aujourd’hui.', 'Exemple fictif : avec une inflation de 2 % par an, les 26 533 € de l’exemple vaudront environ 17 856 € d’aujourd’hui. Nos simulateurs affichent les deux montants : le montant futur et sa valeur en euros d’aujourd’hui.'] },
    ],
    related: ['etf-monde', 'assurance-vie', 'fonds-euros'],
    sources: [IFP],
    faq: [
      { q: 'Quelle est la formule des intérêts composés ?', a: 'Un capital C placé à un taux annuel r pendant n années devient C × (1 + r)^n, si les gains restent placés. Exemple fictif : 10 000 × 1,05^10 ≈ 16 289 €.' },
      { q: 'Comment calcule-t-on la valeur en euros d’aujourd’hui ?', a: 'On divise le montant futur par (1 + inflation)^n. Exemple fictif : 26 533 ÷ 1,02^20 ≈ 17 856 €.' },
      { q: 'Et si j’épargne un peu chaque mois ?', a: 'Chaque versement se met à rapporter à son tour, pendant le temps qui lui reste : les premiers versements sont ceux qui grossissent le plus. Le simulateur de patrimoine fait ce calcul mois par mois.' },
    ],
    cta: { to: '/simulateurs/patrimoine', label: 'Tester les intérêts composés' },
  },
  {
    slug: 'choisir-son-enveloppe',
    title: 'PEA, assurance-vie, PER, compte-titres : choisir son enveloppe',
    summary: 'Ce qui distingue les principales enveloppes et comment les combiner.',
    readingMinutes: 7,
    updatedOn: '2026-11-05',
    sections: [
      { heading: 'Placement et enveloppe', body: ['Le support détermine le risque ; l’enveloppe détermine la fiscalité, la disponibilité et la transmission.'] },
      { heading: 'Les grandes différences', body: ['PEA : plafond de 150 000 € ; un retrait avant 5 ans entraîne en principe la clôture du plan ; après 5 ans, gains exonérés d’impôt sur le revenu (prélèvements sociaux dus).', 'Assurance-vie : aucun plafond de versement ; rachat possible, les gains retirés étant imposables ; après 8 ans, abattement annuel de 4 600 € (9 200 € pour un couple) sur les gains.', 'PER : déduction limitée par un plafond personnel ; épargne en principe bloquée jusqu’à la retraite, sauf cas de déblocage anticipé ; versements déductibles du revenu imposable avant 70 ans.', 'Compte-titres : aucune limite de versement ; aucune limite de retrait ; PFU de 31,4 % en 2026 (12,8 % d’impôt et 18,6 % de prélèvements sociaux).'] },
      { heading: 'Une combinaison fréquente', body: ['Épargne de précaution sur livrets, actions de long terme en PEA, assurance-vie pour la diversification et la transmission, PER si la tranche marginale d’imposition est élevée. Votre situation peut justifier d’autres choix.'] },
    ],
    related: ['pea', 'assurance-vie', 'per', 'compte-titres'],
    sources: [SP('PEA', 'F2385'), SP('Assurance-vie', 'F22414'), SP('Assurance-vie : versements et disponibilité', 'F15274'), SP('PER', 'F34982'), SP('Plus-values sur valeurs mobilières (PFU)', 'F21618')],
  },
  {
    slug: 'combien-epargne-de-precaution',
    title: 'Combien mettre en épargne de précaution ?',
    summary: 'Trois, six ou neuf mois de dépenses : comment choisir son repère, où placer cette réserve et dans quel ordre remplir les livrets.',
    readingMinutes: 5,
    updatedOn: '2026-11-11',
    sections: [
      {
        heading: 'Aucune règle officielle, des repères',
        body: [
          'Aucun texte ne fixe le montant d’une épargne de précaution. Les repères courants se comptent en mois de dépenses : environ 3 mois avec des revenus stables (CDI, fonction publique, retraite), 6 mois avec des revenus variables (CDD, intérim) et jusqu’à 9 mois pour un indépendant ou un dirigeant.',
          'Exemple fictif : avec 2 000 € de dépenses mensuelles, ces repères donnent respectivement 6 000 €, 12 000 € et 18 000 €. À ce montant, ajoutez les dépenses prévisibles (franchise d’assurance, réparation, appareil à remplacer).',
        ],
      },
      {
        heading: 'Ce qui fait varier le montant',
        body: [
          'La stabilité de vos revenus, le nombre de personnes à charge, un seul ou deux revenus dans le foyer, l’âge du logement et du véhicule, ainsi que votre couverture santé et prévoyance. Un foyer à deux revenus stables peut viser le bas de la fourchette ; un indépendant avec un crédit en cours, le haut.',
        ],
      },
      {
        heading: 'Où placer cette réserve',
        body: [
          'La réserve doit rester disponible tout de suite et ne jamais baisser : les livrets réglementés sont faits pour cela. On remplit d’abord le mieux rémunéré (le LEP, si vous y avez droit), puis le suivant quand le plafond est atteint.',
        ],
      },
      {
        heading: 'Et au-delà de la réserve ?',
        body: [
          'Une fois la réserve constituée, l’argent supplémentaire laissé sur un livret perd du pouvoir d’achat si l’inflation dépasse le taux. Le simulateur d’inflation montre l’effet sur la durée ; les guides PEA et assurance-vie présentent les enveloppes pour un horizon plus long.',
        ],
      },
    ],
    related: ['livret-a', 'lep'],
    sources: [SP('Livret A', 'F2365'), SP('LEP', 'F2367'), SP('LDDS', 'F2368'), BDF],
    faq: [
      { q: 'Combien de mois de dépenses faut-il garder en épargne de précaution ?', a: 'Aucune règle officielle ne le fixe. Les repères courants sont d’environ 3 mois de dépenses avec des revenus stables, 6 mois avec des revenus variables et jusqu’à 9 mois pour un indépendant. À adapter à votre situation.' },
      { q: 'Sur quel placement garder son épargne de précaution ?', a: 'Sur des supports disponibles immédiatement et sans risque de perte en capital : les livrets réglementés (LEP si vous y avez droit, Livret A, LDDS), dans la limite de leurs plafonds.' },
      { q: 'Faut-il constituer l’épargne de précaution avant d’investir ?', a: 'C’est l’ordre de priorité le plus courant : une réserve évite de devoir vendre un placement au mauvais moment ou de recourir au découvert. Le montant dépend de vos revenus et de vos charges.' },
    ],
    cta: { to: '/simulateurs/epargne-de-precaution', label: 'Calculer ma réserve' },
  },
  {
    slug: 'taux-endettement-capacite-emprunt',
    title: 'Taux d’endettement : quel repère pour emprunter ?',
    summary: 'Comment se calcule le taux d’endettement, d’où vient le repère de 35 % et pourquoi le reste à vivre compte autant.',
    readingMinutes: 5,
    updatedOn: '2026-11-13',
    sections: [
      {
        heading: 'Le calcul',
        body: [
          'Le taux d’endettement est la part de vos revenus qui part chaque mois dans le remboursement de vos crédits. On divise vos mensualités par vos revenus nets mensuels (ce que vous touchez après cotisations).',
          'Exemple fictif : 200 € de crédit en cours et 850 € de nouvelle mensualité pour 3 000 € de revenus. Les crédits prennent 1 050 € par mois, soit 35 % des revenus.',
        ],
      },
      {
        heading: 'Le repère de 35 %',
        body: [
          'Le Haut Conseil de stabilité financière (HCSF) recommande aux banques de limiter vos charges d’emprunt à 35 % de vos revenus, assurance comprise. Il recommande aussi de limiter la durée du prêt à 25 ans, ou 27 ans avec différé pour un bien neuf ou des travaux. C’est la décision D-HCSF-2021-7, applicable depuis le 1er janvier 2022.',
          'Les banques peuvent y déroger, mais dans une marge limitée. C’est donc un repère, pas un droit à emprunter.',
        ],
      },
      {
        heading: 'Le reste à vivre',
        body: [
          'Le taux ne dit pas ce qu’il vous reste pour vivre. Le reste à vivre le complète : c’est ce qu’il reste de vos revenus après les crédits et les charges courantes, rapporté au nombre de personnes du foyer. Deux foyers au même taux n’ont donc pas la même marge si leurs charges ou leur taille diffèrent.',
        ],
      },
      {
        heading: 'Que faire si le taux dépasse 35 %',
        points: true,
        body: [
          'Point de départ : le foyer de l’exemple fictif peut mettre 850 € par mois dans le nouveau prêt, soit environ 139 000 € sur 20 ans (avec un taux fictif de 3,6 % et une assurance de 0,3 %).',
          'Solder un petit crédit : sans les 200 € du crédit en cours, les 1 050 € vont tous au nouveau prêt, soit environ 172 000 €.',
          'Allonger la durée : sur 25 ans au lieu de 20, environ 160 000 €, mais plus d’intérêts à payer. La durée reste plafonnée (voir plus haut).',
          'Emprunter à deux : avec 1 500 € de revenus en plus, la limite passe à 1 575 € par mois, dont 1 375 € pour le nouveau prêt, soit environ 225 000 €.',
          'Plus d’apport ou un bien moins cher : vous pouvez emprunter autant, mais vous avez besoin de moins.',
        ],
      },
    ],
    related: ['credit-immobilier'],
    sources: [{ label: 'Haut Conseil de stabilité financière', url: 'https://www.economie.gouv.fr/hcsf', official: true }, BDF, ANIL],
    faq: [
      { q: 'Comment calculer son taux d’endettement ?', a: 'On divise le total des mensualités de crédit par les revenus nets mensuels. Exemple fictif : 1 050 € de mensualités pour 3 000 € de revenus donnent un taux de 35 %.' },
      { q: 'Le taux d’endettement maximal est-il de 35 % ?', a: 'C’est le repère recommandé par le HCSF, assurance comprise, appliqué par les banques avec une marge de dérogation limitée. Ce n’est pas une loi : chaque banque apprécie le dossier.' },
      { q: 'Qu’est-ce que le reste à vivre ?', a: 'C’est ce qu’il vous reste chaque mois après les crédits et les charges courantes, souvent rapporté au nombre de personnes du foyer. Il complète le taux d’endettement pour juger si une mensualité est supportable.' },
    ],
    cta: { to: '/simulateurs/endettement', label: 'Calculer mon taux d’endettement' },
  },
  {
    slug: 'pret-a-taux-zero-ptz',
    title: 'Le prêt à taux zéro (PTZ) : pour qui, pour quel logement ?',
    summary: 'Un prêt aidé par l’État pour acheter ou construire sa première résidence principale : à quoi il sert, qui peut l’obtenir, comment il se rembourse et où le demander.',
    readingMinutes: 4,
    updatedOn: '2026-11-13',
    sections: [
      {
        heading: 'Ce que c’est, en deux phrases',
        body: [
          'Le prêt à taux zéro (PTZ) est un prêt aidé par l’État. Vous remboursez uniquement la somme prêtée. Vous ne payez ni intérêts, ni intérêts intercalaires, ni frais de dossier, ni frais d’expertise.',
          'Il ne finance qu’une partie de l’achat ou de la construction de votre future résidence principale. Il s’ajoute toujours à un autre prêt immobilier (prêt bancaire classique, prêt d’accession sociale, prêt épargne logement…).',
        ],
      },
      {
        heading: 'Qui peut l’obtenir',
        points: true,
        body: [
          'Devenir propriétaire de sa résidence principale : en principe, ne pas l’avoir été au cours des 2 années qui précèdent le prêt, sauf exceptions (usufruit ou nue-propriété, handicap, catastrophe naturelle ou technologique).',
          'Des revenus sous un plafond : il dépend du nombre de futurs occupants et de la commune. Plafonds et règles changent selon la date de l’offre de prêt : consultez le tableau à jour de Service-Public.',
          'Les revenus retenus : le revenu fiscal de référence de l’année N-2 de tous les futurs occupants (celui de 2024 pour une demande en 2026). Pour une offre émise à partir d’avril 2025, on prend le coût total de l’opération divisé par 9 s’il est plus élevé.',
        ],
      },
      {
        heading: 'Quel logement peut-on financer',
        points: true,
        body: [
          'Votre résidence principale : habitée au moins 8 mois par an, au plus tard 1 an après l’achat ou la fin des travaux (ou à votre retraite, si elle arrive au plus tard 6 ans après).',
          'Dans le neuf : un logement achevé depuis moins de 5 ans et jamais occupé, ou une construction.',
          'Dans l’ancien : en zone B2 ou C seulement, avec des travaux d’amélioration ou d’économie d’énergie d’au moins 25 % du coût total de l’opération. Le simulateur de Service-Public indique la zone de votre commune.',
        ],
      },
      {
        heading: 'Comment il se rembourse',
        body: [
          'Il dure 25 ans au plus, moins si vos revenus sont plus élevés. On le rembourse d’un seul tenant, ou après un différé d’au moins 2 ans pendant lequel on ne rembourse pas le PTZ.',
        ],
      },
      {
        heading: 'Où le demander, et par où commencer',
        body: [
          'Seuls les établissements financiers (une banque, par exemple) qui ont signé une convention avec l’État peuvent accorder un PTZ. Chacun juge librement votre capacité à rembourser et vos garanties : l’accord n’est jamais automatique.',
          'Mesurez d’abord ce que vous pouvez emprunter (taux d’endettement et reste à vivre), puis demandez à votre banque ou à un courtier si le PTZ peut compléter votre financement. Sans intérêts, il allège le coût du crédit, mais ne dispense ni d’un apport raisonnable ni d’une mensualité supportable.',
        ],
      },
    ],
    related: ['credit-immobilier'],
    sources: [{ label: 'Service-Public.fr — Prêt à taux zéro (PTZ ou PTZ+), page vérifiée le 15 septembre 2026, consultée le 13 novembre 2026', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F10871', official: true }, ANIL],
    faq: [
      { q: 'Le prêt à taux zéro est-il vraiment sans aucun frais ?', a: 'Le PTZ lui-même ne porte ni intérêts, ni frais de dossier ni frais d’expertise. Mais il s’ajoute à un autre prêt, qui, lui, a un coût : intérêts, assurance, garantie.' },
      { q: 'Peut-on financer tout son achat avec un PTZ ?', a: 'Non. Le PTZ finance une partie de l’opération et doit être demandé en complément d’au moins un autre prêt immobilier.' },
      { q: 'Peut-on obtenir un PTZ si l’on a déjà été propriétaire ?', a: 'En principe, il ne faut pas avoir été propriétaire de sa résidence principale pendant les 2 années qui précèdent le prêt, avec quelques exceptions (usufruit, nue-propriété, handicap, catastrophe naturelle).' },
    ],
    cta: { to: '/simulateurs/endettement', label: 'Calculer mon taux d’endettement' },
  },
  {
    slug: 'combien-epargner-par-mois-objectif',
    title: 'Combien épargner par mois pour atteindre un objectif ?',
    summary: 'Apport, voyage, travaux : comment calculer le versement mensuel selon le montant visé, la durée et le taux, et ce que changent les intérêts.',
    readingMinutes: 4,
    updatedOn: '2026-10-27',
    sections: [
      {
        heading: 'Le calcul de base',
        body: [
          'Sans intérêts, c’est simple : on divise l’objectif par le nombre de mois. Exemple fictif : 20 000 € en 5 ans, soit 60 mois, demandent 20 000 / 60 ≈ 333 € par mois.',
          'Avec des intérêts, l’effort baisse un peu. Au taux de 1,7 % par an (celui du Livret A au 5 novembre 2026), le même objectif demande environ 320 € par mois. Sur 5 ans, les intérêts, avant impôt, apportent environ 820 € : à peine 4 % de l’objectif.',
        ],
      },
      {
        heading: 'La durée pèse plus que le taux',
        body: [
          'Sur quelques années, avec un placement sans risque, ce sont surtout vos versements qui construisent la somme, pas les intérêts. Pour le même objectif fictif de 20 000 € à 1,7 % : environ 542 € par mois sur 3 ans, 320 € sur 5 ans et 153 € sur 10 ans. Le levier le plus efficace est donc d’allonger l’échéance, si votre projet le permet.',
        ],
      },
      {
        heading: 'Où placer l’argent selon l’échéance',
        body: [
          'Pour un objectif à moins de 3 à 5 ans, privilégiez des supports sans risque de perte en capital (vous ne pouvez pas y perdre ce que vous avez versé) et disponibles : les livrets réglementés, dans la limite de leurs plafonds (voir la fiche Livret A). Un support investi en actions peut perdre de la valeur au moment où vous avez besoin de la somme. Au-delà d’une dizaine d’années, les autres enveloppes présentées dans les guides deviennent envisageables, avec un risque à accepter.',
        ],
      },
      {
        heading: 'Vérifier que le versement est réaliste',
        body: [
          'Comparez le versement à votre capacité d’épargne réelle : le simulateur de budget la calcule à partir de vos revenus et dépenses. Si le versement est trop élevé, réduisez l’objectif, repoussez l’échéance ou prévoyez un apport de départ.',
        ],
      },
    ],
    related: ['livret-a', 'lep'],
    sources: [SP('Livret A', 'F2365'), BDF],
    faq: [
      { q: 'Comment calculer combien épargner par mois pour un objectif ?', a: 'Sans intérêts, divisez l’objectif par le nombre de mois. Exemple fictif : 20 000 € en 5 ans donnent environ 333 € par mois. Avec des intérêts, le versement est un peu plus bas ; le simulateur le calcule.' },
      { q: 'Les intérêts changent-ils beaucoup le montant à épargner ?', a: 'Sur quelques années et avec un placement sans risque, peu : dans l’exemple fictif de 20 000 € en 5 ans à 1,7 %, les intérêts représentent environ 4 % de l’objectif, avant impôt.' },
      { q: 'Où placer l’argent d’un projet à court terme ?', a: 'Sur des supports disponibles et sans risque de perte en capital, comme les livrets réglementés, dans la limite de leurs plafonds.' },
    ],
    cta: { to: '/simulateurs/objectif-epargne', label: 'Calculer mon versement mensuel' },
  },
  {
    slug: 'rembourser-credit-par-anticipation-ou-investir',
    title: 'Rembourser son crédit par anticipation ou investir ?',
    summary: 'Comment comparer l’économie d’intérêts d’un remboursement anticipé au gain d’un placement, et ce qui fait pencher la balance.',
    readingMinutes: 5,
    updatedOn: '2026-11-11',
    sections: [
      {
        heading: 'Deux options, la même somme',
        body: [
          'Rembourser par anticipation réduit le capital restant dû : la mensualité reste identique et le crédit s’éteint plus tôt. Investir garde le crédit tel quel et place la somme. La bonne comparaison se fait au même horizon, la durée restante du crédit, sur le patrimoine net obtenu.',
        ],
      },
      {
        heading: 'Un exemple fictif chiffré',
        body: [
          'Crédit de 150 000 € à 4 % sur 20 ans restants, 20 000 € disponibles, placement à 5 % par an, frais de 0,2 % par an, gains imposés à 31,4 % (prélèvement forfaitaire unique de 2026). Rembourser fait gagner 45 mois et économise environ 21 250 € d’intérêts ; le patrimoine net final est d’environ 43 850 €, contre 41 250 € en investissant. Dans cet exemple, rembourser l’emporte d’environ 2 600 €.',
          'Le rendement d’équilibre est ici d’environ 5,4 % brut par an : au-dessus, investir gagne, en dessous, rembourser gagne. Ce rendement n’est pas garanti, alors que l’économie d’intérêts, elle, est certaine.',
        ],
      },
      {
        heading: 'Ce qui fait pencher la balance',
        body: [
          'Le taux du crédit (plus il est élevé, plus rembourser est intéressant), le rendement net et son incertitude, la fiscalité du placement, les indemnités de remboursement anticipé (plafonnées par la loi pour les crédits immobiliers : consultez votre contrat) et le besoin de liquidité. Les sommes versées sur un crédit ne sont plus disponibles, alors qu’un placement reste mobilisable.',
        ],
      },
      {
        heading: 'Avant de choisir',
        body: [
          'Constituez d’abord votre épargne de précaution : rembourser un crédit bloque l’argent. Le simulateur ne tient pas compte de l’assurance emprunteur ni des indemnités ; ajoutez-les à votre propre estimation.',
        ],
      },
    ],
    related: ['credit-immobilier'],
    sources: [ANIL, BDF, SP('Plus-values sur valeurs mobilières (PFU)', 'F21618')],
    faq: [
      { q: 'Vaut-il mieux rembourser son crédit ou investir ?', a: 'Cela dépend du taux du crédit et du rendement net espéré du placement. Dans l’exemple fictif de cette page (crédit à 4 %, placement à 5 %), rembourser l’emporte ; le rendement d’équilibre est d’environ 5,4 % brut par an.' },
      { q: 'Que se passe-t-il quand on rembourse par anticipation ?', a: 'Le capital restant dû baisse. Selon l’option choisie avec la banque, la mensualité ou la durée est réduite ; le simulateur suppose que la mensualité est conservée et que le crédit s’éteint plus tôt.' },
      { q: 'Y a-t-il des frais pour un remboursement anticipé ?', a: 'Des indemnités peuvent s’appliquer, plafonnées par la loi pour les crédits immobiliers. Vérifiez votre contrat : le simulateur les ignore.' },
    ],
    cta: { to: '/simulateurs/rembourser-ou-investir', label: 'Comparer rembourser et investir' },
  },
  {
    slug: 'diversification-placements',
    title: 'Diversifier ses placements : à quoi ça sert, comment faire ?',
    summary: 'Pourquoi ne pas tout placer au même endroit, comment la répartition entre placements amortit une baisse, et ce que la diversification ne garantit pas.',
    readingMinutes: 5,
    updatedOn: '2026-10-28',
    sections: [
      {
        heading: 'Le principe',
        body: [
          'Diversifier consiste à répartir son épargne entre plusieurs placements plutôt que de la concentrer sur un seul. La raison avancée par La finance pour tous : les placements n’évoluent pas tous de la même manière et n’offrent pas tous le même degré de disponibilité.',
          'Un livret, un fonds en actions, un bien immobilier ou un fonds en euros n’ont ni les mêmes risques, ni les mêmes délais pour récupérer l’argent. Les combiner évite qu’un seul événement ne décide de tout votre patrimoine.',
        ],
      },
      {
        heading: 'Un exemple fictif chiffré',
        body: [
          'Prenons 10 000 € et une année où les actions perdent 20 % pendant qu’un placement prudent gagne 2 %. Tout en actions, vous perdez 2 000 €. Avec 7 000 € d’actions et 3 000 € de placement prudent, les actions perdent 1 400 € et la part prudente rapporte 60 € : vous perdez 1 340 €, soit 13,4 % au lieu de 20 %.',
          'Chaque placement pèse selon sa part : plus la part prudente est grande, plus la baisse est amortie. Exemple fictif : ces rendements ne sont ni observés ni prévus.',
        ],
      },
      {
        heading: 'Ce que la diversification ne fait pas',
        body: [
          'Elle ne supprime pas le risque de perte : si tous vos placements baissent en même temps, la répartition n’amortit rien. Elle ne garantit pas non plus un meilleur rendement : dans l’exemple ci-dessus, la part prudente limite la perte, mais elle limiterait aussi le gain d’une année où les actions montent.',
          'Elle ne remplace pas l’épargne de précaution, qui doit rester disponible sans risque de moins-value.',
        ],
      },
      {
        heading: 'Comment s’y prendre, concrètement',
        body: [
          'Commencez par la réserve de sécurité, puis répartissez le reste selon votre horizon et la baisse que vous pouvez supporter sans vendre. Un fonds diversifié mondial, comme un ETF, répartit déjà votre argent entre de nombreuses entreprises : regardez ce que contient réellement chaque ligne pour ne pas empiler des placements qui se ressemblent.',
          'Surveillez aussi les frais : multiplier les lignes peut les alourdir. Les ordres de grandeur dépendent de chaque contrat ; comparez-les avec le simulateur de frais.',
        ],
      },
    ],
    related: ['etf-monde', 'livret-a', 'assurance-vie'],
    sources: [{ label: 'La finance pour tous — La diversification, oui mais comment ?', url: 'https://www.lafinancepourtous.com/pratique/placements/les-questions-clefs-avant-d-investir/la-diversification-oui-mais-comment/', official: true }, AMF],
    faq: [
      { q: 'Pourquoi diversifier ses placements ?', a: 'Parce que les placements n’évoluent pas tous de la même manière et n’offrent pas le même degré de disponibilité. Répartir l’épargne évite qu’un seul placement décide de tout le patrimoine.' },
      { q: 'La diversification supprime-t-elle le risque de perte ?', a: 'Non. Si tous les placements détenus baissent en même temps, la répartition n’amortit rien. Elle réduit la dépendance à un seul placement, sans garantir un gain ni l’absence de perte.' },
      { q: 'Comment calculer le rendement d’un ensemble de placements ?', a: 'On calcule le gain ou la perte de chaque placement en euros, on les additionne, puis on rapporte le résultat à la somme placée. Exemple fictif sur 10 000 € : 7 000 € d’actions qui perdent 20 % (−1 400 €) et 3 000 € qui gagnent 2 % (+60 €) donnent −1 340 €, soit −13,4 %.' },
    ],
    cta: { to: '/simulateurs/portefeuille', label: 'Analyser ma répartition' },
  },
  {
    slug: 'inflation-pouvoir-d-achat-epargne',
    title: 'Inflation : que devient le pouvoir d’achat de votre épargne ?',
    summary: 'Ce que l’inflation fait à une somme placée, la différence entre rendement nominal et rendement réel, et comment la calculer.',
    readingMinutes: 5,
    updatedOn: '2026-11-13',
    sections: [
      {
        heading: 'Ce que mesure l’inflation',
        body: [
          'Selon La finance pour tous, l’inflation est une hausse généralisée et durable des prix des biens et des services. Elle correspond à une baisse du pouvoir d’achat de la monnaie : avec la même somme, on peut acheter moins de choses qu’auparavant.',
          'Une épargne dont la valeur affichée ne bouge pas perd donc de sa valeur réelle tant que les prix montent : c’est l’érosion monétaire.',
        ],
      },
      {
        heading: 'Rendement nominal et rendement réel',
        body: [
          'Le rendement nominal est celui qui est affiché : 3 % par an, par exemple. Le rendement réel est ce qu’il reste une fois la hausse des prix retirée. C’est lui qui dit si votre pouvoir d’achat progresse.',
          'La finance pour tous résume l’idée ainsi : un taux d’intérêt diminué de l’inflation. De tête, 3 % de rendement avec 2 % d’inflation font environ 1 % par an. Le calcul exact, détaillé plus bas, donne 0,98 % : un écart minime tant que les taux restent bas.',
          'Si le rendement réel est positif, votre pouvoir d’achat augmente. S’il est négatif, il baisse, même si le montant affiché grossit.',
        ],
      },
      {
        heading: 'Un exemple fictif chiffré',
        body: [
          'Si les prix montent de 2 % par an pendant 10 ans, 10 000 € gardés tels quels n’achètent plus que ce que 8 203 € achètent aujourd’hui.',
          'Placés à 3 % par an, intérêts réinvestis, ils deviennent environ 13 439 €, qui n’achètent que ce que 11 025 € achètent aujourd’hui.',
          'Concrètement, le pouvoir d’achat gagne environ 1 025 € en 10 ans, pas les 3 439 € affichés : un rendement réel d’environ 0,98 % par an (1,03 divisé par 1,02, moins 1). Exemple fictif : ces taux ne sont ni observés ni prévus.',
        ],
      },
      {
        heading: 'Ce qu’il faut en retenir',
        body: [
          'L’inflation varie d’une année à l’autre : une hypothèse constante est une simplification. Comparez toujours un rendement à l’inflation de la même période.',
          'Gardez aussi en tête que la sécurité d’un placement et sa disponibilité ont une valeur, notamment pour l’épargne de précaution.',
          'Les simulateurs « Inflation et pouvoir d’achat » et « Rendement réel de mon placement » calculent ces effets à partir de vos propres hypothèses.',
        ],
      },
    ],
    related: ['livret-a', 'etf-monde', 'fonds-euros'],
    sources: [{ label: 'La finance pour tous — L’inflation', url: 'https://www.lafinancepourtous.com/decryptages/politiques-economiques/economie-mondiale/inflation/', official: true }],
    faq: [
      { q: 'Comment l’inflation réduit-elle le pouvoir d’achat de l’épargne ?', a: 'Les prix montent de façon générale et durable : avec la même somme, on achète moins de choses qu’avant. Une épargne qui ne progresse pas, ou moins vite que les prix, perd donc de la valeur réelle.' },
      { q: 'Comment calculer un rendement réel ?', a: 'De tête, retranchez l’inflation du rendement affiché. Exemple fictif : 3 % de rendement et 2 % d’inflation donnent environ 1 %, et 0,98 % au calcul exact (1,03 divisé par 1,02, moins 1).' },
      { q: 'Un rendement nominal positif garantit-il de ne pas perdre de pouvoir d’achat ?', a: 'Non. Si le rendement nominal est inférieur à l’inflation, le rendement réel est négatif : le montant affiché augmente mais permet d’acheter moins.' },
    ],
    cta: { to: '/simulateurs/inflation', label: 'Simuler l’effet de l’inflation' },
  },
  {
    slug: 'regle-de-72-doubler-son-capital',
    title: 'La règle de 72 : en combien de temps un capital double-t-il ?',
    summary: 'Comment estimer de tête la durée pour doubler un capital, pourquoi la règle fonctionne, ses limites et le calcul exact.',
    readingMinutes: 4,
    updatedOn: '2026-11-11',
    sections: [
      {
        heading: 'Le principe de la règle de 72',
        body: [
          'Un calcul de tête pour savoir en combien d’années un placement double, si les gains restent placés (intérêts composés) : divisez 72 par le taux annuel.',
          'Exemple fictif : à 6 % par an, 72 ÷ 6 = 12. Il faut environ 12 ans pour que 10 000 € deviennent 20 000 €. C’est une estimation, pas une promesse : le taux est une hypothèse que vous choisissez.',
        ],
      },
      {
        heading: 'Jusqu’où l’estimation est-elle bonne ?',
        body: [
          'Le calcul exact donne 11,90 ans à 6 % par an : presque les 12 ans de la règle. L’écart reste d’un an au plus entre 2 % et 12 % : à 2 %, la règle annonce 36 ans au lieu de 35,00 ; à 12 %, 6 ans au lieu de 6,12.',
          'La règle ignore les frais, les impôts et l’inflation, qui allongent la durée : utilisez un taux net de frais.',
        ],
      },
      {
        heading: 'Doubler en euros ou en pouvoir d’achat',
        body: [
          'Si les prix montent, un capital doublé n’achète pas deux fois plus. Pour le pouvoir d’achat, raisonnez avec le rendement réel : le rendement une fois l’inflation retirée, soit à peu près le rendement moins l’inflation.',
          'Exemple fictif : 6 % par an avec 2 % d’inflation donnent un rendement réel d’environ 3,9 %. Le capital double en euros en 11,90 ans, en pouvoir d’achat en 18,02 ans environ. Le simulateur « Doubler son capital » calcule les deux durées.',
        ],
      },
    ],
    related: ['etf-monde', 'fonds-euros'],
    sources: [IFP],
    faq: [
      { q: 'Comment appliquer la règle de 72 ?', a: 'Divisez 72 par le taux de rendement annuel en pourcentage : le résultat est une estimation du nombre d’années pour doubler. Exemple fictif : 72 ÷ 8 = 9 ans.' },
      { q: 'La règle de 72 est-elle exacte ?', a: 'Non, c’est une approximation. L’écart reste faible pour des taux modérés. Pour les curieux, la durée exacte vaut ln 2 ÷ ln (1 + taux), où ln est le logarithme népérien (touche « ln » d’une calculatrice) : à 6 %, ln 2 ÷ ln 1,06 ≈ 11,90 ans.' },
      { q: 'La règle de 72 tient-elle compte des frais et de l’inflation ?', a: 'Non. Utilisez un rendement net de frais et, pour le pouvoir d’achat, le rendement réel. Son calcul exact est (1 + rendement) ÷ (1 + inflation) − 1 : à 6 % de rendement et 2 % d’inflation, environ 3,92 %.' },
    ],
    cta: { to: '/simulateurs/interets-composes#doubler', label: 'Simuler le doublement d’un capital' },
  },
  {
    slug: 'livret-a-calcul-interets-quinzaines',
    title: 'Livret A : comment sont calculés les intérêts (quinzaines)',
    summary: 'À quelle date un dépôt ou un retrait est pris en compte, comment fonctionnent les quinzaines et quand les intérêts sont ajoutés au capital.',
    readingMinutes: 4,
    updatedOn: '2026-11-12',
    sections: [
      {
        heading: 'Des intérêts calculés par quinzaines',
        body: [
          'Le Livret A coupe chaque mois en deux quinzaines : du 1er au 15, puis du 16 à la fin du mois. Une somme ne rapporte des intérêts que pour les quinzaines entières où elle reste sur le livret.',
          'Ce qui compte n’est donc pas le jour exact de votre dépôt ou de votre retrait, mais la date à partir de laquelle la banque le prend en compte (la « date de valeur ») :',
        ],
      },
      {
        heading: 'Dépôt ou retrait : exemples en mai',
        points: true,
        body: [
          'Dépôt le 10 mai (entre le 1er et le 15) : il rapporte dès le 16 mai.',
          'Dépôt le 20 mai (à partir du 16) : il rapporte dès le 1er juin.',
          'Retrait le 10 mai (jusqu’au 15) : la banque retient le solde du 30 avril ; la somme retirée ne rapporte rien du 1er au 15 mai.',
          'Retrait le 20 mai (à partir du 16) : la banque retient le solde du 15 mai ; la somme retirée ne rapporte rien du 16 au 31 mai.',
          'Astuce : retirer le 16 plutôt que le 15 (ou le 1er plutôt que la veille) évite de perdre une quinzaine d’intérêts.',
        ],
      },
      {
        heading: 'Combien représente une quinzaine ?',
        body: [
          'Exemple fictif au taux de 1,70 % par an (taux en vigueur du 1er août 2026 au 31 janvier 2027) : 1 000 € rapportent 17 € sur une année entière. Une année compte 24 quinzaines : une quinzaine rapporte donc environ 0,71 €.',
          'Déposer le 10 mai plutôt que le 20 mai fait donc gagner environ 0,71 € pour 1 000 € : l’écart compte surtout pour de gros montants. Le taux est susceptible de changer au 1er février 2027.',
        ],
      },
      {
        heading: 'Quand les intérêts sont-ils versés ?',
        body: [
          'Au 31 décembre de chaque année, les intérêts cumulés sur l’année s’ajoutent au capital et produisent eux-mêmes des intérêts l’année suivante, même si le plafond de 22 950 € est déjà dépassé. En cas de clôture en cours d’année, les intérêts du 1er janvier à la date de clôture sont crédités le jour de la clôture.',
          'Ces intérêts ne sont pas imposés : ni impôt sur le revenu, ni prélèvements sociaux (Service-Public.fr, page vérifiée le 1er août 2026, consultée le 12 novembre 2026).',
        ],
      },
    ],
    related: ['livret-a'],
    sources: [SP('Livret A', 'F2365')],
    faq: [
      { q: 'À quelle date un dépôt sur le Livret A commence-t-il à rapporter ?', a: 'Un dépôt effectué du 1er au 15 du mois compte à partir du 16 ; un dépôt effectué à partir du 16 compte à partir du 1er du mois suivant.' },
      { q: 'Quand les intérêts du Livret A sont-ils versés ?', a: 'Les intérêts de l’année s’ajoutent au capital au 31 décembre, ou le jour de la clôture si le livret est fermé en cours d’année.' },
      { q: 'Les intérêts du Livret A sont-ils imposés ?', a: 'Non : ils sont exonérés d’impôt sur le revenu et de prélèvements sociaux, selon Service-Public.fr.' },
    ],
    cta: { to: '/simulateurs/epargne-de-precaution', label: 'Simuler son épargne de précaution' },
  },
]);

export const guideBySlug = Object.fromEntries(guides.map((g) => [g.slug, g]));

/** Parcours de lecture de la page « Guides » : chaque guide figure dans un seul groupe (vérifié par un test). */
export const guideGroups: { title: string; intro: string; slugs: string[] }[] = [
  { title: 'Pour démarrer', intro: 'Les bases, dans l’ordre : priorités, réserve, effort d’épargne.', slugs: ['par-ou-commencer', 'combien-epargne-de-precaution', 'epargne-limitee', 'combien-epargner-par-mois-objectif', 'patrimoine-net'] },
  { title: 'Comprendre les mécanismes', intro: 'Le temps, l’inflation, les frais, la diversification : ce qui joue sur vos résultats.', slugs: ['interets-composes', 'regle-de-72-doubler-son-capital', 'inflation-pouvoir-d-achat-epargne', 'diversification-placements', 'comparer-les-frais', 'livret-a-calcul-interets-quinzaines'] },
  { title: 'Choisir ses placements', intro: 'Les familles de placements et les enveloppes qui les contiennent.', slugs: ['types-investissements', 'choisir-son-enveloppe', 'fonctionnement-pea', 'immobilier-ou-etf'] },
  { title: 'Immobilier et crédit', intro: 'Emprunter, louer, rembourser : les repères avant de s’engager.', slugs: ['taux-endettement-capacite-emprunt', 'pret-a-taux-zero-ptz', 'investir-a-credit', 'rentabilite-locative', 'rembourser-credit-par-anticipation-ou-investir'] },
];

/** Autres guides proposés en bas d’un guide : ceux du même groupe d’abord, puis le reste. */
export function otherGuides(slug: string, n = 3) {
  const group = guideGroups.find((g) => g.slugs.includes(slug))?.slugs ?? [];
  const order = [...group, ...guides.map((g) => g.slug)];
  return [...new Set(order)].filter((s) => s !== slug).slice(0, n).map((s) => guideBySlug[s]);
}
