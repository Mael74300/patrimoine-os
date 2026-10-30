import { Link } from 'react-router-dom';
import { investments } from '../data/investments';
import { Dots, PageHead } from '../components/ui';
import { SchemaSeparer } from '../components/Illustrations';

const PATHS = [
  {
    title: 'Créer à partir de ses compétences',
    body: "Prestations de services, conseil, artisanat. Peu de capital, revenu rapide si la demande existe, mais le revenu dépend de votre temps.",
    steps: ['Tester la demande avec quelques clients avant de se déclarer à grande échelle.', 'Choisir un statut simple pour démarrer.', 'Fixer un prix qui couvre cotisations, impôts et périodes creuses.'],
  },
  {
    title: 'Construire un produit',
    body: "Logiciel, e-commerce, contenu. Le revenu peut se détacher de votre temps, mais l'échec est fréquent et la mise en route longue.",
    steps: ['Résoudre un problème précis pour une cible précise.', 'Mesurer le revenu récurrent et le taux de désabonnement.', 'Limiter la dépendance à une seule plateforme.'],
  },
  {
    title: 'Racheter une activité existante',
    body: "Plus coûteux, mais l'activité dégage déjà des résultats. Le principal risque est de surpayer ou de mal évaluer la dépendance au cédant.",
    steps: ['Faire auditer comptes, contrats et salariés.', 'Valoriser à partir des résultats récurrents, pas des promesses.', 'Négocier une période d’accompagnement.'],
  },
];

export default function Entrepreneuriat() {
  const related = investments.filter((i) => ['entreprise', 'numerique', 'capital-humain'].includes(i.category));
  return (
    <>
      <PageHead eyebrow="Entrepreneuriat" title="Créer de la richesse par l'entreprise">
        L'entreprise est à la fois une source de revenus à épargner et un actif qui peut se revendre. C'est aussi la voie la plus risquée et la plus exigeante.
      </PageHead>

      <h2>Trois façons d'entreprendre</h2>
      <div className="grid cols-3">
        {PATHS.map((p) => (
          <div className="panel" key={p.title}>
            <h3 style={{ marginTop: 0 }}>{p.title}</h3>
            <p className="muted">{p.body}</p>
            <ul className="small" style={{ paddingLeft: 18, marginBottom: 0 }}>{p.steps.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>
        ))}
      </div>

      <p className="notice info" style={{ marginTop: 24 }}>
        Testez vos hypothèses de chiffre d'affaires, de marge, de rémunération et de trésorerie dans le{' '}
        <Link to="/simulateurs/entreprise">calculateur entrepreneurial</Link>, en trois scénarios.
      </p>

      <h2>Séparer l'entreprise et le patrimoine</h2>
      <SchemaSeparer />
      <div className="prose">
        <p>
          Un entrepreneur concentre souvent l'essentiel de son patrimoine dans sa société. Constituer en parallèle une épargne personnelle diversifiée
          (livrets, PEA, assurance-vie) réduit la dépendance à une seule activité. Le <Link to="/simulateurs/patrimoine">simulateur de patrimoine</Link> permet
          d'estimer ce que représenterait l'investissement régulier d'une partie des bénéfices.
        </p>
        <p className="notice small">
          Statuts, plafonds de la micro-entreprise et taux de cotisations changent régulièrement : vérifiez-les sur le site de l'URSSAF et de Bpifrance Création
          avant toute décision.
        </p>
      </div>

      <h2>Fiches liées</h2>
      <ul className="inv-list">
        {related.map((i) => (
          <li key={i.slug}>
            <Link className="inv-row" to={`/encyclopedie/${i.slug}`}>
              <div><h3>{i.name}</h3><p>{i.summary}</p></div>
              <div className="meters"><Dots level={i.risk} kind="risk" label="Risque" /><Dots level={i.effort} label="Effort" /></div>
            </Link>
          </li>
        ))}
      </ul>

      <h2>Ressources publiques gratuites</h2>
      <ul>
        <li><a href="https://bpifrance-creation.fr" target="_blank" rel="noopener noreferrer">Bpifrance Création</a> — choix du statut, financement, guides.</li>
        <li><a href="https://www.autoentrepreneur.urssaf.fr" target="_blank" rel="noopener noreferrer">URSSAF — Micro-entrepreneur</a> — déclaration et cotisations.</li>
        <li><a href="https://formalites.entreprises.gouv.fr" target="_blank" rel="noopener noreferrer">Guichet unique des formalités d'entreprises</a> — création et modifications.</li>
      </ul>
    </>
  );
}
