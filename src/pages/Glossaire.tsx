import { Link } from 'react-router-dom';
import { glossary } from '../data/glossary';
import { Crumbs, PageHead } from '../components/ui';

const idOf = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function Glossaire() {
  const terms = [...glossary].sort((a, b) => a.term.localeCompare(b.term, 'fr'));
  const letters = terms.reduce<{ letter: string; first: (typeof terms)[number] }[]>((acc, t) => {
    const letter = t.term.normalize('NFD').replace(/[̀-ͯ]/g, '')[0].toUpperCase();
    return acc.some((x) => x.letter === letter) ? acc : [...acc, { letter, first: t }];
  }, []);
  return (
    <div className="prose">
      <Crumbs items={[{ to: '/', label: 'Accueil' }, { label: 'Glossaire' }]} />
      <PageHead eyebrow="Pédagogie" title="Glossaire de la finance personnelle">
        {terms.length} notions expliquées simplement, avec des liens vers les simulateurs, fiches et guides qui les mettent en pratique.
      </PageHead>
      <nav className="gloss-nav" aria-label="Aller à une lettre">
        {letters.map((l) => <a key={l.letter} href={`#${idOf(l.first.term)}`}>{l.letter}</a>)}
      </nav>
      <dl className="gloss-list">
        {terms.map((t) => (
          <div key={t.term} id={idOf(t.term)} className="gloss-item">
            <dt>{t.term}</dt>
            <dd>
              {t.definition}
              <div className="gloss-links">
                <span>Voir aussi</span>
                {t.links.map((l) => <Link key={l.to} to={l.to}>{l.label}</Link>)}
              </div>
            </dd>
          </div>
        ))}
      </dl>
      <p className="muted small">Définitions générales à visée pédagogique, sans conseil personnalisé. Les chiffres réglementaires figurent dans les fiches, datés et sourcés.</p>
    </div>
  );
}
