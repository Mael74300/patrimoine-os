import type { ReactNode } from 'react';
import { fmtEur, HCSF } from '../lib/finance';
import { pfuSplit } from '../lib/calc/pfu';
import { perDeductionBalance } from '../lib/calc/per';
import { DIVERSIFICATION_EXAMPLE, PER_EXAMPLE, INFLATION_EXAMPLE, LEVERAGE_EXAMPLE, LOAN_EXAMPLE, SNOWBALL_EXAMPLE, diversificationRows, inflationBars, leverageBars, loanSlices, snowballGroups, rendementSteps, RENDEMENT_EXAMPLE, endettementParts, patrimoineParts, rembourserParts, regle72Rows, epargneMoisRows, EPARGNE_MOIS_EXAMPLE, fraisRows, FRAIS_EXAMPLE, petitsVersementsRows, capitalViseRows, CAPITAL_VISE_EXAMPLE, precautionRows, PRECAUTION_EXAMPLE, moisParts, PETITS_VERSEMENTS_EXAMPLE, type SnowballBar } from '../lib/illustrationData';

const W = 420;
const BASE = 262;
const TOP = 40;
const BAR_W = 84;

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
        <strong>Illustration, exemple fictif</strong> : {fmtEur(initial)} placés à {annualRate * 100} % par an, sans nouveau versement, avant frais et impôts.
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
        <strong>Illustration, exemple fictif</strong> : {fmtEur(principal)} empruntés à {ratePct} % sur {years} ans, hors assurance, soit {fmtEur(monthly)} par mois.
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
        <strong>Illustration, exemple fictif</strong> : {fmtEur(initial)} sur {years} ans, avec une inflation constante de {inflation * 100} % par an et un placement à {rate * 100} % par an, avant frais et impôts.
        Le montant affiché peut grossir sans que la somme permette d’acheter plus : ce qui compte, c’est l’écart avec l’inflation. Ces taux ne sont ni observés ni prévus.
      </figcaption>
    </figure>
  );
}

const pct = (v: number) => `${v < 0 ? '−' : ''}${(Math.abs(v) * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;

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
      ? `Bien à ${pct(b.yieldPct)} % : ${fmtEur(b.income)} de loyers nets, tous absorbés par les intérêts, et il manque ${fmtEur(b.shortfall)}.`
      : `Bien à ${pct(b.yieldPct)} % : ${fmtEur(b.income)} de loyers nets, dont ${fmtEur(b.interestPaid)} d’intérêts, il reste ${fmtEur(b.left)} avant impôt, soit ${Math.round((b.left / down) * 100)} % de l’apport.`))
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

/** Schéma « diversification » : même année, 10 000 € tout en actions ou 70 % en actions et 30 % en placement prudent. Les longueurs des barres de perte sont proportionnelles. */
export function SchemaDiversification() {
  const rows = diversificationRows();
  const { capital, stocksReturn, safeReturn } = DIVERSIFICATION_EXAMPLE;
  const X0 = 20;
  const FULL = 380;
  const len = (v: number) => (Math.abs(v) / Math.abs(stocksReturn)) * 280;
  const titles = rows.map((r) => (r.safe > 0 ? `${fmtEur(capital)} : ${fmtEur(capital * r.stocks)} en actions, ${fmtEur(capital * r.safe)} prudents` : `${fmtEur(capital)} tout en actions`));
  const signed = (v: number) => (v > 0 ? `+${fmtEur(v)}` : fmtEur(v));
  const alt = rows
    .map((r, i) => `${titles[i]} (${fmtEur(capital * r.stocks)} en actions${r.safe > 0 ? `, ${fmtEur(capital * r.safe)} en placement prudent` : ''}) : ${signed(r.totalEur)} sur l’année, soit ${pct(r.result)}.`)
    .join(' ');
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 292" role="img" aria-labelledby="ill-div-t ill-div-d" className="ill-svg">
        <title id="ill-div-t">Répartir son épargne entre plusieurs placements réduit la perte d’une année où les actions baissent</title>
        <desc id="ill-div-d">{`Une année fictive où les actions perdent ${pct(-stocksReturn)} et un placement prudent gagne ${pct(safeReturn)}. ${alt}`}</desc>
        {rows.map((r, i) => {
          const y = 8 + i * 146;
          const ws = r.stocks * FULL;
          return (
            <g key={titles[i]}>
              <text x={X0} y={y + 14} className="ill-year" textAnchor="start">{titles[i]}</text>
              <rect x={X0} y={y + 24} width={ws} height={30} rx={4} fill="var(--primary)" />
              <text x={X0 + 10} y={y + 44} className="ill-on-dark ill-in" textAnchor="start">Actions</text>
              {r.safe > 0 && (
                <>
                  <rect x={X0 + ws} y={y + 24} width={FULL - ws} height={30} rx={4} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
                  <text x={X0 + ws + 10} y={y + 44} className="ill-in" textAnchor="start">Prudent</text>
                </>
              )}
              <text x={X0} y={y + 78} className="ill-sub" textAnchor="start">Résultat de l’année</text>
              <rect x={X0} y={y + 86} width={len(r.result)} height={22} rx={4} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
              <text x={X0 + len(r.result) + 10} y={y + 102} className="ill-total" textAnchor="start">{signed(r.totalEur)}</text>
              <text x={X0} y={y + 126} className="ill-sub" textAnchor="start">
                {r.safe > 0
                  ? `Actions ${signed(r.stocksEur)}, prudent ${signed(r.safeEur)} : ${pct(r.result)}`
                  : `Tout suit la baisse des actions : ${pct(r.result)}`}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption>
        <strong>Illustration, exemple fictif</strong> : actions à {pct(stocksReturn)} et placement prudent à +{pct(safeReturn)} sur l’année. La barre foncée montre où est placé l’argent, la barre ocre la perte de l’année : la répartition amortit la baisse, sans l’empêcher.
      </figcaption>
    </figure>
  );
}

/** Schéma « diversifier : principe » : un seul placement ou plusieurs, quand l’un d’eux baisse. Aucun chiffre ; reprend le texte du guide et La finance pour tous (les placements n’évoluent pas tous de la même manière). */
export function SchemaDiversificationPrincipe() {
  const arrow = { fill: 'none', stroke: 'var(--warn)', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const placements = ['Livret', 'Actions', 'Immobilier', 'Fonds en euros'];
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 262" role="img" aria-labelledby="ill-divp-t ill-divp-d" className="ill-svg">
        <title id="ill-divp-t">Un seul placement ou plusieurs : ce qui se passe quand l’un baisse</title>
        <desc id="ill-divp-d">À gauche, toute l’épargne est dans un seul placement : s’il baisse, tout le patrimoine baisse avec lui. À droite, l’épargne est répartie entre un livret, des actions, de l’immobilier et un fonds en euros : si les actions baissent, les autres placements n’évoluent pas de la même manière, donc le patrimoine ne dépend plus d’un seul d’entre eux.</desc>
        <text x={90} y={18} textAnchor="middle" className="ill-step">Tout au même endroit</text>
        <rect x={0} y={34} width={180} height={84} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={90} y={82} textAnchor="middle" className="ill-step">Un seul placement</text>
        <path d="M 90 118 V 152 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <text x={90} y={178} textAnchor="middle" className="ill-in">Il baisse :</text>
        <text x={90} y={198} textAnchor="middle" className="ill-in">tout votre patrimoine</text>
        <text x={90} y={218} textAnchor="middle" className="ill-in">baisse avec lui</text>
        <text x={307} y={18} textAnchor="middle" className="ill-step">Plusieurs placements</text>
        {placements.map((n, i) => {
          const x = 194 + (i % 2) * 116;
          const y = 34 + Math.floor(i / 2) * 46;
          const down = n === 'Actions';
          return (
            <g key={n}>
              <rect x={x} y={y} width={110} height={38} rx={10} fill={down ? 'var(--warn-soft)' : 'var(--accent-soft)'} stroke={down ? 'var(--warn)' : 'var(--accent)'} strokeWidth={2} />
              <text x={x + 55} y={y + 24} textAnchor="middle" className="ill-in">{n}</text>
            </g>
          );
        })}
        <path d="M 307 126 V 152 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <text x={307} y={178} textAnchor="middle" className="ill-in">Un placement baisse :</text>
        <text x={307} y={198} textAnchor="middle" className="ill-in">les autres n’évoluent pas</text>
        <text x={307} y={218} textAnchor="middle" className="ill-in">de la même manière</text>
        <text x={210} y={252} textAnchor="middle" className="ill-sub">Mais si tout baisse en même temps, rien n’amortit</text>
      </svg>
      <figcaption>
        <strong>Illustration, sans chiffre</strong> : le principe de la diversification. Répartir son épargne évite qu’un seul placement décide de tout ; cela ne garantit ni un gain ni l’absence de perte.
      </figcaption>
    </figure>
  );
}

/** Schéma « PTZ : remboursement » : frise dans le temps. Le PTZ s'ajoute à un autre prêt et se rembourse en une ou deux périodes
 * (différé d'au moins 2 ans), 25 ans au plus. Format étroit (viewBox 340) pour rester lisible à 375 px. Durées non à l'échelle ;
 * Service-Public F10871 (page vérifiée le 15 septembre 2026, consultée le 13 novembre 2026). */
export function SchemaPtz() {
  const END = 252;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 272" role="img" aria-labelledby="ill-ptz-t ill-ptz-d" className="ill-svg">
        <title id="ill-ptz-t">Comment se rembourse un prêt à taux zéro</title>
        <desc id="ill-ptz-d">Frise dans le temps. Le PTZ s’ajoute toujours à un autre prêt immobilier. Il se rembourse soit en une seule période, soit en deux périodes : d’abord un différé d’au moins 2 ans pendant lequel on ne rembourse pas le PTZ, puis le remboursement. La durée du PTZ ne dépasse pas 25 ans.</desc>
        <text x={0} y={14} className="ill-step">Autre prêt immobilier (au moins un)</text>
        <rect x={1} y={22} width={332} height={32} rx={10} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={167} y={43} textAnchor="middle" className="ill-in">Le PTZ vient toujours en plus de ce prêt</text>
        <text x={0} y={84} className="ill-step">Cas 1 : PTZ en une seule période</text>
        <rect x={1} y={92} width={END - 1} height={32} rx={10} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={END / 2} y={113} textAnchor="middle" className="ill-in">Remboursement sans intérêts</text>
        <text x={0} y={154} className="ill-step">Cas 2 : PTZ avec différé</text>
        <rect x={1} y={162} width={111} height={32} rx={10} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} strokeDasharray="5 4" />
        <text x={56} y={183} textAnchor="middle" className="ill-in">Différé</text>
        <rect x={118} y={162} width={END - 118} height={32} rx={10} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={(END + 118) / 2} y={183} textAnchor="middle" className="ill-in">Remboursement</text>
        <text x={2} y={212} className="ill-sub">Rien à payer,</text>
        <text x={2} y={228} className="ill-sub">2 ans au minimum</text>
        <path d={`M ${END} 88 V 246`} fill="none" stroke="var(--ink-3)" strokeWidth={1.5} strokeDasharray="4 4" />
        <text x={END + 8} y={140} className="ill-sub">Au plus</text>
        <text x={END + 8} y={158} className="ill-year">25 ans</text>
        <path d="M 1 246 H 334 m -7 -5 l 7 5 l -7 5" fill="none" stroke="var(--ink-2)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 1 241 V 251" stroke="var(--ink-2)" strokeWidth={1.5} />
        <text x={0} y={266} className="ill-sub">Début du prêt</text>
        <text x={END} y={266} textAnchor="middle" className="ill-sub">Fin du PTZ</text>
      </svg>
      <figcaption>
        <strong>Illustration, sans montant, durées non à l’échelle</strong> : pendant le différé, vous ne remboursez pas le PTZ. Plus vos revenus sont élevés, plus la durée est courte ; la vôtre dépend de votre situation (voir Service-Public).
      </figcaption>
    </figure>
  );
}

/** Coupe un libellé en lignes d'au plus `max` caractères, aux espaces. */
export function wrapLabel(label: string, max: number): string[] {
  const lines: string[] = [];
  for (const word of label.split(' ')) {
    const last = lines[lines.length - 1];
    if (last !== undefined && (last + ' ' + word).length <= max) lines[lines.length - 1] = last + ' ' + word;
    else lines.push(word);
  }
  return lines;
}

/** Nombre de caractères par ligne dans une case d'étape (largeur de texte ~250 unités, 14,5 unités × 0,52 par caractère). */
export const ESCALIER_MAX_CHARS = 32;

/**
 * Schéma « parcours » du guide « Par où commencer » : les étapes dans l'ordre, reliées par un fil qui descend vers le long terme,
 * en deux temps (bases solides, puis faire fructifier). Chaque case est un lien vers la rubrique du guide : sur mobile,
 * où le sommaire latéral n'est pas affiché, le schéma sert de sommaire. Aucun chiffre ; libellés = titres des rubriques.
 */
export function SchemaEscalier({ steps, targets, title, splitAt = 3 }: { steps: string[]; targets?: string[]; title: string; splitAt?: number }) {
  const CARD_X = 40;
  const CARD_W = 298;
  const LINE = 18;
  const GAP = 6;
  const PHASE = 24;
  let y = 0;
  const phases: { y: number; label: string; color: string }[] = [];
  const rows = steps.map((s, i) => {
    if (i === 0 || i === splitAt) {
      const first = i === 0;
      phases.push({ y: y + 14, label: first ? 'D’abord : des bases solides' : 'Ensuite : faire fructifier', color: first ? 'var(--primary)' : 'var(--accent)' });
      y += PHASE;
    }
    const lines = wrapLabel(s, ESCALIER_MAX_CHARS);
    const h = 22 + lines.length * LINE;
    const row = { s, i, y, h, lines, grow: i >= splitAt };
    y += h + GAP;
    return row;
  });
  const H = y + 14;
  return (
    <figure className="illustration">
      <svg viewBox={`0 0 340 ${H}`} role="group" aria-labelledby="ill-esc-t" className="ill-svg ill-stairs">
        <title id="ill-esc-t">{title}</title>
        <path d={`M 17 ${rows[0].y + rows[0].h / 2} V ${H - 2} m -5 -7 l 5 7 l 5 -7`} fill="none" stroke="var(--ink-3)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {phases.map((p) => (
          <text key={p.label} x={CARD_X} y={p.y} className="ill-phase" style={{ fill: p.color }}>{p.label}</text>
        ))}
        {rows.map(({ s, i, y: ry, h, lines, grow }) => {
          const cy = ry + h / 2;
          const body = (
            <>
              <rect x={CARD_X} y={ry} width={CARD_W} height={h} rx={12} className="ill-step-card" fill={grow ? 'var(--accent-soft)' : 'var(--surface-2)'} stroke={grow ? 'var(--accent)' : 'var(--primary)'} strokeWidth={1.5} />
              <circle cx={17} cy={cy} r={15} fill={grow ? 'var(--accent)' : 'var(--primary)'} />
              <text x={17} y={cy + 5} textAnchor="middle" className="ill-on-dark ill-num">{i + 1}</text>
              {lines.map((l, k) => (
                <text key={l} x={CARD_X + 14} y={cy + 5 + (k - (lines.length - 1) / 2) * LINE} className="ill-step">{l}</text>
              ))}
              {targets && <path d={`M ${CARD_X + CARD_W - 22} ${cy - 3} l 5 5 l 5 -5`} fill="none" stroke="var(--ink-2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />}
            </>
          );
          return targets?.[i]
            ? <a key={s} href={`#${targets[i]}`} aria-label={`Étape ${i + 1} : ${s}`} className="ill-step-link">{body}</a>
            : <g key={s}>{body}</g>;
        })}
      </svg>
      {targets && <figcaption>Du plus urgent au plus long terme : choisissez une étape pour lire son explication.</figcaption>}
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

/** Schéma « Comment une information est contrôlée » : processus du site (qualitatif, aucun chiffre), repris du texte de la page Méthode. */
export function SchemaVerification() {
  const steps = [
    { a: 'Source', b: 'officielle', c: 'consultée', fill: 'var(--surface)', stroke: 'var(--primary)' },
    { a: 'Fiche', b: 'datée', c: 'avec ses sources', fill: 'var(--accent-soft)', stroke: 'var(--accent)' },
    { a: 'Contrôle', b: 'chaque semaine', c: 'automatique', fill: 'var(--warn-soft)', stroke: 'var(--warn)' },
  ];
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 250" role="img" aria-labelledby="ill-ver-t ill-ver-d" className="ill-svg">
        <title id="ill-ver-t">Comment une information est contrôlée</title>
        <desc id="ill-ver-d">Trois étapes : une source officielle est consultée, la fiche en garde la date et les sources, puis des contrôles automatiques passent chaque semaine. Quand un changement est repéré, une personne vérifie et décide : rien n’est modifié automatiquement.</desc>
        {steps.map((st, i) => (
          <g key={st.a}>
            <rect x={i * 145} y={4} width={130} height={86} rx={12} fill={st.fill} stroke={st.stroke} strokeWidth={2} />
            <text x={i * 145 + 65} y={32} textAnchor="middle" className="ill-step">{st.a}</text>
            <text x={i * 145 + 65} y={52} textAnchor="middle" className="ill-step">{st.b}</text>
            <text x={i * 145 + 65} y={76} textAnchor="middle" className="ill-sub">{st.c}</text>
            {i < 2 && <path d={`M ${i * 145 + 132} 47 h 11 m -6 -6 l 6 6 l -6 6`} fill="none" stroke="var(--ink-2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />}
          </g>
        ))}
        <path d="M 355 90 V 120 m -7 -8 l 7 8 l 7 -8" fill="none" stroke="var(--ink-2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <text x={341} y={110} textAnchor="end" className="ill-in">si un changement est repéré</text>
        <rect x={0} y={128} width={420} height={72} rx={14} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={210} y={158} textAnchor="middle" className="ill-step">Une personne vérifie et décide</text>
        <text x={210} y={182} textAnchor="middle" className="ill-sub">Aucune règle n’est modifiée automatiquement</text>
        <text x={210} y={232} textAnchor="middle" className="ill-sub">Information non confirmée : conservée et signalée « à vérifier »</text>
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
        <rect x={0} y={2} width={228} height={58} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={114} y={28} textAnchor="middle" className="ill-step">Les épargnants</text>
        <text x={114} y={48} textAnchor="middle" className="ill-sub">achètent des parts</text>
        <path d="M 114 60 V 108 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <text x={126} y={90} textAnchor="start" className="ill-in">leur argent</text>
        <rect x={0} y={108} width={228} height={64} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={114} y={134} textAnchor="middle" className="ill-step">La SCPI</text>
        <text x={114} y={156} textAnchor="middle" className="ill-sub">gérée par une société de gestion</text>
        <path d="M 114 172 V 220 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <text x={124} y={202} textAnchor="start" className="ill-in">achète et met en location</text>
        <rect x={0} y={220} width={228} height={58} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={114} y={246} textAnchor="middle" className="ill-step">Des immeubles loués</text>
        <text x={114} y={266} textAnchor="middle" className="ill-sub">bureaux, commerces…</text>
        <path d="M 228 249 H 290 V 31 H 236 m 8 -7 l -8 7 l 8 7" {...arrow} />
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
        <rect x={90} y={2} width={240} height={50} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={210} y={24} textAnchor="middle" className="ill-step">Vous versez</text>
        <text x={210} y={43} textAnchor="middle" className="ill-sub">sur un contrat d'assurance-vie</text>
        <path d="M 210 52 V 84 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={60} y={84} width={300} height={46} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={210} y={104} textAnchor="middle" className="ill-step">Vous choisissez la répartition</text>
        <text x={210} y={121} textAnchor="middle" className="ill-sub">entre deux types de supports</text>
        <path d="M 130 130 V 164 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <path d="M 290 130 V 164 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={0} y={164} width={204} height={110} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={102} y={190} textAnchor="middle" className="ill-step">Fonds en euros</text>
        <text x={102} y={214} textAnchor="middle" className="ill-in">Capital garanti</text>
        <text x={102} y={232} textAnchor="middle" className="ill-in">par l'assureur</text>
        <text x={102} y={256} textAnchor="middle" className="ill-sub">rendement plus faible</text>
        <rect x={216} y={164} width={204} height={110} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={318} y={190} textAnchor="middle" className="ill-step">Unités de compte</text>
        <text x={318} y={214} textAnchor="middle" className="ill-in">Valeur variable selon</text>
        <text x={318} y={232} textAnchor="middle" className="ill-in">les marchés : perte possible</text>
        <text x={318} y={256} textAnchor="middle" className="ill-sub">peut rapporter davantage</text>
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
        <text x={296} y={118} textAnchor="start" className="ill-in">les loyers</text>
        <text x={296} y={136} textAnchor="start" className="ill-in">financent les</text>
        <text x={296} y={154} textAnchor="start" className="ill-in">dividendes versés</text>
        <text x={296} y={172} textAnchor="start" className="ill-in">aux actionnaires</text>
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

/**
 * Schéma « PER : ce que la déduction rapporte vraiment » (exemple fictif de la fiche, montants recalculés par `perDeductionBalance`).
 * Règles : Service-Public F34982 (vérifiée le 12 octobre 2026, consultée le 2026-11-13) ; tranches de 11 % et 30 % du barème 2026 :
 * Service-Public F1419 (consultée le 2026-11-13). Les longueurs des barres sont proportionnelles aux montants.
 */
export function SchemaPerBilan({ children }: { children: ReactNode }) {
  const { amount, entryRatePct, exitRatesPct } = PER_EXAMPLE;
  const rows = exitRatesPct.map((exit) => ({ exit, ...perDeductionBalance(amount, entryRatePct, exit) }));
  const max = Math.max(...rows.flatMap((r) => [r.saved, r.paidLater]));
  const len = (v: number) => (v / max) * 150;
  const alt = rows
    .map((r) => `Si, à la retraite, ces ${fmtEur(amount)} sont imposés dans la tranche à ${r.exit} % : ${fmtEur(r.saved)} d’impôt évité à l’entrée, ${fmtEur(r.paidLater)} payés à la sortie, ${r.net > 0 ? `soit ${fmtEur(r.net)} gagnés` : 'l’impôt est seulement reporté'}.`)
    .join(' ');
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 236" role="img" aria-labelledby="ill-perb-t ill-perb-d" className="ill-svg">
        <title id="ill-perb-t">PER : l’impôt évité au versement est en partie repayé à la sortie</title>
        <desc id="ill-perb-d">{`Exemple fictif : ${fmtEur(amount)} versés et déduits dans la tranche à ${entryRatePct} %, puis retirés en capital à la retraite. ${alt}`}</desc>
        {rows.map((r, i) => {
          const y = 4 + i * 120;
          return (
            <g key={r.exit}>
              {i > 0 && <line x1={0} x2={340} y1={y - 10} y2={y - 10} stroke="var(--line)" strokeWidth={1} />}
              <text x={0} y={y + 14} className="ill-year" textAnchor="start">{`Retraite dans la tranche à ${r.exit}\u00a0%`}</text>
              <rect x={0} y={y + 24} width={len(r.saved)} height={22} rx={4} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
              <text x={len(r.saved) + 8} y={y + 40} className="ill-in" textAnchor="start">{`${fmtEur(r.saved)} évités à l’entrée`}</text>
              <rect x={0} y={y + 54} width={len(r.paidLater)} height={22} rx={4} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
              <text x={len(r.paidLater) + 8} y={y + 70} className="ill-in" textAnchor="start">{`${fmtEur(r.paidLater)} payés à la sortie`}</text>
              <text x={0} y={y + 98} className="ill-total" textAnchor="start" style={{ fill: r.net > 0 ? 'var(--accent)' : 'var(--ink-2)' }}>
                {r.net > 0 ? `Bilan : ${fmtEur(r.net)} gagnés` : 'Bilan : 0\u00a0€, l’impôt est seulement reporté'}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption>{children}</figcaption>
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

/** Schéma « Location nue : micro-foncier ou régime réel » : repris de Service-Public.fr (fiche F1991 « Revenus locatifs (location non meublée) », vérifiée le 15 avril 2026, consultée le 2026-11-07) : micro-foncier jusqu’à 15 000 € de revenus fonciers, abattement forfaitaire de 30 %, travaux et charges non déductibles ; régime réel au-delà de 15 000 €, option possible en dessous (irrévocable pendant 3 ans), recettes diminuées des frais et charges réels et justifiés. */
export function SchemaLocationNue() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 320" role="img" aria-labelledby="ill-ln-t ill-ln-d" className="ill-svg">
        <title id="ill-ln-t">Location nue : micro-foncier ou régime réel</title>
        <desc id="ill-ln-d">On part des loyers encaissés. Jusqu’à 15 000 euros de revenus fonciers bruts par an, le micro-foncier s’applique : un abattement forfaitaire de 30 pour cent est retiré et les travaux et charges ne sont pas déductibles. Au-delà de 15 000 euros, le régime réel s’applique, et on peut aussi le choisir en dessous, pour trois ans minimum : on retire les frais et charges réels et justifiés. Ce qui reste est le revenu foncier imposable.</desc>
        <rect x={0} y={2} width={420} height={50} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={210} y={33} textAnchor="middle" className="ill-step">Loyers encaissés dans l’année</text>
        <path d="M 105 52 V 80 m -7 -8 l 7 8 l 7 -8 M 315 52 V 80 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={0} y={80} width={204} height={150} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={102} y={106} textAnchor="middle" className="ill-step">Micro-foncier</text>
        <text x={102} y={124} textAnchor="middle" className="ill-sub">jusqu’à 15 000 € par an</text>
        <text x={102} y={152} textAnchor="middle" className="ill-in">On retire un</text>
        <text x={102} y={170} textAnchor="middle" className="ill-in">abattement de 30 %</text>
        <text x={102} y={198} textAnchor="middle" className="ill-sub">Travaux et charges</text>
        <text x={102} y={214} textAnchor="middle" className="ill-sub">non déductibles en plus</text>
        <rect x={216} y={80} width={204} height={150} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={318} y={106} textAnchor="middle" className="ill-step">Régime réel</text>
        <text x={318} y={124} textAnchor="middle" className="ill-sub">au-delà de 15 000 € par an</text>
        <text x={318} y={152} textAnchor="middle" className="ill-in">On retire les frais</text>
        <text x={318} y={170} textAnchor="middle" className="ill-in">et charges réels</text>
        <text x={318} y={198} textAnchor="middle" className="ill-sub">À justifier ; choix possible</text>
        <text x={318} y={214} textAnchor="middle" className="ill-sub">en dessous, pour 3 ans</text>
        <path d="M 210 230 V 248 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={0} y={250} width={420} height={36} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={210} y={274} textAnchor="middle" className="ill-step">= revenu foncier imposable</text>
        <text x={210} y={312} textAnchor="middle" className="ill-sub">Schéma de principe d’après Service-Public.fr</text>
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
      <svg viewBox="0 0 420 280" role="img" aria-labelledby="ill-pea-t ill-pea-d" className="ill-svg">
        <title id="ill-pea-t">PEA : ce qui change avant et après 5 ans</title>
        <desc id="ill-pea-d">Avant 5 ans, un retrait entraîne en principe la clôture du plan, sauf exceptions prévues par la loi. Après 5 ans, un retrait partiel ne clôture pas le plan et les versements restent possibles (un retrait total le clôt) ; les gains sont exonérés d’impôt sur le revenu, mais les prélèvements sociaux restent dus.</desc>
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
        <text x={317} y={128} textAnchor="middle" className="ill-step">Retrait partiel possible</text>
        <text x={317} y={148} textAnchor="middle" className="ill-step">sans clôturer le plan</text>
        <text x={317} y={172} textAnchor="middle" className="ill-sub">gains exonérés d’impôt</text>
        <text x={317} y={188} textAnchor="middle" className="ill-sub">sur le revenu ;</text>
        <text x={317} y={204} textAnchor="middle" className="ill-sub">prélèvements sociaux dus</text>
        <text x={210} y={244} textAnchor="middle" className="ill-sub">Un retrait total clôture toujours le plan</text>
        <text x={210} y={264} textAnchor="middle" className="ill-sub">Ouvrir tôt fait courir le délai de 5 ans</text>
      </svg>
    </figure>
  );
}

/** Schéma « Livret A : le jour de l’opération décide » : un mois coupé au 15, ce que devient un dépôt ou un retrait de chaque côté. Seuls chiffres : 1er, 15, 16 ; reprend le texte du guide (Service-Public.fr). */
export function SchemaQuinzaines() {
  const cols = [
    { x: 0, c: 'var(--accent)', soft: 'var(--accent-soft)', jour: 'Du 1er au 15 du mois', dep: ['Dépôt : il rapporte', 'dès le 16 du même mois'], ret: ['Retrait : calcul sur', 'le solde du dernier jour', 'du mois précédent'] },
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
            {k.ret.map((ligne, i) => (
              <text key={ligne} x={k.x + 103} y={(k.ret.length === 3 ? 173 : 182) + i * 18} textAnchor="middle" className="ill-sub">{ligne}</text>
            ))}
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
  const pctFr = (v: number) => `${(Math.round(v * 1000) / 10).toLocaleString('fr-FR', { minimumFractionDigits: 1 })} %`;
  const max = steps[0].value;
  const X0 = 14;
  const BW = 300;
  const alt = steps.map((s) => `${s.label} : ${pctFr(s.value)}`).join(' ; ');
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 316" role="img" aria-labelledby="ill-rend-t ill-rend-d" className="ill-svg">
        <title id="ill-rend-t">Le rendement locatif baisse à mesure qu’on compte les vrais coûts</title>
        <desc id="ill-rend-d">{`Exemple fictif d’un bien à ${fmtEur(RENDEMENT_EXAMPLE.price)} loué ${fmtEur(RENDEMENT_EXAMPLE.monthlyRent)} par mois. ${alt}.`}</desc>
        {steps.map((s, i) => {
          const y = 4 + i * 80;
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
  const pctFr = (v: number) => `${(Math.round(v * 1000) / 10).toLocaleString('fr-FR')} %`;
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
        <strong>Illustration, exemple fictif</strong> : avec {fmtEur(p.lump)} à placer, rembourser l’emporte d’environ {fmtEur(p.gap)}. Si le placement rapportait plus que le rendement d’équilibre (ici environ {p.breakEvenReturn === null ? '—' : pctFr(p.breakEvenReturn)} brut par an), investir gagnerait. Barres proportionnelles aux montants.
      </figcaption>
    </figure>
  );
}

/** Schéma « immobilier ou ETF » : même effort d'épargne, deux chemins, comparaison du patrimoine à la même date. Aucun chiffre ; reprend la méthode décrite dans le guide. */
export function SchemaImmoEtf() {
  const cols = [
    { x: 0, title: 'Scénario 1 : l’immobilier', fill: 'var(--accent-soft)', stroke: 'var(--accent)', lines: ['Apport + crédit : un bien', 'Les loyers paient une partie', 'Vous complétez la mensualité'], end: 'valeur du bien − dette restante' },
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
        <strong>Illustration, exemple fictif</strong> : versement mensuel pour atteindre 20 000 € en 3, 5 ou 10 ans, sans intérêts puis à 1,7 % par an, avant impôt. Barres proportionnelles aux montants.
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
        <strong>Illustration, exemple fictif</strong> : {years} ans à {(annualReturn * 100).toLocaleString('fr-FR')} % par an supposé, avant impôt, versements en début de mois. Les hausses interviennent après 5 ans (100 €) puis 10 ans (150 €). Barres proportionnelles aux montants.
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
  const pct = (v: number) => `${(v * 100).toLocaleString('fr-FR')} %`;
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

export { HeaderArt, HomeArt, type HeaderArtName } from './HeaderArt';
export { SituationIcon, FamilyIcon, SimThemeIcon, GuideGroupIcon, type SituationIconName } from './Icons';

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
        <strong>Illustration, exemple fictif</strong> : capital à réunir pour couvrir 30 000 € de dépenses par an, à trois taux de retrait supposés. Barres proportionnelles aux montants ; aucune garantie de rendement.
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
        <strong>Illustration, exemple fictif</strong> : réserve correspondant aux trois repères courants pour 2 000 € de dépenses par mois. Barres proportionnelles aux montants. Ce sont des repères pédagogiques, pas une règle officielle.
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
          : 'Seuls les crédits (en cours et nouveau) sont comparés au repère de 35 %.'}
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

/** Montants de l'exemple fictif de la fiche Donation (Service-Public F14203 et F36656, consultés le 2026-11-06) : abattement parent → enfant 100 000 €, don familial d'argent 31 865 €. */
export const DONATION_ABATTEMENT = 100_000;
export const DONATION_DON_ARGENT = 31_865;
export const DONATION_PAR_PARENT = DONATION_ABATTEMENT + DONATION_DON_ARGENT;
export const DONATION_TOTAL_DEUX_PARENTS = 2 * DONATION_PAR_PARENT;

/** Schéma « Donation : deux parents, un enfant » : reprend l'exemple fictif de la fiche (2 × (100 000 € + 31 865 €) = 263 730 € sans droits), recalculé par test. */
export function SchemaDonation() {
  const parent = (y: number, n: number) => (
    <g key={n}>
      <rect x={14} y={y} width={176} height={90} rx={10} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
      <text x={102} y={y + 22} textAnchor="middle" className="ill-step">Parent {n}</text>
      <text x={102} y={y + 44} textAnchor="middle" className="ill-sub">{fmtEur(DONATION_ABATTEMENT)} d’abattement</text>
      <text x={102} y={y + 62} textAnchor="middle" className="ill-sub">+ {fmtEur(DONATION_DON_ARGENT)} don d’argent</text>
      <text x={102} y={y + 81} textAnchor="middle" className="ill-step">= {fmtEur(DONATION_PAR_PARENT)}</text>
      <path d={`M 190 ${y + 45} H 232 V 117 H 246`} fill="none" stroke="var(--primary)" strokeWidth={2} strokeLinejoin="round" />
    </g>
  );
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 262" role="img" aria-labelledby="ill-don-t ill-don-d" className="ill-svg">
        <title id="ill-don-t">{`Donation : deux parents peuvent donner ${fmtEur(DONATION_TOTAL_DEUX_PARENTS)} à un enfant sans droits`}</title>
        <desc id="ill-don-d">{`Exemple fictif : chaque parent de moins de 80 ans peut donner à son enfant majeur ${fmtEur(DONATION_ABATTEMENT)} (abattement) plus ${fmtEur(DONATION_DON_ARGENT)} (don familial d’argent), soit ${fmtEur(DONATION_PAR_PARENT)}. Pour deux parents, l’enfant reçoit ${fmtEur(DONATION_TOTAL_DEUX_PARENTS)} sans droits. Les abattements se renouvellent tous les 15 ans.`}</desc>
        {parent(10, 1)}
        {parent(112, 2)}
        <rect x={246} y={80} width={160} height={74} rx={10} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={326} y={104} textAnchor="middle" className="ill-step">Enfant majeur</text>
        <text x={326} y={126} textAnchor="middle" className="ill-step">{fmtEur(DONATION_TOTAL_DEUX_PARENTS)}</text>
        <text x={326} y={144} textAnchor="middle" className="ill-sub">sans droits</text>
        <text x={210} y={230} textAnchor="middle" className="ill-sub">Les abattements se renouvellent tous les 15 ans.</text>
        <text x={210} y={250} textAnchor="middle" className="ill-sub">Parents de moins de 80 ans, enfant majeur.</text>
      </svg>
      <figcaption>
        <strong>Illustration, exemple fictif</strong> : montants en vigueur à la date de vérification de la fiche.
      </figcaption>
    </figure>
  );
}

/** Exemple fictif de la fiche Or : prix de cession et taxe forfaitaire (11 % + 0,5 % de CRDS). */
export const OR_EXAMPLE_PRICE = 2000;
export function orTaxe(prix: number): number {
  return Math.round(prix * 0.115 * 100) / 100;
}

export function SchemaOr() {
  const taxe = orTaxe(OR_EXAMPLE_PRICE);
  const reste = OR_EXAMPLE_PRICE - taxe;
  const X0 = 14;
  const W = 392;
  const wTaxe = (taxe / OR_EXAMPLE_PRICE) * W;
  const cas = [
    { y: 34, titre: 'Cas A : pièce payée 1 900 €, gain de 100 €' },
    { y: 126, titre: 'Cas B : pièce payée 1 000 €, gain de 1 000 €' },
  ];
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 228" role="img" aria-labelledby="ill-or-t ill-or-d" className="ill-svg">
        <title id="ill-or-t">{`Or physique : la taxe forfaitaire est de ${fmtEur(taxe)} sur une vente à ${fmtEur(OR_EXAMPLE_PRICE)}, quel que soit le gain`}</title>
        <desc id="ill-or-d">{`Exemple fictif : une pièce d’or revendue ${fmtEur(OR_EXAMPLE_PRICE)} sous le régime forfaitaire. La taxe est de 11 % du prix de vente plus 0,5 % de CRDS, soit ${fmtEur(taxe)}, que le gain soit de 100 € ou de 1 000 €. Il reste ${fmtEur(reste)} au vendeur.`}</desc>
        {cas.map((c) => (
          <g key={c.y}>
            <text x={X0} y={c.y - 8} className="ill-step">{c.titre}</text>
            <rect x={X0} y={c.y} width={W} height={36} fill="var(--accent)" />
            <rect x={X0} y={c.y} width={wTaxe} height={36} fill="var(--warn)" />
            <rect x={X0} y={c.y} width={W} height={36} rx={8} fill="none" stroke="var(--ink-2)" strokeWidth={1.5} />
            <text x={X0 + wTaxe + (W - wTaxe) / 2} y={c.y + 23} textAnchor="middle" className="ill-on-dark ill-total">{fmtEur(reste)} pour vous</text>
            <text x={X0} y={c.y + 54} className="ill-sub">Taxe : {fmtEur(taxe)} (à gauche, en orange)</text>
          </g>
        ))}
        <text x={210} y={204} textAnchor="middle" className="ill-sub">Même taxe dans les deux cas :</text>
        <text x={210} y={222} textAnchor="middle" className="ill-sub">11,5 % du prix de vente de {fmtEur(OR_EXAMPLE_PRICE)}</text>
      </svg>
      <figcaption>
        <strong>Illustration, exemple fictif</strong> : régime forfaitaire (11 % + 0,5 % de CRDS) calculé sur le prix de vente, pas sur le gain. Barres proportionnelles aux montants.
      </figcaption>
    </figure>
  );
}

/** Étapes de la vie d'un PEL (Service-Public F16140, consulté le 2026-11-06) : bornes en années depuis l'ouverture. */
export const PEL_PHASES = [
  { from: 0, to: 4, label: 'Durée minimale', detail: 'versements d’au moins 540 € par an' },
  { from: 4, to: 10, label: 'Prolongation possible', detail: 'année par année, jusqu’à 10 ans' },
  { from: 10, to: 15, label: 'Sans versement', detail: 'intérêts au taux du contrat' },
] as const;
export const PEL_LIVRET_AGE = 15;

/** Frise « vie d'un PEL » : durées proportionnelles aux années, règles seulement (aucun montant fictif). */
export function SchemaPel() {
  const X0 = 14;
  const W = 392;
  const x = (y: number) => X0 + (y / PEL_LIVRET_AGE) * W;
  const fills = ['var(--primary)', 'var(--accent)', 'var(--warn)'];
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 258" role="img" aria-labelledby="ill-pel-t ill-pel-d" className="ill-svg">
        <title id="ill-pel-t">Vie d’un PEL : taux figé à l’ouverture, 4 ans minimum, 10 ans maximum de versements, livret ordinaire à 15 ans</title>
        <desc id="ill-pel-d">Le taux est fixé à l’ouverture du plan et ne change pas. De 0 à 4 ans : durée minimale, avec au moins 540 € versés par an. De 4 à 10 ans : le plan peut être prolongé d’année en année. De 10 à 15 ans : plus de versements, mais les intérêts continuent au taux du contrat. À 15 ans, le PEL devient un livret ordinaire au taux fixé par la banque.</desc>
        <text x={X0} y={18} className="ill-step">Taux fixé à l’ouverture (2,00 % en 2026),</text>
        <text x={X0} y={36} className="ill-step">le même pendant tout le plan</text>
        <line x1={X0} x2={X0 + W} y1={42} y2={42} stroke="var(--ink-2)" strokeWidth={1.5} strokeDasharray="5 4" />
        {PEL_PHASES.map((p, i) => (
          <g key={p.label}>
            <rect x={x(p.from)} y={52} width={x(p.to) - x(p.from)} height={40} fill={fills[i]} />
            <text x={(x(p.from) + x(p.to)) / 2} y={77} textAnchor="middle" className="ill-on-dark ill-total">{i === 0 ? '4 ans' : i === 1 ? '6 ans' : '5 ans'}</text>
          </g>
        ))}
        <rect x={X0} y={52} width={W} height={40} rx={8} fill="none" stroke="var(--ink-2)" strokeWidth={1.5} />
        {[0, 4, 10, 15].map((y) => (
          <g key={y}>
            <line x1={x(y)} x2={x(y)} y1={92} y2={102} stroke="var(--ink-2)" strokeWidth={1.5} />
            <text x={x(y)} y={118} textAnchor={y === 0 ? 'start' : y === PEL_LIVRET_AGE ? 'end' : 'middle'} className="ill-sub">{y === 0 ? 'Ouverture' : `${y} ans`}</text>
          </g>
        ))}
        {PEL_PHASES.map((p, i) => (
          <g key={p.label}>
            <rect x={X0} y={136 + i * 32} width={14} height={14} rx={3} fill={fills[i]} />
            <text x={X0 + 22} y={148 + i * 32} className="ill-sub" textAnchor="start"><tspan fontWeight="700">{p.label}</tspan> : {p.detail}</text>
          </g>
        ))}
        <text x={X0} y={236} className="ill-sub" textAnchor="start">À 15 ans : le PEL devient un livret ordinaire,</text>
        <text x={X0} y={252} className="ill-sub" textAnchor="start">au taux fixé par la banque.</text>
      </svg>
      <figcaption>
        <strong>Illustration</strong> : règles des PEL ouverts à partir de 2018, durées proportionnelles. Retirer de l’argent avant l’échéance entraîne la clôture du plan.
      </figcaption>
    </figure>
  );
}

/** Fiche LEP : la condition de revenus à l'ouverture et pour garder le livret (Service-Public F2367). Aucun chiffre : les plafonds sont dans la fiche. */
export function SchemaLep() {
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 300" role="img" aria-labelledby="ill-lep-t ill-lep-d" className="ill-svg">
        <title id="ill-lep-t">LEP : le revenu fiscal de référence décide de l’ouverture, et deux années de suite au-dessus du plafond entraînent la clôture</title>
        <desc id="ill-lep-d">Pour ouvrir un LEP, la banque regarde le revenu fiscal de référence de l’avis d’imposition. En dessous du plafond (ou égal), le livret peut être ouvert ; au-dessus, il ne peut pas l’être. Une fois le livret ouvert, un dépassement du plafond une seule année n’oblige pas à le fermer, tant que l’année suivante repasse sous le plafond. Deux années consécutives au-dessus du plafond entraînent la clôture obligatoire.</desc>
        <text x={8} y={20} className="ill-step" fontWeight="700">1. Pour ouvrir le livret</text>
        <rect x={110} y={30} width={200} height={44} rx={10} fill="none" stroke="var(--ink-2)" strokeWidth={1.5} />
        <text x={210} y={49} textAnchor="middle" className="ill-sub">Revenu fiscal de référence</text>
        <text x={210} y={65} textAnchor="middle" className="ill-sub">(avis d’imposition)</text>
        <path d="M160 74 L107 100 M260 74 L313 100" stroke="var(--ink-2)" strokeWidth={1.5} fill="none" />
        <rect x={8} y={100} width={198} height={50} rx={10} fill="var(--accent)" />
        <text x={107} y={121} textAnchor="middle" className="ill-on-dark ill-total">≤ plafond</text>
        <text x={107} y={140} textAnchor="middle" className="ill-on-dark" fontSize={13}>LEP possible</text>
        <rect x={214} y={100} width={198} height={50} rx={10} fill="var(--warn)" />
        <text x={313} y={121} textAnchor="middle" className="ill-on-dark ill-total">&gt; plafond</text>
        <text x={313} y={140} textAnchor="middle" className="ill-on-dark" fontSize={13}>pas d’ouverture</text>
        <text x={8} y={186} className="ill-step" fontWeight="700">2. Une fois le livret ouvert</text>
        <rect x={8} y={198} width={198} height={46} rx={10} fill="var(--primary)" />
        <text x={107} y={217} textAnchor="middle" className="ill-on-dark ill-total">1 année au-dessus</text>
        <text x={107} y={235} textAnchor="middle" className="ill-on-dark" fontSize={13}>conservé si retour en dessous</text>
        <rect x={214} y={198} width={198} height={46} rx={10} fill="var(--warn)" />
        <text x={313} y={217} textAnchor="middle" className="ill-on-dark ill-total">2 années de suite</text>
        <text x={313} y={235} textAnchor="middle" className="ill-on-dark" fontSize={13}>clôture obligatoire</text>
        <text x={8} y={272} className="ill-sub" textAnchor="start">Un seul LEP par personne : chaque époux ou</text>
        <text x={8} y={288} className="ill-sub" textAnchor="start">partenaire de Pacs peut avoir le sien.</text>
      </svg>
      <figcaption>
        <strong>Illustration</strong> : le plafond dépend du nombre de parts et du lieu de résidence ; il est révisé chaque année (valeurs 2026 dans la fiche). La banque vérifie sur l’année N-2 ou N-1.
      </figcaption>
    </figure>
  );
}

/** Fiche Unités de compte : exemple fictif. Chiffres calculés ici et recalculés par test. */
export const UC_NOMBRE = 100;
export const UC_PRIX_ACHAT = 10;
export function ucValeur(nombre: number, prixUnite: number): number {
  return Math.round(nombre * prixUnite * 100) / 100;
}

/** Fiche Unités de compte : le nombre d'unités est garanti, pas leur valeur (Service-Public F15274). */
export function SchemaUniteDeCompte() {
  const cas = [
    { prix: 8, label: 'Les marchés baissent', fill: 'var(--warn)' },
    { prix: 10, label: 'Valeur inchangée', fill: 'var(--primary)' },
    { prix: 12, label: 'Les marchés montent', fill: 'var(--accent)' },
  ];
  const X0 = 14;
  const W = 392;
  const max = ucValeur(UC_NOMBRE, 12);
  const base = ucValeur(UC_NOMBRE, UC_PRIX_ACHAT);
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 262" role="img" aria-labelledby="ill-uc-t ill-uc-d" className="ill-svg">
        <title id="ill-uc-t">Unités de compte : le nombre d’unités reste le même, c’est leur valeur qui varie</title>
        <desc id="ill-uc-d">{`Exemple fictif : vous achetez ${UC_NOMBRE} unités de compte à ${fmtEur(UC_PRIX_ACHAT)} l’unité, soit ${fmtEur(base)}. Vous gardez ${UC_NOMBRE} unités quoi qu’il arrive. Si l’unité vaut ${fmtEur(8)}, votre épargne vaut ${fmtEur(ucValeur(UC_NOMBRE, 8))} ; si elle vaut ${fmtEur(10)}, ${fmtEur(base)} ; si elle vaut ${fmtEur(12)}, ${fmtEur(ucValeur(UC_NOMBRE, 12))}. L’assureur garantit le nombre d’unités, pas leur valeur.`}</desc>
        <text x={X0} y={18} className="ill-step" fontWeight="700">{`Vous achetez ${UC_NOMBRE} unités à ${fmtEur(UC_PRIX_ACHAT)} = ${fmtEur(base)}`}</text>
        <text x={X0} y={36} className="ill-sub">Plus tard, vous avez toujours {UC_NOMBRE} unités. Leur valeur, non :</text>
        {cas.map((c, i) => {
          const y = 52 + i * 52;
          const w = (ucValeur(UC_NOMBRE, c.prix) / max) * W;
          return (
            <g key={c.prix}>
              <text x={X0} y={y + 10} className="ill-sub">{`${c.label} : l’unité vaut ${fmtEur(c.prix)}`}</text>
              <rect x={X0} y={y + 16} width={w} height={26} rx={7} fill={c.fill} />
              <text x={X0 + 10} y={y + 34} className="ill-on-dark ill-total" fontSize={13}>{`${UC_NOMBRE} unités = ${fmtEur(ucValeur(UC_NOMBRE, c.prix))}`}</text>
            </g>
          );
        })}
        <rect x={14} y={212} width={392} height={40} rx={10} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={1.5} />
        <text x={210} y={229} textAnchor="middle" className="ill-sub">L’assureur garantit le nombre d’unités,</text>
        <text x={210} y={245} textAnchor="middle" className="ill-sub">pas leur valeur : perte possible en capital.</text>
      </svg>
      <figcaption>
        <strong>Illustration, exemple fictif</strong> : les valeurs de l’unité sont inventées pour montrer le principe, ce n’est pas une prévision. Barres proportionnelles aux montants.
      </figcaption>
    </figure>
  );
}

/** Fiche Fonds en euros : principe qualitatif (aucun chiffre), repris de Service-Public F15274 (consulté le 2026-11-07) : sommes valorisées en euros, placées par l’assureur sur des actifs peu risqués, valeur des fonds investis garantie par l’assureur, garantie en capital en contrepartie d’un faible rendement, intérêts annuels ajoutés au capital. */
export function SchemaFondsEuros() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 300" role="img" aria-labelledby="ill-fe-t ill-fe-d" className="ill-svg">
        <title id="ill-fe-t">Fonds en euros : capital garanti par l’assureur, intérêts ajoutés chaque année</title>
        <desc id="ill-fe-d">Vous versez de l’argent sur un contrat d’assurance-vie en fonds en euros. L’assureur le place sur des actifs peu risqués et garantit la valeur des fonds investis. Chaque année, il verse des intérêts qui s’ajoutent au capital et produisent à leur tour des intérêts. La contrepartie de cette garantie en capital est un faible rendement.</desc>
        <rect x={0} y={2} width={420} height={50} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={210} y={33} textAnchor="middle" className="ill-step">Vous versez sur un contrat d’assurance-vie</text>
        <path d="M 210 52 V 78 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={0} y={80} width={420} height={104} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={210} y={106} textAnchor="middle" className="ill-step">L’assureur place votre argent</text>
        <text x={210} y={134} textAnchor="middle" className="ill-in">Sur des actifs peu risqués</text>
        <text x={210} y={160} textAnchor="middle" className="ill-sub">La valeur des fonds investis est garantie</text>
        <text x={210} y={176} textAnchor="middle" className="ill-sub">par l’assureur : c’est la garantie en capital</text>
        <path d="M 210 184 V 206 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={0} y={208} width={420} height={50} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={210} y={229} textAnchor="middle" className="ill-step">Chaque année : des intérêts s’ajoutent au capital</text>
        <text x={210} y={247} textAnchor="middle" className="ill-sub">contrepartie de la garantie : un faible rendement</text>
        <text x={210} y={290} textAnchor="middle" className="ill-sub">Schéma de principe d’après Service-Public</text>
      </svg>
    </figure>
  );
}

/** Fiche Compte à terme : principe qualitatif (aucun chiffre), repris de La finance pour tous, « Comptes à terme » (mise à jour le 2 mars 2026, consultée le 2026-11-07) : prêt à la banque pour une durée choisie, taux ou formule connu au départ, trois formes (fixe, progressif, révisable), pénalité sur les intérêts en cas de retrait anticipé. */
export function SchemaCompteATerme() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const rows = [
    { y: 100, t: 'Taux fixe', a: 'Somme versée en une fois', b: 'Capital et intérêts rendus à l’échéance' },
    { y: 166, t: 'Taux progressif', a: 'Somme versée en une fois', b: 'Taux plus haut si l’argent reste longtemps' },
    { y: 232, t: 'Taux révisable', a: 'Taux lié à un indice de référence', b: 'Renouvelé à chaque période' },
  ];
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 354" role="img" aria-labelledby="ill-cat-t ill-cat-d" className="ill-svg">
        <title id="ill-cat-t">Compte à terme : un prêt à la banque pour une durée choisie</title>
        <desc id="ill-cat-d">Vous prêtez une somme à la banque pour une durée choisie avec elle. Le taux ou la formule de calcul est connu dès le départ. Il existe trois formes : à taux fixe, à taux progressif par paliers, ou à taux révisable indexé sur un indice. Retirer l’argent avant l’échéance entraîne une pénalité sur les intérêts.</desc>
        <rect x={0} y={2} width={420} height={56} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={210} y={27} textAnchor="middle" className="ill-step">Vous prêtez à la banque pour une durée choisie</text>
        <text x={210} y={46} textAnchor="middle" className="ill-sub">Le taux, ou sa formule, est connu dès le départ</text>
        <path d="M 210 58 V 80 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        {rows.map((r) => (
          <g key={r.t}>
            <rect x={0} y={r.y - 18} width={420} height={60} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
            <text x={14} y={r.y} className="ill-step">{r.t}</text>
            <text x={14} y={r.y + 15} className="ill-sub">{r.a}</text>
            <text x={14} y={r.y + 29} className="ill-sub">{r.b}</text>
          </g>
        ))}
        <path d="M 210 292 V 306 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={0} y={310} width={420} height={40} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={210} y={335} textAnchor="middle" className="ill-step">Retrait avant l’échéance : pénalité sur les intérêts</text>
      </svg>
    </figure>
  );
}

/** Fiche Assurance-vie : transmission au décès, repris de impots.gouv.fr (« Je suis bénéficiaire d’une assurance-vie, comment la déclarer ? », consulté le 2026-11-08), contrats souscrits depuis le 13 octobre 1998 : primes versées avant 70 ans, 152 500 € exonérés par bénéficiaire puis 20 % jusqu’à 700 000 € et 31,25 % au-delà ; primes versées après 70 ans, droits de succession après un abattement global de 30 500 €. */
export function SchemaAssuranceVieDeces() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 300" role="img" aria-labelledby="ill-avd-t ill-avd-d" className="ill-svg">
        <title id="ill-avd-t">Assurance-vie : ce qui se passe au décès de l’assuré</title>
        <desc id="ill-avd-d">Au décès de l’assuré, l’assureur verse le capital aux bénéficiaires désignés dans le contrat. Le traitement dépend de l’âge de l’assuré au moment du versement des primes. Primes versées avant 70 ans : 152 500 euros sont exonérés par bénéficiaire, puis 20 pour cent jusqu’à 700 000 euros et 31,25 pour cent au-delà. Primes versées après 70 ans : droits de succession, après un abattement global de 30 500 euros. Règles pour les contrats souscrits depuis le 13 octobre 1998.</desc>
        <rect x={20} y={2} width={380} height={56} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={210} y={27} textAnchor="middle" className="ill-step">Décès de l’assuré</text>
        <text x={210} y={46} textAnchor="middle" className="ill-sub">L’assureur verse le capital aux bénéficiaires désignés</text>
        <path d="M 110 58 V 82 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <path d="M 310 58 V 82 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={0} y={82} width={204} height={170} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={102} y={106} textAnchor="middle" className="ill-step">Primes versées</text>
        <text x={102} y={124} textAnchor="middle" className="ill-step">avant 70 ans</text>
        <text x={102} y={152} textAnchor="middle" className="ill-sub">Par bénéficiaire :</text>
        <text x={102} y={174} textAnchor="middle" className="ill-in">152 500 € sans impôt</text>
        <text x={102} y={196} textAnchor="middle" className="ill-in">puis 20 % jusqu’à 700 000 €</text>
        <text x={102} y={218} textAnchor="middle" className="ill-in">puis 31,25 % au-delà</text>
        <rect x={216} y={82} width={204} height={170} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={318} y={106} textAnchor="middle" className="ill-step">Primes versées</text>
        <text x={318} y={124} textAnchor="middle" className="ill-step">après 70 ans</text>
        <text x={318} y={152} textAnchor="middle" className="ill-sub">Droits de succession</text>
        <text x={318} y={174} textAnchor="middle" className="ill-in">après un abattement</text>
        <text x={318} y={196} textAnchor="middle" className="ill-in">de 30 500 €, global</text>
        <text x={318} y={218} textAnchor="middle" className="ill-in">pour tous les contrats</text>
        <text x={210} y={282} textAnchor="middle" className="ill-sub">Contrats souscrits depuis le 13 octobre 1998</text>
      </svg>
    </figure>
  );
}

/** Schéma « Forêt : parts de groupement forestier » : principe qualitatif. Seuls chiffres : 25 % et huit ans, confirmés sur le BOFiP (BOI-IR-RICI-60-20-20, consulté le 2026-11-08). */
export function SchemaForet() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 330" role="img" aria-labelledby="ill-foret-t ill-foret-d" className="ill-svg">
        <title id="ill-foret-t">Comment fonctionne un groupement forestier</title>
        <desc id="ill-foret-d">L’épargnant achète des parts du groupement forestier avec de l’argent. Le groupement possède des forêts et les gère selon un plan simple de gestion agréé. En échange, l’État accorde un crédit d’impôt de 25 % des sommes retenues, à condition de garder les parts jusqu’au 31 décembre de la huitième année suivant l’achat.</desc>
        <rect x={0} y={2} width={220} height={58} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={110} y={28} textAnchor="middle" className="ill-step">L’épargnant</text>
        <text x={110} y={48} textAnchor="middle" className="ill-sub">achète des parts, en argent</text>
        <path d="M 110 60 V 108 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <text x={126} y={90} textAnchor="start" className="ill-in">son argent</text>
        <rect x={0} y={108} width={220} height={64} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={110} y={134} textAnchor="middle" className="ill-step">Le groupement forestier</text>
        <text x={110} y={156} textAnchor="middle" className="ill-sub">plan simple de gestion agréé</text>
        <path d="M 110 172 V 220 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <text x={126} y={202} textAnchor="start" className="ill-in">possède et gère</text>
        <rect x={0} y={220} width={220} height={58} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={110} y={246} textAnchor="middle" className="ill-step">Des forêts</text>
        <text x={110} y={266} textAnchor="middle" className="ill-sub">bois, tempêtes, incendies…</text>
        <path d="M 262 31 H 228 m 8 -7 l -8 7 l 8 7" {...arrow} />
        <rect x={262} y={2} width={158} height={118} rx={12} fill="var(--surface)" stroke="var(--accent)" strokeWidth={2} />
        <text x={341} y={30} textAnchor="middle" className="ill-step">L’État</text>
        <text x={341} y={54} textAnchor="middle" className="ill-in">crédit d’impôt</text>
        <text x={341} y={74} textAnchor="middle" className="ill-in">de 25 % des</text>
        <text x={341} y={94} textAnchor="middle" className="ill-in">sommes retenues</text>
        <text x={341} y={112} textAnchor="middle" className="ill-sub">avec un plafond</text>
        <text x={262} y={170} textAnchor="start" className="ill-in">À condition de garder</text>
        <text x={262} y={190} textAnchor="start" className="ill-in">les parts jusqu’au</text>
        <text x={262} y={210} textAnchor="start" className="ill-in">31 décembre de la</text>
        <text x={262} y={230} textAnchor="start" className="ill-in">8e année suivant</text>
        <text x={262} y={250} textAnchor="start" className="ill-in">l’achat</text>
        <text x={210} y={314} textAnchor="middle" className="ill-sub">Schéma de principe</text>
      </svg>
    </figure>
  );
}

/** Schéma « Objets d’art : la taxe dépend du prix de vente » : seuil 5 000 €, taux 6 % + CRDS 0,5 % = 6,5 % du prix de cession (BOFiP BOI-RPPM-PVBMC-20-10, consulté le 2026-11-09). */
export function SchemaObjetsArt() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 330" role="img" aria-labelledby="ill-art-t ill-art-d" className="ill-svg">
        <title id="ill-art-t">À la vente d’un objet d’art, la taxe dépend du prix de vente</title>
        <desc id="ill-art-d">Vous vendez un objet d’art, de collection ou une antiquité. Si le prix de vente est inférieur ou égal à 5 000 euros, il n’y a aucune taxe forfaitaire. Au-delà de 5 000 euros, la taxe forfaitaire est de 6 % du prix, plus 0,5 % de CRDS, soit 6,5 % du prix de vente et non du gain. En pratique, le seuil s’apprécie objet par objet.</desc>
        <rect x={60} y={2} width={300} height={52} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={210} y={26} textAnchor="middle" className="ill-step">Vous vendez un objet d’art</text>
        <text x={210} y={44} textAnchor="middle" className="ill-sub">ou de collection, ou une antiquité</text>
        <path d="M 100 54 V 96 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <path d="M 320 54 V 96 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={0} y={96} width={200} height={58} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={100} y={122} textAnchor="middle" className="ill-in">Prix de vente</text>
        <text x={100} y={144} textAnchor="middle" className="ill-step">5 000 € ou moins</text>
        <rect x={220} y={96} width={200} height={58} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={320} y={122} textAnchor="middle" className="ill-in">Prix de vente</text>
        <text x={320} y={144} textAnchor="middle" className="ill-step">plus de 5 000 €</text>
        <path d="M 100 154 V 192 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <path d="M 320 154 V 192 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={0} y={192} width={200} height={76} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={100} y={224} textAnchor="middle" className="ill-step">Aucune taxe</text>
        <text x={100} y={246} textAnchor="middle" className="ill-sub">forfaitaire</text>
        <rect x={220} y={192} width={200} height={76} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={320} y={216} textAnchor="middle" className="ill-step">6,5 % du prix</text>
        <text x={320} y={238} textAnchor="middle" className="ill-in">6 % + 0,5 % de CRDS</text>
        <text x={320} y={257} textAnchor="middle" className="ill-sub">sur le prix, pas sur le gain</text>
        <text x={210} y={292} textAnchor="middle" className="ill-in">En pratique, le seuil s’apprécie objet par objet.</text>
        <text x={210} y={316} textAnchor="middle" className="ill-sub">Schéma de principe</text>
      </svg>
    </figure>
  );
}

/** Schéma « Formation : votre CPF vous suit » : principe qualitatif, sans chiffre (Service-Public F10705, vérifiée le 27 juin 2026, consultée le 2026-11-09). */
export function SchemaCpf() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const cols = [
    { x: 0, a: 'Vous travaillez', b: 'chez un employeur' },
    { x: 143, a: 'Vous changez', b: 'd’employeur' },
    { x: 286, a: 'Vous perdez', b: 'votre emploi' },
  ];
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 330" role="img" aria-labelledby="ill-cpf-t ill-cpf-d" className="ill-svg">
        <title id="ill-cpf-t">Votre compte personnel de formation vous suit</title>
        <desc id="ill-cpf-d">Quelle que soit votre situation (en poste, changement d’employeur, perte d’emploi), vous gardez vos droits sur votre compte personnel de formation. Si une formation coûte plus que le montant disponible, vous pouvez demander un complément à votre employeur, à l’Agefiph ou à la région.</desc>
        {cols.map((c) => (
          <g key={c.x}>
            <rect x={c.x} y={2} width={134} height={58} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
            <text x={c.x + 67} y={28} textAnchor="middle" className="ill-in">{c.a}</text>
            <text x={c.x + 67} y={48} textAnchor="middle" className="ill-in">{c.b}</text>
            <path d={`M ${c.x + 67} 60 V 98 m -7 -8 l 7 8 l 7 -8`} {...arrow} />
          </g>
        ))}
        <rect x={0} y={98} width={420} height={64} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={210} y={124} textAnchor="middle" className="ill-step">Votre CPF vous suit</text>
        <text x={210} y={146} textAnchor="middle" className="ill-sub">vous gardez vos droits</text>
        <path d="M 210 162 V 200 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <text x={226} y={186} textAnchor="start" className="ill-in">si la formation coûte plus</text>
        <rect x={0} y={200} width={420} height={78} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={210} y={226} textAnchor="middle" className="ill-step">Un complément est possible</text>
        <text x={210} y={250} textAnchor="middle" className="ill-in">demandé à votre employeur,</text>
        <text x={210} y={268} textAnchor="middle" className="ill-in">à l’Agefiph ou à la région</text>
        <text x={210} y={314} textAnchor="middle" className="ill-sub">Schéma de principe</text>
      </svg>
    </figure>
  );
}

/** Schéma « Créer son entreprise : deux sources de valeur » : principe qualitatif, sans chiffre (reprend le texte « Fonctionnement » de la fiche). */
export function SchemaCreationEntreprise() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 330" role="img" aria-labelledby="ill-ce-t ill-ce-d" className="ill-svg">
        <title id="ill-ce-t">Créer son entreprise : deux sources de valeur, un risque réel</title>
        <desc id="ill-ce-d">Le patrimoine se construit de deux façons : les bénéfices accumulés année après année, et la valeur de l’entreprise lors d’une cession. Le risque de perdre toute la mise est réel.</desc>
        <rect x={0} y={2} width={200} height={72} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={100} y={30} textAnchor="middle" className="ill-step">Les bénéfices</text>
        <text x={100} y={52} textAnchor="middle" className="ill-in">accumulés au fil</text>
        <text x={100} y={67} textAnchor="middle" className="ill-in">des années</text>
        <rect x={220} y={2} width={200} height={72} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={320} y={30} textAnchor="middle" className="ill-step">La revente</text>
        <text x={320} y={52} textAnchor="middle" className="ill-in">valeur de l’entreprise</text>
        <text x={320} y={67} textAnchor="middle" className="ill-in">lors d’une cession</text>
        <path d="M 100 74 V 112 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <path d="M 320 74 V 112 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={0} y={112} width={420} height={64} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={210} y={138} textAnchor="middle" className="ill-step">Votre patrimoine</text>
        <text x={210} y={160} textAnchor="middle" className="ill-sub">si l’activité trouve ses clients</text>
        <rect x={0} y={198} width={420} height={78} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={210} y={226} textAnchor="middle" className="ill-step">Sinon, la mise peut être perdue</text>
        <text x={210} y={250} textAnchor="middle" className="ill-in">le risque de perte totale</text>
        <text x={210} y={268} textAnchor="middle" className="ill-in">est réel</text>
        <text x={210} y={314} textAnchor="middle" className="ill-sub">Schéma de principe</text>
      </svg>
    </figure>
  );
}

/** Schéma « Racheter une entreprise : les bénéfices remboursent la dette » : principe qualitatif, sans chiffre (reprend le texte « Fonctionnement » de la fiche). */
export function SchemaRepriseEntreprise() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 330" role="img" aria-labelledby="ill-re-t ill-re-d" className="ill-svg">
        <title id="ill-re-t">Racheter une entreprise : les bénéfices remboursent la dette</title>
        <desc id="ill-re-d">On rachète une entreprise en s’endettant. Ses bénéfices servent à rembourser la dette d’acquisition. Le risque porte sur le prix payé (la valorisation) et sur la continuité de l’activité.</desc>
        <rect x={0} y={2} width={200} height={72} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={100} y={30} textAnchor="middle" className="ill-step">1. Le rachat</text>
        <text x={100} y={52} textAnchor="middle" className="ill-in">financé en partie</text>
        <text x={100} y={67} textAnchor="middle" className="ill-in">par un emprunt</text>
        <rect x={220} y={2} width={200} height={72} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={320} y={30} textAnchor="middle" className="ill-step">2. L’activité</text>
        <text x={320} y={52} textAnchor="middle" className="ill-in">dégage des bénéfices</text>
        <text x={320} y={67} textAnchor="middle" className="ill-in">qui remboursent la dette</text>
        <path d="M 200 38 H 214 m -6 -6 l 6 6 l -6 6" {...arrow} />
        <path d="M 320 74 V 112 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={0} y={112} width={420} height={64} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={210} y={138} textAnchor="middle" className="ill-step">Une fois la dette remboursée</text>
        <text x={210} y={160} textAnchor="middle" className="ill-sub">l’entreprise est à vous</text>
        <rect x={0} y={198} width={420} height={78} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={210} y={226} textAnchor="middle" className="ill-step">Deux risques</text>
        <text x={210} y={250} textAnchor="middle" className="ill-in">le prix payé était trop élevé (valorisation)</text>
        <text x={210} y={268} textAnchor="middle" className="ill-in">ou l’activité ne continue pas (continuité)</text>
        <text x={210} y={314} textAnchor="middle" className="ill-sub">Schéma de principe</text>
      </svg>
    </figure>
  );
}

/** Schéma « Activité numérique : un revenu récurrent, mais fragile » : principe qualitatif, sans chiffre (reprend le texte « Fonctionnement » de la fiche). */
export function SchemaActiviteNumerique() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 420 330" role="img" aria-labelledby="ill-an-t ill-an-d" className="ill-svg">
        <title id="ill-an-t">Activité numérique : un revenu récurrent, mais fragile</title>
        <desc id="ill-an-d">La valeur d’une activité en ligne repose sur son revenu récurrent et sa croissance, et l’activité peut se revendre. Mais ce revenu peut s’effondrer : concurrence, dépendance à une plateforme.</desc>
        <rect x={0} y={2} width={420} height={64} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={210} y={30} textAnchor="middle" className="ill-step">Un revenu récurrent</text>
        <text x={210} y={52} textAnchor="middle" className="ill-in">abonnements, ventes, contenus</text>
        <path d="M 210 66 V 100 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={0} y={100} width={420} height={64} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={210} y={128} textAnchor="middle" className="ill-step">La valeur de l’activité</text>
        <text x={210} y={150} textAnchor="middle" className="ill-sub">elle peut se revendre</text>
        <rect x={0} y={186} width={420} height={90} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={210} y={214} textAnchor="middle" className="ill-step">Mais le revenu peut s’effondrer</text>
        <text x={210} y={238} textAnchor="middle" className="ill-in">concurrence,</text>
        <text x={210} y={256} textAnchor="middle" className="ill-in">dépendance à une plateforme</text>
        <text x={210} y={314} textAnchor="middle" className="ill-sub">Schéma de principe</text>
      </svg>
    </figure>
  );
}

/** Schéma « où se cachent les frais » (guide Comparer les frais) : frais payés une fois, à l’entrée, à la sortie ou au changement
 *  de support, et frais prélevés chaque année sur l’enveloppe et sur les fonds. Aucun chiffre ; reprend la liste du guide. */
export function SchemaFamillesFrais() {
  const once = { fill: 'var(--warn-soft)', stroke: 'var(--gold)' };
  const yearly = { fill: 'var(--surface-2)', stroke: 'var(--primary)' };
  const tag = (x: number, y: number, w: number, c: typeof once, l1: string, l2: string) => (
    <g>
      <rect x={x} y={y} width={w} height={42} rx={9} fill={c.fill} stroke={c.stroke} strokeWidth={1.5} />
      <text x={x + 10} y={y + 17} className="ill-in ill-fee-head">{l1}</text>
      <text x={x + 10} y={y + 34} className="ill-in ill-fee">{l2}</text>
    </g>
  );
  const arrowDown = (x: number, y1: number, y2: number) => (
    <path d={`M ${x} ${y1} V ${y2 - 2} M ${x - 5} ${y2 - 8} L ${x} ${y2 - 2} L ${x + 5} ${y2 - 8}`} fill="none" stroke="var(--ink-2)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  );
  const fund = (x: number, name: string) => (
    <g>
      <rect x={x} y={196} width={114} height={66} rx={10} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={1.5} />
      <text x={x + 57} y={218} textAnchor="middle" className="ill-in">{name}</text>
      <rect x={x + 8} y={226} width={98} height={28} rx={7} fill={yearly.fill} stroke={yearly.stroke} strokeWidth={1.2} />
      <text x={x + 57} y={244} textAnchor="middle" className="ill-in ill-fee">frais courants</text>
    </g>
  );
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 374" role="img" aria-labelledby="ill-ff-t ill-ff-d" className="ill-svg">
        <title id="ill-ff-t">Où se trouvent les frais d’un placement</title>
        <desc id="ill-ff-d">Vos versements entrent dans une enveloppe (assurance-vie, PEA, compte-titres…) qui contient des fonds. Frais payés une fois : à l’entrée (frais sur versement, courtage), au changement de fonds (arbitrage) et à la sortie (frais de sortie, courtage). Frais prélevés chaque année : frais de gestion ou droits de garde de l’enveloppe, et frais courants de chaque fonds.</desc>
        <rect x={14} y={4} width={128} height={30} rx={15} fill="var(--surface)" stroke="var(--ink-2)" strokeWidth={1.5} />
        <text x={78} y={24} textAnchor="middle" className="ill-in">Vos versements</text>
        {arrowDown(78, 34, 98)}
        {tag(100, 44, 232, once, 'Une fois, à l’entrée', 'frais sur versement, courtage')}
        <rect x={6} y={98} width={328} height={178} rx={16} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={20} y={122} className="ill-step">L’enveloppe</text>
        <text x={110} y={122} className="ill-in ill-fee">assurance-vie, PEA, compte-titres…</text>
        {tag(20, 134, 240, yearly, 'Chaque année', 'frais de gestion ou droits de garde')}
        {fund(20, 'Un fonds')}
        {fund(206, 'Un autre fonds')}
        <path d="M 140 222 H 198 M 192 217 L 198 222 L 192 227 M 146 217 L 140 222 L 146 227" fill="none" stroke="var(--warn)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
        <text x={169} y={244} textAnchor="middle" className="ill-in ill-fee-head">arbitrage</text>
        <text x={169} y={259} textAnchor="middle" className="ill-in ill-fee">une fois</text>
        {arrowDown(78, 276, 340)}
        {tag(100, 288, 232, once, 'Une fois, à la sortie', 'frais de sortie, courtage')}
        <rect x={14} y={340} width={128} height={30} rx={15} fill="var(--surface)" stroke="var(--ink-2)" strokeWidth={1.5} />
        <text x={78} y={360} textAnchor="middle" className="ill-in">Votre retrait</text>
      </svg>
      <figcaption>
        <strong>En jaune</strong>, les frais payés une fois, à chaque opération ; <strong>en bleu</strong>, ceux prélevés chaque année. Selon l’enveloppe et le contrat, seuls certains existent.
      </figcaption>
    </figure>
  );
}
