import { Link } from 'react-router-dom';
import { simulators } from '../lib/search';
import { PageHead } from '../components/ui';

export default function Simulators() {
  return (
    <>
      <PageHead eyebrow="Simulateurs" title="Simulateurs financiers">
        Gratuits, sans compte, calculés dans votre navigateur. Vos saisies sont mémorisées sur cet appareil uniquement.
      </PageHead>
      <div className="grid cols-2">
        {simulators.map((s) => (
          <Link key={s.slug} to={`/simulateurs/${s.slug}`} className="panel" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3 style={{ marginTop: 0, color: 'var(--primary)' }}>{s.title}</h3>
            <p className="muted" style={{ marginBottom: 0 }}>{s.excerpt}</p>
          </Link>
        ))}
        <Link to="/comparateur" className="panel" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 style={{ marginTop: 0, color: 'var(--primary)' }}>Comparateur de placements et de stratégies</h3>
          <p className="muted" style={{ marginBottom: 0 }}>Jusqu'à trois placements côte à côte, avec projection selon vos hypothèses.</p>
        </Link>
      </div>
      <p className="small muted" style={{ marginTop: 24 }}>
        Les formules utilisées sont décrites dans <Link to="/methodologie">Méthode & sources</Link> et vérifiées par des tests automatisés.
      </p>
    </>
  );
}
