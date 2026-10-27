import type { Guide, Source } from './types';

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
export const guides: Guide[] = [
  {
    slug: 'types-investissements',
    title: 'Tous les types d’investissements accessibles aux particuliers',
    summary: 'Panorama des familles de placements ouvertes à un particulier en France, classées par risque, horizon et effort.',
    readingMinutes: 6,
    updatedOn: '2026-10-10',
    widget: 'catalogue',
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
          'Un même ETF peut être logé dans un PEA, un compte-titres, une assurance-vie ou un PER. Le placement détermine le risque ; l’enveloppe détermine la fiscalité, la disponibilité et la transmission. Les enveloppes ont leur propre famille dans le catalogue ci-dessous.',
        ],
      },
      {
        heading: 'Le catalogue',
        body: ['Chaque famille regroupe des fiches détaillées, avec fiscalité datée et sources. Les familles sans fiche sont en cours de rédaction : nous préférons attendre qu’une information soit vérifiée plutôt que de publier une page approximative.'],
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
    readingMinutes: 5,
    updatedOn: '2026-10-10',
    widget: 'patrimoine-net',
    sections: [
      {
        heading: 'La définition',
        body: [
          'Le patrimoine net est la valeur de tout ce que vous possédez, moins tout ce que vous devez. Un ménage propriétaire d’un logement estimé 250 000 € avec 180 000 € de crédit restant dû et 15 000 € d’épargne a un patrimoine net de 85 000 €.',
        ],
      },
      {
        heading: 'Ce qu’il faut compter',
        body: [
          'Actifs : comptes et livrets ; placements à leur valeur actuelle (valeur de rachat pour une assurance-vie, valeur liquidative pour un PEA) ; biens immobiliers à leur valeur de marché estimée ; parts d’entreprise si une valeur raisonnable peut être retenue ; véhicule éventuellement, à sa valeur de revente.',
          'Dettes : le capital restant dû de chaque crédit, et non la somme des mensualités restantes, qui inclut des intérêts pas encore courus. Le tableau d’amortissement de votre banque l’indique.',
        ],
      },
      {
        heading: 'Les erreurs fréquentes',
        body: [
          'Retenir le prix d’achat d’un bien au lieu de sa valeur actuelle ; oublier les frais et impôts d’une vente éventuelle ; compter deux fois un crédit déjà déduit d’une valeur ; inclure des droits à la retraite, qui ne sont pas un capital disponible.',
          'L’important est la régularité : refaire le calcul une ou deux fois par an avec la même méthode permet de suivre la tendance.',
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
          'Un rendement locatif brut de 6 % se calcule sur le prix du bien, avant charges, impôts et crédit. La performance d’un ETF se mesure sur la somme investie, frais du fonds déduits. Mettre ces deux chiffres côte à côte compare des grandeurs qui ne sont pas calculées sur la même base.',
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
          'Liquidité : des ETF se vendent en quelques jours, un bien en plusieurs mois. Temps : la gestion locative demande des heures chaque année. Risques : vacance, impayés, travaux et réglementation d’un côté ; baisses de marché parfois supérieures à 30 % de l’autre.',
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
          'Un bien de 200 000 € est acheté avec 20 000 € d’apport et 180 000 € empruntés à 3,5 % sur 20 ans. La première année, les intérêts représentent environ 6 200 €.',
          'S’il rapporte 10 000 € par an nets de charges (5 % de son prix), il reste environ 3 800 € avant impôt, soit près de 19 % de l’apport. S’il ne rapporte que 6 000 € (3 %), il manque environ 200 € pour couvrir les seuls intérêts. Dans les deux cas, il faut aussi rembourser le capital, ce qui pèse sur la trésorerie mensuelle.',
        ],
      },
      {
        heading: 'Les risques',
        body: [
          'Le levier amplifie tout : une vacance prolongée, des travaux imprévus, une hausse de la taxe foncière ou une baisse des prix à la revente pèsent sur l’apport, qui est faible.',
          'En France, les banques appliquent la recommandation du Haut Conseil de stabilité financière : un taux d’effort maximal de 35 % des revenus, assurance comprise, et une durée de 25 ans au plus, sauf dérogations.',
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
    updatedOn: '2026-10-10',
    sections: [
      {
        heading: 'Le rendement brut',
        body: [
          'Loyers annuels hors charges divisés par le prix d’achat. Un bien de 150 000 € loué 750 € par mois affiche 9 000 / 150 000 = 6 %. C’est l’indicateur des annonces : il ignore les frais d’acquisition, la vacance, les charges et les impôts.',
        ],
      },
      {
        heading: 'Le rendement net de charges',
        body: [
          'Loyers réellement encaissés (après vacance), moins taxe foncière, charges non récupérables, assurance, gestion et entretien, divisés par le coût total (prix, frais d’acquisition, travaux).',
          'Sur le même exemple fictif, avec 8 % de frais d’acquisition, 10 000 € de travaux, un mois de vacance et environ 2 060 € de charges annuelles, le rendement net tombe à environ 3,6 %.',
        ],
      },
      {
        heading: 'Après impôt et cash-flow',
        body: [
          'Le rendement après impôt dépend du régime (micro-foncier, réel, location meublée) et de votre tranche marginale d’imposition. Il se calcule au cas par cas.',
          'Le cash-flow mensuel mesure l’argent qui entre ou sort de votre poche chaque mois une fois la mensualité de crédit payée. Avec 150 000 € empruntés à 3,5 % sur 20 ans, l’exemple ci-dessus demande un effort d’environ 390 € par mois avant impôt.',
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
    readingMinutes: 6,
    updatedOn: '2026-10-10',
    sections: [
      {
        heading: 'Les règles de base',
        body: [
          'Le PEA est réservé aux personnes fiscalement domiciliées en France ; on ne peut en détenir qu’un par personne. Les versements, uniquement en euros, sont plafonnés à 150 000 €. Le PEA-PME, dédié aux petites et moyennes entreprises, partage avec lui un plafond global de 225 000 €.',
          'Il accueille des actions de sociétés ayant leur siège dans l’Union européenne ou l’Espace économique européen, et des fonds ou ETF éligibles, y compris certains ETF qui répliquent des indices mondiaux.',
        ],
      },
      {
        heading: 'Retraits et fiscalité',
        body: [
          'Avant 5 ans, un retrait entraîne en principe la clôture du plan et l’imposition des gains au prélèvement forfaitaire unique (31,4 % en 2026), sauf exceptions prévues par la loi.',
          'Après 5 ans, les retraits sont possibles sans clôturer le plan et sans bloquer les versements futurs. Les gains sont exonérés d’impôt sur le revenu ; seuls les prélèvements sociaux restent dus. Leur taux exact pour les gains de 2026 est à vérifier sur impots.gouv.fr.',
        ],
      },
      {
        heading: 'Bien l’utiliser',
        body: [
          'Ouvrir un PEA tôt, même avec un petit versement, fait courir le délai de 5 ans. Les dividendes reçus dans le plan ne sont pas imposés tant qu’ils y restent. Comparez les frais de courtage et de tenue de compte, qui varient fortement d’un établissement à l’autre.',
        ],
      },
    ],
    related: ['pea', 'etf-monde', 'compte-titres'],
    sources: [SP('PEA', 'F2385'), IMPOTS],
    faq: [
      { q: 'Quel est le plafond de versement du PEA ?', a: 'Les versements, uniquement en euros, sont plafonnés à 150 000 €. Le PEA-PME partage avec lui un plafond global de 225 000 €.' },
      { q: 'Que se passe-t-il en cas de retrait avant 5 ans ?', a: 'En principe, le plan est clôturé et les gains sont imposés au prélèvement forfaitaire unique (31,4 % en 2026), sauf exceptions prévues par la loi.' },
      { q: 'Peut-on retirer de l’argent après 5 ans sans clôturer le PEA ?', a: 'Oui : après 5 ans, les retraits sont possibles sans clôturer le plan et sans bloquer les versements futurs. Les gains sont exonérés d’impôt sur le revenu ; seuls les prélèvements sociaux restent dus.' },
      { q: 'Combien de PEA peut-on détenir ?', a: 'Un seul par personne, à condition d’être fiscalement domicilié en France.' },
    ],
    cta: { to: '/simulateurs/patrimoine', label: 'Simuler une épargne en PEA' },
  },
  {
    slug: 'comparer-les-frais',
    title: 'Comment comparer les frais d’investissement',
    summary: 'Les différents frais, comment les additionner et pourquoi un écart d’un point pèse lourd sur 25 ans.',
    readingMinutes: 6,
    updatedOn: '2026-10-10',
    sections: [
      {
        heading: 'Les familles de frais',
        body: [
          'Ponctuels : frais d’entrée ou sur versement, frais de courtage par ordre, frais de sortie, frais d’arbitrage. Récurrents : frais de gestion de l’enveloppe, frais courants des fonds, droits de garde.',
          'Le document d’informations clés (DIC), obligatoire pour les fonds, indique les coûts des supports. Les frais propres à l’enveloppe figurent dans les conditions du contrat ou la grille tarifaire.',
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
          'Exemple fictif : 10 000 € placés 25 ans avec un rendement brut supposé de 6 % deviennent environ 40 800 € avec 0,2 % de frais annuels, mais environ 29 400 € avec 1,5 %. L’écart dépasse le montant investi au départ.',
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
    updatedOn: '2026-10-10',
    sections: [
      {
        heading: 'Commencer petit, mais commencer',
        body: [
          'Exemple fictif : 50 € par mois pendant 30 ans, avec un rendement supposé de 4 %, représentent environ 34 400 € pour 18 000 € versés.',
          'Si les versements passent à 100 € au bout de 5 ans puis à 150 € au bout de 10 ans, le total atteint environ 78 200 € pour 45 000 € versés. Augmenter progressivement son effort pèse davantage que chercher le placement miracle.',
        ],
      },
      {
        heading: 'Les priorités',
        body: [
          'Le LEP si vous y avez droit : c’est le meilleur taux sans risque, sans impôt. Une épargne de précaution, même modeste, évite le recours au découvert ou au crédit renouvelable, dont le coût annule tout rendement.',
          'Un virement automatique le jour de la paie rend l’épargne régulière sans effort de volonté. Certains PEA et contrats d’assurance-vie acceptent de petits versements programmés.',
        ],
      },
      {
        heading: 'Les pièges',
        body: [
          'Les produits à frais élevés, qui pèsent proportionnellement plus sur de petits montants. Les promesses de rendement élevé sans risque : consultez les listes noires de l’AMF avant tout placement proposé par un inconnu.',
          'Enfin, le capital humain : une formation qui augmente durablement vos revenus peut accroître votre capacité d’épargne plus que n’importe quel placement.',
        ],
      },
    ],
    related: ['lep', 'livret-a', 'etf-monde', 'capital-humain'],
    sources: [SP('LEP', 'F2367'), AMF],
    faq: [
      { q: 'Peut-on se constituer un patrimoine en épargnant 50 € par mois ?', a: 'Exemple fictif : 50 € par mois pendant 30 ans, avec un rendement supposé de 4 %, représentent environ 34 400 € pour 18 000 € versés. Ce n’est pas une prévision : les rendements réels varient.' },
      { q: 'Faut-il d’abord placer ou constituer une épargne de précaution ?', a: 'Une épargne de précaution, même modeste, évite le recours au découvert ou au crédit renouvelable, dont le coût annule tout rendement. Le LEP, si vous y avez droit, est le meilleur taux sans risque, sans impôt.' },
      { q: 'Comment épargner régulièrement sans y penser ?', a: 'Un virement automatique le jour de la paie rend l’épargne régulière sans effort de volonté. Certains PEA et contrats d’assurance-vie acceptent de petits versements programmés.' },
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
      { heading: 'Connaître sa capacité d’épargne', body: ['Listez vos revenus nets et vos dépenses fixes sur trois mois. Passer de 100 € à 300 € d’épargne mensuelle a souvent plus d’effet que gagner un point de rendement.'] },
      { heading: 'Constituer une épargne de précaution', body: ['Un repère courant est de trois à six mois de dépenses, à adapter à la stabilité de vos revenus. Les livrets réglementés (LEP si vous êtes éligible, puis Livret A et LDDS) sont les supports naturels de cette réserve.'] },
      { heading: 'Rembourser les dettes coûteuses', body: ['Un crédit à la consommation à taux élevé coûte souvent plus que ce que rapporterait un placement. Le rembourser est un gain certain.'] },
      { heading: 'Ouvrir les bonnes enveloppes tôt', body: ['PEA et assurance-vie bénéficient d’avantages fiscaux qui dépendent de leur ancienneté (5 et 8 ans). Les ouvrir tôt, même avec un petit versement, fait courir ces délais.'] },
      { heading: 'Investir régulièrement selon son horizon', body: ['L’argent nécessaire dans moins de trois ans n’a pas sa place en actions. Pour un horizon long, une allocation diversifiée et peu coûteuse, alimentée chaque mois, est une approche robuste.'] },
    ],
    related: ['livret-a', 'lep', 'pea', 'assurance-vie', 'etf-monde'],
    sources: [IFP, AMF],
    cta: { to: '/simulateurs/patrimoine', label: 'Faire une simulation' },
  },
  {
    slug: 'interets-composes',
    title: 'Comprendre les intérêts composés',
    summary: 'Pourquoi le temps, les frais et la régularité comptent plus que la recherche du meilleur placement.',
    readingMinutes: 5,
    updatedOn: '2026-10-10',
    sections: [
      { heading: 'Le principe', body: ['Les intérêts composés consistent à gagner des intérêts sur les intérêts déjà acquis. Avec un taux r pendant n années, un capital C devient C × (1 + r)^n.', 'Exemple fictif : 10 000 € à 5 % par an deviennent environ 16 289 € après 10 ans et 26 533 € après 20 ans. La seconde décennie rapporte plus que la première.'] },
      { heading: 'L’effet des frais', body: ['Des frais annuels de 1 % s’appliquent chaque année à tout le capital. Sur 25 ans, ils réduisent un capital placé en une fois d’environ 22 %.'] },
      { heading: 'L’inflation', body: ['Un capital nominal ne dit rien du pouvoir d’achat futur. Nos simulateurs affichent aussi la valeur en euros d’aujourd’hui, en divisant par (1 + inflation)^n.'] },
    ],
    related: ['etf-monde', 'assurance-vie', 'fonds-euros'],
    sources: [IFP],
    cta: { to: '/simulateurs/patrimoine', label: 'Tester les intérêts composés' },
  },
  {
    slug: 'choisir-son-enveloppe',
    title: 'PEA, assurance-vie, PER, compte-titres : choisir son enveloppe',
    summary: 'Ce qui distingue les principales enveloppes et comment les combiner.',
    readingMinutes: 7,
    updatedOn: '2026-10-10',
    sections: [
      { heading: 'Placement et enveloppe', body: ['Le support détermine le risque ; l’enveloppe détermine la fiscalité, la disponibilité et la transmission.'] },
      { heading: 'Les grandes différences', body: ['PEA : actions européennes, plafond de 150 000 €, exonération d’impôt sur le revenu après 5 ans (prélèvements sociaux dus).', 'Assurance-vie : supports variés, fiscalité allégée après 8 ans, avantages successoraux.', 'PER : versements déductibles mais argent bloqué jusqu’à la retraite, sauf exceptions.', 'Compte-titres : aucune limite, fiscalité standard (PFU de 31,4 % en 2026).'] },
      { heading: 'Une combinaison fréquente', body: ['Épargne de précaution sur livrets, actions de long terme en PEA, assurance-vie pour la diversification et la transmission, PER si la tranche marginale d’imposition est élevée. Votre situation peut justifier d’autres choix.'] },
    ],
    related: ['pea', 'assurance-vie', 'per', 'compte-titres'],
    sources: [SP('PEA', 'F2385'), SP('Assurance-vie', 'F22414'), SP('PER', 'F34982')],
  },
  {
    slug: 'combien-epargne-de-precaution',
    title: 'Combien mettre en épargne de précaution ?',
    summary: 'Trois, six ou neuf mois de dépenses : comment choisir son repère, où placer cette réserve et dans quel ordre remplir les livrets.',
    readingMinutes: 5,
    updatedOn: '2026-10-27',
    sections: [
      {
        heading: 'Aucune règle officielle, des repères',
        body: [
          'Aucun texte ne fixe le montant d’une épargne de précaution. Les repères courants se comptent en mois de dépenses : environ 3 mois avec des revenus stables (CDI, fonction publique, retraite), 6 mois avec des revenus variables (CDD, intérim) et jusqu’à 9 mois pour un indépendant ou un dirigeant.',
          'Exemple fictif : avec 2 000 € de dépenses mensuelles, ces repères donnent respectivement 6 000 €, 12 000 € et 18 000 €. À ce montant, ajoutez les dépenses prévisibles (franchise d’assurance, réparation, appareil à remplacer).',
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
          'La réserve doit rester disponible immédiatement et ne pas fluctuer : les livrets réglementés sont les supports naturels. Plafonds de dépôt : LEP 10 000 € (sous conditions de revenus), Livret A 22 950 € et LDDS 12 000 €. Taux au 10 octobre 2026 : 2,5 % pour le LEP et 1,7 % pour le Livret A et le LDDS, fixés pour la période du 1er août 2026 au 31 janvier 2027.',
          'On remplit en général d’abord le mieux rémunéré (LEP si vous y avez droit), puis le Livret A, puis le LDDS. Ces taux changent à chaque révision : vérifiez-les sur les fiches Livret A et LEP.',
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
      { q: 'Combien de mois de dépenses faut-il garder en épargne de précaution ?', a: 'Aucune règle officielle ne le fixe. Les repères courants sont d’environ 3 mois de dépenses avec des revenus stables, 6 mois avec des revenus variables et jusqu’à 9 mois pour un indépendant. À adapter à votre situation.' },
      { q: 'Sur quel placement garder son épargne de précaution ?', a: 'Sur des supports disponibles immédiatement et sans risque de perte en capital : les livrets réglementés (LEP si vous y avez droit, Livret A, LDDS), dans la limite de leurs plafonds.' },
      { q: 'Faut-il constituer l’épargne de précaution avant d’investir ?', a: 'C’est l’ordre de priorité le plus courant : une réserve évite de devoir vendre un placement au mauvais moment ou de recourir au découvert. Le montant dépend de vos revenus et de vos charges.' },
    ],
    cta: { to: '/simulateurs/epargne-de-precaution', label: 'Calculer ma réserve' },
  },
  {
    slug: 'taux-endettement-capacite-emprunt',
    title: 'Taux d’endettement : quel repère pour emprunter ?',
    summary: 'Comment se calcule le taux d’endettement, d’où vient le repère de 35 % et pourquoi le reste à vivre compte autant.',
    readingMinutes: 5,
    updatedOn: '2026-10-27',
    sections: [
      {
        heading: 'Le calcul',
        body: [
          'Le taux d’endettement est la part de vos revenus consacrée au remboursement de vos crédits : mensualités divisées par revenus nets mensuels. Exemple fictif : 200 € de crédit en cours et 850 € de nouvelle mensualité pour 3 000 € de revenus donnent (200 + 850) / 3 000 = 35 %.',
        ],
      },
      {
        heading: 'Le repère de 35 %',
        body: [
          'Le Haut Conseil de stabilité financière (décision D-HCSF-2021-7, applicable depuis le 1er janvier 2022) recommande aux banques de limiter les charges d’emprunt à 35 % des revenus, assurance comprise, et la durée à 25 ans (27 ans avec différé pour un bien neuf ou des travaux). Les banques disposent d’une marge de dérogation, qui reste limitée : c’est un repère, pas un droit à emprunter.',
          'Avec 3 000 € de revenus, la charge totale de crédit maximale est donc de 1 050 € par mois ; si 200 € sont déjà engagés, il reste 850 € pour le nouveau crédit.',
        ],
      },
      {
        heading: 'Le reste à vivre',
        body: [
          'Le taux ne dit pas ce qu’il vous reste. Deux foyers au même taux n’ont pas la même marge si leurs charges ou le nombre de personnes diffèrent. Le reste à vivre (revenus moins crédits et charges courantes, rapporté au nombre de personnes) complète le taux et aide à vérifier qu’une mensualité reste supportable.',
        ],
      },
      {
        heading: 'Que faire si le taux dépasse 35 %',
        body: [
          'Allonger la durée dans la limite du repère, augmenter l’apport, réduire le prix visé, solder un petit crédit ou emprunter à deux. Le simulateur calcule la mensualité maximale, le revenu minimal et le capital empruntable.',
        ],
      },
    ],
    related: ['credit-immobilier'],
    sources: [{ label: 'Haut Conseil de stabilité financière', url: 'https://www.economie.gouv.fr/hcsf', official: true }, BDF, ANIL],
    faq: [
      { q: 'Comment calculer son taux d’endettement ?', a: 'On divise le total des mensualités de crédit par les revenus nets mensuels. Exemple fictif : 1 050 € de mensualités pour 3 000 € de revenus donnent un taux de 35 %.' },
      { q: 'Le taux d’endettement maximal est-il de 35 % ?', a: 'C’est le repère recommandé par le HCSF, assurance comprise, appliqué par les banques avec une marge de dérogation limitée. Ce n’est pas une loi : chaque banque apprécie le dossier.' },
      { q: 'Qu’est-ce que le reste à vivre ?', a: 'C’est ce qu’il vous reste chaque mois après les crédits et les charges courantes, souvent rapporté au nombre de personnes du foyer. Il complète le taux d’endettement pour juger si une mensualité est supportable.' },
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
          'Sans intérêts, le versement mensuel est simplement l’objectif divisé par le nombre de mois. Exemple fictif : 20 000 € en 5 ans, soit 60 mois, demandent 20 000 / 60 ≈ 333 € par mois.',
          'Avec un taux de 1,7 % par an (celui du Livret A au 10 octobre 2026), le même objectif demande environ 320 € par mois : les intérêts, avant impôt, apportent environ 820 € sur 5 ans, soit à peine 4 % de l’objectif.',
        ],
      },
      {
        heading: 'La durée pèse plus que le taux',
        body: [
          'Sur des durées courtes et des placements sans risque, ce sont surtout vos versements qui construisent la somme. Pour le même objectif fictif de 20 000 € à 1,7 % : environ 542 € par mois sur 3 ans, 320 € sur 5 ans et 153 € sur 10 ans. Allonger l’échéance est le levier le plus efficace, s’il est compatible avec votre projet.',
        ],
      },
      {
        heading: 'Où placer l’argent selon l’échéance',
        body: [
          'Pour un objectif à moins de 3 à 5 ans, privilégiez des supports sans risque de perte en capital et disponibles : livrets réglementés dans la limite de leurs plafonds (voir la fiche Livret A). Un support investi en actions peut perdre de la valeur au moment où vous avez besoin de la somme. Au-delà d’une dizaine d’années, les autres enveloppes présentées dans les guides deviennent envisageables, avec un risque à accepter.',
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
      { q: 'Comment calculer combien épargner par mois pour un objectif ?', a: 'Sans intérêts, divisez l’objectif par le nombre de mois. Exemple fictif : 20 000 € en 5 ans donnent environ 333 € par mois. Avec des intérêts, le versement est un peu plus bas ; le simulateur le calcule.' },
      { q: 'Les intérêts changent-ils beaucoup le montant à épargner ?', a: 'Sur quelques années et avec un placement sans risque, peu : dans l’exemple fictif de 20 000 € en 5 ans à 1,7 %, les intérêts représentent environ 4 % de l’objectif, avant impôt.' },
      { q: 'Où placer l’argent d’un projet à court terme ?', a: 'Sur des supports disponibles et sans risque de perte en capital, comme les livrets réglementés, dans la limite de leurs plafonds.' },
    ],
    cta: { to: '/simulateurs/objectif-epargne', label: 'Calculer mon versement mensuel' },
  },
  {
    slug: 'rembourser-credit-par-anticipation-ou-investir',
    title: 'Rembourser son crédit par anticipation ou investir ?',
    summary: 'Comment comparer l’économie d’intérêts d’un remboursement anticipé au gain d’un placement, et ce qui fait pencher la balance.',
    readingMinutes: 5,
    updatedOn: '2026-10-27',
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
          'Crédit de 150 000 € à 4 % sur 20 ans restants, 20 000 € disponibles, placement à 5 % par an, frais de 0,2 % par an, gains imposés à 30 %. Rembourser fait gagner 45 mois et économise environ 21 250 € d’intérêts ; le patrimoine net final est d’environ 43 900 €, contre 41 700 € en investissant. Dans cet exemple, rembourser l’emporte d’environ 2 200 €.',
          'Le rendement d’équilibre est ici d’environ 5,3 % brut par an : au-dessus, investir gagne, en dessous, rembourser gagne. Ce rendement n’est pas garanti, alors que l’économie d’intérêts, elle, est certaine.',
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
    sources: [ANIL, BDF],
    faq: [
      { q: 'Vaut-il mieux rembourser son crédit ou investir ?', a: 'Cela dépend du taux du crédit et du rendement net espéré du placement. Dans l’exemple fictif de cette page (crédit à 4 %, placement à 5 %), rembourser l’emporte ; le rendement d’équilibre est d’environ 5,3 % brut par an.' },
      { q: 'Que se passe-t-il quand on rembourse par anticipation ?', a: 'Le capital restant dû baisse. Selon l’option choisie avec la banque, la mensualité ou la durée est réduite ; le simulateur suppose que la mensualité est conservée et que le crédit s’éteint plus tôt.' },
      { q: 'Y a-t-il des frais pour un remboursement anticipé ?', a: 'Des indemnités peuvent s’appliquer, plafonnées par la loi pour les crédits immobiliers. Vérifiez votre contrat : le simulateur les ignore.' },
    ],
    cta: { to: '/simulateurs/rembourser-ou-investir', label: 'Comparer rembourser et investir' },
  },
];

export const guideBySlug = Object.fromEntries(guides.map((g) => [g.slug, g]));
