/**
 * Questions-réponses affichées sous certains simulateurs (et reprises en données structurées FAQPage).
 * Elles expliquent uniquement le fonctionnement du calcul à partir des hypothèses saisies : aucun taux, plafond
 * ni règle réglementaire n'y figure.
 */
export type FaqItem = { q: string; a: string };

export const simFaq: Record<string, FaqItem[]> = {
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
  frais: [
    { q: 'Pourquoi une petite différence de frais pèse-t-elle autant à long terme ?', a: 'Les frais annuels sont prélevés chaque année sur le capital, qui ne produit plus de gains sur la part prélevée. Cet effet se cumule avec la durée, d’où un écart de capital final bien supérieur à la différence de frais.' },
    { q: 'Que signifie la part des gains absorbée par les frais ?', a: 'C’est le rapport entre le coût des frais (capital final sans frais moins capital final avec frais) et les gains obtenus sans frais, à rendement brut et versements identiques.' },
    { q: 'Quels frais faut-il saisir ?', a: 'Le total des frais annuels courants de votre placement, en pourcentage de l’encours. Le simulateur compare trois niveaux, à rendement brut et versements identiques ; les valeurs par défaut sont fictives.' },
  ],
};
