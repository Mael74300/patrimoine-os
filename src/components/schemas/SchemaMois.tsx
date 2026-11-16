import { fmtEur, fmtPct, HCSF } from '../../lib/finance';
import { incomeBreakdown } from '../../lib/calc/debtRatio';

/**
 * « Où partent vos revenus » du simulateur d'endettement : une barre des revenus du mois (crédits, autres charges, reste à vivre),
 * avec le repère de 35 % en pointillé, puis le détail poste par poste. Calculée à partir des montants saisis.
 */
export function SchemaMois(props: { income: number; existingPayments: number; newPayment: number; livingCosts: number }) {
  const m = incomeBreakdown(props);
  if (m.income <= 0 || m.scale <= 0) return null;
  const pct = `${HCSF.maxRatio * 100} %`;
  const marker = Math.min(100, m.marker);
  // L'étiquette du repère reste dans la barre, même quand le trait est près d'un bord.
  const labelLeft = Math.min(Math.max(marker, 22), 78);
  const aria = `${m.parts.map((p) => `${p.label} : ${fmtEur(p.value)}`).join(' ; ')}. Repère de ${pct} des revenus : ${fmtEur(m.limit)}.`;
  const creditsWidth = Math.min(100, (m.credits / m.scale) * 100);
  const creditsShare = fmtPct(m.credits / m.income);
  const creditsLine = m.margin >= 0
    ? <>Seuls les crédits comptent pour le repère (c’est votre taux d’endettement) : il reste {fmtEur(m.margin)} de marge avant le trait.</>
    : <>Seuls les crédits comptent pour le repère (c’est votre taux d’endettement) : ils dépassent le trait de {fmtEur(-m.margin)} par mois.</>;
  return (
    <>
      <h2>Où partent vos revenus chaque mois</h2>
      <figure className="db">
        <div className="db-head">
          <span>Vos revenus</span>
          <strong>{fmtEur(m.income)} par mois</strong>
        </div>
        {m.credits > 0 && (
          <div className="db-brace" aria-hidden="true">
            <span style={{ width: `${creditsWidth}%` }}><b>Crédits : {creditsShare}</b></span>
          </div>
        )}
        <div className="db-wrap">
          <div className="bb-bar db-bar" role="img" aria-label={aria}>
            {m.parts.map((p, i) => {
              // Pourcentage écrit dans la case s'il y tient et si le trait du repère ne le traverse pas.
              const start = m.parts.slice(0, i).reduce((a, q) => a + q.width, 0);
              const clear = Math.abs(start + p.width / 2 - marker) > 7;
              return (
                <span key={p.key} className={'bb-seg db-' + p.key} style={{ width: `${p.width}%` }}>
                  {p.width >= 13 && clear ? fmtPct(p.share) : ''}
                </span>
              );
            })}
          </div>
          <span className="db-mark" style={{ left: `${marker}%` }} aria-hidden="true" />
        </div>
        <div className="db-scale" aria-hidden="true">
          <span style={{ left: `${labelLeft}%` }}>Repère {pct} = {fmtEur(m.limit)}</span>
        </div>
        <ul className="db-list">
          {m.parts.map((p) => (
            <li key={p.key}>
              <i className={'bb-dot db-' + p.key} aria-hidden="true" />
              <span className="db-label">{p.label}</span>
              <strong className="db-amount">{fmtEur(p.value)}</strong>
              <span className="db-share">{fmtPct(p.share)}</span>
            </li>
          ))}
        </ul>
        <figcaption>
          {m.shortfall > 0 && <><strong>Vos dépenses dépassent vos revenus de {fmtEur(m.shortfall)} par mois.</strong> </>}
          {creditsLine}
        </figcaption>
      </figure>
    </>
  );
}
