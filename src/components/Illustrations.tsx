import { fmtEur } from '../lib/finance';
import { DIVERSIFICATION_EXAMPLE, INFLATION_EXAMPLE, LEVERAGE_EXAMPLE, LOAN_EXAMPLE, SNOWBALL_EXAMPLE, diversificationRows, inflationBars, leverageBars, loanSlices, snowballGroups, rendementSteps, RENDEMENT_EXAMPLE, type SnowballBar } from '../lib/illustrationData';

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

/** Schéma « effet de levier » : première année du bien acheté à crédit, avec un bien qui rapporte 5 % ou 3 % de son prix net de charges. */
export function SchemaLevier() {
  const { interest, down, bars } = leverageBars();
  const { price } = LEVERAGE_EXAMPLE;
  const BASE_Y = 250;
  const TOP_Y = 56;
  const BW = 92;
  const max = Math.max(...bars.map((b) => b.income));
  const h = (v: number) => (v / max) * (BASE_Y - TOP_Y);
  const pct = (v: number) => String(Math.round(v * 10) / 10).replace('.', ',');
  const alt = bars
    .map((b) => (b.shortfall > 0
      ? `Bien à ${pct(b.yieldPct)} % : ${fmtEur(b.income)} de loyers nets, tous absorbés par les intérêts, et il manque ${fmtEur(b.shortfall)}.`
      : `Bien à ${pct(b.yieldPct)} % : ${fmtEur(b.income)} de loyers nets, dont ${fmtEur(b.interestPaid)} d’intérêts, il reste ${fmtEur(b.left)} avant impôt, soit ${Math.round((b.left / down) * 100)} % de l’apport.`))
    .join(' ');
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 350" role="img" aria-labelledby="ill-lev-t ill-lev-d" className="ill-svg">
        <title id="ill-lev-t">Effet de levier : le même crédit enrichit si le bien rapporte plus que les intérêts, et appauvrit sinon</title>
        <desc id="ill-lev-d">{`Bien de ${fmtEur(price)} acheté avec ${fmtEur(down)} d’apport, première année : ${fmtEur(interest)} d’intérêts à payer. ${alt}`}</desc>
        <line x1={20} x2={400} y1={BASE_Y} y2={BASE_Y} stroke="var(--line)" strokeWidth={2} />
        {bars.map((b, i) => {
          const cx = 105 + i * 215;
          const x = cx - BW / 2;
          const hi = h(b.interestPaid);
          const hl = h(b.left);
          return (
            <g key={b.yieldPct}>
              <rect x={x} y={BASE_Y - hi} width={BW} height={hi} rx={4} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
              {hl > 0 && <rect x={x} y={BASE_Y - hi - hl} width={BW} height={hl} rx={4} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />}
              {b.shortfall > 0 && <rect x={x} y={BASE_Y - h(interest)} width={BW} height={h(interest) - hi} rx={4} fill="none" stroke="var(--warn)" strokeWidth={2} strokeDasharray="5 4" />}
              <text x={cx} y={BASE_Y - h(Math.max(b.income, interest)) - 10} textAnchor="middle" className="ill-total">{b.shortfall > 0 ? `Manque ${fmtEur(b.shortfall)}` : `Reste ${fmtEur(b.left)}`}</text>
              <text x={cx} y={BASE_Y - hi / 2 + 4} textAnchor="middle" className="ill-in">{fmtEur(b.interestPaid)}</text>
              <text x={cx} y={BASE_Y + 20} textAnchor="middle" className="ill-year">{`Rapporte ${pct(b.yieldPct)} %`}</text>
              <text x={cx} y={BASE_Y + 38} textAnchor="middle" className="ill-sub">{`${fmtEur(b.income)} par an`}</text>
            </g>
          );
        })}
        <g transform="translate(24 306)">
          <rect width={14} height={14} rx={3} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
          <text x={22} y={12} className="ill-sub" textAnchor="start">Intérêts du crédit (année 1)</text>
          <rect x={232} width={14} height={14} rx={3} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
          <text x={254} y={12} className="ill-sub" textAnchor="start">Ce qu’il reste</text>
        </g>
      </svg>
      <figcaption>
        <strong>Illustration, exemple fictif</strong> : bien de {fmtEur(price)} acheté avec {fmtEur(down)} d’apport, avant impôt. Les loyers nets de charges servent d’abord à payer les intérêts ({fmtEur(interest)} la première année).
        Le crédit reste le même dans les deux cas : c’est le rendement du bien qui décide si le levier enrichit ou appauvrit. Le remboursement du capital, en plus, pèse sur la trésorerie.
      </figcaption>
    </figure>
  );
}

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

/** Icônes décoratives des familles d'investissement : même grille 48 × 48 et même trait que `SituationIcon`. */
export function FamilyIcon({ id }: { id: string }) {
  const line = { fill: 'none', stroke: 'var(--primary)', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const soft = { fill: 'var(--accent-soft)', stroke: 'var(--accent)', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  let shape: JSX.Element;
  switch (id) {
    case 'epargne': // tirelire
      shape = <><ellipse cx="22" cy="28" rx="14" ry="10" {...soft} /><path d="M34 24l6-3v8l-5-2M14 37v4M28 37v4M17 16c3-2 8-2 11 0" {...line} /><path d="M20 20h6" {...line} /></>;
      break;
    case 'actions': // courbe en hausse
      shape = <><path d="M8 8v32h34" {...line} /><path d="M14 33l9-10 7 6 11-14" {...soft} fill="none" /><path d="M34 15h7v7" {...line} /></>;
      break;
    case 'obligations': // titre avec sceau
      shape = <><rect x="9" y="8" width="30" height="32" rx="3" {...soft} /><path d="M16 17h16M16 24h16" {...line} /><circle cx="29" cy="33" r="4" {...line} /></>;
      break;
    case 'enveloppes': // enveloppe
      shape = <><rect x="7" y="12" width="34" height="24" rx="3" {...soft} /><path d="M8 14l16 12 16-12" {...line} /></>;
      break;
    case 'immobilier': // immeuble
      shape = <><rect x="12" y="6" width="24" height="36" rx="2" {...soft} /><path d="M19 14h2M27 14h2M19 22h2M27 22h2M19 30h2M27 30h2M21 42v-6h6v6" {...line} /></>;
      break;
    case 'pierre-papier': // maison + feuille
      shape = <><path d="M5 24 18 12l13 12" {...line} /><path d="M9 22v16h18V22" {...soft} /><rect x="30" y="20" width="12" height="18" rx="2" {...line} /><path d="M33 26h6M33 31h6" {...line} /></>;
      break;
    case 'credit-immo': // maison + flèche de levier
      shape = <><path d="M6 24 20 11l14 13" {...line} /><path d="M10 22v18h20V22" {...soft} /><path d="M36 38V20M31 25l5-5 5 5" {...line} /></>;
      break;
    case 'entreprise': // mallette
      shape = <><rect x="7" y="16" width="34" height="23" rx="3" {...soft} /><path d="M18 16v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4M7 27h34" {...line} /><path d="M22 27v3h4v-3" {...line} /></>;
      break;
    case 'numerique': // écran
      shape = <><rect x="6" y="9" width="36" height="25" rx="3" {...soft} /><path d="M18 41h12M24 34v7" {...line} /><path d="M13 27l6-6 5 4 8-8" {...line} /></>;
      break;
    case 'private': // fusée / jeune pousse en cercle
      shape = <><circle cx="24" cy="24" r="16" {...soft} /><path d="M24 33V22M24 25c-5 0-7-3-7-7 5 0 7 3 7 7zM24 22c0-4 2-6 7-6 0 4-2 6-7 6z" {...line} /></>;
      break;
    case 'metaux': // lingot
      shape = <><path d="M5 34l6-14h26l6 14z" {...soft} /><path d="M15 27h18M12 34h24" {...line} /></>;
      break;
    case 'crypto': // pièce à B stylisé (cercle et barres)
      shape = <><circle cx="24" cy="24" r="16" {...soft} /><path d="M20 15v18M20 17h6a4 4 0 0 1 0 8h-6M20 25h7a4 4 0 0 1 0 8h-7M23 12v3M28 12v3M23 33v3M28 33v3" {...line} /></>;
      break;
    case 'collection': // cadre de tableau
      shape = <><rect x="7" y="8" width="34" height="32" rx="2" {...line} /><rect x="13" y="14" width="22" height="20" {...soft} /><path d="M15 31l7-8 5 5 3-3 5 6" {...line} /></>;
      break;
    case 'terres': // champ et soleil
      shape = <><circle cx="34" cy="14" r="5" {...soft} /><path d="M5 40l8-16h22l8 16zM11 32h26M8 38h32" {...line} /></>;
      break;
    case 'energie': // éclair
      shape = <><path d="M27 5 11 27h12l-2 16 16-23H25z" {...soft} /></>;
      break;
    case 'retraite': // sablier
      shape = <><path d="M13 7h22M13 41h22M15 7c0 9 9 12 9 17s-9 8-9 17M33 7c0 9-9 12-9 17s9 8 9 17" {...line} /><path d="M18 36c3-3 9-3 12 0v5H18z" {...soft} /></>;
      break;
    case 'levier': // balance à bascule
      shape = <><path d="M24 22l-9 18h18z" {...soft} /><path d="M6 30 42 14" {...line} /><circle cx="9" cy="34" r="4" {...soft} /><circle cx="39" cy="10" r="4" {...soft} /></>;
      break;
    case 'capital-humain': // toque de diplômé
      shape = <><path d="M24 10 4 20l20 10 20-10z" {...soft} /><path d="M12 25v9c6 5 18 5 24 0v-9M44 20v12" {...line} /></>;
      break;
    case 'transmission': // deux mains / cœur
      shape = <><path d="M24 40C10 30 7 22 7 17a8 8 0 0 1 17-3 8 8 0 0 1 17 3c0 5-3 13-17 23z" {...soft} /></>;
      break;
    default: // étoile discrète
      shape = <path d="M24 7l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z" {...soft} />;
  }
  return <svg viewBox="0 0 48 48" width={40} height={40} aria-hidden="true" focusable="false" className="family-icon">{shape}</svg>;
}

/** Icônes décoratives des thèmes de simulateurs : même trait et mêmes couleurs que `FamilyIcon`, grille 48 × 48. */
export function SimThemeIcon({ id, size = 36 }: { id: string; size?: number }) {
  const line = { fill: 'none', stroke: 'var(--primary)', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const soft = { fill: 'var(--accent-soft)', stroke: 'var(--accent)', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  let shape: JSX.Element;
  switch (id) {
    case 'epargne': // plante qui pousse sur une pile de pièces
      shape = <><ellipse cx="24" cy="39" rx="14" ry="5" {...soft} /><path d="M10 31v8M38 31v8" {...line} /><ellipse cx="24" cy="31" rx="14" ry="5" {...soft} /><path d="M24 26V14M24 19c-5 0-8-3-8-8 5 0 8 3 8 8zM24 16c0-4 3-6 8-6 0 4-3 6-8 6z" {...line} /></>;
      break;
    case 'credit': // calculette
      shape = <><rect x="10" y="6" width="28" height="36" rx="4" {...soft} /><path d="M16 14h16" {...line} /><path d="M17 23h2M24 23h2M31 23h2M17 31h2M24 31h2M31 31h2M17 38h2M24 38h9" {...line} /></>;
      break;
    case 'budget': // camembert
      shape = <><circle cx="24" cy="24" r="16" {...soft} /><path d="M24 24V8M24 24l13.9 8" {...line} /><circle cx="24" cy="24" r="16" {...line} /></>;
      break;
    case 'immobilier': // maison
      shape = <><path d="M6 23 24 8l18 15" {...line} /><path d="M11 20v22h26V20" {...soft} /><path d="M20 42V30h8v12" {...line} /></>;
      break;
    case 'retraite': // soleil couchant
      shape = <><path d="M6 36h36" {...line} /><path d="M14 36a10 10 0 0 1 20 0z" {...soft} /><path d="M24 12v6M10 20l4 4M38 20l-4 4" {...line} /></>;
      break;
    case 'entreprise': // mallette
      shape = <><rect x="7" y="16" width="34" height="23" rx="3" {...soft} /><path d="M18 16v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4M7 27h34" {...line} /><path d="M22 27v3h4v-3" {...line} /></>;
      break;
    default: // autres : courbe en hausse
      shape = <><path d="M8 8v32h34" {...line} /><path d="M14 33l9-10 7 6 11-14" {...line} /></>;
  }
  return <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" focusable="false" className="sim-theme-icon">{shape}</svg>;
}

/** Icônes décoratives des quatre parcours de la page Guides : même trait et même grille 48 × 48 que `SimThemeIcon`. */
export function GuideGroupIcon({ index, size = 36 }: { index: number; size?: number }) {
  const line = { fill: 'none', stroke: 'var(--primary)', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const soft = { fill: 'var(--accent-soft)', stroke: 'var(--accent)', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  let shape: JSX.Element;
  switch (index) {
    case 0: // drapeau de départ
      shape = <><path d="M12 42V7" {...line} /><path d="M12 9h26l-6 8 6 8H12z" {...soft} /></>;
      break;
    case 1: // engrenage : les mécanismes
      shape = <><circle cx="24" cy="24" r="11" {...soft} /><circle cx="24" cy="24" r="4.5" {...line} /><path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.6 10.6l4.2 4.2M33.2 33.2l4.2 4.2M10.6 37.4l4.2-4.2M33.2 14.8l4.2-4.2" {...line} /></>;
      break;
    case 2: // balance : choisir
      shape = <><path d="M24 8v32M15 40h18" {...line} /><path d="M9 14h30" {...line} /><path d="M9 14l-5 12h10zM39 14l-5 12h10z" {...soft} /><path d="M4 26a5 4 0 0 0 10 0M34 26a5 4 0 0 0 10 0" {...line} /></>;
      break;
    default: // maison et clé : immobilier et crédit
      shape = <><path d="M5 22 22 8l17 14" {...line} /><path d="M10 19v21h24V19" {...soft} /><path d="M18 40V29h8v11" {...line} /><circle cx="39" cy="38" r="3.5" {...soft} /><path d="M39 34.5V28M39 31h4" {...line} /></>;
  }
  return <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" focusable="false" className="sim-theme-icon">{shape}</svg>;
}

/** Schéma « escalier » : les étapes d’un guide, dans l’ordre, chacune un cran plus haut. Les libellés viennent des titres du guide. */
export function SchemaEscalier({ steps, title }: { steps: string[]; title: string }) {
  const ROW = 46;
  const STEP = 22;
  const H = steps.length * ROW + 34;
  const alt = steps.map((s, i) => `Étape ${i + 1} : ${s}.`).join(' ');
  return (
    <figure className="illustration">
      <svg viewBox={`0 0 420 ${H}`} role="img" aria-labelledby="ill-esc-t ill-esc-d" className="ill-svg ill-stairs">
        <title id="ill-esc-t">{title}</title>
        <desc id="ill-esc-d">{alt}</desc>
        {steps.map((s, i) => {
          const x = i * STEP;
          const y = i * ROW;
          return (
            <g key={s}>
              <rect x={x} y={y + 2} width={420 - x} height={ROW - 6} rx={10} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={1.5} />
              <circle cx={x + 24} cy={y + ROW / 2 - 1} r={14} fill="var(--primary)" />
              <text x={x + 24} y={y + ROW / 2 + 4} textAnchor="middle" className="ill-on-dark ill-num">{i + 1}</text>
              <text x={x + 48} y={y + ROW / 2 + 4.5} textAnchor="start" className="ill-step">{s}</text>
            </g>
          );
        })}
        <text x={0} y={H - 8} textAnchor="start" className="ill-sub">Du plus urgent au plus long terme</text>
        <path d={`M 262 ${H - 12} H 400 m -8 -5 l 8 5 l -8 5`} fill="none" stroke="var(--ink-2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </figure>
  );
}

/** Schéma « placement et enveloppe » : un même ETF logé dans quatre enveloppes. Aucun chiffre ; reprend la phrase du guide. */
export function SchemaEnveloppe() {
  const envs = ['PEA', 'Compte-titres', 'Assurance-vie', 'PER'];
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 270" role="img" aria-labelledby="ill-env-t ill-env-d" className="ill-svg">
        <title id="ill-env-t">Un même placement peut être logé dans plusieurs enveloppes</title>
        <desc id="ill-env-d">Un même ETF (le placement) peut être logé dans un PEA, un compte-titres, une assurance-vie ou un PER (les enveloppes). Le placement détermine le risque ; l’enveloppe détermine la fiscalité, la disponibilité et la transmission.</desc>
        <rect x={110} y={2} width={200} height={40} rx={20} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={1.5} />
        <text x={210} y={27} textAnchor="middle" className="ill-step">Le placement : un ETF</text>
        <path d="M 210 42 V 189" fill="none" stroke="var(--ink-2)" strokeWidth={1.5} />
        {envs.map((e, i) => {
          const x = (i % 2) * 220;
          const y = 66 + Math.floor(i / 2) * 86;
          return (
            <g key={e}>
              <path d={`M 210 ${y + 37} H ${i % 2 ? 220 : 200}`} fill="none" stroke="var(--ink-2)" strokeWidth={1.5} />
              <rect x={x} y={y} width={200} height={74} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
              <text x={x + 100} y={y + 25} textAnchor="middle" className="ill-step">{e}</text>
              <rect x={x + 50} y={y + 36} width={100} height={26} rx={13} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={1.5} />
              <text x={x + 100} y={y + 54} textAnchor="middle" className="ill-in">le même ETF</text>
            </g>
          );
        })}
        <text x={210} y={246} textAnchor="middle" className="ill-sub">L’enveloppe fixe la fiscalité,</text>
        <text x={210} y={264} textAnchor="middle" className="ill-sub">la disponibilité et la transmission</text>
      </svg>
    </figure>
  );
}

/** Schéma « séparer l’entreprise et le patrimoine » : une partie des bénéfices part vers une épargne personnelle diversifiée. Aucun chiffre ; reprend le texte de la page Entrepreneuriat. */
export function SchemaSeparer() {
  const savings = ['Livrets', 'PEA', 'Assurance-vie'];
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 300" role="img" aria-labelledby="ill-sep-t ill-sep-d" className="ill-svg">
        <title id="ill-sep-t">Séparer l’entreprise et le patrimoine personnel</title>
        <desc id="ill-sep-d">Une partie des bénéfices de l’entreprise est investie régulièrement dans une épargne personnelle diversifiée (livrets, PEA, assurance-vie), ce qui réduit la dépendance à une seule activité.</desc>
        <rect x={110} y={2} width={200} height={62} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={210} y={28} textAnchor="middle" className="ill-step">Votre entreprise</text>
        <text x={210} y={50} textAnchor="middle" className="ill-sub">une seule activité</text>
        <path d="M 210 64 V 112 m -7 -8 l 7 8 l 7 -8" fill="none" stroke="var(--ink-2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <text x={226} y={94} textAnchor="start" className="ill-in">une partie des bénéfices</text>
        <rect x={0} y={122} width={420} height={134} rx={14} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={210} y={148} textAnchor="middle" className="ill-step">Votre épargne personnelle</text>
        {savings.map((s, i) => (
          <g key={s}>
            <rect x={16 + i * 130} y={166} width={118} height={40} rx={10} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
            <text x={75 + i * 130} y={191} textAnchor="middle" className="ill-in">{s}</text>
          </g>
        ))}
        <text x={210} y={234} textAnchor="middle" className="ill-sub">diversifiée, hors de la société</text>
        <text x={210} y={284} textAnchor="middle" className="ill-sub">Moins de dépendance à une seule activité</text>
      </svg>
    </figure>
  );
}

/** Schéma « PEA : avant et après 5 ans » : frise du temps, la règle de retrait change à la cinquième année. Seul chiffre : « 5 ans » ; reprend le texte du guide. */
export function SchemaPea() {
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 262" role="img" aria-labelledby="ill-pea-t ill-pea-d" className="ill-svg">
        <title id="ill-pea-t">PEA : ce qui change avant et après 5 ans</title>
        <desc id="ill-pea-d">Avant 5 ans, un retrait entraîne en principe la clôture du plan, sauf exceptions prévues par la loi. Après 5 ans, on peut retirer sans clôturer le plan ; les gains sont exonérés d’impôt sur le revenu, mais les prélèvements sociaux restent dus.</desc>
        <rect x={0} y={34} width={206} height={30} rx={15} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <rect x={214} y={34} width={206} height={30} rx={15} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={103} y={54} textAnchor="middle" className="ill-step">Avant 5 ans</text>
        <text x={317} y={54} textAnchor="middle" className="ill-step">Après 5 ans</text>
        <circle cx={210} cy={49} r={17} fill="var(--primary)" />
        <text x={210} y={54} textAnchor="middle" className="ill-on-dark ill-num">5</text>
        <text x={210} y={18} textAnchor="middle" className="ill-sub">Ouverture du PEA, puis 5 ans plus tard</text>
        <path d="M 103 64 V 92 m -6 -7 l 6 7 l 6 -7 M 317 64 V 92 m -6 -7 l 6 7 l 6 -7" fill="none" stroke="var(--ink-2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <rect x={0} y={100} width={206} height={118} rx={12} fill="var(--surface)" stroke="var(--warn)" strokeWidth={2} />
        <text x={103} y={128} textAnchor="middle" className="ill-step">Un retrait clôture</text>
        <text x={103} y={148} textAnchor="middle" className="ill-step">le plan</text>
        <text x={103} y={178} textAnchor="middle" className="ill-sub">en principe, sauf</text>
        <text x={103} y={196} textAnchor="middle" className="ill-sub">exceptions prévues par la loi</text>
        <rect x={214} y={100} width={206} height={118} rx={12} fill="var(--surface)" stroke="var(--accent)" strokeWidth={2} />
        <text x={317} y={128} textAnchor="middle" className="ill-step">Retrait possible</text>
        <text x={317} y={148} textAnchor="middle" className="ill-step">sans clôturer le plan</text>
        <text x={317} y={172} textAnchor="middle" className="ill-sub">gains exonérés d’impôt</text>
        <text x={317} y={188} textAnchor="middle" className="ill-sub">sur le revenu ;</text>
        <text x={317} y={204} textAnchor="middle" className="ill-sub">prélèvements sociaux dus</text>
        <text x={210} y={246} textAnchor="middle" className="ill-sub">Ouvrir tôt fait courir le délai de 5 ans</text>
      </svg>
    </figure>
  );
}

/** Schéma « Livret A : le jour de l’opération décide » : un mois coupé au 15, ce que devient un dépôt ou un retrait de chaque côté. Seuls chiffres : 1er, 15, 16 ; reprend le texte du guide (Service-Public.fr). */
export function SchemaQuinzaines() {
  const cols = [
    { x: 0, c: 'var(--accent)', soft: 'var(--accent-soft)', jour: 'Du 1er au 15 du mois', dep: ['Dépôt : il rapporte', 'dès le 16 du même mois'], ret: ['Retrait : calcul sur le solde', 'du dernier jour du mois précédent'] },
    { x: 214, c: 'var(--warn)', soft: 'var(--warn-soft)', jour: 'À partir du 16', dep: ['Dépôt : il rapporte', 'dès le 1er du mois suivant'], ret: ['Retrait : calcul sur', 'le solde du 15 du mois'] },
  ];
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 262" role="img" aria-labelledby="ill-quinz-t ill-quinz-d" className="ill-svg">
        <title id="ill-quinz-t">Livret A : le jour du dépôt ou du retrait décide</title>
        <desc id="ill-quinz-d">Un dépôt du 1er au 15 du mois rapporte à partir du 16 du même mois ; un dépôt à partir du 16 rapporte à partir du 1er du mois suivant. Un retrait du 1er au 15 est calculé sur le solde arrêté au dernier jour du mois précédent ; un retrait à partir du 16, sur le solde arrêté au 15.</desc>
        <text x={210} y={16} textAnchor="middle" className="ill-sub">Le mois est coupé en deux quinzaines</text>
        {cols.map((k) => (
          <g key={k.x}>
            <rect x={k.x} y={28} width={206} height={30} rx={15} fill={k.soft} stroke={k.c} strokeWidth={2} />
            <text x={k.x + 103} y={48} textAnchor="middle" className="ill-step">{k.jour}</text>
            <path d={`M ${k.x + 103} 58 V 78 m -6 -7 l 6 7 l 6 -7`} fill="none" stroke="var(--ink-2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <rect x={k.x} y={86} width={206} height={62} rx={12} fill="var(--surface)" stroke={k.c} strokeWidth={2} />
            <text x={k.x + 103} y={112} textAnchor="middle" className="ill-sub">{k.dep[0]}</text>
            <text x={k.x + 103} y={130} textAnchor="middle" className="ill-sub">{k.dep[1]}</text>
            <rect x={k.x} y={156} width={206} height={62} rx={12} fill="var(--surface)" stroke={k.c} strokeWidth={2} />
            <text x={k.x + 103} y={182} textAnchor="middle" className="ill-sub">{k.ret[0]}</text>
            <text x={k.x + 103} y={200} textAnchor="middle" className="ill-sub">{k.ret[1]}</text>
          </g>
        ))}
        <text x={210} y={246} textAnchor="middle" className="ill-sub">Le jour de l’opération compte autant que le montant</text>
      </svg>
    </figure>
  );
}

/** Schéma « De 6 % à 3,6 % » : le rendement brut d’une annonce fond quand on compte les frais, la vacance et les charges. Exemple fictif calculé (illustrationData). */
export function SchemaRendement() {
  const steps = rendementSteps();
  const pctFr = (v: number) => `${(Math.round(v * 1000) / 10).toLocaleString('fr-FR', { minimumFractionDigits: 1 })} %`;
  const max = steps[0].value;
  const X0 = 14;
  const BW = 300;
  const alt = steps.map((s) => `${s.label} : ${pctFr(s.value)}`).join(' ; ');
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 272" role="img" aria-labelledby="ill-rend-t ill-rend-d" className="ill-svg">
        <title id="ill-rend-t">Le rendement locatif baisse à mesure qu’on compte les vrais coûts</title>
        <desc id="ill-rend-d">{`Exemple fictif d’un bien à ${fmtEur(RENDEMENT_EXAMPLE.price)} loué ${fmtEur(RENDEMENT_EXAMPLE.monthlyRent)} par mois. ${alt}.`}</desc>
        {steps.map((s, i) => {
          const y = 4 + i * 66;
          const w = (s.value / max) * BW;
          const last = i === steps.length - 1;
          return (
            <g key={s.label}>
              <text x={X0} y={y + 14} className="ill-step">{s.label}</text>
              <rect x={X0} y={y + 22} width={BW} height={26} rx={6} fill="var(--surface-2)" />
              <rect x={X0} y={y + 22} width={w} height={26} rx={6} fill={last ? 'var(--accent)' : 'var(--primary)'} />
              <text x={X0 + BW + 12} y={y + 41} className="ill-total">{pctFr(s.value)}</text>
              <text x={X0} y={y + 63} className="ill-sub">{s.detail}</text>
            </g>
          );
        })}
      </svg>
      <figcaption>
        <strong>Illustration, exemple fictif</strong> : le même bien de {fmtEur(RENDEMENT_EXAMPLE.price)}, loué {fmtEur(RENDEMENT_EXAMPLE.monthlyRent)} par mois, vu sous quatre angles. Barres proportionnelles aux pourcentages ; le rendement après impôt dépend de votre situation et n’est pas montré.
      </figcaption>
    </figure>
  );
}
