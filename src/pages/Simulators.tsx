import { useState } from 'react';
import { Link } from 'react-router-dom';
import { norm, simulators } from '../lib/search';
import { simBySlug, simThemes, unthemedSims } from '../lib/simThemes';
import { PageHead } from '../components/ui';

export default function Simulators() {
  const [q, setQ] = useState('');
  const terms = norm(q).split(/\s+/).filter(Boolean);
  const match = (slug: string) => {
    const s = simBySlug(slug);
    const text = norm(`${s.title} ${s.excerpt} ${s.keywords}`);
    return terms.every((t) => text.includes(t));
  };
  const groups = [...simThemes, { id: 'autres', title: 'Autres', slugs: unthemedSims().map((s) => s.slug) }]
    .map((t) => ({ ...t, slugs: t.slugs.filter(match) }))
    .filter((t) => t.slugs.length);
  const shown = groups.reduce((n, t) => n + t.slugs.length, 0);

  return (
    <>
      <PageHead eyebrow="Simulateurs" title="Simulateurs financiers gratuits">
        {simulators.length} simulateurs classés par thème, calculés dans votre navigateur. Vos saisies restent sur cet appareil.
      </PageHead>
      <div className="field" style={{ maxWidth: 420 }}>
        <label htmlFor="sim-filter">Filtrer les simulateurs</label>
        <input id="sim-filter" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="crédit, inflation, retraite…" />
      </div>
      {q && <p className="small muted" role="status">{shown} simulateur{shown > 1 ? 's' : ''} sur {simulators.length}</p>}
      <nav aria-label="Thèmes" className="small" style={{ margin: '8px 0 16px' }}>
        {groups.map((t, i) => (
          <span key={t.id}>{i > 0 && ' · '}<a href={`#${t.id}`}>{t.title}</a></span>
        ))}
      </nav>
      {groups.map((t) => (
        <section key={t.id} aria-labelledby={`h-${t.id}`}>
          <h2 id={`h-${t.id}`}><span id={t.id} style={{ scrollMarginTop: 80 }}>{t.title}</span></h2>
          <ul className="inv-list">
            {t.slugs.map((slug) => {
              const s = simBySlug(slug);
              return <li key={slug}><Link className="inv-row" to={`/simulateurs/${slug}`}><div><h3>{s.title}</h3><p>{s.excerpt}</p></div></Link></li>;
            })}
          </ul>
        </section>
      ))}
      {!shown && <p className="muted">Aucun simulateur ne correspond à « {q} ».</p>}
      <p className="small muted" style={{ marginTop: 24 }}>
        Pour comparer des placements entre eux : <Link to="/comparateur">comparateur de fiches</Link>. Formules et conventions :{' '}
        <Link to="/methodologie">Méthode et sources</Link>.
      </p>
    </>
  );
}
