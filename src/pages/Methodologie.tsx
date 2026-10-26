import { Link } from 'react-router-dom';
import { AS_OF, investments } from '../data/investments';
import { PageHead } from '../components/ui';

const FORMULAS: [string, string[]][] = [
  ['Conventions générales', [
    'Taux en pourcentage annuel. Placements : taux mensuel équivalent (1 + r)^(1/12) − 1. Crédits : taux mensuel = taux nominal / 12, convention bancaire française.',
    'Rendement net de frais : (1 + r) × (1 − f) − 1. Rendement réel : (1 + r) / (1 + i) − 1. Valeur en euros d’aujourd’hui : valeur / (1 + i)^années.',
    'Entrées invalides, négatives ou nulles : remplacées par une valeur neutre ; durées nulles gérées ; aucune division par zéro ; aucun résultat NaN.',
    'Déterminisme : mêmes hypothèses, mêmes résultats. Aucun tirage aléatoire.',
  ]],
  ['Patrimoine à long terme', [
    'Versements en début de mois, capitalisation mensuelle, retraits ponctuels en fin d’année plafonnés au capital disponible.',
    'Gains simulés = capital final + retraits − versements. Fiscalité de sortie : un taux unique appliqué aux gains restants.',
    'Versement requis pour un objectif : (cible − capital initial × (1 + t)^n) / [((1 + t)^n − 1) / t × (1 + t)].',
  ]],
  ['Crédit', [
    'Mensualité : C × t / (1 − (1 + t)^−n). Assurance : taux annuel × capital initial / 12.',
    'Remboursement anticipé : indemnités = min(6 mois d’intérêts sur la somme remboursée, 3 % du capital restant dû avant remboursement).',
  ]],
  ['Immobilier locatif', [
    'Rendement brut = loyers annuels / prix. Rendement net de charges = (loyers encaissés − charges) / (prix + frais + travaux + mobilier).',
    'Flux de trésorerie avant impôt = loyers − charges − intérêts − capital remboursé − assurance.',
    'Impôt estimé = base × (tranche marginale + prélèvements sociaux). Micro : base = loyers × (1 − abattement). Réel : loyers − charges − intérêts − assurance, déficit reporté ; LMNP : amortissement sans création de déficit.',
    'Patrimoine net immobilier = prix × (1 + évolution)^années − capital restant dû. Plus-value : 19 % + 17,2 % avec abattements pour durée de détention.',
  ]],
  ['Comparateur ETF / immobilier', [
    'Même capital de départ (l’apport) ; même effort annuel : le flux négatif après impôt du bien est investi en ETF ; un excédent est placé au taux choisi.',
    'Patrimoine net : ETF après imposition des gains ; immobilier après frais de revente, impôt sur la plus-value et remboursement du capital restant dû.',
  ]],
  ['Entreprise', [
    'Résultat avant impôt = marge brute − charges fixes − rémunération chargée. Impôt sur les sociétés après report des pertes.',
    'Flux de trésorerie = résultat net − variation du besoin en fonds de roulement (CA × délai clients / 365). Valeur = résultat net positif × multiple.',
  ]],
  ['Indépendance financière', [
    'Capital visé = (dépenses − revenus récurrents) / taux de retrait. Délai : capital × (1 + rendement réel) + épargne, chaque année.',
    'Phase de retrait : retrait en début d’année, revalorisé de l’inflation, puis rendement nominal sur le capital restant.',
  ]],
  ['Épargne de précaution', [
    'Montant visé = dépenses mensuelles × nombre de mois + réserve pour dépenses prévisibles. Les durées proposées (3, 6, 9 mois) sont des repères, non une règle officielle.',
    'Constitution : intérêts au taux mensuel équivalent puis versement en fin de mois. Versement requis : (cible − épargne × (1 + t)^n) / [((1 + t)^n − 1) / t].',
    'Répartition : LEP (si éligible), puis Livret A, puis LDDS, dans la limite des plafonds de versement ; l’excédent est indiqué sans rémunération supposée.',
  ]],
  ['Impact des frais', [
    'Rendement net = (1 + rendement brut) × (1 − frais) − 1, capitalisé chaque mois au taux actuariel équivalent, versements en début de mois (même moteur que le simulateur de patrimoine).',
    'Coût des frais = capital final sans frais − capital final avec frais, à versements et rendement brut identiques. Part des gains absorbée = coût / (capital sans frais − versements cumulés).',
  ]],
  ['Rembourser ou investir', [
    'Horizon commun : la durée restante du crédit. Crédit à échéances constantes, taux mensuel = taux nominal / 12 ; mensualité = capital × t / (1 − (1 + t)^−n).',
    'Rembourser : la somme réduit le capital, la mensualité est conservée, le crédit s’éteint plus tôt et les mensualités libérées sont investies jusqu’à l’horizon. Investir : le crédit suit son échéancier, la somme est placée dès le départ.',
    'Placement : rendement net de frais au taux actuariel mensuel ; patrimoine net = placement − impôt (taux unique sur les gains, jamais sur une perte) − capital restant dû. Rendement d’équilibre : recherche par dichotomie du rendement brut (0–30 %) qui égalise les deux options. Assurance et indemnités de remboursement anticipé ignorées.',
  ]],
  ['Inflation et pouvoir d’achat', [
    'Valeur d’une somme S en euros d’aujourd’hui après T années : S / (1 + i)^T. Montant nécessaire pour garder le même pouvoir d’achat : S × (1 + i)^T. Perte de pouvoir d’achat = 1 − valeur réelle / S.',
    'Rendement réel = (1 + r) / (1 + i) − 1. Durée pour perdre la moitié du pouvoir d’achat = ln 2 / ln(1 + i) ; durée pour doubler un capital placé = ln 2 / ln(1 + r) (valeur exacte de la « règle des 72 »). Sans versement, avant impôt.',
  ]],
  ['Budget et taux d’épargne', [
    'Taux d’épargne = épargne mensuelle / revenu net mensuel. Revenu non affecté = revenu − besoins − envies − épargne.',
    'Repère 50 / 30 / 20 : besoins 50 %, envies 30 %, épargne 20 % du revenu net ; repère pédagogique, non une règle officielle. Effort pour un taux visé = revenu × taux − épargne actuelle, couvert d’abord par le revenu non affecté puis par les envies.',
    'Projection de l’épargne : versements mensuels constants en début de mois, capitalisés au rendement net supposé (hypothèse de l’utilisateur, sans garantie).',
  ]],
];

export default function Methodologie() {
  const flagged = investments.filter((i) => !i.tax.verified || !i.fees.verified || !i.minCapital.verified).length;
  return (
    <div className="prose">
      <PageHead eyebrow="Transparence" title="Méthode et sources">
        Comment les informations sont vérifiées, comment les calculs sont faits et comment le site est maintenu.
      </PageHead>

      <h2>Indépendance et limites</h2>
      <p>
        Patrimoine OS fournit des informations générales et des outils de calcul. Il ne délivre aucun conseil en investissement personnalisé.
        Une hypothèse de rendement n'est jamais présentée comme une prévision. Aucune statistique n'est inventée.
      </p>

      <h2>Sources et vérification</h2>
      <p>
        Les informations de référence proviennent en priorité de sources officielles : AMF, Banque de France, ACPR, INSEE, Service-Public.fr,
        impots.gouv.fr et textes publiés au Journal officiel. Chaque fiche conserve ses sources, la date de vérification, la date à laquelle la fiscalité
        était considérée comme valable, les données chiffrées utilisées, les hypothèses et une date de prochaine révision. Dernière vérification
        générale : {AS_OF}. À ce jour, {flagged} fiche{flagged > 1 ? 's comportent' : ' comporte'} au moins un élément signalé « à vérifier ».
      </p>

      <h2>Mises à jour automatisées, validation humaine</h2>
      <p>Des tâches gratuites s'exécutent chaque semaine sur GitHub Actions :</p>
      <ul>
        <li>vérification des liens cités et de la présence des pages sources ;</li>
        <li>détection des modifications des pages officielles suivies, par comparaison d'empreintes, en respectant leurs règles d'accès (robots.txt) et sans copier leur contenu ;</li>
        <li>signalement des fiches dont la date de révision est passée ;</li>
        <li>exécution des tests et vérification que le site se construit.</li>
      </ul>
      <p>
        Une modification détectée ouvre un ticket de révision ; elle ne remplace jamais automatiquement une règle fiscale. Si une information ne peut
        pas être vérifiée de façon fiable, la version existante est conservée et signalée. Aucun contenu financier n'est généré automatiquement.
      </p>

      <h2>Formules de calcul</h2>
      {FORMULAS.map(([t, list]) => (
        <section key={t}>
          <h3>{t}</h3>
          <ul>{list.map((l) => <li key={l}>{l}</li>)}</ul>
        </section>
      ))}
      <p>Chaque module de calcul est indépendant et couvert par des tests automatisés, y compris sur des exemples connus et des valeurs limites.</p>

      <h2>Liens commerciaux et publicité</h2>
      <p>
        Le site ne contient aujourd'hui ni publicité ni lien affilié, et fonctionne entièrement sans revenu. Si des partenariats sont ajoutés,
        chaque lien sera signalé « Lien commercial ». Un produit ne sera jamais mis en avant parce qu'il rapporte une commission.
      </p>

      <h2>Confidentialité</h2>
      <p>Aucun cookie ; une mesure d'audience anonyme compte les pages vues ; vos calculs restent dans votre navigateur. Détails dans la <Link to="/confidentialite">politique de confidentialité</Link>.</p>
    </div>
  );
}
