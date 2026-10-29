import { fmtEur } from '../lib/finance';
import { SNOWBALL_EXAMPLE, snowballGroups, type SnowballBar } from '../lib/illustrationData';

const W = 420;
const BASE = 262;
const TOP = 40;
const BAR_W = 64;

/** Schéma « boule de neige » : même capital, mêmes 5 %, intérêts simples ou réinvestis. Les hauteurs sont proportionnelles aux montants. */
export function SchemaInterets() {
  const groups = snowballGroups();
  const max = Math.max(...groups.map((g) => g.compound.total));
  const h = (v: number) => (v / max) * (BASE - TOP);
  const { initial, annualRate } = SNOWBALL_EXAMPLE;
  const alt = groups
    .map((g) => `Après ${g.year} ans : ${fmtEur(g.simple.total)} en intérêts simples, ${fmtEur(g.compound.total)} en intérêts composés.`)
    .join(' ');

  const bar = (b: SnowballBar, x: number) => {
    const hc = h(b.capital);
    const hi = h(b.interest);
    const compound = b.kind === 'compound';
    return (
      <g key={b.kind + x}>
        <rect x={x} y={BASE - hc} width={BAR_W} height={hc} rx={4} fill="var(--primary)" />
        <rect x={x} y={BASE - hc - hi} width={BAR_W} height={hi} rx={4} fill={compound ? 'var(--accent-soft)' : 'var(--warn-soft)'} stroke={compound ? 'var(--accent)' : 'var(--warn)'} strokeWidth={2} />
        <text x={x + BAR_W / 2} y={BASE - hc - hi - 8} textAnchor="middle" className="ill-total">{fmtEur(b.total)}</text>
        <text x={x + BAR_W / 2} y={BASE - hc - hi / 2 + 4} textAnchor="middle" className="ill-in">{`+ ${fmtEur(b.interest)}`}</text>
        <text x={x + BAR_W / 2} y={BASE + 18} textAnchor="middle" className="ill-sub">{compound ? 'Composés' : 'Simples'}</text>
      </g>
    );
  };

  return (
    <figure className="illustration">
      <svg viewBox={`0 0 ${W} 352`} role="img" aria-labelledby="ill-int-t ill-int-d" className="ill-svg">
        <title id="ill-int-t">Intérêts simples et intérêts composés : l’écart se creuse avec le temps</title>
        <desc id="ill-int-d">{`Capital de ${fmtEur(initial)} placé à ${annualRate * 100} % par an, sans nouveau versement. ${alt}`}</desc>
        <line x1={20} x2={W - 20} y1={BASE} y2={BASE} stroke="var(--line)" strokeWidth={2} />
        {groups.map((g, i) => {
          const cx = 110 + i * 200;
          return (
            <g key={g.year}>
              {bar(g.simple, cx - BAR_W - 8)}
              {bar(g.compound, cx + 8)}
              <text x={cx} y={BASE + 42} textAnchor="middle" className="ill-year">{`Après ${g.year} ans`}</text>
            </g>
          );
        })}
        <g transform={`translate(24 ${BASE + 60})`}>
          <rect width={14} height={14} rx={3} fill="var(--primary)" />
          <text x={22} y={12} className="ill-sub" textAnchor="start">{`Capital de départ : ${fmtEur(initial)}`}</text>
          <rect x={232} width={14} height={14} rx={3} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
          <text x={254} y={12} className="ill-sub" textAnchor="start">Intérêts gagnés</text>
        </g>
      </svg>
      <figcaption>
        <strong>Illustration, exemple fictif</strong> : {fmtEur(initial)} placés à {annualRate * 100} % par an, sans nouveau versement, avant frais et impôts.
        Avec des intérêts simples, on touche chaque année la même somme. Avec des intérêts composés, les intérêts déjà gagnés rapportent à leur tour : l’écart s’agrandit avec la durée.
      </figcaption>
    </figure>
  );
}

export type SituationIconName = 'pousse' | 'pieces' | 'maison' | 'soleil';

/** Icônes décoratives des parcours d'accueil : même trait (2,5), même grille 48 × 48, couleurs du thème. */
export function SituationIcon({ name }: { name: SituationIconName }) {
  const line = { fill: 'none', stroke: 'var(--primary)', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const soft = { fill: 'var(--accent-soft)', stroke: 'var(--accent)', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <svg viewBox="0 0 48 48" width={48} height={48} aria-hidden="true" focusable="false" className="situation-icon">
      {name === 'pousse' && (
        <>
          <path d="M24 42V24" {...line} />
          <path d="M24 28c-9 0-13-5-13-12 8 0 13 4 13 12z" {...soft} />
          <path d="M24 24c0-7 4-11 12-11 0 7-4 11-12 11z" {...soft} />
          <path d="M16 42h16" {...line} />
        </>
      )}
      {name === 'pieces' && (
        <>
          <ellipse cx="24" cy="35" rx="14" ry="5.5" {...soft} />
          <path d="M10 27v8M38 27v8" {...line} />
          <ellipse cx="24" cy="27" rx="14" ry="5.5" {...soft} />
          <path d="M10 19v8M38 19v8" {...line} />
          <ellipse cx="24" cy="19" rx="14" ry="5.5" {...soft} />
        </>
      )}
      {name === 'maison' && (
        <>
          <path d="M6 23 24 8l18 15" {...line} />
          <path d="M11 20v22h26V20" {...soft} />
          <path d="M20 42V30h8v12" {...line} />
        </>
      )}
      {name === 'soleil' && (
        <>
          <path d="M6 36h36" {...line} />
          <path d="M14 36a10 10 0 0 1 20 0z" {...soft} />
          <path d="M24 12v6M10 20l4 4M38 20l-4 4" {...line} />
        </>
      )}
    </svg>
  );
}
