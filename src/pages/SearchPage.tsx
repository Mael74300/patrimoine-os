import { Link, useSearchParams } from 'react-router-dom';
import { search, searchSuggestions } from '../lib/search';
import { PageHead } from '../components/ui';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const hits = search(q);
  return (
    <>
      <PageHead title="Recherche" />
      <div className="search-box" role="search">
        <input type="search" value={q} autoFocus aria-label="Rechercher" placeholder="PEA, SCPI, crédit…" onChange={(e) => setParams({ q: e.target.value }, { replace: true })} />
      </div>
      <p className="small muted" aria-live="polite">{q ? `${hits.length} résultat${hits.length > 1 ? 's' : ''} pour « ${q} »` : 'Saisissez un mot-clé.'}</p>
      {hits.length === 0 && (
        <section aria-labelledby="search-ideas">
          <h2 id="search-ideas">{q ? 'Essayez plutôt un de ces points de départ' : 'Points de départ'}</h2>
          <p className="small muted">{q ? 'Vérifiez l’orthographe ou cherchez un mot plus simple (« crédit », « retraite », « impôt »).' : 'Ou tapez un mot dans la zone de recherche : placement, simulateur ou guide.'}</p>
          <ul className="search-ideas">
            {searchSuggestions.map((s) => (
              <li key={s.to}><Link className="tag" to={s.to}>{s.label}</Link></li>
            ))}
          </ul>
        </section>
      )}
      <ul className="inv-list">
        {hits.map((h) => (
          <li key={h.to}>
            <Link className="inv-row" to={h.to}>
              <div>
                <div className="small muted">{h.kind}</div>
                <h3>{h.title}</h3>
                <p>{h.excerpt}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
