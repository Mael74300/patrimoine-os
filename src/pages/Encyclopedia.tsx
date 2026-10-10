import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { categories, categoryById } from '../data/categories';
import { investments } from '../data/investments';
import { norm } from '../lib/search';
import { Dots, PageHead } from '../components/ui';

export default function Encyclopedia() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const cat = params.get('cat') ?? '';
  const maxRisk = Number(params.get('risque') ?? 5);
  const minLiq = Number(params.get('liquidite') ?? 1);
  const set = (k: string, v: string) => {
    const p = new URLSearchParams(params);
    if (v) p.set(k, v);
    else p.delete(k);
    setParams(p, { replace: true });
  };

  const list = useMemo(() => {
    const terms = norm(q).split(/\s+/).filter(Boolean);
    return investments
      .filter((i) => !cat || i.category === cat)
      .filter((i) => i.risk <= maxRisk && i.liquidity >= minLiq)
      .filter((i) => {
        const hay = norm([i.name, i.summary, i.tags.join(' '), categoryById[i.category].name].join(' '));
        return terms.every((t) => hay.includes(t));
      })
      .sort((a, b) => categoryById[a.category].order - categoryById[b.category].order || a.name.localeCompare(b.name));
  }, [q, cat, maxRisk, minLiq]);

  const currentCat = cat ? categoryById[cat] : null;

  return (
    <>
      <PageHead eyebrow="Encyclopédie" title={currentCat ? currentCat.name : 'Encyclopédie des investissements'}>
        {currentCat ? currentCat.short : `${investments.length} fiches structurées, avec fiscalité datée et sources. Le catalogue s'enrichit progressivement.`}
      </PageHead>

      <div className="filters" role="group" aria-label="Filtres">
        <div>
          <label htmlFor="f-q">Recherche</label>
          <input id="f-q" type="search" value={q} placeholder="ex. immobilier, retraite…" onChange={(e) => set('q', e.target.value)} />
        </div>
        <div>
          <label htmlFor="f-cat">Famille</label>
          <select id="f-cat" value={cat} onChange={(e) => set('cat', e.target.value)}>
            <option value="">Toutes</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="f-r">Risque maximal</label>
          <select id="f-r" value={maxRisk} onChange={(e) => set('risque', e.target.value === '5' ? '' : e.target.value)}>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n === 5 ? 'Tous' : `${n} sur 5 ou moins`}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="f-l">Liquidité minimale</label>
          <select id="f-l" value={minLiq} onChange={(e) => set('liquidite', e.target.value === '1' ? '' : e.target.value)}>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n === 1 ? 'Toutes' : `${n} sur 5 ou plus`}</option>)}
          </select>
        </div>
      </div>

      <p className="small muted" aria-live="polite">{list.length} résultat{list.length > 1 ? 's' : ''}</p>
      {currentCat && list.length === 0 && !q && (
        <p className="notice info">Les fiches de cette famille sont en préparation. Elles seront publiées une fois leurs informations vérifiées.</p>
      )}
      <ul className="inv-list">
        {list.map((i) => (
          <li key={i.slug}>
            <Link className="inv-row" to={`/encyclopedie/${i.slug}`}>
              <div>
                <div className="small muted">{categoryById[i.category].name}</div>
                <h3>{i.name}</h3>
                <p>{i.summary}</p>
              </div>
              <div className="meters">
                <Dots level={i.risk} kind="risk" label="Risque" />
                <Dots level={i.liquidity} kind="liq" label="Liquidité" />
                <Dots level={i.effort} label="Effort" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
