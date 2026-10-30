/**
 * Questions-réponses affichées sous certains simulateurs (et reprises en données structurées FAQPage).
 * Elles expliquent uniquement le fonctionnement du calcul à partir des hypothèses saisies : aucun taux, plafond
 * ni règle réglementaire n'y figure.
 */
export type FaqItem = { q: string; a: string };

/**
 * Simulateur « Intérêts composés » (quatre onglets) : les questions des quatre anciens simulateurs, sans doublon de question.
 */
const interetsComposes: FaqItem[] = [
  { q: 'Comment calcule-t-on la somme à placer aujourd’hui ?', a: 'On « actualise » le capital visé : on le divise par le facteur de croissance (1 + taux mensuel)^(nombre de mois), après avoir retranché ce que vos versements mensuels apporteront. Le calcul est direct, sans itération, et utilise le même modèle que le simulateur de durée.' },
  { q: 'Pourquoi un rendement plus élevé réduit-il la somme à placer ?', a: 'Parce que les intérêts font une plus grande part du chemin. Mais le rendement saisi est une hypothèse, jamais une garantie : il vaut mieux tester plusieurs valeurs prudentes.' },
  { q: 'Que se passe-t-il si mes versements mensuels suffisent déjà ?', a: 'Le capital à placer affiché est alors de 0 € : vos versements et leurs intérêts supposés atteignent l’objectif sans somme de départ.' },
  { q: 'Le résultat tient-il compte des frais, impôts et de l’inflation ?', a: 'Non. Le rendement est supposé constant, avant frais, impôts et inflation. Pour mesurer l’effet de l’inflation, utilisez le simulateur dédié.' },
  { q: 'Le résultat est-il une prévision ?', a: 'Non. C’est un calcul pédagogique à partir de vos hypothèses, sans conseil en investissement. Les montants par défaut sont fictifs.' },
  { q: 'Comment la durée est-elle calculée ?', a: 'Le simulateur ajoute chaque mois le rendement mensuel équivalent puis le versement, jusqu’à ce que le capital atteigne le montant visé. La durée est le nombre de mois nécessaires, avec un maximum de 100 ans.' },
  { q: 'Que signifie le gain de temps grâce au rendement ?', a: 'C’est la différence entre la durée sans aucun rendement (capital de départ plus versements seuls) et la durée avec le rendement que vous supposez.' },
  { q: 'Pourquoi l’objectif peut-il ne jamais être atteint ?', a: 'Sans versement et avec un rendement nul ou négatif, le capital ne progresse pas : il faut augmenter le versement, le rendement supposé ou baisser l’objectif.' },
  { q: 'Le résultat est-il une prévision ?', a: 'Non. Le rendement est supposé constant, avant frais, impôts et inflation, et les versements sont supposés réguliers. Les montants par défaut sont fictifs.' },
  { q: 'Comment le rendement nécessaire est-il calculé ?', a: 'Le simulateur cherche, par approximations successives, le rendement annuel qui, appliqué chaque mois à votre capital (converti en taux mensuel équivalent) avec votre versement en fin de mois, atteint exactement le capital visé à l’échéance choisie. C’est le même modèle que celui du simulateur de durée.' },
  { q: 'Un rendement nécessaire élevé est-il réaliste ?', a: 'Le simulateur ne le dit pas : il indique seulement ce que votre objectif exige. Plus le rendement nécessaire est élevé, plus l’objectif repose sur une performance incertaine ; il vaut alors mieux augmenter le versement, allonger la durée ou revoir le capital visé.' },
  { q: 'Que signifie un rendement nécessaire de 0 % ?', a: 'Vos versements et votre capital de départ suffisent à atteindre l’objectif sans aucun rendement. Le simulateur n’affiche pas de rendement négatif.' },
  { q: 'Ce rendement tient-il compte des frais, impôts et de l’inflation ?', a: 'Non. C’est un rendement annuel constant avant frais, impôts et inflation. Pour comparer à un placement réel, il faut retrancher les frais et l’impôt de ce placement, et vous pouvez corriger de l’inflation avec le simulateur dédié.' },
  { q: 'Le résultat est-il une prévision ?', a: 'Non. C’est un calcul pédagogique à partir de vos hypothèses, sans conseil en investissement. Les montants par défaut sont fictifs.' },
  { q: 'En combien de temps un capital double-t-il ?', a: 'Sans nouveau versement et à rendement annuel constant, la durée exacte vaut ln(2) divisé par ln(1 + rendement). Elle ne dépend pas du capital de départ, seulement du rendement supposé : plus il est élevé, plus le doublement est rapide.' },
  { q: 'Qu’est-ce que la règle de 72 ?', a: 'C’est une approximation de tête : on divise 72 par le rendement annuel exprimé en pourcentage pour obtenir le nombre d’années nécessaires pour doubler. Le simulateur la compare au calcul exact pour montrer l’écart, faible pour des rendements de quelques pour cent.' },
  { q: 'Pourquoi tenir compte de l’inflation ?', a: 'Un capital qui double en valeur nominale ne double pas en pouvoir d’achat si les prix augmentent aussi. Le simulateur calcule le rendement réel, (1 + rendement) / (1 + inflation) − 1, et la durée pour multiplier la valeur réelle du capital.' },
  { q: 'Le résultat est-il une prévision ?', a: 'Non. Le rendement et l’inflation réels sont inconnus et varient ; ils sont supposés constants, avant frais et impôts. Les montants par défaut sont fictifs.' },
].filter((f, i, all) => all.findIndex((g) => g.q === f.q) === i);

const interetsSimples: FaqItem[] = [
  { q: 'Quelle différence entre intérêts simples et intérêts composés ?', a: 'Avec des intérêts simples, chaque année rapporte le même montant, calculé sur le capital de départ. Avec des intérêts composés, les intérêts de chaque année sont ajoutés au capital et produisent à leur tour des intérêts les années suivantes.' },
  { q: 'Quelles formules le simulateur utilise-t-il ?', a: 'Intérêts simples : capital × (1 + taux × années). Intérêts composés : capital × (1 + taux)^années. Les deux donnent le même résultat après la première année ; l’écart se creuse ensuite, d’autant plus vite que le taux et la durée sont élevés.' },
  { q: 'Pourquoi l’écart est-il nul avec un taux nul ?', a: 'Sans intérêts, il n’y a rien à réinvestir : les deux méthodes laissent le capital inchangé. L’écart grandit avec le taux et avec la durée.' },
  { q: 'Le résultat est-il une prévision ?', a: 'Non. Le taux est supposé constant, sans versement, avant frais, impôts et inflation. Les produits réels ont leurs propres règles de calcul et de versement des intérêts ; les montants par défaut sont fictifs.' },
];
const attendreFaq: FaqItem[] = [
  { q: 'Combien coûte de commencer à épargner plus tard ?', a: 'Cela dépend du versement, du rendement que vous supposez, de la date d’arrivée et du délai. Le simulateur compare le capital obtenu en commençant tout de suite et en commençant après le délai, à versement mensuel et date d’arrivée identiques.' },
  { q: 'Pourquoi l’attente coûte-t-elle plus que les versements manqués ?', a: 'Chaque versement manqué aurait aussi produit des intérêts jusqu’à la date d’arrivée, et ces intérêts auraient eux-mêmes produit des intérêts. Avec un rendement nul, le coût se limite aux versements non effectués.' },
  { q: 'Que signifie le versement pour rattraper ?', a: 'C’est le versement mensuel constant, à partir de la fin du délai, qui donne à l’arrivée le même capital que si vous aviez commencé tout de suite avec votre versement actuel. C’est un calcul sur vos hypothèses, pas une recommandation.' },
  { q: 'Le résultat est-il une prévision ?', a: 'Non. Le rendement réel est inconnu et varie ; il est supposé constant et avant frais, impôts et inflation. Les montants par défaut sont fictifs.' },
];
const progressifFaq: FaqItem[] = [
  { q: 'Quel effet a une hausse annuelle du versement mensuel ?', a: 'Chaque hausse s’ajoute aux versements suivants, qui fructifient ensuite à leur tour. Le simulateur compare le capital obtenu avec un versement constant et avec un versement qui augmente d’un pourcentage chaque année, au même rendement supposé.' },
  { q: 'Que signifie le versement constant équivalent ?', a: 'C’est la mensualité fixe qui donnerait, sur la même durée et au même rendement supposé, le même capital final que le versement qui augmente. Il permet de comparer les deux façons d’épargner.' },
  { q: 'La hausse du versement est-elle comparable à celle de mon salaire ?', a: 'Vous choisissez librement le pourcentage : le simulateur ne connaît ni votre salaire ni son évolution. Indexer son épargne sur une hausse de revenu est une hypothèse de votre part, pas une prévision.' },
  { q: 'Le résultat est-il une prévision ?', a: 'Non. Le rendement réel est inconnu et varie ; il est supposé constant et avant frais, impôts et inflation. Les montants par défaut sont fictifs.' },
];
const tauxFaq: FaqItem[] = [
  { q: 'Comment passer d’un taux annuel à un taux mensuel ?', a: 'Le taux mensuel équivalent vaut (1 + taux annuel)^(1/12) − 1. Capitalisé douze fois, il redonne exactement le taux annuel. Par exemple, un taux annuel fictif de 5 % correspond à un taux mensuel équivalent d’environ 0,4074 %.' },
  { q: 'Quelle différence entre taux équivalent et taux proportionnel ?', a: 'Le taux proportionnel s’obtient en divisant simplement le taux annuel par le nombre de périodes (5 % / 12 ≈ 0,4167 %). Capitalisé douze fois, il donne un taux annuel un peu supérieur à 5 % : les deux ne sont pas interchangeables dès qu’il y a capitalisation.' },
  { q: 'Quel taux utiliser pour un calcul d’épargne ou de crédit ?', a: 'Cela dépend de la convention du produit, indiquée dans son contrat. Ce simulateur se contente de convertir un taux saisi selon les deux méthodes ; il ne dit pas laquelle s’applique à un produit donné.' },
  { q: 'Le résultat est-il une prévision ?', a: 'Non. C’est un calcul mathématique à partir du seul taux saisi. Les valeurs par défaut sont fictives.' },
];

/** Simulateur « Intérêts composés » : questions de chaque onglet, affichées sous l'onglet actif ; les données structurées reprennent celles du premier onglet. */
const prevision = interetsComposes.find((f) => f.q === 'Le résultat est-il une prévision ?')!;
export const interetsComposesFaq = {
  placer: interetsComposes.slice(0, 5),
  duree: [...interetsComposes.slice(5, 8), prevision],
  rendement: [...interetsComposes.slice(8, 12), prevision],
  doubler: [...interetsComposes.slice(12), prevision],
  simple: interetsSimples,
  attendre: attendreFaq,
  progressif: progressifFaq,
  taux: tauxFaq,
};

/** Questions de l’onglet « Quelle durée ? ». */
const creditsDuree: FaqItem[] = [
    { q: 'Pourquoi allonger la durée réduit-elle la mensualité mais augmente-t-elle le coût ?', a: 'Le capital est remboursé plus lentement : chaque mensualité est plus faible, mais le capital restant dû reste élevé plus longtemps et génère des intérêts plus longtemps. Le coût total (intérêts et assurance) augmente donc avec la durée, à taux identique.' },
    { q: 'Comment la mensualité est-elle calculée ?', a: 'Avec la formule des crédits à mensualités constantes : capital × (taux annuel / 12) ÷ (1 − (1 + taux annuel / 12)^(−nombre de mois)). Sans taux, la mensualité vaut simplement le capital divisé par le nombre de mois. L’assurance, calculée ici sur le capital initial, s’y ajoute.' },
    { q: 'Que comprend le coût total affiché ?', a: 'La somme des intérêts et de l’assurance sur toute la durée, sans le capital emprunté. Les frais de dossier, de garantie ou de notaire ne sont pas inclus.' },
    { q: 'Le taux est-il le même pour toutes les durées ?', a: 'Dans ce simulateur oui, par simplification. En pratique, les banques proposent souvent des taux différents selon la durée : saisissez le taux de chaque offre dans le calculateur de crédit pour les comparer.' },
    { q: 'Le résultat est-il une offre de prêt ?', a: 'Non. C’est un calcul pédagogique à partir de vos saisies, avec un taux fixe. Les montants par défaut sont fictifs.' },
];

/** Questions de l’onglet « Quel TAEG ? ». */
const creditsTaeg: FaqItem[] = [
    { q: 'Pourquoi le TAEG est-il supérieur au taux nominal ?', a: 'Le taux nominal ne porte que sur les intérêts. Le TAEG ajoute l’assurance et les frais payés au départ : vous recevez moins que le capital emprunté tout en remboursant les mêmes échéances, ce qui relève le taux annuel réellement supporté. Avec ni assurance ni frais, les deux taux sont égaux.' },
    { q: 'Comment ce simulateur calcule-t-il le TAEG ?', a: 'Il cherche le taux annuel pour lequel la valeur actuelle des mensualités (assurance comprise) égale le capital emprunté diminué des frais payés au départ, par dichotomie. La formule est détaillée sur la page Méthode. C’est une estimation à partir de vos saisies.' },
    { q: 'Le TAEG calculé ici peut-il différer de celui de mon offre de prêt ?', a: 'Oui, c’est une estimation pédagogique : elle suppose des échéances constantes, une assurance calculée sur le capital initial et des frais payés à la signature. Seul le TAEG indiqué sur l’offre de la banque fait foi.' },
    { q: 'Pour comparer deux offres, que faut-il saisir ?', a: 'Saisissez pour chaque offre le même capital et la même durée, avec son taux nominal, le taux annuel de son assurance et le total de ses frais payés au départ, puis comparez le TAEG et le coût total obtenus.' },
];

/** Questions de l’onglet « In fine ou amortissable ». */
const creditsInFine: FaqItem[] = [
    { q: 'Quelle différence entre un crédit in fine et un crédit amortissable ?', a: 'Dans un crédit amortissable, chaque mensualité rembourse une part de capital et des intérêts. Dans un crédit in fine, on ne paie que les intérêts pendant la durée et le capital est remboursé en une seule fois à l’échéance, souvent à l’aide d’une épargne constituée en parallèle.' },
    { q: 'Comment le simulateur calcule-t-il l’épargne à constituer ?', a: 'Il cherche le versement mensuel qui, placé chaque fin de mois au rendement net supposé, reconstitue exactement le capital emprunté à l’échéance : capital × r ÷ ((1 + r)^mois − 1), avec r le taux mensuel équivalent. Sans rendement, c’est le capital divisé par le nombre de mois.' },
    { q: 'Quand l’in fine coûte-t-il plus cher ?', a: 'Quand l’épargne rapporte moins que le taux du crédit : les intérêts, calculés sur tout le capital pendant toute la durée, dépassent alors les gains de l’épargne. Dans ce simulateur, le coût net est égal aux intérêts et à l’assurance, diminués des gains de l’épargne.' },
    { q: 'Le rendement de l’épargne est-il garanti ?', a: 'Non. Le rendement saisi est une hypothèse constante : un placement réel peut rapporter moins, voire perdre de la valeur, et le capital pourrait alors manquer à l’échéance. Fiscalité, frais de l’enveloppe et conditions de la banque ne sont pas pris en compte.' },
    { q: 'Le résultat est-il une offre de prêt ?', a: 'Non. C’est un calcul pédagogique à partir de vos saisies, avec un taux fixe. Les montants par défaut sont fictifs.' },
];

/** Questions de l’onglet « Renégocier mon prêt ». */
const creditsRenegocier: FaqItem[] = [
    { q: 'Comment savoir si renégocier ou racheter mon crédit est rentable ?', a: 'Comparez les intérêts qu’il vous reste à payer sur le prêt actuel avec ceux du nouveau prêt, puis retirez les frais de l’opération : c’est le gain net affiché. Il doit être positif, et le point mort (frais divisés par l’économie mensuelle) doit être inférieur au temps pendant lequel vous comptez garder le prêt.' },
    { q: 'Quels frais faut-il saisir ?', a: 'Tous les frais ponctuels de l’opération : frais de dossier, garantie du nouveau prêt, indemnités éventuelles de remboursement anticipé du prêt actuel. Ils dépendent de vos contrats et de l’offre reçue : relevez-les sur vos documents, le simulateur n’en suppose aucun.' },
    { q: 'Pourquoi la mensualité baisse-t-elle mais le gain net est-il négatif ?', a: 'Si la nouvelle durée est plus longue que la durée restante, la mensualité diminue mais les intérêts s’accumulent sur plus de mois. Le gain net, qui compare les intérêts totaux et inclut les frais, est le bon indicateur du coût.' },
    { q: 'L’assurance emprunteur est-elle prise en compte ?', a: 'Non, les mensualités sont hors assurance. Si le nouveau contrat d’assurance change son coût, ajoutez l’écart sur la durée au gain net à la main.' },
    { q: 'Le résultat est-il une promesse de gain ?', a: 'Non. Il découle uniquement des taux, durées et frais saisis, avec des échéances constantes. Les montants par défaut sont fictifs et l’offre réelle d’une banque peut différer.' },
];

/** Simulateur « Comparer des crédits » : questions de chaque onglet, affichées sous l'onglet actif ; les données structurées reprennent celles de l'onglet ouvert par défaut. */
export const comparerCreditsFaq = { duree: creditsDuree, taeg: creditsTaeg, infine: creditsInFine, renegocier: creditsRenegocier };

export const simFaq: Record<string, FaqItem[]> = {
  'interets-composes': interetsComposesFaq.placer,
  'comparer-des-credits': comparerCreditsFaq.duree,
  immobilier: [
    { q: 'Quelle différence entre rendement brut et rendement net de charges ?', a: 'Le rendement brut rapporte les loyers annuels au prix du bien seul. Le rendement net de charges retire des loyers encaissés (vacance déduite) les charges, la taxe foncière, l’entretien et la gestion, puis divise par le coût total de l’opération (prix, frais d’acquisition, travaux, mobilier). Il est donc plus bas, et plus proche de la réalité.' },
    { q: 'Comment le flux de trésorerie mensuel est-il calculé ?', a: 'Il vaut les loyers encaissés moins les charges, divisés par douze, moins la mensualité du crédit assurance comprise, la première année et avant impôt. Un flux négatif signifie que vous complétez chaque mois la différence avec votre épargne.' },
    { q: 'À quoi sert le scénario défavorable ?', a: 'À tester la solidité du projet : il ajoute de la vacance, réduit le loyer, majore les charges et diminue l’évolution du prix du bien, avec les valeurs indiquées sur la page. Si le patrimoine net reste positif et le projet tenable dans ce cas, votre hypothèse centrale est moins fragile.' },
    { q: 'Que représente le patrimoine net immobilier ?', a: 'C’est la valeur estimée du bien à l’horizon choisi, selon l’évolution annuelle du prix saisie, moins le capital restant dû du crédit. Il ne tient compte ni des frais de revente ni de l’impôt sur la plus-value : pour une comparaison complète avec un placement financier, utilisez le comparateur ETF et immobilier.' },
    { q: 'Les résultats sont-ils des prévisions ?', a: 'Non. Ils découlent uniquement des hypothèses saisies (prix, loyer, charges, taux, régime d’imposition choisi), supposées constantes ou indexées au taux indiqué. Les montants par défaut sont fictifs et l’impôt affiché est une estimation à vérifier pour votre situation.' },
  ],
  'epargne-de-precaution': [
    { q: 'Comment le montant de la réserve est-il calculé ?', a: 'Il vaut vos dépenses mensuelles multipliées par le nombre de mois de couverture choisi, plus la réserve complémentaire que vous saisissez pour des dépenses prévisibles (franchise, réparation, appareil). Aucune règle officielle n’impose ce montant : les durées proposées selon la situation professionnelle sont des repères pédagogiques à adapter.' },
    { q: 'Que signifie le nombre de mois couverts ?', a: 'C’est votre épargne disponible divisée par vos dépenses mensuelles : le nombre de mois pendant lesquels vous pourriez maintenir votre niveau de dépenses sans aucun revenu. Plus vos dépenses incompressibles sont stables, plus ce repère est fiable.' },
    { q: 'Comment le délai pour constituer la réserve est-il estimé ?', a: 'Mois par mois, les intérêts au taux annuel saisi (converti en taux mensuel équivalent) sont ajoutés au solde, puis votre versement mensuel. Le délai est le premier mois où le solde atteint le montant visé. C’est une approximation : les livrets calculent leurs intérêts par quinzaine et les créditent une fois par an.' },
    { q: 'Comment la répartition entre livrets est-elle déterminée ?', a: 'Le simulateur remplit les livrets dans l’ordre, du mieux au moins rémunéré, dans la limite du plafond de chacun ; le reste est indiqué à part, sans rémunération supposée. Le plafond et le taux de chaque livret proviennent des données du site, avec leur date de vérification affichée sur la page : contrôlez-les auprès de votre banque avant de décider.' },
    { q: 'Cette réserve est-elle un conseil personnalisé ?', a: 'Non. C’est un calcul pédagogique à partir de vos saisies, sans conseil en investissement. Les montants par défaut sont fictifs.' },
  ],
  endettement: [
    { q: 'Comment le taux d’endettement est-il calculé ?', a: 'Il vaut la somme des mensualités de vos crédits (en cours et nouveau, assurance comprise) divisée par vos revenus nets mensuels. La page affiche le taux avant et après le projet pour mesurer l’effet de la nouvelle mensualité.' },
    { q: 'À quoi correspond le repère affiché sur la page ?', a: 'C’est le repère issu de la recommandation du Haut Conseil de stabilité financière, indiqué avec sa source et sa date de vérification en bas de page. Les banques disposent d’une marge d’appréciation et regardent aussi l’apport, la stabilité des revenus et l’épargne : dépasser ce repère ne signifie pas un refus automatique.' },
    { q: 'Que mesure le reste à vivre ?', a: 'C’est le revenu net qui reste après les mensualités de crédit et les charges courantes que vous saisissez, ramené au nombre de personnes du foyer. Il n’existe pas de seuil officiel unique : il dépend de vos charges réelles.' },
    { q: 'Comment la mensualité maximale et le revenu minimal sont-ils obtenus ?', a: 'La mensualité maximale est le revenu multiplié par le taux repère, moins les mensualités déjà en cours. Le revenu minimal est le total des mensualités (en cours et nouvelle) divisé par ce même taux. Ce sont des calculs à partir de vos saisies, pas une décision de financement.' },
  ],
  patrimoine: [
    { q: 'Comment le simulateur calcule-t-il le capital final ?', a: 'Le capital de départ puis chaque versement mensuel sont capitalisés au rendement annuel que vous saisissez, converti en taux mensuel équivalent, après déduction des frais annuels. Les versements sont placés en début de mois et les retraits ponctuels prélevés en fin d’année, dans la limite du capital disponible.' },
    { q: 'Que représentent les gains affichés ?', a: 'Ils valent le capital final, plus les retraits effectués, moins le total des versements. C’est la part du capital final qui provient du rendement et non de votre épargne. La fiscalité de sortie, si vous en saisissez une, est un taux unique appliqué aux gains restants : c’est une simplification.' },
    { q: 'À quoi servent les trois scénarios comparés ?', a: 'À tester l’effet d’un seul paramètre à la fois : versement, durée, rendement ou frais. Les scénarios partagent le même moteur de calcul, ce qui permet de lire l’écart sans autre différence que celle que vous avez saisie.' },
    { q: 'Le résultat est-il une prévision ?', a: 'Non. Il découle uniquement du rendement, des frais et de l’inflation que vous saisissez, supposés constants chaque année, alors que les marchés varient. Les montants par défaut sont fictifs.' },
  ],
  portefeuille: [
    { q: 'Comment le rendement du portefeuille est-il calculé ?', a: 'C’est la moyenne des rendements attendus de chaque ligne, pondérée par son poids dans le portefeuille (montant de la ligne divisé par le total). Les frais et le niveau de risque sont pondérés de la même façon. Le rendement net de chaque ligne est (1 + rendement) × (1 − frais) − 1.' },
    { q: 'Que fait le rééquilibrage ?', a: 'Pour chaque ligne, il compare le montant actuel au montant correspondant à l’allocation cible appliquée au total du portefeuille. Un résultat positif est un montant à acheter, un résultat négatif un montant à vendre. Les frais et impôts éventuels liés aux ventes ne sont pas pris en compte.' },
    { q: 'Que signifie le niveau de risque moyen ?', a: 'C’est la moyenne pondérée des niveaux de risque de 1 à 7 que vous attribuez vous-même à chaque ligne. Il n’est pas calculé à partir de données de marché et ne mesure ni la volatilité ni le risque de perte réel.' },
    { q: 'La projection est-elle une prévision ?', a: 'Non. Elle applique chaque année le rendement net pondéré saisi, sans volatilité, avec une allocation maintenue constante. Les montants par défaut sont fictifs.' },
  ],
  'etf-immobilier': [
    { q: 'Sur quelle base l’ETF et l’immobilier sont-ils comparés ?', a: 'Sur le même capital de départ (l’apport immobilier est investi en ETF dans l’autre scénario) et sur le même effort d’épargne annuel : le flux négatif après impôt du bien est versé sur les ETF dans l’autre scénario, et un excédent éventuel est placé au taux de trésorerie choisi.' },
    { q: 'Que représente le patrimoine net affiché ?', a: 'Pour l’ETF, la valeur du placement après imposition des gains saisie. Pour l’immobilier, la valeur du bien après frais de revente et impôt sur la plus-value estimé, moins le capital restant dû du crédit. Les deux sont estimés à l’horizon choisi.' },
    { q: 'Pourquoi le résultat change-t-il autant avec la hausse des prix et le rendement de l’ETF ?', a: 'L’immobilier est financé à crédit : une petite variation de la valeur du bien agit sur un capital plus grand que l’apport. À l’inverse, le rendement de l’ETF s’applique à tous les versements. Faites varier ces deux hypothèses pour voir à partir de quand l’un dépasse l’autre.' },
    { q: 'Ce résultat est-il une prévision ?', a: 'Non. Il ne repose que sur les hypothèses saisies (prix, loyers, charges, rendement, frais), supposées constantes, dont l’évolution réelle est inconnue. Les montants par défaut sont fictifs.' },
  ],
  entreprise: [
    { q: 'Quelle différence entre chiffre d’affaires, résultat et trésorerie ?', a: 'Le chiffre d’affaires est le total des ventes. Le résultat est ce qui reste après charges, rémunération et impôt sur les sociétés. La trésorerie suit les encaissements réels : elle tient compte du délai de paiement des clients et de l’investissement initial, donc elle peut baisser même quand le résultat est positif.' },
    { q: 'Comment le besoin en fonds de roulement est-il estimé ?', a: 'Il vaut le chiffre d’affaires multiplié par le délai de paiement des clients et divisé par 365. Plus vos clients paient tard, plus l’activité consomme de trésorerie à mesure qu’elle grandit.' },
    { q: 'Comment la valeur de l’entreprise est-elle estimée ?', a: 'Par un multiple du résultat net positif, que vous choisissez. C’est une estimation pédagogique : elle n’est ni de la trésorerie ni un revenu, et une valorisation réelle dépend de nombreux autres facteurs.' },
    { q: 'Que changent les scénarios pessimiste et optimiste ?', a: 'Ils modifient le chiffre d’affaires de départ, sa croissance et la marge brute par rapport au scénario central, les autres hypothèses restant identiques. Le taux d’impôt sur les sociétés et les charges sociales sont des valeurs que vous saisissez : vérifiez-les pour votre situation. Les montants par défaut sont fictifs.' },
  ],
  inflation: [
    { q: 'Que mesure la perte de pouvoir d’achat affichée ?', a: 'Elle compare ce que l’on pourra acheter avec la somme dans l’avenir à ce qu’elle permet d’acheter aujourd’hui, si les prix progressent au taux d’inflation que vous saisissez. La somme n’a pas diminué en euros : ce sont les prix qui ont augmenté.' },
    { q: 'Qu’est-ce que le rendement réel ?', a: 'C’est le rendement net corrigé de l’inflation, calculé par (1 + rendement) / (1 + inflation) − 1. Il est positif si le placement progresse plus vite que les prix, négatif sinon.' },
    { q: 'Quel taux d’inflation faut-il saisir ?', a: 'Aucun taux n’est imposé : c’est une hypothèse de votre choix, que vous pouvez faire varier pour tester plusieurs scénarios. L’inflation future est inconnue et le résultat n’est pas une prévision.' },
  ],
  'louer-ou-acheter': [
    { q: 'Comment le simulateur compare-t-il louer et acheter ?', a: 'Il calcule à l’horizon choisi le patrimoine net du propriétaire (valeur du bien moins frais de revente et capital restant dû) et celui du locataire (apport, frais et écarts mensuels placés au rendement saisi), puis en affiche l’écart.' },
    { q: 'Qu’est-ce que le point d’équilibre ?', a: 'C’est le premier mois à partir duquel acheter l’emporte durablement sur louer jusqu’à l’horizon, avec vos hypothèses. S’il n’apparaît pas, acheter ne l’emporte pas sur la durée étudiée.' },
    { q: 'Pourquoi le résultat dépend-il autant de la hausse des prix et de la durée ?', a: 'Les frais d’acquisition et de revente pèsent d’autant plus que la durée de détention est courte, alors que la hausse du bien et le remboursement du capital jouent sur la durée. Le simulateur montre l’effet de ces deux hypothèses.' },
    { q: 'Le résultat est-il une prévision ?', a: 'Non. Il ne repose que sur les hypothèses que vous saisissez (prix, loyer, rendement, charges), dont l’évolution réelle est inconnue. Les montants par défaut sont fictifs.' },
  ],
  'rendement-reel-de-mon-placement': [
    { q: 'Comment calculer le rendement réel de mon placement si j’ai fait plusieurs versements ?', a: 'Diviser le gain par le total versé ne tient pas compte de la date des versements. Le taux de rendement interne est le taux annuel qui, appliqué à chaque versement pendant la durée où il est resté placé, redonne la valeur actuelle. Le simulateur le calcule à partir du versement initial, du versement mensuel, de la durée et de la valeur actuelle.' },
    { q: 'Quelle différence entre rendement cumulé et rendement annuel équivalent ?', a: 'Le rendement cumulé est le gain rapporté au total versé, sans tenir compte de la durée. Le rendement annuel équivalent le ramène à un taux par an, ce qui permet de comparer des placements détenus pendant des durées différentes.' },
    { q: 'Le résultat tient-il compte des frais, des impôts et de l’inflation ?', a: 'Seulement dans la mesure où la valeur que vous saisissez les intègre déjà. Pour un rendement net de frais et d’impôts, saisissez la valeur nette que vous obtiendriez en cas de retrait. L’inflation n’est pas déduite : le résultat est un rendement nominal.' },
    { q: 'Ce rendement passé permet-il de prévoir l’avenir ?', a: 'Non. Il décrit ce qui s’est passé sur la période saisie et ne garantit rien pour la suite. Les montants par défaut sont fictifs.' },
  ],
  'retraits-reguliers-duree-du-capital': [
    { q: 'Combien de temps un capital tient-il si j’en retire un montant chaque mois ?', a: 'Cela dépend du capital, du retrait, du rendement que vous supposez et de la revalorisation annuelle du retrait. Le simulateur calcule mois par mois le capital restant et indique le mois d’épuisement s’il survient avant l’horizon choisi.' },
    { q: 'Que signifie le retrait mensuel tenable ?', a: 'C’est le premier retrait mensuel le plus élevé qui laisse encore un capital positif à la fin de l’horizon choisi, avec vos hypothèses de rendement et de revalorisation. Il est calculé par le simulateur, ce n’est pas une règle ni un seuil officiel.' },
    { q: 'Pourquoi revaloriser le retrait chaque année ?', a: 'Pour conserver le même pouvoir d’achat quand les prix montent : vous saisissez la hausse annuelle supposée du retrait (0 % pour un montant constant). Plus elle est élevée, plus le capital s’épuise vite.' },
    { q: 'Ce résultat est-il une prévision ?', a: 'Non. Il repose uniquement sur le rendement et la revalorisation que vous saisissez, supposés constants, avant frais et impôts. Les montants par défaut sont fictifs.' },
  ],
  'investir-d-un-coup-ou-progressivement': [
    { q: 'Vaut-il mieux investir tout de suite ou progressivement ?', a: 'Cela dépend du parcours des prix, qui est inconnu. Si le prix progresse régulièrement plus vite que l’argent en attente, investir tout de suite finit au-dessus, car chaque euro est exposé plus longtemps. Si le prix baisse pendant la période d’étalement, les tranches achètent à un prix plus bas et l’étalement finit au-dessus. Le simulateur montre les deux cas avec vos hypothèses.' },
    { q: 'À quoi sert l’étalement des versements ?', a: 'Il limite le regret de tout investir juste avant une baisse : l’investisseur ne dépend plus d’un seul prix d’entrée. Il ne rend pas le placement plus rentable en moyenne, et il laisse une partie du capital hors du marché pendant l’étalement.' },
    { q: 'Que représente le rendement de la part non investie ?', a: 'C’est le taux que vous supposez sur l’argent en attente d’être investi (0 % si laissé sur un compte non rémunéré). Plus il est élevé, plus l’écart avec un investissement immédiat se réduit.' },
    { q: 'Ce résultat est-il une prévision ?', a: 'Non. Il ne repose que sur le parcours de prix que vous choisissez, avant frais et impôts. Les montants par défaut sont fictifs.' },
  ],
  dettes: [
    { q: 'Quelle différence entre la méthode avalanche et la boule de neige ?', a: 'Avec l’avalanche, tout le budget disponible au-delà des mensualités minimales va d’abord à la dette au taux le plus élevé. Avec la boule de neige, il va à celle dont le solde est le plus petit. Dans les deux cas, une dette soldée libère sa mensualité pour la suivante.' },
    { q: 'Quelle méthode coûte le moins d’intérêts ?', a: 'À budget identique, l’avalanche minimise les intérêts versés puisqu’elle réduit en premier la dette la plus chère. La boule de neige peut coûter un peu plus mais solde plus vite la première dette, ce qui peut aider à tenir la durée. Le simulateur chiffre l’écart avec vos saisies.' },
    { q: 'Comment le budget mensuel est-il défini ?', a: 'Le budget total est constant : somme des mensualités minimales de vos dettes plus le versement supplémentaire que vous saisissez. Quand une dette est soldée, sa mensualité est reportée sur la suivante.' },
    { q: 'Les résultats sont-ils une prévision ?', a: 'Non, ils découlent uniquement des soldes, taux et mensualités que vous saisissez, supposés constants. Les valeurs par défaut sont fictives.' },
  ],
  'objectif-epargne': [
    { q: 'Comment est calculé le versement mensuel nécessaire ?', a: 'Le simulateur cherche le versement mensuel constant qui, placé au rendement annuel net que vous saisissez, versé en fin de mois, atteint le montant visé à l’échéance, après prise en compte de l’épargne déjà constituée. La formule est détaillée sur la page Méthode.' },
    { q: 'Quel taux faut-il saisir ?', a: 'Aucun taux n’est imposé : c’est une hypothèse de votre choix, que le simulateur considère comme un rendement net. Saisir 0 % donne le versement sans aucun intérêt, simple division du montant restant par le nombre de mois.' },
    { q: 'Pourquoi allonger la durée réduit-il autant le versement ?', a: 'Le montant à constituer est réparti sur davantage de mois, et les intérêts éventuels jouent plus longtemps. Sur de courtes durées, ce sont surtout les versements qui construisent la somme.' },
    { q: 'Le résultat est-il une prévision ?', a: 'Non, il ne repose que sur vos hypothèses (montant, durée, taux), supposées constantes. Les valeurs par défaut sont fictives.' },
  ],
  'rembourser-ou-investir': [
    { q: 'Comment le simulateur compare-t-il rembourser et investir ?', a: 'Il compare, à l’horizon choisi, le patrimoine net obtenu en remboursant une somme par anticipation (intérêts économisés) et celui obtenu en la plaçant au rendement saisi tout en poursuivant le crédit, après frais et imposition saisis.' },
    { q: 'Qu’est-ce que le rendement d’équilibre ?', a: 'C’est le rendement annuel brut du placement pour lequel les deux options donnent le même patrimoine net avec vos hypothèses. Au-dessus, investir l’emporte ; en dessous, rembourser l’emporte.' },
    { q: 'Quels frais et quelle imposition sont pris en compte ?', a: 'Uniquement ceux que vous saisissez : les frais annuels du placement et un taux unique d’imposition appliqué aux gains à l’horizon. Les éventuelles indemnités de remboursement anticipé de votre prêt ne sont pas calculées : vérifiez les conditions de votre contrat.' },
    { q: 'Le résultat est-il une prévision ?', a: 'Non, le rendement futur est inconnu et un placement peut perdre de la valeur. Le résultat découle uniquement de vos hypothèses, et les valeurs par défaut sont fictives.' },
  ],
  frais: [
    { q: 'Pourquoi une petite différence de frais pèse-t-elle autant à long terme ?', a: 'Les frais annuels sont prélevés chaque année sur le capital, qui ne produit plus de gains sur la part prélevée. Cet effet se cumule avec la durée, d’où un écart de capital final bien supérieur à la différence de frais.' },
    { q: 'Que signifie la part des gains absorbée par les frais ?', a: 'C’est le rapport entre le coût des frais (capital final sans frais moins capital final avec frais) et les gains obtenus sans frais, à rendement brut et versements identiques.' },
    { q: 'Quels frais faut-il saisir ?', a: 'Le total des frais annuels courants de votre placement, en pourcentage de l’encours. Le simulateur compare trois niveaux, à rendement brut et versements identiques ; les valeurs par défaut sont fictives.' },
  ],
  credit: [
    { q: 'Comment la mensualité d’un crédit est-elle calculée ?', a: 'Pour un prêt à échéances constantes, la mensualité vaut capital × t / (1 − (1 + t)^−n), où t est le taux mensuel (taux nominal annuel divisé par 12) et n le nombre de mensualités. Chaque échéance rembourse des intérêts sur le capital restant dû, le reste amortit le capital.' },
    { q: 'Pourquoi les intérêts diminuent-ils au fil du prêt ?', a: 'Les intérêts de chaque mois se calculent sur le capital restant dû. Celui-ci baisse à chaque échéance, donc la part d’intérêts décroît et la part de capital augmente, alors que la mensualité reste identique. Le tableau d’amortissement le montre mois par mois.' },
    { q: 'Qu’est-ce que le coût total du crédit affiché ?', a: 'C’est la somme des intérêts, et de l’assurance si vous en saisissez une, payés sur toute la durée. Le TAEG, qui intègre aussi les frais payés au départ, se calcule dans le simulateur de TAEG.' },
    { q: 'Le résultat remplace-t-il une offre de prêt ?', a: 'Non, c’est une estimation à partir de vos saisies. Seule l’offre remise par l’établissement prêteur engage celui-ci et précise les montants exacts.' },
  ],
  budget: [
    { q: 'Comment le taux d’épargne est-il calculé ?', a: 'Il s’obtient en divisant l’épargne mensuelle par le revenu net mensuel. Le revenu non affecté est ce qu’il reste du revenu après les besoins, les envies et l’épargne que vous saisissez.' },
    { q: 'La répartition 50 / 30 / 20 est-elle une règle ?', a: 'Non, c’est un repère pédagogique : 50 % du revenu net pour les besoins, 30 % pour les envies, 20 % pour l’épargne. Votre situation (loyer, famille, projets) peut justifier une répartition très différente.' },
    { q: 'Comment lire l’effort pour atteindre un taux d’épargne visé ?', a: 'Le simulateur calcule la somme mensuelle à épargner en plus pour atteindre le taux visé, couverte d’abord par le revenu non affecté puis par une réduction des envies. Les besoins ne sont pas modifiés.' },
    { q: 'La projection de l’épargne est-elle une prévision ?', a: 'Non. Elle suppose des versements constants et le rendement net que vous saisissez, sans garantie. Elle ne tient compte ni des imprévus ni de l’évolution de vos revenus.' },
  ],
  'independance-financiere': [
    { q: 'Comment le capital visé est-il calculé ?', a: 'Il vaut (dépenses annuelles − revenus récurrents) / taux de retrait. Plus le taux de retrait choisi est bas, plus le capital nécessaire est élevé : un taux de 4 % correspond à 25 fois les dépenses à financer.' },
    { q: 'Quel taux de retrait faut-il choisir ?', a: 'Aucun taux n’est imposé : c’est une hypothèse de votre choix, à faire varier. Un taux faible est plus prudent, un taux élevé réduit le capital visé mais épuise plus vite le capital si les rendements sont faibles. Le simulateur indique pendant combien d’années le capital dure.' },
    { q: 'Pourquoi le rendement et l’inflation sont-ils séparés ?', a: 'Les dépenses augmentent avec l’inflation alors que le capital rapporte un rendement. Le délai d’atteinte utilise le rendement réel, corrigé de l’inflation, et la phase de retrait revalorise les retraits de l’inflation.' },
    { q: 'Le délai affiché est-il une prévision ?', a: 'Non. Il découle uniquement de vos hypothèses (épargne, rendement, inflation, dépenses), dont l’évolution réelle est inconnue. Les montants par défaut sont fictifs.' },
  ],
};
