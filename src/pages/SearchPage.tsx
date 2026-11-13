import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchDetailed, searchSuggestions } from '../lib/search';
import { PageHead } from '../components/ui';

/** Nombre de résultats affichés avant le bouton « Voir les autres ». */
export const FIRST = 10;

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const urlQ = params.get('q') ?? '';
  // La saisie vit dans la page et n'est recopiée dans l'adresse qu'après une courte pause :
  // une frappe rapide ne perd plus de lettres, et l'adresse reste partageable.
  const [q, setQ] = useState(urlQ);
  const pending = useRef(0);
  useEffect(() => {
    if (!pending.current && urlQ !== q) setQ(urlQ); // adresse changée ailleurs (loupe de l'en-tête, accueil)
  }, [urlQ]);
  useEffect(() => {
    return () => window.clearTimeout(pending.current);
  }, []);
  const onType = (v: string) => {
    setQ(v);
    window.clearTimeout(pending.current);
    pending.current = window.setTimeout(() => {
      pending.current = 0;
      setParams(v ? { q: v } : {}, { replace: true });
    }, 250);
  };
  const { hits, partial } = searchDetailed(q);
  // Les premiers résultats d'abord ; le reste sur demande, pour ne pas dérouler 40 cartes sur mobile.
  const [more, setMore] = useState<string | null>(null);
  const shown = more === q ? hits : hits.slice(0, FIRST);
  // Arrivée par la loupe de l'en-tête : la zone de saisie prend le focus, après celui que l'application
  // donne au contenu à chaque changement de page (d'où le léger délai).
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const t = window.setTimeout(() => input.current?.focus({ preventScroll: true }), 0);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <>
      <PageHead title="Recherche" />
      <div className="search-box" role="search">
        <input ref={input} type="search" value={q} autoFocus aria-label="Rechercher" placeholder="PEA, SCPI, crédit…" onChange={(e) => onType(e.target.value)} />
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
      {partial && <p className="small">Aucune page ne contient tous ces mots : voici les plus proches.</p>}
      {hits.length > 0 && (
        <ul className="inv-list">
          {shown.map((h) => (
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
      )}
      {shown.length < hits.length && (
        <button type="button" className="btn secondary search-more" onClick={() => setMore(q)}>
          {`Voir les ${hits.length - shown.length} autres résultats`}
        </button>
      )}
    </>
  );
}
