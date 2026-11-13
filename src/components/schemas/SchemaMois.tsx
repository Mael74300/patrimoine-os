import { fmtEur, HCSF } from '../../lib/finance';
import { moisParts } from '../../lib/illustrationData';

/** Barre « où part votre mois » du simulateur d'endettement : calculée à partir des montants saisis, largeurs proportionnelles. */
export function SchemaMois(props: { income: number; existingPayments: number; newPayment: number; livingCosts: number }) {
  const m = moisParts(props);
  if (m.income <= 0 || m.scale <= 0) return null;
  const X0 = 14;
  const BW = 312;
  const fills: Record<string, { fill: string; stroke?: string }> = {
    existing: { fill: 'var(--primary)' },
    added: { fill: 'var(--accent)' },
    living: { fill: 'var(--warn-soft)', stroke: 'var(--warn)' },
    rest: { fill: 'var(--surface-2)', stroke: 'var(--line)' },
  };
  const parts = m.parts.filter((p) => p.value > 0);
  let cursor = 0;
  const segs = parts.map((p) => {
    const x = X0 + (cursor / m.scale) * BW;
    const w = (p.value / m.scale) * BW;
    cursor += p.value;
    return { ...p, x, w };
  });
  const xLimit = X0 + (m.limit / m.scale) * BW;
  const alt = `${parts.map((p) => `${p.label} : ${fmtEur(p.value)}`).join(' ; ')}.${m.shortfall > 0 ? ` Les dépenses dépassent les revenus de ${fmtEur(m.shortfall)}.` : ''} Repère de ${HCSF.maxRatio * 100} % des revenus : ${fmtEur(m.limit)}.`;
  const H = 128 + parts.length * 26;
  return (
    <figure className="illustration">
      <svg viewBox={`0 0 340 ${H}`} role="img" aria-labelledby="ill-mois-t ill-mois-d" className="ill-svg">
        <title id="ill-mois-t">Où part votre mois de revenus</title>
        <desc id="ill-mois-d">{`Revenus nets : ${fmtEur(m.income)} par mois. ${alt}`}</desc>
        <text x={X0} y="16" className="ill-step">{`Vos revenus : ${fmtEur(m.income)} par mois`}</text>
        <clipPath id="ill-mois-clip"><rect x={X0} y="30" width={BW} height="34" rx="8" /></clipPath>
        <g clipPath="url(#ill-mois-clip)">
          {segs.map((s) => (
            <rect key={s.key} x={s.x} y="30" width={s.w} height="34" fill={fills[s.key].fill} />
          ))}
        </g>
        <rect x={X0} y="30" width={BW} height="34" rx="8" fill="none" stroke="var(--line)" />
        <line x1={xLimit} x2={xLimit} y1="22" y2="74" stroke="var(--ink)" strokeWidth="2.5" strokeDasharray="4 3" />
        <text x={Math.min(Math.max(xLimit, 90), 250)} y="92" textAnchor="middle" className="ill-total">{`Repère : 35 % = ${fmtEur(m.limit)}`}</text>
        {parts.map((p, i) => (
          <g key={p.key}>
            <rect x={X0} y={108 + i * 26} width="18" height="18" rx="4" fill={fills[p.key].fill} stroke={fills[p.key].stroke ?? 'none'} />
            <text x={X0 + 28} y={122 + i * 26} className="ill-step">{`${fmtEur(p.value)} : ${p.label.toLowerCase()}`}</text>
          </g>
        ))}
      </svg>
      <figcaption>
        {m.shortfall > 0
          ? `Vos dépenses dépassent vos revenus de ${fmtEur(m.shortfall)} par mois.`
          : 'Seuls les crédits (en cours et nouveau) sont comparés au repère de 35 %.'}
      </figcaption>
    </figure>
  );
}
