import { useState } from 'react';
import { Link } from 'react-router-dom';
import { filterGlossary } from '../lib/glossaryFilter';
import { glossary, glossaryId } from '../data/glossary';
import { Crumbs, PageHead } from '../components/ui';

const idOf = glossaryId;

export default function Glossaire() {
  const [q, setQ] = useState('');
  const all = [...glossary].sort((a, b) => a.term.localeCompare(b.term, 'fr'));
  const terms = filterGlossary(all, q);
  const filtering = q.trim().length > 0;
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
        {all.length} notions expliquées simplement, avec des liens vers les simulateurs, fiches et guides qui les mettent en pratique.
      </PageHead>
      <div className="search-box gloss-search" role="search">
        <input type="search" value={q} aria-label="Chercher une notion" placeholder="Chercher une notion : inflation, ETF…" onChange={(e) => setQ(e.target.value)} />
      </div>
      <div aria-live="polite">
        {filtering && <p className="small muted gloss-status">{terms.length ? `${terms.length} notion${terms.length > 1 ? 's' : ''} pour « ${q.trim()} »` : `Aucune notion pour « ${q.trim()} ». Essayez un mot plus simple.`}</p>}
      </div>
      {!filtering && (
        <nav id="lettres" className="gloss-nav" aria-label="Aller à une lettre">
          {groups.map((g) => <a key={g.letter} href={`#lettre-${g.letter}`}>{g.letter}</a>)}
        </nav>
      )}
      <div className="gloss-groups">
      {groups.map((g) => (
        <section key={g.letter} id={`lettre-${g.letter}`} className="gloss-group" aria-labelledby={`h-${g.letter}`}>
          <h2 id={`h-${g.letter}`} className="gloss-letter" aria-label={`Notions commençant par ${g.letter}`}>{g.letter}</h2>
          {!filtering && <a className="gloss-top" href="#lettres" aria-label="Retour à la liste des lettres">↑ Lettres</a>}
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
