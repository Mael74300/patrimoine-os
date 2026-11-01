import { Link } from 'react-router-dom';
import { glossary } from '../data/glossary';
import { Crumbs, PageHead } from '../components/ui';

const idOf = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function Glossaire() {
  const terms = [...glossary].sort((a, b) => a.term.localeCompare(b.term, 'fr'));
  const strip = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '')[0].toUpperCase();
  const groups = terms.reduce<{ letter: string; items: typeof terms }[]>((acc, t) => {
    const letter = strip(t.term);
    const last = acc[acc.length - 1];
    if (last && last.letter === letter) last.items.push(t);
    else acc.push({ letter, items: [t] });
    return acc;
  }, []);
  return (
    <div className="prose">
      <Crumbs items={[{ to: '/', label: 'Accueil' }, { label: 'Glossaire' }]} />
      <PageHead eyebrow="Pédagogie" title="Glossaire de la finance personnelle">
        {terms.length} notions expliquées simplement, avec des liens vers les simulateurs, fiches et guides qui les mettent en pratique.
      </PageHead>
      <nav className="gloss-nav" aria-label="Aller à une lettre">
        {groups.map((g) => <a key={g.letter} href={`#lettre-${g.letter}`}>{g.letter}</a>)}
      </nav>
      <div className="gloss-groups">
      {groups.map((g) => (
        <section key={g.letter} id={`lettre-${g.letter}`} className="gloss-group" aria-labelledby={`h-${g.letter}`}>
          <h2 id={`h-${g.letter}`} className="gloss-letter" aria-label={`Notions commençant par ${g.letter}`}>{g.letter}</h2>
          <dl className="gloss-list">
            {g.items.map((t) => (
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
        </section>
      ))}
      </div>
      <p className="muted small">Définitions générales à visée pédagogique, sans conseil personnalisé. Les chiffres réglementaires figurent dans les fiches, datés et sourcés.</p>
    </div>
  );
}
