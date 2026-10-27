/**
 * Questions-réponses affichées sous certains simulateurs (et reprises en données structurées FAQPage).
 * Elles expliquent uniquement le fonctionnement du calcul à partir des hypothèses saisies : aucun taux, plafond
 * ni règle réglementaire n'y figure.
 */
export type FaqItem = { q: string; a: string };

export const simFaq: Record<string, FaqItem[]> = {
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
  taeg: [
    { q: 'Pourquoi le TAEG est-il supérieur au taux nominal ?', a: 'Le taux nominal ne porte que sur les intérêts. Le TAEG ajoute l’assurance et les frais payés au départ : vous recevez moins que le capital emprunté tout en remboursant les mêmes échéances, ce qui relève le taux annuel réellement supporté. Avec ni assurance ni frais, les deux taux sont égaux.' },
    { q: 'Comment ce simulateur calcule-t-il le TAEG ?', a: 'Il cherche le taux annuel pour lequel la valeur actuelle des mensualités (assurance comprise) égale le capital emprunté diminué des frais payés au départ, par dichotomie. La formule est détaillée sur la page Méthode. C’est une estimation à partir de vos saisies.' },
    { q: 'Le TAEG calculé ici peut-il différer de celui de mon offre de prêt ?', a: 'Oui, c’est une estimation pédagogique : elle suppose des échéances constantes, une assurance calculée sur le capital initial et des frais payés à la signature. Seul le TAEG indiqué sur l’offre de la banque fait foi.' },
    { q: 'Pour comparer deux offres, que faut-il saisir ?', a: 'Saisissez pour chaque offre le même capital et la même durée, avec son taux nominal, le taux annuel de son assurance et le total de ses frais payés au départ, puis comparez le TAEG et le coût total obtenus.' },
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
