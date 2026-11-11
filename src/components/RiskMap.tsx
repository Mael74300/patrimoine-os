import { Link } from 'react-router-dom';
import { investments } from '../data/investments';
import { HIGH_EFFORT, HORIZONS, RISK_BANDS, riskMap } from '../lib/riskMap';

/** Petite horloge : la fiche demande du temps ou des compétences (effort 4 ou 5 sur 5). */
function EffortMark() {
  return (
    <svg className="rm-effort" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 4.6V8l2.4 1.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Classement des fiches par risque (lignes) et horizon conseillé (colonnes), à partir des repères des fiches. */
export function RiskMap() {
  const { cells, envelopes } = riskMap(investments);
  return (
    <div className="rm">
      <div className="rm-wrap">
        <table className="rm-table">
          <caption className="sr-only">Placements classés par risque et par durée de placement conseillée</caption>
          <thead>
            <tr>
              <td className="rm-corner"><span>Durée conseillée →</span><span>Risque ↓</span></td>
              {HORIZONS.map((h) => <th key={h.id} scope="col">{h.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {RISK_BANDS.map((r) => (
              <tr key={r.id} className={`rm-row rm-${r.id}`}>
                <th scope="row">
                  <span className="rm-risk">{r.label}</span>
                  <span className="rm-hint">{r.hint}</span>
                </th>
                {HORIZONS.map((h) => {
                  const c = cells.find((x) => x.risk === r.id && x.horizon === h.id)!;
                  return (
                    <td key={h.id} data-label={h.label} className={c.items.length ? undefined : 'rm-empty'}>
                      {c.items.length ? (
                        <ul>
                          {c.items.map((i) => (
                            <li key={i.slug}>
                              <Link to={`/encyclopedie/${i.slug}`}>{i.name}</Link>
                              {i.effort >= HIGH_EFFORT && <><EffortMark /><span className="sr-only"> (demande beaucoup de temps)</span></>}
                            </li>
                          ))}
                        </ul>
                      ) : <span aria-label="aucune fiche">—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="rm-legend small"><EffortMark /> demande beaucoup de temps ou de compétences. Repères attribués par Patrimoine OS : un classement indicatif, qui ne remplace pas la lecture de la fiche.</p>
      <p className="rm-env small">
        <strong>À part, les enveloppes</strong> : leur risque dépend de ce qu’on y place.{' '}
        {envelopes.map((e, k) => <span key={e.slug}>{k > 0 && ' · '}<Link to={`/encyclopedie/${e.slug}`}>{e.name}</Link></span>)}
      </p>
    </div>
  );
}
