import { useState } from 'react';
import { Link } from 'react-router-dom';
import { norm, simulators } from '../lib/search';
import { simBlurb, simBySlug, simThemes, unthemedSims } from '../lib/simThemes';
import { PageHead } from '../components/ui';
import { SimThemeIcon } from '../components/Illustrations';

/** Simulateurs d'entrée, dans l'ordre où un débutant en a besoin (aucun chiffre : seulement des renvois). */
export const startSims: { slug: string; label: string }[] = [
  { slug: 'epargne-de-precaution', label: 'Je veux une réserve pour les imprévus' },
  { slug: 'objectif-epargne', label: 'Je veux épargner pour un projet' },
  { slug: 'endettement', label: 'Je prépare un emprunt' },
  { slug: 'budget', label: 'Je veux savoir où part mon argent' },
  { slug: 'inflation', label: 'Je crains que les prix grignotent mon épargne' },
  { slug: 'retraits-reguliers-duree-du-capital', label: 'Je prépare ma retraite' },
];

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
      <PageHead art="simulateurs" eyebrow="Simulateurs" title="Simulateurs financiers gratuits">
        {simulators.length} simulateurs classés par thème, calculés dans votre navigateur. Vos saisies restent sur cet appareil.
      </PageHead>
      <div className="field" style={{ maxWidth: 420 }}>
        <label htmlFor="sim-filter">Filtrer les simulateurs</label>
        <input id="sim-filter" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="crédit, inflation, retraite…" />
      </div>
      {!q && (
        <section aria-labelledby="sim-start">
          <h2 id="sim-start" className="small" style={{ margin: '16px 0 8px' }}>Pas sûr du simulateur à ouvrir ? Partez de votre situation.</h2>
          <ul className="search-ideas search-ideas--start">
            {startSims.map((x) => (
              <li key={x.slug}><Link className="tag" to={`/simulateurs/${x.slug}`}>{x.label} <span aria-hidden="true">→</span></Link></li>
            ))}
          </ul>
        </section>
      )}
      {q && <p className="small muted" role="status">{shown} simulateur{shown > 1 ? 's' : ''} sur {simulators.length}</p>}
      {!q && <p className="small sim-themes-label">Ou parcourez les simulateurs par thème :</p>}
      <nav aria-label="Thèmes" className="theme-nav">
        {groups.map((t) => (
          <a key={t.id} href={`#${t.id}`}><SimThemeIcon id={t.id} size={24} />{t.title} <span aria-hidden="true">{t.slugs.length}</span></a>
        ))}
      </nav>
      {groups.map((t) => (
        <section key={t.id} aria-labelledby={`h-${t.id}`}>
          <h2 id={`h-${t.id}`} className="theme-title"><SimThemeIcon id={t.id} /><span id={t.id} style={{ scrollMarginTop: 80 }}>{t.title}</span></h2>
          <ul className="inv-list inv-list--compact inv-list--grid">
            {t.slugs.map((slug) => {
              const s = simBySlug(slug);
              return <li key={slug}><Link className="inv-row" to={`/simulateurs/${slug}`}><div><h3>{s.title}</h3><p>{simBlurb(slug)}</p></div></Link></li>;
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
