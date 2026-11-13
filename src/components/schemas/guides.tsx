import { fmtEur, fmtPct, HCSF } from '../../lib/finance';
import { DIVERSIFICATION_EXAMPLE, INFLATION_EXAMPLE, LOAN_EXAMPLE, SNOWBALL_EXAMPLE, diversificationRows, inflationBars, loanSlices, snowballGroups, rendementSteps, RENDEMENT_EXAMPLE, cashflowParts, endettementParts, leviersEndettement, LEVIERS_EXAMPLE, patrimoineParts, rembourserParts, regle72Rows, epargneMoisRows, EPARGNE_MOIS_EXAMPLE, fraisRows, FRAIS_EXAMPLE, petitsVersementsRows, precautionRows, PRECAUTION_EXAMPLE, PETITS_VERSEMENTS_EXAMPLE, type SnowballBar } from '../../lib/illustrationData';
import { W, BASE, TOP, BAR_W, pct, wrapLabel } from './outils';

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

/** Schéma « De 6 % à 3,6 % » : le rendement brut d’une annonce fond quand on compte les frais, la vacance et les charges. Exemple fictif calculé (illustrationData). */
export function SchemaRendement() {
  const steps = rendementSteps();
  const pctFr = (v: number) => `${(Math.round(v * 1000) / 10).toLocaleString('fr-FR', { minimumFractionDigits: 1 })} %`;
  const max = steps[0].value;
  const X0 = 14;
  const BW = 250;
  const alt = steps.map((s) => `${s.label} (${s.detail}) : ${pctFr(s.value)}`).join(' ; ');
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 214" role="img" aria-labelledby="ill-rend-t ill-rend-d" className="ill-svg">
        <title id="ill-rend-t">Le rendement locatif baisse à mesure qu’on compte les vrais coûts</title>
        <desc id="ill-rend-d">{`Exemple fictif d’un bien à ${fmtEur(RENDEMENT_EXAMPLE.price)} loué ${fmtEur(RENDEMENT_EXAMPLE.monthlyRent)} par mois. ${alt}.`}</desc>
        {steps.map((s, i) => {
          const y = 4 + i * 54;
          const w = (s.value / max) * BW;
          const last = i === steps.length - 1;
          return (
            <g key={s.label}>
              <text x={X0} y={y + 14} className="ill-step">{s.label}</text>
              <rect x={X0} y={y + 22} width={BW} height={24} rx={6} fill="var(--surface-2)" />
              <rect x={X0} y={y + 22} width={w} height={24} rx={6} fill={last ? 'var(--accent)' : 'var(--primary)'} />
              <text x={X0 + BW + 10} y={y + 39} className="ill-total">{pctFr(s.value)}</text>
            </g>
          );
        })}
      </svg>
      <figcaption>
        <strong>Illustration, exemple fictif</strong> : le même bien, loué {fmtEur(RENDEMENT_EXAMPLE.monthlyRent)} par mois, vu sous quatre angles. Barres proportionnelles aux pourcentages.
      </figcaption>
    </figure>
  );
}

/** Schéma « cash-flow » : sur un mois moyen, ce qui sort (charges, crédit) face à ce qui entre (loyer) ; l’écart est l’effort de l’investisseur. Exemple fictif calculé par le simulateur (illustrationData). */
export function SchemaCashflow() {
  const c = cashflowParts();
  const X0 = 14;
  const BW = 312;
  const x = (v: number) => X0 + (v / c.out) * BW;
  const mid = (a: number, b: number) => (x(a) + x(b)) / 2;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 176" role="img" aria-labelledby="ill-cf-t ill-cf-d" className="ill-svg">
        <title id="ill-cf-t">Le loyer ne couvre pas tout : l’écart sort de votre poche</title>
        <desc id="ill-cf-d">{`Exemple fictif, un mois moyen avant impôt. Ce qui sort : ${fmtEur(c.out)}, soit ${fmtEur(c.charges)} de charges du bien et ${fmtEur(c.loan)} de crédit, assurance comprise. Ce qui entre : ${fmtEur(c.rents)} de loyer encaissé en moyenne. Il manque ${fmtEur(c.effort)} par mois, à payer de votre poche.`}</desc>
        <text x={X0} y="16" className="ill-step">{`Ce qui sort : ${fmtEur(c.out)} par mois`}</text>
        <rect x={X0} y="26" width={BW} height="32" rx="8" fill="var(--primary)" />
        <rect x={X0} y="26" width={x(c.charges) - X0} height="32" rx="8" fill="var(--surface-2)" stroke="var(--line)" />
        <rect x={x(c.charges)} y="26" width="8" height="32" fill="var(--primary)" />
        <text x={mid(0, c.charges)} y="47" textAnchor="middle" className="ill-in">{fmtEur(c.charges)}</text>
        <text x={mid(c.charges, c.out)} y="47" textAnchor="middle" className="ill-total ill-on-dark">{fmtEur(c.loan)}</text>
        <text x={X0} y="76" className="ill-sub">charges</text>
        <text x={x(c.charges) + 10} y="76" className="ill-sub">crédit, assurance comprise</text>
        <text x={X0} y="110" className="ill-step">{`Ce qui entre : ${fmtEur(c.rents)} par mois`}</text>
        <rect x={X0} y="120" width={BW} height="32" rx="8" fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth="2" strokeDasharray="5 4" />
        <rect x={X0} y="120" width={x(c.rents) - X0} height="32" rx="8" fill="var(--accent)" />
        <text x={mid(0, c.rents)} y="141" textAnchor="middle" className="ill-total ill-on-dark">{fmtEur(c.rents)}</text>
        <text x={mid(c.rents, c.out)} y="141" textAnchor="middle" className="ill-total">{fmtEur(c.effort)}</text>
        <text x={X0} y="170" className="ill-sub">loyer encaissé (moyenne)</text>
        <text x={x(c.rents) + 6} y="170" className="ill-sub">votre effort</text>
      </svg>
      <figcaption>
        <strong>Illustration, exemple fictif</strong> : un mois moyen de la première année, avant impôt. Largeurs proportionnelles aux montants, arrondis à l’euro.
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

/** Guide « Taux d'endettement » : somme empruntable selon le levier, sur le foyer fictif du guide (calculée par leviersEndettement). */
export function SchemaLeviers() {
  const l = leviersEndettement();
  const X0 = 14;
  const BW = 312;
  const max = l.couple;
  const w = (v: number) => (v / max) * BW;
  const rows = [
    { label: `Au départ (${LEVIERS_EXAMPLE.years} ans)`, value: l.base, base: true },
    { label: `Durée allongée à ${LEVIERS_EXAMPLE.longerYears} ans`, value: l.longer },
    { label: 'Petit crédit soldé', value: l.noOldLoan },
    { label: 'À deux revenus', value: l.couple },
  ];
  const xBase = X0 + w(l.base);
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 238" role="img" aria-labelledby="ill-lev-t ill-lev-d" className="ill-svg">
        <title id="ill-lev-t">Ce que chaque levier change à la somme empruntable</title>
        <desc id="ill-lev-d">{`Exemple fictif, au repère de 35 %, assurance comprise : ${rows.map((r) => `${r.label}, environ ${fmtEur(r.value)}`).join(' ; ')}.`}</desc>
        <line x1={xBase} x2={xBase} y1="20" y2="232" stroke="var(--ink-2)" strokeWidth="1.5" strokeDasharray="4 3" />
        {rows.map((r, i) => {
          const y = 8 + i * 56;
          return (
            <g key={r.label}>
              <text x={X0} y={y + 10} className="ill-step">{r.label}</text>
              <rect x={X0} y={y + 18} width={w(r.value)} height="28" rx="7" fill={r.base ? 'var(--primary)' : 'var(--accent)'} />
              <text x={X0 + w(r.value) - 10} y={y + 37} textAnchor="end" className="ill-in ill-on-dark">{`≈ ${fmtEur(r.value)}`}</text>
            </g>
          );
        })}
      </svg>
      <figcaption>
        <strong>Illustration, exemple fictif</strong> : taux de {fmtPct(LEVIERS_EXAMPLE.rate)}, assurance de {fmtPct(LEVIERS_EXAMPLE.insuranceRate)}. Le pointillé marque le point de départ ; longueurs proportionnelles aux montants.
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
        <strong>Illustration, exemple fictif</strong> : {fmtEur(p.assets)} − {fmtEur(p.debt)} = {fmtEur(p.net)}. Largeurs proportionnelles aux montants.
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
