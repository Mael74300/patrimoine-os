import { Link } from 'react-router-dom';
import { simulators } from '../lib/search';
import { PageHead } from '../components/ui';

export default function Simulators() {
  return (
    <>
      <PageHead eyebrow="Simulateurs" title="Simulateurs financiers gratuits">
        Sans compte, calculés dans votre navigateur. Vos saisies restent sur cet appareil.
      </PageHead>
      <div className="grid cols-2">
        {simulators.map((s) => (
          <Link key={s.slug} to={`/simulateurs/${s.slug}`} className="panel" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)' }}>{s.title}</h2>
            <p className="muted" style={{ margin: '6px 0 0' }}>{s.excerpt}</p>
          </Link>
        ))}
        <Link to="/comparateur" className="panel" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)' }}>Comparateur de placements</h2>
          <p className="muted" style={{ margin: '6px 0 0' }}>Jusqu'à trois fiches côte à côte, avec projection selon vos hypothèses.</p>
        </Link>
      </div>
      <p className="small muted" style={{ marginTop: 24 }}>
        Formules et conventions : <Link to="/methodologie">Méthode et sources</Link>. Chaque formule est vérifiée par des tests automatisés.
      </p>
    </>
  );
}
