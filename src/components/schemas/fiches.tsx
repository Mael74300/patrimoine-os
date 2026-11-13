import type { ReactNode } from 'react';
import { fmtEur } from '../../lib/finance';
import { pfuSplit } from '../../lib/calc/pfu';
import { perDeductionBalance } from '../../lib/calc/per';
import { PER_EXAMPLE } from '../../lib/illustrationData';
import { W } from './outils';

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
