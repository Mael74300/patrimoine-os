import { Link } from 'react-router-dom';
import { investments } from '../data/investments';
import { MeterRows, MetersLegend, PageHead } from '../components/ui';
import { SchemaSeparer } from '../components/schemas/SchemaSeparer';

const PATHS = [
  {
    title: 'Créer à partir de ses compétences',
    body: "Services, conseil, artisanat. Peu d'argent pour démarrer, des revenus rapides s'il y a des clients, mais vous ne gagnez que quand vous travaillez.",
    fiche: { slug: 'creation-entreprise', label: 'la fiche Créer son entreprise' },
    steps: [
      'Trouver quelques premiers clients avant de tout miser dessus.',
      'Démarrer avec un statut simple (Bpifrance Création aide à choisir).',
      'Fixer un prix qui paie aussi cotisations, impôts et mois sans clients.',
    ],
  },
  {
    title: 'Construire un produit',
    body: "Logiciel, boutique en ligne, formation en vidéo. Le produit peut se vendre sans vous, mais beaucoup de projets échouent et les ventes tardent souvent.",
    fiche: { slug: 'activite-numerique', label: 'la fiche SaaS, e-commerce et produits numériques' },
    steps: [
      'Partir d’un problème précis, vécu par un public précis.',
      'Suivre les abonnements et la part des clients qui s’en vont.',
      'Ne pas dépendre d’un seul site pour vendre.',
    ],
  },
  {
    title: 'Racheter une activité existante',
    body: "Plus cher au départ, mais l'activité gagne déjà de l'argent. Les grands risques : payer trop cher, ou voir les clients partir avec l'ancien propriétaire.",
    fiche: { slug: 'reprise-entreprise', label: 'la fiche Racheter une entreprise' },
    steps: [
      'Faire vérifier comptes, contrats et salariés par un professionnel.',
      'Payer d’après ce que l’activité gagne vraiment, pas d’après des promesses.',
      'Obtenir que l’ancien propriétaire vous accompagne quelques mois.',
    ],
  },
];

export default function Entrepreneuriat() {
  const fiche = (slug: string) => investments.find((i) => i.slug === slug)!;
  const competences = fiche('capital-humain');
  return (
    <>
      <PageHead art="entrepreneuriat" eyebrow="Entrepreneuriat" title="Créer de la richesse par l'entreprise">
        Une entreprise peut rapporter des revenus à épargner, puis se revendre. C'est aussi la voie la plus risquée et la plus exigeante.
      </PageHead>

      <h2>Trois façons d'entreprendre</h2>
      <div className="grid cols-3">
        {PATHS.map((p) => {
          const inv = fiche(p.fiche.slug);
          return (
            <div className="panel path-card" key={p.title}>
              <h3>{p.title}</h3>
              <p className="muted">{p.body}</p>
              <MeterRows risk={inv.risk} liquidity={inv.liquidity} effort={inv.effort} effortNote={inv.timeSkills} noNote />
              <ul className="small path-steps">{p.steps.map((s) => <li key={s}>{s}</li>)}</ul>
              <p className="path-more"><Link to={`/encyclopedie/${p.fiche.slug}`} aria-label={`Lire ${p.fiche.label}`}>Voir la fiche →</Link></p>
            </div>
          );
        })}
      </div>
      <MetersLegend />

      <div className="panel cta-band">
        <p>
          <strong>Votre projet en chiffres :</strong> ventes, charges, ce que vous pourrez vous verser et l’argent disponible, en scénario pessimiste,
          central et optimiste.
        </p>
        <Link className="btn" to="/simulateurs/entreprise">Chiffrer mon projet</Link>
      </div>

      <h2>Séparer l'entreprise et le patrimoine</h2>
      <SchemaSeparer>
        <p>
          Un entrepreneur a souvent presque tout son patrimoine dans sa société. Une épargne personnelle à côté (livrets, PEA, assurance-vie) limite la
          casse si l'activité s'arrête. Le <Link to="/simulateurs/patrimoine">simulateur de patrimoine</Link> estime ce que donnerait le placement régulier
          d'une partie des bénéfices.
        </p>
      </SchemaSeparer>
      <h2>Avant de vous lancer</h2>
      <div className="path-prep">
        <Link className="panel path-before" to={`/encyclopedie/${competences.slug}`}>
          <strong>{competences.name} →</strong>
          <span>{competences.summary}</span>
        </Link>
        <div className="panel">
          <h3>Ressources publiques gratuites</h3>
          <ul className="small">
            <li><a href="https://bpifrance-creation.fr" target="_blank" rel="noopener noreferrer">Bpifrance Création</a> — choix du statut, financement, guides.</li>
            <li><a href="https://www.autoentrepreneur.urssaf.fr" target="_blank" rel="noopener noreferrer">URSSAF — Micro-entrepreneur</a> — déclaration et cotisations.</li>
            <li><a href="https://formalites.entreprises.gouv.fr" target="_blank" rel="noopener noreferrer">Guichet unique des formalités d'entreprises</a> — création et modifications.</li>
          </ul>
          <p className="small path-warn">Statuts, plafonds et taux de cotisations changent souvent : vérifiez-les sur ces sites avant de décider.</p>
        </div>
      </div>
    </>
  );
}
