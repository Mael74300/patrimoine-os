import { Link } from 'react-router-dom';
import { glossary } from '../data/glossary';
import { Crumbs, PageHead } from '../components/ui';

const idOf = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function Glossaire() {
  const terms = [...glossary].sort((a, b) => a.term.localeCompare(b.term, 'fr'));
  return (
    <div className="prose">
      <Crumbs items={[{ to: '/', label: 'Accueil' }, { label: 'Glossaire' }]} />
      <PageHead eyebrow="Pédagogie" title="Glossaire de la finance personnelle">
        {terms.length} notions expliquées simplement, avec des liens vers les simulateurs, fiches et guides qui les mettent en pratique.
      </PageHead>
      <dl>
        {terms.map((t) => (
          <div key={t.term} id={idOf(t.term)} style={{ marginBottom: 20 }}>
            <dt><strong>{t.term}</strong></dt>
            <dd style={{ margin: '4px 0 0' }}>
              {t.definition}
              <div className="small muted">
                Voir aussi : {t.links.map((l, i) => <span key={l.to}>{i > 0 && ' · '}<Link to={l.to}>{l.label}</Link></span>)}
              </div>
            </dd>
          </div>
        ))}
      </dl>
      <p className="muted small">Définitions générales à visée pédagogique, sans conseil personnalisé. Les chiffres réglementaires figurent dans les fiches, datés et sourcés.</p>
    </div>
  );
}
