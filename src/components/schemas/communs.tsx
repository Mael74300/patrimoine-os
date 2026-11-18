import { fmtEur } from '../../lib/finance';
import { LEVERAGE_EXAMPLE, leverageBars } from '../../lib/illustrationData';
import { pct } from './outils';

/** Schéma « effet de levier » : première année du bien acheté à crédit, avec un bien qui rapporte 5 % ou 3 % de son prix net de charges.
 * ViewBox 340 (chantier 112, étape 7, 2026-11-15) : à 375 px, les petits textes s'affichent vers 13 px au lieu de 11,2 px. */
export function SchemaLevier({ brief = false }: { brief?: boolean } = {}) {
  const { interest, down, bars } = leverageBars();
  const { price } = LEVERAGE_EXAMPLE;
  const BASE_Y = 226;
  const TOP_Y = 32;
  const BW = 84;
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
      <svg viewBox="0 0 340 328" role="img" aria-labelledby="ill-lev-t ill-lev-d" className="ill-svg">
        <title id="ill-lev-t">Effet de levier : le même crédit enrichit si le bien rapporte plus que les intérêts, et appauvrit sinon</title>
        <desc id="ill-lev-d">{`Bien de ${fmtEur(price)} acheté avec ${fmtEur(down)} d’apport, première année : ${fmtEur(interest)} d’intérêts à payer. ${alt}`}</desc>
        <line x1={6} x2={334} y1={BASE_Y} y2={BASE_Y} stroke="var(--line)" strokeWidth={2} />
        {bars.map((b, i) => {
          const cx = 85 + i * 170;
          const x = cx - BW / 2;
          const hi = h(b.interestPaid);
          const hl = h(b.left);
          return (
            <g key={b.yieldPct}>
              <rect x={x} y={BASE_Y - hi} width={BW} height={hi} rx={4} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
              {hl > 0 && <rect x={x} y={BASE_Y - hi - hl} width={BW} height={hl} rx={4} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />}
              {b.shortfall > 0 && <rect x={x} y={BASE_Y - h(interest)} width={BW} height={h(interest) - hi} rx={4} fill="none" stroke="var(--warn)" strokeWidth={2} strokeDasharray="5 4" />}
              <text x={cx} y={BASE_Y - h(Math.max(b.income, interest)) - 10} textAnchor="middle" className="ill-total">{b.shortfall > 0 ? `Manque ${fmtEur(b.shortfall)}` : `Reste ${fmtEur(b.left)}`}</text>
              <text x={cx} y={BASE_Y - hi / 2 + 5} textAnchor="middle" className="ill-step">{fmtEur(b.interestPaid)}</text>
              <text x={cx} y={BASE_Y + 20} textAnchor="middle" className="ill-year">{`Rapporte ${pct(b.yieldPct)} %`}</text>
              <text x={cx} y={BASE_Y + 38} textAnchor="middle" className="ill-sub">{`${fmtEur(b.income)} par an`}</text>
            </g>
          );
        })}
        <g transform="translate(6 280)">
          <rect width={14} height={14} rx={3} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
          <text x={22} y={12} className="ill-sub" textAnchor="start">Intérêts du crédit (année 1)</text>
          <rect y={24} width={14} height={14} rx={3} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
          <text x={22} y={36} className="ill-sub" textAnchor="start">Ce qu’il reste</text>
        </g>
      </svg>
      {brief ? (
        // Guide « Investir à crédit » : le texte autour du schéma détaille déjà l'exemple ; la légende ne le répète pas.
        <figcaption>
          <strong>Illustration, exemple fictif</strong> : première année, avant impôt. Même crédit dans les deux cas : c’est le rendement du bien qui décide si le levier enrichit ou appauvrit.
        </figcaption>
      ) : (
        <figcaption>
          <strong>Illustration, exemple fictif</strong> : bien de {fmtEur(price)} acheté avec {fmtEur(down)} d’apport, première année, avant impôt. Les loyers nets de charges paient d’abord les intérêts : c’est le rendement du bien qui décide si le levier enrichit ou appauvrit.
        </figcaption>
      )}
    </figure>
  );
}

/** Schéma « PEA : avant et après 5 ans » : frise du temps, la règle de retrait change à la cinquième année. Seul chiffre : « 5 ans » ; reprend le texte du guide.
 * ViewBox 340 (chantier 112, étape 7, 2026-11-15) : à 375 px, les petits textes s'affichent vers 13 px au lieu de 10 à 11 px avec l'ancien viewBox 420. */
export function SchemaPea() {
  const L = 84; // centre de la colonne « avant »
  const R = 256; // centre de la colonne « après »
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 318" role="img" aria-labelledby="ill-pea-t ill-pea-d" className="ill-svg">
        <title id="ill-pea-t">PEA : ce qui change avant et après 5 ans</title>
        <desc id="ill-pea-d">Avant 5 ans, un retrait entraîne en principe la clôture du plan, sauf exceptions prévues par la loi. Après 5 ans, un retrait partiel ne clôture pas le plan et les versements restent possibles (un retrait total le clôt) ; les gains sont exonérés d’impôt sur le revenu, mais les prélèvements sociaux restent dus.</desc>
        <text x={170} y={16} textAnchor="middle" className="ill-sub">Ouverture du PEA, puis 5 ans plus tard</text>
        <rect x={2} y={30} width={164} height={32} rx={16} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <rect x={174} y={30} width={164} height={32} rx={16} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={L - 8} y={51} textAnchor="middle" className="ill-step">Avant 5 ans</text>
        <text x={R + 8} y={51} textAnchor="middle" className="ill-step">Après 5 ans</text>
        <circle cx={170} cy={46} r={18} fill="var(--primary)" stroke="var(--surface)" strokeWidth={3} />
        <text x={170} y={51} textAnchor="middle" className="ill-on-dark ill-num">5</text>
        <path d={`M ${L} 62 V 88 m -6 -7 l 6 7 l 6 -7 M ${R} 62 V 88 m -6 -7 l 6 7 l 6 -7`} fill="none" stroke="var(--ink-2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <rect x={2} y={96} width={164} height={150} rx={12} fill="var(--surface)" stroke="var(--warn)" strokeWidth={2} />
        <text x={L} y={124} textAnchor="middle" className="ill-step">Un retrait</text>
        <text x={L} y={144} textAnchor="middle" className="ill-step">clôture le plan</text>
        <line x1={22} x2={146} y1={162} y2={162} stroke="var(--line)" strokeWidth={1.5} />
        <text x={L} y={193} textAnchor="middle" className="ill-sub">en principe, sauf</text>
        <text x={L} y={211} textAnchor="middle" className="ill-sub">exceptions prévues</text>
        <text x={L} y={229} textAnchor="middle" className="ill-sub">par la loi</text>
        <rect x={174} y={96} width={164} height={150} rx={12} fill="var(--surface)" stroke="var(--accent)" strokeWidth={2} />
        <text x={R} y={124} textAnchor="middle" className="ill-step">Retrait partiel</text>
        <text x={R} y={144} textAnchor="middle" className="ill-step">sans clôture</text>
        <line x1={194} x2={318} y1={162} y2={162} stroke="var(--line)" strokeWidth={1.5} />
        <text x={R} y={184} textAnchor="middle" className="ill-sub">gains exonérés d’impôt</text>
        <text x={R} y={202} textAnchor="middle" className="ill-sub">sur le revenu ;</text>
        <text x={R} y={220} textAnchor="middle" className="ill-sub">prélèvements</text>
        <text x={R} y={238} textAnchor="middle" className="ill-sub">sociaux dus</text>
        <text x={170} y={276} textAnchor="middle" className="ill-sub">Un retrait total clôture toujours le plan</text>
        <text x={170} y={298} textAnchor="middle" className="ill-sub">Ouvrir tôt fait courir le délai de 5 ans</text>
      </svg>
    </figure>
  );
}

/** Schéma « Livret A : le jour de l’opération décide » : quatre frises (dépôt ou retrait, dans la première ou la seconde quinzaine)
 * montrent sur le calendrier quand la somme rapporte, et la quinzaine où elle reste sur le livret sans rien rapporter.
 * Seuls chiffres : 1er, 15, 16 ; règle reprise de Service-Public.fr, fiche F2365 (« Livret A », vérifiée le 1er août 2026,
 * consultée le 2026-11-14) : dépôt jusqu’au 15 → 16 du même mois ; à partir du 16 → 1er du mois suivant ;
 * retrait jusqu’au 15 → solde du dernier jour du mois précédent ; à partir du 16 → solde du 15.
 * ViewBox 340 : à 375 px, le dessin s’affiche presque à sa taille (textes ~13,5 px au lieu de ~11 px avec l’ancien viewBox 420). */
export function SchemaQuinzaines() {
  // Calendrier commun aux quatre frises : fin du mois d’avant, 1er → 15, 16 → fin du mois, début du mois suivant.
  const P = 1;
  const A = 64;
  const B = 164;
  const N = 264;
  const FIN = 339;
  const BAR_H = 20;
  const rows = [
    { y: 74, op: 'Dépôt', res: ' : rapporte dès le 16', at: 114, rapporte: [B, FIN], attente: [114, B], depot: true },
    { y: 136, op: 'Dépôt', res: ' : rapporte dès le 1er du mois suivant', at: 214, rapporte: [N, FIN], attente: [214, N], depot: true },
    { y: 214, op: 'Retrait', res: ' : ne rapporte plus dès le 1er', at: 114, rapporte: [P, A], attente: [A, 114], depot: false },
    { y: 276, op: 'Retrait', res: ' : ne rapporte plus dès le 16', at: 214, rapporte: [P, B], attente: [B, 214], depot: false },
  ];
  const gridBottom = 276 + 12 + BAR_H + 6;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 358" role="img" aria-labelledby="ill-quinz-t ill-quinz-d" className="ill-svg">
        <title id="ill-quinz-t">Livret A : le jour du dépôt ou du retrait décide</title>
        <desc id="ill-quinz-d">Un dépôt du 1er au 15 du mois rapporte à partir du 16 du même mois ; un dépôt à partir du 16 rapporte à partir du 1er du mois suivant. Un retrait du 1er au 15 est calculé sur le solde arrêté au dernier jour du mois précédent ; un retrait à partir du 16, sur le solde arrêté au 15. Dans chaque cas, la somme passe jusqu’à une quinzaine sur le livret sans rien rapporter.</desc>
        {/* En-tête du calendrier */}
        <text x={(P + A) / 2} y={20} textAnchor="middle" className="ill-sub">mois</text>
        <text x={(P + A) / 2} y={36} textAnchor="middle" className="ill-sub">d’avant</text>
        <rect x={A + 3} y={12} width={B - A - 6} height={30} rx={15} fill="var(--surface-2)" />
        <text x={(A + B) / 2} y={32} textAnchor="middle" className="ill-step">du 1er au 15</text>
        <rect x={B + 3} y={12} width={N - B - 6} height={30} rx={15} fill="var(--surface-2)" />
        <text x={(B + N) / 2} y={32} textAnchor="middle" className="ill-step">du 16 à la fin</text>
        <text x={(N + FIN) / 2} y={20} textAnchor="middle" className="ill-sub">mois</text>
        <text x={(N + FIN) / 2} y={36} textAnchor="middle" className="ill-sub">suivant</text>
        {[A, B, N].map((x) => (
          <line key={x} x1={x} x2={x} y1={46} y2={gridBottom} stroke="var(--line)" strokeWidth={1.5} strokeDasharray="3 4" />
        ))}
        {rows.map((r) => {
          const by = r.y + 12;
          return (
            <g key={r.y}>
              <text x={0} y={r.y} className="ill-sub" style={{ paintOrder: 'stroke', stroke: 'var(--surface)', strokeWidth: 6, strokeLinejoin: 'round' }}><tspan className="ill-step" style={{ fill: 'var(--ink)' }}>{r.op}</tspan>{r.res}</text>
              <rect x={P} y={by} width={FIN - P} height={BAR_H} rx={6} fill="var(--surface)" stroke="var(--line)" strokeWidth={1.5} />
              <rect x={r.rapporte[0]} y={by} width={r.rapporte[1] - r.rapporte[0]} height={BAR_H} rx={6} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
              <rect x={r.attente[0]} y={by + 2} width={r.attente[1] - r.attente[0]} height={BAR_H - 4} rx={4} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={1.5} strokeDasharray="4 3" />
              <circle cx={r.at} cy={by + BAR_H / 2} r={10} fill="var(--primary)" stroke="var(--surface)" strokeWidth={2} />
              <path d={r.depot ? `M ${r.at - 5} ${by + 10} h 10 M ${r.at} ${by + 5} v 10` : `M ${r.at - 5} ${by + 10} h 10`} stroke="var(--primary-ink)" strokeWidth={2.2} strokeLinecap="round" />
            </g>
          );
        })}
        <g transform="translate(1 334)">
          <circle cx={9} cy={9} r={8} fill="var(--primary)" />
          <path d="M 5 9 h 8 M 9 5 v 8" stroke="var(--primary-ink)" strokeWidth={2} strokeLinecap="round" />
          <text x={22} y={14} className="ill-sub">opération</text>
          <rect x={96} y={2} width={22} height={14} rx={4} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
          <text x={124} y={14} className="ill-sub">rapporte</text>
          <rect x={190} y={3} width={22} height={12} rx={3} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={1.5} strokeDasharray="4 3" />
          <text x={218} y={14} className="ill-sub">sans intérêts</text>
        </g>
      </svg>
    </figure>
  );
}
