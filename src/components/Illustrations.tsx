import { fmtEur, HCSF } from '../lib/finance';
import { pfuSplit } from '../lib/calc/pfu';
import { DIVERSIFICATION_EXAMPLE, INFLATION_EXAMPLE, LEVERAGE_EXAMPLE, LOAN_EXAMPLE, SNOWBALL_EXAMPLE, diversificationRows, inflationBars, leverageBars, loanSlices, snowballGroups, rendementSteps, RENDEMENT_EXAMPLE, endettementParts, patrimoineParts, rembourserParts, regle72Rows, epargneMoisRows, EPARGNE_MOIS_EXAMPLE, fraisRows, FRAIS_EXAMPLE, petitsVersementsRows, capitalViseRows, CAPITAL_VISE_EXAMPLE, precautionRows, PRECAUTION_EXAMPLE, moisParts, PETITS_VERSEMENTS_EXAMPLE, type SnowballBar } from '../lib/illustrationData';

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
export function FamilyIcon({ id, size = 40 }: { id: string; size?: number }) {
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
  return <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" focusable="false" className="family-icon">{shape}</svg>;
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
  const STEP = 14;
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

/** Schéma « Comment fonctionne une SCPI » : principe qualitatif (aucun chiffre), repris du texte de la fiche et de La finance pour tous. */
export function SchemaScpi() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 330" role="img" aria-labelledby="ill-scpi-t ill-scpi-d" className="ill-svg">
        <title id="ill-scpi-t">Comment fonctionne une SCPI</title>
        <desc id="ill-scpi-d">Les épargnants achètent des parts de la SCPI. La SCPI, gérée par une société de gestion, achète des immeubles et les loue. Les loyers perçus, après déduction des frais, reviennent aux épargnants sous forme de revenus.</desc>
        <rect x={0} y={2} width={220} height={58} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={110} y={28} textAnchor="middle" className="ill-step">Les épargnants</text>
        <text x={110} y={48} textAnchor="middle" className="ill-sub">achètent des parts</text>
        <path d="M 110 60 V 108 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <text x={126} y={90} textAnchor="start" className="ill-in">leur argent</text>
        <rect x={0} y={108} width={220} height={64} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={110} y={134} textAnchor="middle" className="ill-step">La SCPI</text>
        <text x={110} y={156} textAnchor="middle" className="ill-sub">gérée par une société de gestion</text>
        <path d="M 110 172 V 220 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <text x={126} y={202} textAnchor="start" className="ill-in">achète et met en location</text>
        <rect x={0} y={220} width={220} height={58} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={110} y={246} textAnchor="middle" className="ill-step">Des immeubles loués</text>
        <text x={110} y={266} textAnchor="middle" className="ill-sub">bureaux, commerces, logements…</text>
        <path d="M 220 249 H 290 V 31 H 228 m 8 -7 l -8 7 l 8 7" {...arrow} />
        <text x={302} y={118} textAnchor="start" className="ill-in">les loyers,</text>
        <text x={302} y={136} textAnchor="start" className="ill-in">moins les frais,</text>
        <text x={302} y={154} textAnchor="start" className="ill-in">reviennent aux</text>
        <text x={302} y={172} textAnchor="start" className="ill-in">épargnants</text>
        <text x={210} y={314} textAnchor="middle" className="ill-sub">Schéma de principe, sans chiffre</text>
      </svg>
    </figure>
  );
}

/** Schéma « Assurance-vie : un contrat, deux types de supports » : principe qualitatif (aucun chiffre), repris de Service-Public (F15274) : garantie du fonds en euros, risque de perte en capital des unités de compte. */
export function SchemaAssuranceVie() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 330" role="img" aria-labelledby="ill-av-t ill-av-d" className="ill-svg">
        <title id="ill-av-t">Assurance-vie : un contrat, deux types de supports</title>
        <desc id="ill-av-d">Vous versez de l'argent sur un contrat d'assurance-vie, puis vous choisissez la part placée sur chaque support. Le fonds en euros est garanti par l'assureur, avec un faible rendement. Les unités de compte peuvent rapporter davantage mais comportent un risque de perte en capital.</desc>
        <rect x={110} y={2} width={200} height={50} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={210} y={24} textAnchor="middle" className="ill-step">Vous versez</text>
        <text x={210} y={43} textAnchor="middle" className="ill-sub">sur un contrat d'assurance-vie</text>
        <path d="M 210 52 V 84 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={60} y={84} width={300} height={46} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={210} y={104} textAnchor="middle" className="ill-step">Vous choisissez la répartition</text>
        <text x={210} y={121} textAnchor="middle" className="ill-sub">entre deux types de supports</text>
        <path d="M 130 130 V 164 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <path d="M 290 130 V 164 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={0} y={164} width={200} height={110} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={100} y={190} textAnchor="middle" className="ill-step">Fonds en euros</text>
        <text x={100} y={214} textAnchor="middle" className="ill-in">Capital garanti</text>
        <text x={100} y={232} textAnchor="middle" className="ill-in">par l'assureur</text>
        <text x={100} y={256} textAnchor="middle" className="ill-sub">rendement plus faible</text>
        <rect x={220} y={164} width={200} height={110} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={320} y={190} textAnchor="middle" className="ill-step">Unités de compte</text>
        <text x={320} y={214} textAnchor="middle" className="ill-in">Valeur variable selon</text>
        <text x={320} y={232} textAnchor="middle" className="ill-in">les marchés : perte possible</text>
        <text x={320} y={256} textAnchor="middle" className="ill-sub">rendement possible plus élevé</text>
        <text x={210} y={314} textAnchor="middle" className="ill-sub">Schéma de principe, sans chiffre</text>
      </svg>
    </figure>
  );
}

/** Schéma « Trois façons de participer » : principe qualitatif (aucun chiffre), repris de La finance pour tous (page « Crowdfunding ou Finance participative », mise à jour du 13 décembre 2024). */
export function SchemaCrowdfunding() {
  const rows = [
    { c: 'var(--accent)', soft: 'var(--accent-soft)', nom: 'Don', sous: ['avec ou sans', 'contrepartie'], recoit: ['Vous recevez : une contrepartie', '(un objet, une place…) ou rien'], risque: ['Risque : le projet échoue,', 'la contrepartie n’est pas livrée'] },
    { c: 'var(--primary)', soft: 'var(--surface-2)', nom: 'Prêt', sous: ['avec intérêts'], recoit: ['Vous recevez : des intérêts', 'si le prêt est remboursé'], risque: ['Risque : l’emprunteur', 'ne rembourse pas (défaut)'] },
    { c: 'var(--warn)', soft: 'var(--warn-soft)', nom: 'Titres', sous: ['actions ou', 'obligations'], recoit: ['Vous recevez : dividendes ou', 'intérêts, selon le titre'], risque: ['Risque : perte partielle ou totale,', 'titres difficiles à revendre'] },
  ];
  const H = 92;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 340" role="img" aria-labelledby="ill-cf-t ill-cf-d" className="ill-svg">
        <title id="ill-cf-t">Financement participatif : trois façons de participer</title>
        <desc id="ill-cf-d">Sur une plateforme, on peut financer un projet de trois façons. Le don, avec ou sans contrepartie : le risque est que le projet échoue et que la contrepartie ne soit pas livrée. Le prêt avec intérêts : le risque est le défaut de remboursement. La souscription de titres, actions ou obligations non cotées : les risques sont la perte partielle ou totale du capital et la difficulté à revendre les titres.</desc>
        <text x={210} y={14} textAnchor="middle" className="ill-sub">Sur une plateforme, trois façons de financer un projet</text>
        {rows.map((r, i) => {
          const y = 26 + i * (H + 8);
          return (
            <g key={r.nom}>
              <rect x={1} y={y} width={418} height={H} rx={12} fill="var(--surface)" stroke={r.c} strokeWidth={2} />
              <rect x={1} y={y} width={104} height={H} rx={12} fill={r.soft} stroke={r.c} strokeWidth={2} />
              <rect x={90} y={y + 2} width={16} height={H - 4} fill="var(--surface)" />
              <path d={`M 105 ${y + 2} V ${y + H - 2}`} stroke={r.c} strokeWidth={2} />
              <text x={53} y={y + 44 - (r.sous.length - 1) * 8} textAnchor="middle" className="ill-step">{r.nom}</text>
              {r.sous.map((t, k) => <text key={t} x={53} y={y + 62 - (r.sous.length - 1) * 8 + k * 15} textAnchor="middle" className="ill-sub">{t}</text>)}
              <text x={118} y={y + 24} className="ill-in">{r.recoit[0]}</text>
              <text x={118} y={y + 40} className="ill-in">{r.recoit[1]}</text>
              <text x={118} y={y + 62} className="ill-sub">{r.risque[0]}</text>
              <text x={118} y={y + 78} className="ill-sub">{r.risque[1]}</text>
            </g>
          );
        })}
        <text x={210} y={332} textAnchor="middle" className="ill-sub">Schéma de principe, sans chiffre</text>
      </svg>
    </figure>
  );
}

/** Schéma « Comment fonctionne une foncière cotée » : principe qualitatif (aucun chiffre), repris de La finance pour tous (page « Les sociétés foncières »). */
export function SchemaFonciereCotee() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 330" role="img" aria-labelledby="ill-fc-t ill-fc-d" className="ill-svg">
        <title id="ill-fc-t">Comment fonctionne une foncière cotée</title>
        <desc id="ill-fc-d">Les investisseurs achètent et revendent des actions de la foncière en Bourse, au prix du marché. La foncière possède des immeubles de bureaux et de commerces qu’elle loue. Les loyers lui permettent de verser des dividendes aux actionnaires.</desc>
        <rect x={0} y={2} width={220} height={58} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={110} y={28} textAnchor="middle" className="ill-step">Les investisseurs</text>
        <text x={110} y={48} textAnchor="middle" className="ill-sub">achètent des actions en Bourse</text>
        <path d="M 110 60 V 108 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <text x={126} y={90} textAnchor="start" className="ill-in">revendables en Bourse</text>
        <rect x={0} y={108} width={220} height={64} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={110} y={134} textAnchor="middle" className="ill-step">La foncière cotée</text>
        <text x={110} y={156} textAnchor="middle" className="ill-sub">société dont le prix varie</text>
        <path d="M 110 172 V 220 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <text x={126} y={202} textAnchor="start" className="ill-in">possède et loue</text>
        <rect x={0} y={220} width={220} height={58} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={110} y={246} textAnchor="middle" className="ill-step">Des immeubles loués</text>
        <text x={110} y={266} textAnchor="middle" className="ill-sub">surtout bureaux et commerces</text>
        <path d="M 220 249 H 290 V 31 H 228 m 8 -7 l -8 7 l 8 7" {...arrow} />
        <text x={302} y={118} textAnchor="start" className="ill-in">les loyers</text>
        <text x={302} y={136} textAnchor="start" className="ill-in">financent les</text>
        <text x={302} y={154} textAnchor="start" className="ill-in">dividendes versés</text>
        <text x={302} y={172} textAnchor="start" className="ill-in">aux actionnaires</text>
        <text x={210} y={314} textAnchor="middle" className="ill-sub">Schéma de principe, sans chiffre</text>
      </svg>
    </figure>
  );
}

/** Schéma « Capital-investissement : de l’épargne à la revente » : repris de l’AMF (page « Capital-investissement : FCPR, FCPI, FIP », consultée le 2026-11-05) : 50 % minimum de titres non cotés pour un FCPR, pas de rachat en cours de vie du fonds, durée de vie pouvant atteindre 10 ans, voire plus. */
export function SchemaCapitalInvestissement() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 372" role="img" aria-labelledby="ill-ci-t ill-ci-d" className="ill-svg">
        <title id="ill-ci-t">Capital-investissement : l’argent est bloqué pendant la vie du fonds</title>
        <desc id="ill-ci-d">Vous achetez des parts d’un fonds de capital-investissement. Le fonds investit dans des sociétés non cotées : au moins la moitié de son actif pour un FCPR. Pendant la vie du fonds, qui peut atteindre 10 ans, voire plus, vous ne pouvez pas obtenir le rachat de vos parts. Vous récupérez votre argent à la fin, quand le fonds a revendu ses titres et est dissous. Vous pouvez perdre une partie ou la totalité de votre mise.</desc>
        <rect x={0} y={2} width={220} height={58} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={110} y={28} textAnchor="middle" className="ill-step">Vous</text>
        <text x={110} y={48} textAnchor="middle" className="ill-sub">achetez des parts du fonds</text>
        <path d="M 110 60 V 100 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <text x={126} y={86} textAnchor="start" className="ill-in">votre argent</text>
        <rect x={0} y={100} width={220} height={64} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={110} y={126} textAnchor="middle" className="ill-step">Le fonds</text>
        <text x={110} y={148} textAnchor="middle" className="ill-sub">FCPR, FCPI ou FIP</text>
        <path d="M 110 164 V 204 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <text x={126} y={190} textAnchor="start" className="ill-in">il investit</text>
        <rect x={0} y={204} width={220} height={64} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={110} y={230} textAnchor="middle" className="ill-step">Des sociétés non cotées</text>
        <text x={110} y={252} textAnchor="middle" className="ill-sub">50 % minimum pour un FCPR</text>
        <rect x={244} y={2} width={176} height={266} rx={12} fill="var(--surface-2)" stroke="var(--line)" strokeWidth={2} />
        <text x={332} y={32} textAnchor="middle" className="ill-step">Pendant la vie</text>
        <text x={332} y={52} textAnchor="middle" className="ill-step">du fonds</text>
        <text x={332} y={84} textAnchor="middle" className="ill-in">aucun rachat possible</text>
        <text x={332} y={106} textAnchor="middle" className="ill-sub">durée : jusqu’à 10 ans,</text>
        <text x={332} y={124} textAnchor="middle" className="ill-sub">voire plus</text>
        <path d="M 332 142 V 182 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <text x={332} y={206} textAnchor="middle" className="ill-in">À la fin : le fonds</text>
        <text x={332} y={224} textAnchor="middle" className="ill-in">revend ses titres,</text>
        <text x={332} y={242} textAnchor="middle" className="ill-in">puis il est dissous</text>
        <rect x={0} y={288} width={420} height={44} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={210} y={315} textAnchor="middle" className="ill-in">Risque : perdre une partie ou la totalité de la mise</text>
        <text x={210} y={358} textAnchor="middle" className="ill-sub">Schéma de principe d’après l’AMF</text>
      </svg>
    </figure>
  );
}

/** Schéma « PER : déduire à l’entrée, bloqué, imposé à la sortie » : principe qualitatif (aucun chiffre), repris de Service-Public.fr (fiche F34982, consultée le 2026-11-05) : versements volontaires déductibles du revenu imposable ou non (renonciation possible), PER bloqué jusqu’à la retraite sauf accident de la vie et achat de la résidence principale, sortie en capital, en rente viagère ou partiellement en capital et en rente, versements déduits imposés au barème de l’impôt sur le revenu. */
export function SchemaPer() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 372" role="img" aria-labelledby="ill-per-t ill-per-d" className="ill-svg">
        <title id="ill-per-t">PER : un impôt réduit à l’entrée, de l’argent bloqué, une sortie imposée</title>
        <desc id="ill-per-d">Pendant votre vie active, vous versez de l’argent sur votre PER. Ces versements peuvent être déduits de votre revenu imposable, ce qui réduit votre impôt de l’année ; vous pouvez aussi y renoncer. L’épargne reste ensuite bloquée jusqu’à la retraite, sauf cas prévus : accident de la vie ou achat de la résidence principale. À la retraite, vous récupérez l’épargne en capital, en rente viagère ou en partie des deux. La sortie est imposée : les versements déduits sont ajoutés à vos revenus imposables de l’année.</desc>
        <rect x={0} y={2} width={420} height={80} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={210} y={28} textAnchor="middle" className="ill-step">1. Vous versez sur votre PER</text>
        <text x={210} y={52} textAnchor="middle" className="ill-in">Versement déductible du revenu imposable</text>
        <text x={210} y={70} textAnchor="middle" className="ill-sub">(vous pouvez aussi renoncer à la déduction)</text>
        <path d="M 210 82 V 112 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <text x={226} y={102} textAnchor="start" className="ill-in">impôt de l’année réduit</text>
        <rect x={0} y={112} width={420} height={86} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={210} y={138} textAnchor="middle" className="ill-step">2. Jusqu’à la retraite : épargne bloquée</text>
        <text x={210} y={162} textAnchor="middle" className="ill-sub">Sauf cas prévus : accident de la vie,</text>
        <text x={210} y={180} textAnchor="middle" className="ill-sub">achat de la résidence principale</text>
        <path d="M 210 198 V 228 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <text x={226} y={218} textAnchor="start" className="ill-in">retraite</text>
        <rect x={0} y={228} width={420} height={86} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={210} y={254} textAnchor="middle" className="ill-step">3. Vous récupérez l’épargne</text>
        <text x={210} y={278} textAnchor="middle" className="ill-in">En capital, en rente viagère ou les deux</text>
        <text x={210} y={298} textAnchor="middle" className="ill-sub">La sortie est imposée</text>
        <text x={210} y={342} textAnchor="middle" className="ill-sub">Schéma de principe d’après Service-Public.fr</text>
      </svg>
    </figure>
  );
}

/** Schéma « LMNP : deux façons de calculer le revenu imposable » : principe qualitatif (aucun chiffre), repris de Service-Public.fr (fiche F32744, consultée le 2026-11-05) : régime micro-BIC = recettes diminuées d’un abattement forfaitaire pour frais ; régime réel = déduction des charges réelles, dont l’amortissement du logement et des meubles, à justifier. */
export function SchemaLmnp() {
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 300" role="img" aria-labelledby="ill-lmnp-t ill-lmnp-d" className="ill-svg">
        <title id="ill-lmnp-t">LMNP : deux façons de calculer le revenu imposable</title>
        <desc id="ill-lmnp-d">Dans les deux cas, on part des loyers encaissés. Au régime micro-BIC, on retire un abattement forfaitaire pour frais : aucun justificatif à fournir. Au régime réel, on retire les charges réelles, dont l’amortissement du logement et des meubles : il faut pouvoir les justifier. Ce qui reste est le revenu imposable.</desc>
        <rect x={0} y={2} width={420} height={50} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={210} y={33} textAnchor="middle" className="ill-step">Loyers encaissés dans l’année</text>
        <path d="M 105 52 V 80 m -7 -8 l 7 8 l 7 -8 M 315 52 V 80 m -7 -8 l 7 8 l 7 -8" fill="none" stroke="var(--ink-2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <rect x={0} y={80} width={204} height={130} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={102} y={106} textAnchor="middle" className="ill-step">Micro-BIC</text>
        <text x={102} y={134} textAnchor="middle" className="ill-in">On retire un</text>
        <text x={102} y={152} textAnchor="middle" className="ill-in">abattement forfaitaire</text>
        <text x={102} y={178} textAnchor="middle" className="ill-sub">Simple : pas de</text>
        <text x={102} y={194} textAnchor="middle" className="ill-sub">frais à justifier</text>
        <rect x={216} y={80} width={204} height={130} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={318} y={106} textAnchor="middle" className="ill-step">Régime réel</text>
        <text x={318} y={134} textAnchor="middle" className="ill-in">On retire les charges</text>
        <text x={318} y={152} textAnchor="middle" className="ill-in">réelles et l’amortissement</text>
        <text x={318} y={178} textAnchor="middle" className="ill-sub">Du logement et des meubles ;</text>
        <text x={318} y={194} textAnchor="middle" className="ill-sub">à justifier</text>
        <path d="M 210 210 V 228 m -7 -8 l 7 8 l 7 -8" fill="none" stroke="var(--ink-2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <rect x={0} y={230} width={420} height={36} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={210} y={254} textAnchor="middle" className="ill-step">= revenu imposable (BIC)</text>
        <text x={210} y={290} textAnchor="middle" className="ill-sub">Schéma de principe d’après Service-Public.fr</text>
      </svg>
    </figure>
  );
}

/** Schéma « ETF : un fonds qui suit un indice, acheté en Bourse comme une action » : principe qualitatif (aucun chiffre), repris de l’AMF (communiqué « ETF et risques associés », 14 février 2017, consulté le 2026-11-05) : un fonds indiciel coté vise à répliquer la performance d’un indice de référence, en achetant les titres qui le composent ou par réplication synthétique ; il est négociable en Bourse comme une simple action. */
export function SchemaEtf() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 300" role="img" aria-labelledby="ill-etf-t ill-etf-d" className="ill-svg">
        <title id="ill-etf-t">ETF : un fonds qui suit un indice, acheté en Bourse</title>
        <desc id="ill-etf-d">Un indice de référence mesure l’évolution d’un ensemble d’entreprises. Le fonds ETF cherche à en répliquer la performance, en achetant les titres de l’indice ou par des produits dérivés. Vous achetez des parts du fonds en Bourse, comme une action : vous suivez l’indice, à la hausse comme à la baisse.</desc>
        <rect x={0} y={2} width={420} height={50} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={210} y={33} textAnchor="middle" className="ill-step">Un indice de référence</text>
        <path d="M 210 52 V 78 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={0} y={80} width={420} height={104} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={210} y={106} textAnchor="middle" className="ill-step">Le fonds (ETF)</text>
        <text x={210} y={134} textAnchor="middle" className="ill-in">Il cherche à répliquer la performance de l’indice</text>
        <text x={210} y={160} textAnchor="middle" className="ill-sub">en achetant les titres de l’indice</text>
        <text x={210} y={176} textAnchor="middle" className="ill-sub">ou par des produits dérivés (réplication synthétique)</text>
        <path d="M 210 184 V 206 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={0} y={208} width={420} height={50} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={210} y={229} textAnchor="middle" className="ill-step">Vous : achat de parts en Bourse</text>
        <text x={210} y={247} textAnchor="middle" className="ill-sub">comme une action : vous suivez l’indice</text>
        <text x={210} y={290} textAnchor="middle" className="ill-sub">Schéma de principe d’après l’AMF</text>
      </svg>
    </figure>
  );
}

/** Schéma « Cryptos : passer par un prestataire agréé, sans garantie des dépôts » : principe qualitatif (aucun chiffre), repris de l’AMF (« Investir en crypto-actifs : quel professionnel choisir ? », 27 juillet 2026, consulté le 2026-11-06) : depuis le 1er juillet 2026, il faut le statut PSCA (agrément AMF en France) pour proposer des services sur crypto-actifs ; le FGDR ne couvre pas les crypto-actifs en cas de faillite de la plateforme. */
export function SchemaCrypto() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 300" role="img" aria-labelledby="ill-cr-t ill-cr-d" className="ill-svg">
        <title id="ill-cr-t">Cryptos : passer par un prestataire agréé, sans garantie des dépôts</title>
        <desc id="ill-cr-d">Pour acheter des crypto-actifs, vous passez par un prestataire de services sur crypto-actifs (PSCA), agréé par l’AMF en France. Depuis le 1er juillet 2026, l’ancien statut PSAN ne suffit plus. Attention : si la plateforme fait faillite, le fonds de garantie des dépôts (FGDR) ne couvre pas les crypto-actifs.</desc>
        <rect x={0} y={2} width={420} height={50} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={210} y={33} textAnchor="middle" className="ill-step">Vous</text>
        <path d="M 210 52 V 78 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={0} y={80} width={420} height={104} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={210} y={106} textAnchor="middle" className="ill-step">Un prestataire agréé (PSCA)</text>
        <text x={210} y={134} textAnchor="middle" className="ill-in">Agrément de l’AMF en France</text>
        <text x={210} y={160} textAnchor="middle" className="ill-sub">Depuis le 1er juillet 2026, l’ancien statut PSAN</text>
        <text x={210} y={176} textAnchor="middle" className="ill-sub">ne suffit plus : à vérifier sur la liste blanche de l’AMF</text>
        <path d="M 210 184 V 206 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={0} y={208} width={420} height={50} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={210} y={229} textAnchor="middle" className="ill-step">Vos crypto-actifs : aucune garantie des dépôts</text>
        <text x={210} y={247} textAnchor="middle" className="ill-sub">le FGDR ne les couvre pas si la plateforme fait faillite</text>
        <text x={210} y={290} textAnchor="middle" className="ill-sub">Schéma de principe d’après l’AMF</text>
      </svg>
    </figure>
  );
}

/** Schéma « Obligation : prêter, puis le prix selon les taux » : principe qualitatif (aucun chiffre), repris de La finance pour tous (page « Obligations », « effet balançoire »). */
export function SchemaObligation() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 340" role="img" aria-labelledby="ill-ob-t ill-ob-d" className="ill-svg">
        <title id="ill-ob-t">Une obligation : un prêt, et un prix qui varie avec les taux</title>
        <desc id="ill-ob-d">En achetant une obligation, vous prêtez de l’argent à un État ou à une entreprise, qui vous verse des intérêts (coupons) puis vous rembourse à l’échéance. Si vous revendez avant l’échéance, le prix dépend des taux : quand les taux montent, le prix des obligations déjà émises baisse ; quand les taux baissent, il monte.</desc>
        <rect x={0} y={2} width={150} height={64} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={75} y={30} textAnchor="middle" className="ill-step">Vous</text>
        <text x={75} y={50} textAnchor="middle" className="ill-sub">le prêteur</text>
        <rect x={270} y={2} width={150} height={64} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={345} y={30} textAnchor="middle" className="ill-step">L’émetteur</text>
        <text x={345} y={50} textAnchor="middle" className="ill-sub">État, entreprise</text>
        <path d="M 156 22 H 262 m -8 -7 l 8 7 l -8 7" {...arrow} />
        <text x={209} y={14} textAnchor="middle" className="ill-in">vous prêtez</text>
        <path d="M 264 48 H 158 m 8 -7 l -8 7 l 8 7" {...arrow} />
        <text x={209} y={72} textAnchor="middle" className="ill-in">intérêts (coupons)</text>
        <text x={209} y={88} textAnchor="middle" className="ill-in">puis remboursement</text>
        <line x1={0} y1={112} x2={420} y2={112} stroke="var(--line)" strokeWidth={2} strokeDasharray="4 6" />
        <text x={210} y={140} textAnchor="middle" className="ill-step">Si vous revendez avant l’échéance</text>
        <text x={210} y={160} textAnchor="middle" className="ill-sub">le prix suit les taux, comme une balançoire</text>
        <rect x={0} y={178} width={200} height={110} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={100} y={206} textAnchor="middle" className="ill-step">Les taux montent</text>
        <path d="M 100 218 V 252 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <text x={100} y={276} textAnchor="middle" className="ill-in">le prix de l’obligation baisse</text>
        <rect x={220} y={178} width={200} height={110} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={320} y={206} textAnchor="middle" className="ill-step">Les taux baissent</text>
        <path d="M 320 252 V 218 m -7 8 l 7 -8 l 7 8" {...arrow} />
        <text x={320} y={276} textAnchor="middle" className="ill-in">le prix de l’obligation monte</text>
        <text x={210} y={322} textAnchor="middle" className="ill-sub">Schéma de principe, sans chiffre</text>
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

/** Schéma « Où va un revenu de 3 000 € » : part des crédits et repère de 35 % (HCSF) sur l’exemple fictif du guide « Taux d’endettement ». */
export function SchemaEndettement() {
  const p = endettementParts();
  const X0 = 14;
  const BW = 312;
  const x = (v: number) => X0 + (v / p.income) * BW;
  const xLimit = x(p.limit);
  const rows = [
    { fill: 'var(--primary)', label: `${fmtEur(p.existing)} : crédit déjà en cours` },
    { fill: 'var(--accent)', label: `${fmtEur(p.added)} : nouvelle mensualité` },
    { fill: 'var(--surface-2)', label: `${fmtEur(p.rest)} : le reste de vos revenus`, stroke: true },
  ];
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 192" role="img" aria-labelledby="ill-end-t ill-end-d" className="ill-svg">
        <title id="ill-end-t">Les crédits ne doivent pas dépasser 35 % des revenus</title>
        <desc id="ill-end-d">{`Exemple fictif : ${fmtEur(p.income)} de revenus nets par mois. ${rows.map((r) => r.label).join(' ; ')}. Les crédits (${fmtEur(p.existing + p.added)}) représentent ${Math.round(p.ratioAfter * 100)} % des revenus, soit le repère de 35 % (${fmtEur(p.limit)}).`}</desc>
        <text x={X0} y="16" className="ill-step">{`Revenus nets : ${fmtEur(p.income)} par mois`}</text>
        <rect x={X0} y="30" width={BW} height="34" rx="8" fill="var(--surface-2)" stroke="var(--line)" />
        <rect x={X0} y="30" width={x(p.existing) - X0} height="34" rx="8" fill="var(--primary)" />
        <rect x={x(p.existing)} y="30" width={x(p.existing + p.added) - x(p.existing)} height="34" fill="var(--accent)" />
        <rect x={X0 + 8} y="30" width={x(p.existing) - X0 - 8} height="34" fill="var(--primary)" />
        <line x1={xLimit} x2={xLimit} y1="22" y2="74" stroke="var(--ink)" strokeWidth="2.5" strokeDasharray="4 3" />
        <text x={xLimit} y="92" textAnchor="middle" className="ill-total">{`Repère : 35 % = ${fmtEur(p.limit)}`}</text>
        {rows.map((r, i) => (
          <g key={r.label}>
            <rect x={X0} y={112 + i * 26} width="18" height="18" rx="4" fill={r.fill} stroke={r.stroke ? 'var(--line)' : 'none'} />
            <text x={X0 + 28} y={126 + i * 26} className="ill-step">{r.label}</text>
          </g>
        ))}
      </svg>
      <figcaption>
        <strong>Illustration, exemple fictif</strong> : avec {fmtEur(p.income)} de revenus, la charge totale de crédit maximale est de {fmtEur(p.limit)} par mois ; si {fmtEur(p.existing)} sont déjà engagés, il reste {fmtEur(p.maxNewPayment)} pour le nouveau crédit. Largeurs proportionnelles aux montants.
      </figcaption>
    </figure>
  );
}

/** Schéma « Patrimoine net = ce que l’on possède − ce que l’on doit » sur l’exemple fictif du guide. */
export function SchemaPatrimoineNet() {
  const p = patrimoineParts();
  const X0 = 14;
  const BW = 312;
  const x = (v: number) => X0 + (v / p.assets) * BW;
  const rows = [
    { fill: 'var(--primary)', label: `${fmtEur(p.home)} : logement (valeur estimée)` },
    { fill: 'var(--gold)', label: `${fmtEur(p.savings)} : épargne` },
    { fill: 'var(--surface-2)', label: `${fmtEur(p.debt)} : crédit restant dû`, stroke: true },
    { fill: 'var(--accent)', label: `${fmtEur(p.net)} : patrimoine net` },
  ];
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 226" role="img" aria-labelledby="ill-pn-t ill-pn-d" className="ill-svg">
        <title id="ill-pn-t">Patrimoine net : ce que l’on possède moins ce que l’on doit</title>
        <desc id="ill-pn-d">{`Exemple fictif : ${rows.slice(0, 3).map((r) => r.label).join(' ; ')}. Ce que l’on possède (${fmtEur(p.assets)}) moins ce que l’on doit (${fmtEur(p.debt)}) donne un patrimoine net de ${fmtEur(p.net)}.`}</desc>
        <text x={X0} y="16" className="ill-step">{`Ce que l’on possède : ${fmtEur(p.assets)}`}</text>
        <rect x={X0} y="24" width={BW} height="30" rx="8" fill="var(--primary)" />
        <rect x={x(p.home)} y="24" width={x(p.assets) - x(p.home)} height="30" rx="8" fill="var(--gold)" />
        <rect x={x(p.home) - 8} y="24" width="8" height="30" fill="var(--primary)" />
        <text x={X0} y="80" className="ill-step">{`Ce que l’on doit : ${fmtEur(p.debt)}`}</text>
        <rect x={X0} y="88" width={BW} height="30" rx="8" fill="var(--accent)" />
        <rect x={X0} y="88" width={x(p.debt) - X0} height="30" rx="8" fill="var(--surface-2)" stroke="var(--line)" />
        <rect x={x(p.debt) - 8} y="88" width="8" height="30" fill="var(--surface-2)" />
        {rows.map((r, i) => (
          <g key={r.label}>
            <rect x={X0} y={134 + i * 24} width="16" height="16" rx="4" fill={r.fill} stroke={r.stroke ? 'var(--line)' : 'none'} />
            <text x={X0 + 26} y={147 + i * 24} className="ill-step">{r.label}</text>
          </g>
        ))}
      </svg>
      <figcaption>
        <strong>Illustration, exemple fictif</strong> : ce que l’on possède moins ce que l’on doit donne le patrimoine net ({fmtEur(p.assets)} − {fmtEur(p.debt)} = {fmtEur(p.net)}). Largeurs proportionnelles aux montants.
      </figcaption>
    </figure>
  );
}

/** Schéma « Rembourser ou investir » : patrimoine net final des deux options sur l’exemple fictif du guide. */
export function SchemaRembourser() {
  const p = rembourserParts();
  const pctFr = (v: number) => `${(Math.round(v * 1000) / 10).toLocaleString('fr-FR')} %`;
  const X0 = 14;
  const BW = 250;
  const w = (v: number) => (v / Math.max(p.wealthPrepay, p.wealthInvest)) * BW;
  const bars = [
    { y: 52, v: p.wealthPrepay, fill: 'var(--accent)', title: 'Option 1 : rembourser', sub: `crédit éteint ${p.monthsSaved} mois plus tôt, mensualité inchangée` },
    { y: 136, v: p.wealthInvest, fill: 'var(--primary)', title: 'Option 2 : investir', sub: `placement à ${pctFr(p.annualReturn)} par an, crédit inchangé` },
  ];
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 210" role="img" aria-labelledby="ill-rb-t ill-rb-d" className="ill-svg">
        <title id="ill-rb-t">Rembourser ou investir : le patrimoine net obtenu dans chaque cas</title>
        <desc id="ill-rb-d">{`Exemple fictif : ${fmtEur(p.lump)} disponibles, crédit de ${fmtEur(p.balance)} à ${pctFr(p.annualRate)} sur ${p.remainingYears} ans restants. Au bout de ${p.remainingYears} ans, patrimoine net d’environ ${fmtEur(p.wealthPrepay)} en remboursant, contre environ ${fmtEur(p.wealthInvest)} en investissant : écart d’environ ${fmtEur(p.gap)}.`}</desc>
        <text x={X0} y="16" className="ill-step">{`Patrimoine net après ${p.remainingYears} ans (environ)`}</text>
        {bars.map((b) => (
          <g key={b.title}>
            <text x={X0} y={b.y - 10} className="ill-step">{b.title}</text>
            <rect x={X0} y={b.y} width={w(b.v)} height="28" rx="7" fill={b.fill} />
            <text x={X0 + w(b.v) + 8} y={b.y + 19} className="ill-total">{fmtEur(b.v)}</text>
            <text x={X0} y={b.y + 46} className="ill-sub">{b.sub}</text>
          </g>
        ))}
      </svg>
      <figcaption>
        <strong>Illustration, exemple fictif</strong> : avec {fmtEur(p.lump)} à placer, rembourser l’emporte d’environ {fmtEur(p.gap)} (intérêts économisés : environ {fmtEur(p.interestSaved)}). Si le placement rapportait davantage que le rendement d’équilibre, investir gagnerait. Barres proportionnelles aux montants.
      </figcaption>
    </figure>
  );
}

/** Schéma « immobilier ou ETF » : même effort d'épargne, deux chemins, comparaison du patrimoine à la même date. Aucun chiffre ; reprend la méthode décrite dans le guide. */
export function SchemaImmoEtf() {
  const cols = [
    { x: 0, title: 'Scénario 1 : l’immobilier', fill: 'var(--accent-soft)', stroke: 'var(--accent)', lines: ['Apport + crédit : un bien', 'Les loyers paient une partie', 'Vous complétez la mensualité'], end: 'valeur du bien − capital restant dû' },
    { x: 214, title: 'Scénario 2 : les ETF', fill: 'var(--surface-2, var(--surface))', stroke: 'var(--primary)', lines: ['L’apport est placé en ETF', 'puis la même somme chaque', 'année : rien à emprunter'], end: 'valeur des ETF' },
  ];
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 330" role="img" aria-labelledby="ill-ie-t ill-ie-d" className="ill-svg">
        <title id="ill-ie-t">Comparer immobilier et ETF à effort égal</title>
        <desc id="ill-ie-d">Même capital de départ et même effort d’épargne chaque année, placés soit dans un bien immobilier financé à crédit, soit en ETF. À la fin du même horizon, on compare le patrimoine obtenu dans chaque cas, après frais, impôts et frais de revente.</desc>
        <rect x={40} y={2} width={340} height={44} rx={12} fill="var(--surface)" stroke="var(--ink-2)" strokeWidth={2} />
        <text x={210} y={30} textAnchor="middle" className="ill-step">Même capital de départ, même effort par an</text>
        {cols.map((c) => (
          <g key={c.title}>
            <path d={`M ${c.x + 103} 46 V 70 m -7 -8 l 7 8 l 7 -8`} fill="none" stroke="var(--ink-2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <rect x={c.x} y={76} width={206} height={126} rx={12} fill={c.fill} stroke={c.stroke} strokeWidth={2} />
            <text x={c.x + 103} y={102} textAnchor="middle" className="ill-step">{c.title}</text>
            {c.lines.map((l, i) => (
              <text key={l} x={c.x + 103} y={130 + i * 22} textAnchor="middle" className="ill-in">{l}</text>
            ))}
            <path d={`M ${c.x + 103} 202 V 226 m -7 -8 l 7 8 l 7 -8`} fill="none" stroke="var(--ink-2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <text x={c.x + 103} y={246} textAnchor="middle" className="ill-sub">{c.end}</text>
          </g>
        ))}
        <rect x={0} y={262} width={420} height={60} rx={12} fill="var(--surface)" stroke="var(--ink-2)" strokeWidth={2} />
        <text x={210} y={288} textAnchor="middle" className="ill-step">Même horizon : on compare les deux patrimoines</text>
        <text x={210} y={308} textAnchor="middle" className="ill-sub">après frais, impôts et frais de revente</text>
      </svg>
      <figcaption>
        <strong>Schéma sans chiffres</strong> : ce qui est comparable, c’est le patrimoine final à effort égal, pas le rendement brut.
      </figcaption>
    </figure>
  );
}

/** Schéma « règle de 72 » : années pour doubler un capital, calcul exact et règle de 72, à cinq taux fictifs. */
export function SchemaRegle72() {
  const rows = regle72Rows();
  const X0 = 52;
  const BW = 215;
  const max = Math.max(...rows.map((r) => r.rule));
  const f1 = (v: number) => v.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const f0 = (v: number) => v.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
  const alt = rows.map((r) => `à ${f0(r.rate * 100)} %, ${f1(r.exact)} ans en calcul exact et ${f0(r.rule)} ans par la règle de 72`).join(' ; ');
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 330" role="img" aria-labelledby="ill-72-t ill-72-d" className="ill-svg">
        <title id="ill-72-t">Années pour doubler un capital : calcul exact et règle de 72</title>
        <desc id="ill-72-d">{`Exemple fictif, sans frais ni impôts. ${alt}.`}</desc>
        {rows.map((r, i) => {
          const y = 8 + i * 62;
          return (
            <g key={r.rate}>
              <text x="8" y={y + 24} className="ill-step">{`${f0(r.rate * 100)} %`}</text>
              <rect x={X0} y={y} width={(r.exact / max) * BW} height="20" rx="5" fill="var(--primary)" />
              <text x={X0 + (r.exact / max) * BW + 6} y={y + 15} className="ill-sub">{`${f1(r.exact)} ans`}</text>
              <rect x={X0} y={y + 26} width={(r.rule / max) * BW} height="20" rx="5" fill="var(--accent)" />
              <text x={X0 + (r.rule / max) * BW + 6} y={y + 41} className="ill-sub">{`${f0(r.rule)} ans`}</text>
            </g>
          );
        })}
        <rect x="52" y="318" width="12" height="9" rx="2" fill="var(--primary)" />
        <text x="70" y="327" className="ill-sub">calcul exact</text>
        <rect x="170" y="318" width="12" height="9" rx="2" fill="var(--accent)" />
        <text x="188" y="327" className="ill-sub">règle de 72</text>
      </svg>
      <figcaption>
        <strong>Illustration, exemple fictif</strong> : années nécessaires pour doubler un capital à cinq rendements annuels supposés, sans frais, impôts ni inflation. Barres proportionnelles aux durées.
      </figcaption>
    </figure>
  );
}

/** Schéma « combien épargner par mois » : versement mensuel pour atteindre 20 000 € selon la durée, sans intérêts et à 1,7 % (exemple fictif). */
export function SchemaEpargneMois() {
  const rows = epargneMoisRows();
  const X0 = 66;
  const BW = 180;
  const max = Math.max(...rows.map((r) => r.plain));
  const f0 = (v: number) => Math.round(v).toLocaleString('fr-FR');
  const alt = rows.map((r) => `sur ${r.years} ans, ${f0(r.plain)} € par mois sans intérêts et ${f0(r.withRate)} € à 1,7 %`).join(' ; ');
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 215" role="img" aria-labelledby="ill-em-t ill-em-d" className="ill-svg">
        <title id="ill-em-t">Versement mensuel pour atteindre 20 000 € selon la durée</title>
        <desc id="ill-em-d">{`Exemple fictif, avant impôt. ${alt}.`}</desc>
        {rows.map((r, i) => {
          const y = 8 + i * 62;
          return (
            <g key={r.years}>
              <text x="8" y={y + 24} className="ill-step">{`${r.years} ans`}</text>
              <rect x={X0} y={y} width={(r.plain / max) * BW} height="20" rx="5" fill="var(--primary)" />
              <text x={X0 + (r.plain / max) * BW + 6} y={y + 15} className="ill-sub">{`${f0(r.plain)} €`}</text>
              <rect x={X0} y={y + 26} width={(r.withRate / max) * BW} height="20" rx="5" fill="var(--accent)" />
              <text x={X0 + (r.withRate / max) * BW + 6} y={y + 41} className="ill-sub">{`${f0(r.withRate)} €`}</text>
            </g>
          );
        })}
        <rect x="66" y="200" width="12" height="9" rx="2" fill="var(--primary)" />
        <text x="84" y="209" className="ill-sub">sans intérêts</text>
        <rect x="184" y="200" width="12" height="9" rx="2" fill="var(--accent)" />
        <text x="202" y="209" className="ill-sub">{`à ${(EPARGNE_MOIS_EXAMPLE.rate * 100).toLocaleString('fr-FR')} % par an`}</text>
      </svg>
      <figcaption>
        <strong>Illustration, exemple fictif</strong> : versement mensuel pour atteindre 20 000 € en 3, 5 ou 10 ans, sans intérêts puis à 1,7 % par an, avant impôt. Barres proportionnelles aux montants.
      </figcaption>
    </figure>
  );
}

/** Schéma « petits versements » : versé et gains après 30 ans, 50 € par mois constants ou augmentés (exemple fictif, 4 % par an supposé). */
export function SchemaPetitsVersements() {
  const rows = petitsVersementsRows();
  const { years, annualReturn } = PETITS_VERSEMENTS_EXAMPLE;
  const X0 = 14;
  const BW = 312;
  const max = Math.max(...rows.map((r) => r.total));
  const alt = rows.map((r) => `${r.label} : ${fmtEur(r.paid)} versés et ${fmtEur(r.gains)} de gains, soit environ ${fmtEur(r.total)}`).join(' ; ');
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 222" role="img" aria-labelledby="ill-pv-t ill-pv-d" className="ill-svg">
        <title id="ill-pv-t">Ce que deviennent de petits versements après 30 ans</title>
        <desc id="ill-pv-d">{`Exemple fictif, ${(annualReturn * 100).toLocaleString('fr-FR')} % par an supposé, avant impôt, sur ${years} ans. ${alt}.`}</desc>
        {rows.map((r, i) => {
          const y = 30 + i * 78;
          const wp = (r.paid / max) * BW;
          const wg = (r.gains / max) * BW;
          return (
            <g key={r.label}>
              <text x={X0} y={y - 10} className="ill-in">{r.label}</text>
              <rect x={X0} y={y} width={wp} height="28" rx="7" fill="var(--primary)" />
              <rect x={X0 + wp} y={y} width={wg} height="28" rx="7" fill="var(--accent)" />
              <text x={X0 + 8} y={y + 19} className="ill-in ill-on-dark">{fmtEur(r.paid)}</text>
              {wg > 90 ? (
                <text x={X0 + wp + 8} y={y + 19} className="ill-in ill-on-dark">{`+ ${fmtEur(r.gains)}`}</text>
              ) : (
                <text x={X0 + wp + wg + 6} y={y + 19} className="ill-in">{`+ ${fmtEur(r.gains)}`}</text>
              )}
              <text x={X0} y={y + 46} className="ill-sub">{`Total : environ ${fmtEur(r.total)}, dont ${fmtEur(r.gains)} de gains`}</text>
            </g>
          );
        })}
        <rect x={X0} y="194" width="12" height="9" rx="2" fill="var(--primary)" />
        <text x={X0 + 18} y="203" className="ill-sub">versé</text>
        <rect x={X0 + 78} y="194" width="12" height="9" rx="2" fill="var(--accent)" />
        <text x={X0 + 96} y="203" className="ill-sub">gains supposés</text>
      </svg>
      <figcaption>
        <strong>Illustration, exemple fictif</strong> : {years} ans à {(annualReturn * 100).toLocaleString('fr-FR')} % par an supposé, avant impôt, versements en début de mois. Les hausses interviennent après 5 ans (100 €) puis 10 ans (150 €). Barres proportionnelles aux montants.
      </figcaption>
    </figure>
  );
}

/** Schéma « effet des frais » : capital final de 10 000 € placés 25 ans à 6 % brut supposé, sans frais, 0,2 % et 1,5 % par an (exemple fictif). */
export function SchemaFrais() {
  const rows = fraisRows();
  const { initial, annualReturn, years } = FRAIS_EXAMPLE;
  const X0 = 14;
  const BW = 236;
  const max = rows[0].final;
  const pct = (v: number) => `${(v * 100).toLocaleString('fr-FR')} %`;
  const label = (f: number) => (f === 0 ? 'Sans frais (référence)' : `${pct(f)} de frais par an`);
  const alt = rows.map((r) => `${r.fees === 0 ? 'sans frais' : `avec ${pct(r.fees)} de frais par an`}, environ ${fmtEur(r.final)}${r.cost ? ` (${fmtEur(r.cost)} de moins)` : ''}`).join(' ; ');
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 250" role="img" aria-labelledby="ill-fr-t ill-fr-d" className="ill-svg">
        <title id="ill-fr-t">Effet des frais annuels sur un capital après 25 ans</title>
        <desc id="ill-fr-d">{`Exemple fictif : ${fmtEur(initial)} placés ${years} ans avec un rendement brut supposé de ${pct(annualReturn)}. Capital obtenu : ${alt}.`}</desc>
        <text x={X0} y="16" className="ill-step">{`Capital après ${years} ans (environ)`}</text>
        {rows.map((r, i) => {
          const y = 46 + i * 66;
          const w = (r.final / max) * BW;
          return (
            <g key={r.fees}>
              <text x={X0} y={y - 8} className="ill-in">{label(r.fees)}</text>
              {r.cost > 0 && <rect x={X0 + w} y={y} width={BW - w} height="26" rx="7" fill="none" stroke="var(--danger)" strokeWidth="1.5" strokeDasharray="4 3" />}
              <rect x={X0} y={y} width={w} height="26" rx="7" fill={r.fees === 0 ? 'var(--accent)' : 'var(--primary)'} />
              <text x={X0 + 10} y={y + 18} className="ill-in ill-on-dark">{fmtEur(r.final)}</text>
              {r.cost > 0 && <text x={X0 + BW + 8} y={y + 18} className="ill-loss">{`− ${fmtEur(r.cost)}`}</text>}
            </g>
          );
        })}
        <text x={X0} y="244" className="ill-sub">{`Pointillés : ce que les frais retirent.`}</text>
      </svg>
      <figcaption>
        <strong>Illustration, exemple fictif</strong> : {fmtEur(initial)} placés {years} ans à {pct(annualReturn)} brut supposé, sans versement ni impôt. Barres proportionnelles aux montants.
      </figcaption>
    </figure>
  );
}

export type HeaderArtName = 'guides' | 'simulateurs' | 'encyclopedie' | 'comparateur' | 'entrepreneuriat';

/** Scènes décoratives des bandeaux de rubrique (240 × 150) : même trait, mêmes couleurs que les icônes ; aucune donnée chiffrée. */
export function HeaderArt({ name }: { name: HeaderArtName }) {
  const line = { fill: 'none', stroke: 'var(--primary)', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const soft = { fill: 'var(--accent-soft)', stroke: 'var(--accent)', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const white = { fill: '#fff', stroke: 'var(--primary)', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const gold = { fill: 'var(--gold)', stroke: 'var(--primary)', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  let scene: JSX.Element;
  switch (name) {
    case 'guides': // livre ouvert, ampoule au-dessus
      scene = <>
        <path d="M30 128c30-12 60-12 90 0 30-12 60-12 90 0" {...line} opacity=".35" />
        <path d="M120 124V62C98 50 66 50 36 60v62c30-10 62-10 84 2z" {...white} />
        <path d="M120 124V62c22-12 54-12 84-2v62c-30-10-62-10-84 2z" {...soft} />
        <path d="M54 76c18-4 38-4 52 2M54 92c18-4 38-4 52 2M134 78c14-6 34-6 52-2M134 94c14-6 34-6 52-2" {...line} />
        <path d="M120 22a17 17 0 0 0-9 31v5h18v-5a17 17 0 0 0-9-31z" {...gold} />
        <path d="M113 64h14M85 20l-7-6M155 20l7-6M70 40h-9M170 40h9" {...line} />
      </>;
      break;
    case 'simulateurs': // calculatrice et courbe
      scene = <>
        <rect x="26" y="18" width="84" height="116" rx="12" {...white} />
        <rect x="38" y="30" width="60" height="24" rx="6" {...soft} />
        <path d="M46 66h12M72 66h12M46 84h12M72 84h12M46 102h12M72 102h12" {...line} strokeWidth={6} />
        <rect x="40" y="114" width="56" height="10" rx="5" {...gold} />
        <path d="M130 124h92M130 124V40" {...line} />
        <path d="M138 108l24-22 20 12 34-50" {...line} stroke="var(--accent)" />
        <path d="M206 54h14v14" {...line} stroke="var(--accent)" />
        <circle cx="162" cy="86" r="5" {...gold} /><circle cx="182" cy="98" r="5" {...gold} />
      </>;
      break;
    case 'encyclopedie': // étagère de volumes et loupe
      scene = <>
        <path d="M20 128h150" {...line} />
        <rect x="30" y="52" width="26" height="76" rx="4" {...white} />
        <rect x="60" y="34" width="26" height="94" rx="4" {...soft} />
        <rect x="90" y="60" width="26" height="68" rx="4" {...gold} />
        <rect x="120" y="44" width="26" height="84" rx="4" {...white} />
        <path d="M37 68h12M67 52h12M97 76h12M127 60h12M37 112h12M67 112h12" {...line} strokeWidth={2.5} />
        <circle cx="188" cy="62" r="26" {...white} fill="var(--accent-soft)" />
        <path d="M207 82l22 24" {...line} strokeWidth={7} />
        <path d="M176 58a14 14 0 0 1 12-10" {...line} stroke="var(--accent)" />
      </>;
      break;
    case 'comparateur': // balance, deux plateaux
      scene = <>
        <path d="M120 30v94M86 128h68" {...line} />
        <circle cx="120" cy="26" r="6" {...gold} />
        <path d="M44 44h152" {...line} />
        <path d="M44 44 24 92h40zM196 44l-20 48h40z" {...soft} />
        <path d="M24 92a20 14 0 0 0 40 0M176 92a20 14 0 0 0 40 0" {...line} />
        <path d="M34 78h20M186 66h20M186 78h20" {...line} strokeWidth={2.5} />
      </>;
      break;
    default: // entrepreneuriat : pousse et boutique
      scene = <>
        <path d="M24 128h192" {...line} />
        <rect x="136" y="64" width="70" height="64" rx="6" {...white} />
        <path d="M130 64l8-24h66l8 24z" {...soft} />
        <path d="M130 64a9 9 0 0 0 18 0 9 9 0 0 0 18 0 9 9 0 0 0 18 0 9 9 0 0 0 18 0" {...line} />
        <rect x="160" y="92" width="22" height="36" rx="3" {...gold} />
        <ellipse cx="68" cy="120" rx="34" ry="8" {...gold} />
        <path d="M68 118V68" {...line} />
        <path d="M68 86C48 86 40 72 40 58c20 0 28 10 28 28zM68 76c0-18 10-30 30-30 0 18-10 30-30 30z" {...soft} />
      </>;
      break;
  }
  return <svg viewBox="0 0 240 150" aria-hidden="true" focusable="false" className="header-art">{scene}</svg>;
}

/** Scène décorative du bandeau d'accueil (260 × 200), pensée pour le fond bleu : piles de pièces de plus en plus hautes et pousse. Aucune donnée chiffrée. */
export function HomeArt() {
  const w = { fill: 'rgba(255,255,255,.12)', stroke: '#fff', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const g = { fill: 'var(--gold)', stroke: '#fff', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const l = { fill: 'none', stroke: '#fff', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const pile = (x: number, n: number) => Array.from({ length: n }, (_, i) => {
    const y = 172 - i * 16;
    return <path key={`${x}-${i}`} d={`M${x - 26} ${y}v-10a26 9 0 0 1 52 0v10a26 9 0 0 1-52 0z`} {...(i === n - 1 ? g : w)} />;
  });
  return (
    <svg viewBox="0 0 260 200" aria-hidden="true" focusable="false" className="home-art">
      <path d="M8 184h244" {...l} opacity=".5" />
      {pile(50, 2)}
      {pile(130, 4)}
      {pile(210, 6)}
      <path d="M50 118c34-6 60-26 80-56M210 66V44" {...l} strokeDasharray="2 9" opacity=".7" />
      <path d="M210 52V28" {...l} />
      <path d="M210 40C192 40 184 28 184 14c18 0 26 10 26 26zM210 32c0-16 10-26 28-26 0 16-10 26-28 26z" fill="var(--accent-soft)" stroke="#fff" strokeWidth={3} strokeLinejoin="round" />
    </svg>
  );
}

/** Schéma « capital visé » : plus on retire peu chaque année, plus le capital nécessaire est grand (exemple fictif). */
export function SchemaCapitalVise() {
  const rows = capitalViseRows();
  const X0 = 52;
  const BW = 190;
  const max = Math.max(...rows.map((r) => r.capital));
  const f0 = (v: number) => v.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
  const eur = (v: number) => `${f0(v)}\u00a0€`;
  const alt = rows.map((r) => `à ${f0(r.rate * 100)} % de retrait, il faut ${eur(r.capital)}`).join(' ; ');
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 170" role="img" aria-labelledby="ill-cv-t ill-cv-d" className="ill-svg">
        <title id="ill-cv-t">Capital nécessaire pour vivre de ses placements selon le taux de retrait</title>
        <desc id="ill-cv-d">{`Exemple fictif : ${eur(CAPITAL_VISE_EXAMPLE.expenses)} de dépenses par an, sans autre revenu. ${alt}. Plus le taux de retrait est bas, plus le capital nécessaire est grand.`}</desc>
        <text x="8" y="18" className="ill-sub">{`Dépenses : ${eur(CAPITAL_VISE_EXAMPLE.expenses)} par an ÷ taux de retrait = capital`}</text>
        {rows.map((r, i) => {
          const y = 34 + i * 44;
          const w = (r.capital / max) * BW;
          return (
            <g key={r.rate}>
              <text x="8" y={y + 22} className="ill-step">{`${f0(r.rate * 100)} %`}</text>
              <rect x={X0} y={y} width={w} height="30" rx="6" fill="var(--primary)" />
              <text x={X0 + w + 6} y={y + 20} className="ill-sub">{eur(r.capital)}</text>
            </g>
          );
        })}
      </svg>
      <figcaption>
        <strong>Illustration, exemple fictif</strong> : capital à réunir pour couvrir 30 000 € de dépenses par an, à trois taux de retrait supposés. Barres proportionnelles aux montants ; aucune garantie de rendement.
      </figcaption>
    </figure>
  );
}

export function SchemaPrecaution() {
  const rows = precautionRows();
  const X0 = 14;
  const BW = 180;
  const max = Math.max(...rows.map((r) => r.amount));
  const f0 = (v: number) => v.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
  const eur = (v: number) => `${f0(v)}\u00a0€`;
  const alt = rows.map((r) => `${r.months} mois (${r.label.toLowerCase()}) : ${eur(r.amount)}`).join(' ; ');
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 190" role="img" aria-labelledby="ill-pre-t ill-pre-d" className="ill-svg">
        <title id="ill-pre-t">Réserve de précaution pour 3, 6 ou 9 mois de dépenses</title>
        <desc id="ill-pre-d">{`Exemple fictif : ${eur(PRECAUTION_EXAMPLE.monthly)} de dépenses par mois. ${alt}. Plus la situation est incertaine, plus le repère est haut.`}</desc>
        <text x="8" y="18" className="ill-sub">{`Dépenses : ${eur(PRECAUTION_EXAMPLE.monthly)} par mois × nombre de mois`}</text>
        {rows.map((r, i) => {
          const y = 32 + i * 50;
          const w = (r.amount / max) * BW;
          return (
            <g key={r.months}>
              <text x={X0} y={y + 10} className="ill-sub">{`${r.months} mois · ${r.label}`}</text>
              <rect x={X0} y={y + 16} width={w} height="22" rx="6" fill="var(--primary)" />
              <text x={X0 + w + 6} y={y + 33} className="ill-step">{eur(r.amount)}</text>
            </g>
          );
        })}
      </svg>
      <figcaption>
        <strong>Illustration, exemple fictif</strong> : réserve correspondant aux trois repères courants pour 2 000 € de dépenses par mois. Barres proportionnelles aux montants. Ce sont des repères pédagogiques, pas une règle officielle.
      </figcaption>
    </figure>
  );
}

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
          : 'Seuls les crédits (en cours et nouveau) sont comparés au repère de 35 %.'}
      </figcaption>
    </figure>
  );
}

/** Schéma « retraits réguliers » : trois trajectoires qualitatives du capital selon que les gains dépassent, égalent ou n'atteignent pas les retraits. Aucun chiffre. */
export function SchemaRetraits() {
  const X0 = 40;
  const X1 = 330;
  const Y0 = 20;
  const Y1 = 150;
  const mid = 70;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 232" role="img" aria-labelledby="ill-ret-t ill-ret-d" className="ill-svg">
        <title id="ill-ret-t">Évolution du capital quand on retire de l’argent chaque mois</title>
        <desc id="ill-ret-d">Illustration sans chiffres. Trois trajectoires partent du même capital. Si les gains du placement dépassent les retraits, le capital augmente. S’ils les égalent, le capital reste stable. S’ils sont inférieurs, le capital baisse jusqu’à s’épuiser.</desc>
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke="var(--ink-2)" strokeWidth="1.5" />
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke="var(--ink-2)" strokeWidth="1.5" />
        <text x="8" y="14" className="ill-sub">Capital</text>
        <text x={X1} y={Y1 + 16} textAnchor="end" className="ill-sub">Temps →</text>
        <path d={`M${X0} ${mid} C150 ${mid - 4} 230 ${mid - 20} ${X1} ${Y0 + 4}`} fill="none" stroke="var(--chart-2)" strokeWidth="3" strokeLinecap="round" />
        <path d={`M${X0} ${mid} L${X1} ${mid}`} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
        <path d={`M${X0} ${mid} C150 ${mid + 4} 230 ${mid + 40} ${X1 - 40} ${Y1}`} fill="none" stroke="var(--danger)" strokeWidth="3" strokeLinecap="round" />
        <circle cx={X0} cy={mid} r="4.5" fill="var(--ink)" />
        <text x={X0 + 6} y={mid - 10} className="ill-sub">départ</text>
        <rect x="14" y="178" width="12" height="9" rx="2" fill="var(--chart-2)" />
        <text x="32" y="187" className="ill-sub">gains supérieurs aux retraits : le capital grandit</text>
        <rect x="14" y="194" width="12" height="9" rx="2" fill="var(--primary)" />
        <text x="32" y="203" className="ill-sub">gains égaux aux retraits : le capital tient</text>
        <rect x="14" y="210" width="12" height="9" rx="2" fill="var(--danger)" />
        <text x="32" y="219" className="ill-sub">gains inférieurs aux retraits : le capital s’épuise</text>
      </svg>
      <figcaption>
        <strong>Illustration, sans chiffres</strong> : l’allure du capital dépend de l’écart entre ce que le placement rapporte et ce que vous retirez. Les courbes sont indicatives.
      </figcaption>
    </figure>
  );
}

export const CTO_EXAMPLE_GAIN = 1000;

/** Schéma « Compte-titres : sur un gain, ce qui reste après le PFU » : exemple fictif de 1 000 € de plus-value réalisée, taux de 2026 (12,8 % + 18,6 % = 31,4 %, Service-Public F21618, consulté le 2026-11-06). Chiffres recalculés par src/cto.test.ts. */
export function SchemaCto() {
  const r = pfuSplit(CTO_EXAMPLE_GAIN);
  const X0 = 14;
  const W = 392;
  const wIr = (r.ir / CTO_EXAMPLE_GAIN) * W;
  const wPs = (r.ps / CTO_EXAMPLE_GAIN) * W;
  const wNet = W - wIr - wPs;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 214" role="img" aria-labelledby="ill-cto-t ill-cto-d" className="ill-svg">
        <title id="ill-cto-t">{`Compte-titres : sur un gain de ${fmtEur(CTO_EXAMPLE_GAIN)}, il vous reste ${fmtEur(r.net)}`}</title>
        <desc id="ill-cto-d">{`Exemple fictif : vous vendez des titres avec ${fmtEur(CTO_EXAMPLE_GAIN)} de plus-value. Le prélèvement forfaitaire unique de 31,4 % retire ${fmtEur(r.ir)} d’impôt sur le revenu (12,8 %) et ${fmtEur(r.ps)} de prélèvements sociaux (18,6 %), soit ${fmtEur(r.total)}. Il vous reste ${fmtEur(r.net)}.`}</desc>
        <text x={X0} y={20} className="ill-step">Un gain de {fmtEur(CTO_EXAMPLE_GAIN)} (exemple fictif)</text>
        <rect x={X0} y={32} width={wIr} height={40} fill="var(--warn)" />
        <rect x={X0 + wIr} y={32} width={wPs} height={40} fill="var(--primary)" />
        <rect x={X0 + wIr + wPs} y={32} width={wNet} height={40} fill="var(--accent)" />
        <rect x={X0} y={32} width={W} height={40} rx={8} fill="none" stroke="var(--ink-2)" strokeWidth={1.5} />
        <text x={X0 + wIr + wPs + wNet / 2} y={58} textAnchor="middle" className="ill-on-dark ill-total">{fmtEur(r.net)} pour vous</text>
        <path d={`M ${X0 + wIr / 2} 76 V 98 H ${X0 + 12} V 108`} fill="none" stroke="var(--warn)" strokeWidth={2} strokeLinejoin="round" />
        <path d={`M ${X0 + wIr + wPs / 2} 76 V 98 H ${X0 + 214} V 108`} fill="none" stroke="var(--primary)" strokeWidth={2} strokeLinejoin="round" />
        <text x={X0} y={128} className="ill-step">{fmtEur(r.ir)}</text>
        <text x={X0} y={146} className="ill-sub">impôt sur le revenu</text>
        <text x={X0} y={162} className="ill-sub">(12,8 %)</text>
        <text x={X0 + 202} y={128} className="ill-step">{fmtEur(r.ps)}</text>
        <text x={X0 + 202} y={146} className="ill-sub">prélèvements sociaux</text>
        <text x={X0 + 202} y={162} className="ill-sub">(18,6 %)</text>
        <text x={210} y={200} textAnchor="middle" className="ill-sub">Total retiré : {fmtEur(r.total)}, soit 31,4 % du gain</text>
      </svg>
      <figcaption>
        <strong>Illustration, exemple fictif</strong> : taux de 2026 sur une plus-value réalisée, sans option pour le barème progressif. Barre proportionnelle aux montants.
      </figcaption>
    </figure>
  );
}

/** Schéma « Actions en direct : répartir sur 15 lignes limite l’effet d’une défaillance » : reprend l’exemple fictif de la fiche (15 lignes de 1 000 €, perte maximale 1 000 €, soit 6,7 % de 15 000 €), recalculé par test. Aucune information factuelle nouvelle. */
export function SchemaActions() {
  const cells = Array.from({ length: 15 }, (_, i) => ({ x: 40 + (i % 5) * 70, y: 54 + Math.floor(i / 5) * 46, bad: i === 7 }));
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 300" role="img" aria-labelledby="ill-act-t ill-act-d" className="ill-svg">
        <title id="ill-act-t">Actions : une seule entreprise défaillante sur quinze</title>
        <desc id="ill-act-d">Exemple fictif : un portefeuille de quinze actions de 1 000 € chacune, soit 15 000 €. Si une seule entreprise fait défaillance, la perte est au plus de 1 000 €, soit 6,7 % du total.</desc>
        <text x={210} y={24} textAnchor="middle" className="ill-step">15 entreprises × 1 000 € = 15 000 €</text>
        {cells.map((c, i) => (
          <g key={i}>
            <rect x={c.x} y={c.y} width={60} height={36} rx={8} fill={c.bad ? 'var(--warn-soft)' : 'var(--accent-soft)'} stroke={c.bad ? 'var(--warn)' : 'var(--accent)'} strokeWidth={2} />
            <text x={c.x + 30} y={c.y + 23} textAnchor="middle" className="ill-in">{c.bad ? '0 €' : '1 000 €'}</text>
          </g>
        ))}
        <rect x={0} y={198} width={420} height={62} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={210} y={222} textAnchor="middle" className="ill-step">Une entreprise défaillante : − 1 000 € au plus</text>
        <text x={210} y={244} textAnchor="middle" className="ill-sub">soit 6,7 % du total (1 000 € sur 15 000 €)</text>
        <text x={210} y={288} textAnchor="middle" className="ill-sub">Exemple fictif, schéma d’illustration</text>
      </svg>
    </figure>
  );
}
