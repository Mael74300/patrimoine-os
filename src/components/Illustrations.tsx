import { fmtEur } from '../lib/finance';
import { DIVERSIFICATION_EXAMPLE, INFLATION_EXAMPLE, LOAN_EXAMPLE, SNOWBALL_EXAMPLE, diversificationRows, inflationBars, loanSlices, snowballGroups, type SnowballBar } from '../lib/illustrationData';

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

/** Schéma « que contient une mensualité » : à total constant, la part d'intérêts diminue et la part de capital augmente. */
export function SchemaMensualite() {
  const { monthly, slices } = loanSlices();
  const { principal, annualRate, years } = LOAN_EXAMPLE;
  const ratePct = String(Math.round(annualRate * 1000) / 10).replace('.', ',');
  const BASE_Y = 250;
  const TOP_Y = 52;
  const BW = 78;
  const scale = (BASE_Y - TOP_Y) / (monthly * 12);
  const alt = slices
    .map((s) => `Année ${s.year} : ${fmtEur(s.interest)} d’intérêts et ${fmtEur(s.principal)} de capital remboursé.`)
    .join(' ');
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 320" role="img" aria-labelledby="ill-loan-t ill-loan-d" className="ill-svg">
        <title id="ill-loan-t">Dans une mensualité fixe, la part d’intérêts diminue et la part de capital augmente</title>
        <desc id="ill-loan-d">{`Crédit de ${fmtEur(principal)} à ${ratePct} % sur ${years} ans, mensualité de ${fmtEur(monthly)} hors assurance, soit ${fmtEur(monthly * 12)} par an. ${alt}`}</desc>
        <line x1={20} x2={400} y1={BASE_Y} y2={BASE_Y} stroke="var(--line)" strokeWidth={2} />
        {slices.map((s, i) => {
          const cx = 80 + i * 130;
          const x = cx - BW / 2;
          const hi = s.interest * scale;
          const hp = s.principal * scale;
          return (
            <g key={s.year}>
              <rect x={x} y={BASE_Y - hp} width={BW} height={hp} rx={4} fill="var(--primary)" />
              <rect x={x} y={BASE_Y - hp - hi} width={BW} height={hi} rx={4} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
              <text x={cx} y={TOP_Y - 10} textAnchor="middle" className="ill-total">{fmtEur(s.total)}</text>
              <text x={cx} y={BASE_Y - hp - hi / 2 + 4} textAnchor="middle" className="ill-in" style={hi < 18 ? { display: 'none' } : undefined}>{fmtEur(s.interest)}</text>
              <text x={cx} y={BASE_Y - hp / 2 + 4} textAnchor="middle" className="ill-in ill-on-dark">{fmtEur(s.principal)}</text>
              <text x={cx} y={BASE_Y + 20} textAnchor="middle" className="ill-year">{`Année ${s.year}`}</text>
            </g>
          );
        })}
        <g transform="translate(24 288)">
          <rect width={14} height={14} rx={3} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
          <text x={22} y={12} className="ill-sub" textAnchor="start">Intérêts (le prix du crédit)</text>
          <rect x={200} width={14} height={14} rx={3} fill="var(--primary)" />
          <text x={222} y={12} className="ill-sub" textAnchor="start">Capital remboursé</text>
        </g>
      </svg>
      <figcaption>
        <strong>Illustration, exemple fictif</strong> : {fmtEur(principal)} empruntés à {ratePct} % sur {years} ans, hors assurance, soit {fmtEur(monthly)} par mois.
        Chaque année, on rembourse la même somme ({fmtEur(monthly * 12)}), mais au début elle sert surtout à payer les intérêts. Le capital emprunté diminue peu au départ, puis de plus en plus vite.
      </figcaption>
    </figure>
  );
}

/** Schéma « inflation » : montant affiché et pouvoir d'achat réel au bout de 10 ans, avec ou sans placement. */
export function SchemaInflation() {
  const bars = inflationBars();
  const { initial, inflation, rate, years } = INFLATION_EXAMPLE;
  const BASE_Y = 250;
  const TOP_Y = 56;
  const BW = 74;
  const max = Math.max(...bars.map((b) => b.shown));
  const h = (v: number) => (v / max) * (BASE_Y - TOP_Y);
  const alt = bars
    .map((b) => `${b.label} : ${fmtEur(b.shown)} affichés, soit ${fmtEur(b.real)} en euros d’aujourd’hui.`)
    .join(' ');
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 340" role="img" aria-labelledby="ill-infl-t ill-infl-d" className="ill-svg">
        <title id="ill-infl-t">L’inflation réduit la valeur réelle d’une somme : le montant affiché ne dit pas ce qu’on peut acheter</title>
        <desc id="ill-infl-d">{`${fmtEur(initial)} sur ${years} ans, avec une inflation de ${inflation * 100} % par an. ${alt}`}</desc>
        <line x1={20} x2={400} y1={BASE_Y} y2={BASE_Y} stroke="var(--line)" strokeWidth={2} />
        {bars.map((b, i) => {
          const cx = 105 + i * 215;
          const xs = cx - BW - 6;
          const xr = cx + 6;
          return (
            <g key={b.label}>
              <rect x={xs} y={BASE_Y - h(b.shown)} width={BW} height={h(b.shown)} rx={4} fill="var(--surface-2)" stroke="var(--ink-2)" strokeWidth={2} strokeDasharray="6 4" />
              <rect x={xr} y={BASE_Y - h(b.real)} width={BW} height={h(b.real)} rx={4} fill="var(--primary)" />
              <text x={xs + BW / 2} y={BASE_Y - h(b.shown) - 8} textAnchor="middle" className="ill-total">{fmtEur(b.shown)}</text>
              <text x={xr + BW / 2} y={BASE_Y - h(b.real) - 8} textAnchor="middle" className="ill-total">{fmtEur(b.real)}</text>
              <text x={cx} y={BASE_Y + 20} textAnchor="middle" className="ill-year">{b.label}</text>
            </g>
          );
        })}
        <line x1={20} x2={400} y1={BASE_Y - h(initial)} y2={BASE_Y - h(initial)} stroke="var(--accent)" strokeWidth={2} strokeDasharray="2 5" />
        <g transform="translate(24 288)">
          <rect width={14} height={14} rx={3} fill="none" stroke="var(--ink-2)" strokeWidth={2} strokeDasharray="4 3" />
          <text x={22} y={12} className="ill-sub" textAnchor="start">Montant affiché</text>
          <rect x={170} width={14} height={14} rx={3} fill="var(--primary)" />
          <text x={192} y={12} className="ill-sub" textAnchor="start">Valeur en euros d’aujourd’hui</text>
          <line x1={0} x2={14} y1={34} y2={34} stroke="var(--accent)" strokeWidth={2} strokeDasharray="2 3" />
          <text x={22} y={39} className="ill-sub" textAnchor="start">{`Niveau de départ : ${fmtEur(initial)}`}</text>
        </g>
      </svg>
      <figcaption>
        <strong>Illustration, exemple fictif</strong> : {fmtEur(initial)} sur {years} ans, avec une inflation constante de {inflation * 100} % par an et un placement à {rate * 100} % par an, avant frais et impôts.
        Le montant affiché peut grossir sans que la somme permette d’acheter plus : ce qui compte, c’est l’écart avec l’inflation. Ces taux ne sont ni observés ni prévus.
      </figcaption>
    </figure>
  );
}

const pct = (v: number) => `${v < 0 ? '−' : ''}${(Math.abs(v) * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;

/** Schéma « diversification » : même année, 100 % actions ou 70 % actions et 30 % placement prudent. Les longueurs des barres de perte sont proportionnelles. */
export function SchemaDiversification() {
  const rows = diversificationRows();
  const { stocksReturn, safeReturn } = DIVERSIFICATION_EXAMPLE;
  const X0 = 20;
  const FULL = 380;
  const len = (v: number) => (Math.abs(v) / Math.abs(stocksReturn)) * 280;
  const titles = ['Tout en actions', 'Actions et placement prudent'];
  const alt = rows
    .map((r, i) => `${titles[i]} (${pct(r.stocks)} d’actions${r.safe > 0 ? `, ${pct(r.safe)} de placement prudent` : ''}) : ${pct(r.result)} sur l’année.`)
    .join(' ');
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 258" role="img" aria-labelledby="ill-div-t ill-div-d" className="ill-svg">
        <title id="ill-div-t">Répartir son épargne entre plusieurs placements réduit la perte d’une année où les actions baissent</title>
        <desc id="ill-div-d">{`Une année fictive où les actions perdent ${pct(-stocksReturn)} et un placement prudent gagne ${pct(safeReturn)}. ${alt}`}</desc>
        {rows.map((r, i) => {
          const y = 8 + i * 124;
          const ws = r.stocks * FULL;
          return (
            <g key={titles[i]}>
              <text x={X0} y={y + 14} className="ill-year" textAnchor="start">{titles[i]}</text>
              <rect x={X0} y={y + 24} width={ws} height={30} rx={4} fill="var(--primary)" />
              <text x={X0 + 10} y={y + 44} className="ill-on-dark ill-in" textAnchor="start">{`Actions ${pct(r.stocks)}`}</text>
              {r.safe > 0 && (
                <>
                  <rect x={X0 + ws} y={y + 24} width={FULL - ws} height={30} rx={4} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
                  <text x={X0 + ws + 10} y={y + 44} className="ill-in" textAnchor="start">{`Prudent ${pct(r.safe)}`}</text>
                </>
              )}
              <text x={X0} y={y + 78} className="ill-sub" textAnchor="start">Résultat de l’année</text>
              <rect x={X0} y={y + 86} width={len(r.result)} height={22} rx={4} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
              <text x={X0 + len(r.result) + 10} y={y + 102} className="ill-total" textAnchor="start">{pct(r.result)}</text>
            </g>
          );
        })}
      </svg>
      <figcaption>
        <strong>Illustration, exemple fictif</strong> : une année où les actions perdent {pct(-stocksReturn)} et où un placement prudent gagne {pct(safeReturn)}.
        La barre foncée montre la part de chaque placement ; la barre ocre est la perte de l’année. La répartition amortit la baisse, sans l’empêcher ni garantir un gain. Ces rendements ne sont ni observés ni prévus.
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
