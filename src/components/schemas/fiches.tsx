import type { ReactNode } from 'react';
import { fmtEur } from '../../lib/finance';
import { pfuSplit, PFU_IR_PCT, PFU_PS_PCT, PFU_TOTAL_PCT } from '../../lib/calc/pfu';
import { perDeductionBalance } from '../../lib/calc/per';
import { ASSURANCE_VIE_EXAMPLE, CROWDFUNDING_EXAMPLE, DONATION_EXAMPLE, ETF_EXAMPLE, LOCATION_NUE_EXAMPLE, OBLIGATION_EXAMPLE, PEL_EXAMPLE, PER_EXAMPLE, REPRISE_EXAMPLE, SCPI_EXAMPLE, TERM_DEPOSIT_EXAMPLE } from '../../lib/illustrationData';
import { LIVRETS } from '../../data/livrets';
import { assuranceVieRetrait, bondCoupons, forestCredit, crowdfundingScenario, etfMilestones, lepVsLivretA, pelVsLivretA, termDepositVsLivretA, microFoncierExample, repriseDebtShare, scpiFeesPayback, sensitivityChangePct } from '../../lib/calc/ficheExemples';
import { detailDroitsLigneDirecte } from '../../lib/calc/donation';
import { fmtEur2 } from '../../lib/calc/format';
import { W } from './outils';

/** Schéma « Comment fonctionne une SCPI » : principe qualitatif (aucun chiffre), repris du texte de la fiche et de La finance pour tous. */
/* ViewBox 340 (chantier 112, étape 3) : à 375 px, les textes s'affichent presque à leur taille
 * (≈ 11,2 px et cadres collés aux bords avec l'ancien viewBox 420). Mêmes textes et mêmes règles. */
export function SchemaScpi() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 334" role="img" aria-labelledby="ill-scpi-t ill-scpi-d" className="ill-svg">
        <title id="ill-scpi-t">Comment fonctionne une SCPI</title>
        <desc id="ill-scpi-d">Les épargnants achètent des parts de la SCPI. La SCPI, gérée par une société de gestion, achète des immeubles et les loue. Les loyers perçus, après déduction des frais, reviennent aux épargnants sous forme de revenus.</desc>
        <rect x={1} y={2} width={190} height={58} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={96} y={28} textAnchor="middle" className="ill-step">Les épargnants</text>
        <text x={96} y={48} textAnchor="middle" className="ill-sub">achètent des parts</text>
        <path d="M 96 60 V 108 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <text x={106} y={90} textAnchor="start" className="ill-in">leur argent</text>
        <rect x={1} y={108} width={190} height={76} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={96} y={132} textAnchor="middle" className="ill-step">La SCPI</text>
        <text x={96} y={154} textAnchor="middle" className="ill-sub">gérée par une</text>
        <text x={96} y={172} textAnchor="middle" className="ill-sub">société de gestion</text>
        <path d="M 96 184 V 232 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <text x={106} y={204} textAnchor="start" className="ill-in">achète et met</text>
        <text x={106} y={221} textAnchor="start" className="ill-in">en location</text>
        <rect x={1} y={232} width={190} height={58} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={96} y={258} textAnchor="middle" className="ill-step">Des immeubles loués</text>
        <text x={96} y={278} textAnchor="middle" className="ill-sub">bureaux, commerces…</text>
        <path d="M 191 261 H 212 V 31 H 199 m 8 -7 l -8 7 l 8 7" {...arrow} />
        <text x={222} y={122} textAnchor="start" className="ill-in">les loyers,</text>
        <text x={222} y={140} textAnchor="start" className="ill-in">moins les frais,</text>
        <text x={222} y={158} textAnchor="start" className="ill-in">reviennent aux</text>
        <text x={222} y={176} textAnchor="start" className="ill-in">épargnants</text>
        <text x={170} y={324} textAnchor="middle" className="ill-sub">Schéma de principe, sans chiffre</text>
      </svg>
    </figure>
  );
}

/** Schéma « Assurance-vie : un contrat, deux types de supports » : principe qualitatif (aucun chiffre), repris de Service-Public (F15274) : garantie du fonds en euros, risque de perte en capital des unités de compte. */
/* ViewBox 340 (chantier 112, étape 2) : à 375 px, les textes s'affichent presque à leur taille et les deux cadres
 * gardent leur marge (≈ 11,2 px et cadres collés aux bords avec l'ancien viewBox 420). */
export function SchemaAssuranceVie() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const L = 1;
  const R = 175;
  const BW = 164;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 324" role="img" aria-labelledby="ill-av-t ill-av-d" className="ill-svg">
        <title id="ill-av-t">Assurance-vie : un contrat, deux types de supports</title>
        <desc id="ill-av-d">Vous versez de l'argent sur un contrat d'assurance-vie, puis vous choisissez la part placée sur chaque support. Le fonds en euros est garanti par l'assureur, avec un faible rendement. Les unités de compte peuvent rapporter davantage mais comportent un risque de perte en capital.</desc>
        <rect x={40} y={2} width={260} height={52} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={170} y={24} textAnchor="middle" className="ill-step">Vous versez</text>
        <text x={170} y={44} textAnchor="middle" className="ill-sub">sur un contrat d'assurance-vie</text>
        <path d="M 170 54 V 80 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={14} y={80} width={312} height={52} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={170} y={102} textAnchor="middle" className="ill-step">Vous choisissez la répartition</text>
        <text x={170} y={122} textAnchor="middle" className="ill-sub">entre deux types de supports</text>
        <path d={`M ${L + BW / 2} 132 V 160 m -7 -8 l 7 8 l 7 -8`} {...arrow} />
        <path d={`M ${R + BW / 2} 132 V 160 m -7 -8 l 7 8 l 7 -8`} {...arrow} />
        <rect x={L} y={160} width={BW} height={136} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={L + BW / 2} y={186} textAnchor="middle" className="ill-step">Fonds en euros</text>
        <text x={L + BW / 2} y={214} textAnchor="middle" className="ill-in">Capital garanti</text>
        <text x={L + BW / 2} y={232} textAnchor="middle" className="ill-in">par l'assureur</text>
        <text x={L + BW / 2} y={270} textAnchor="middle" className="ill-sub">rendement plus faible</text>
        <rect x={R} y={160} width={BW} height={136} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={R + BW / 2} y={186} textAnchor="middle" className="ill-step">Unités de compte</text>
        <text x={R + BW / 2} y={214} textAnchor="middle" className="ill-in">Valeur variable</text>
        <text x={R + BW / 2} y={232} textAnchor="middle" className="ill-in">selon les marchés :</text>
        <text x={R + BW / 2} y={250} textAnchor="middle" className="ill-in">perte possible</text>
        <text x={R + BW / 2} y={270} textAnchor="middle" className="ill-sub">peut rapporter</text>
        <text x={R + BW / 2} y={286} textAnchor="middle" className="ill-sub">davantage</text>
        <text x={170} y={318} textAnchor="middle" className="ill-sub">Schéma de principe, sans chiffre</text>
      </svg>
    </figure>
  );
}

/** Schéma « Trois façons de participer » : principe qualitatif (aucun chiffre), repris de La finance pour tous (page « Crowdfunding ou Finance participative », mise à jour du 13 décembre 2024). */
/* ViewBox 340 (chantier 112, étape 8) : à 375 px, les textes s'affichent presque à leur taille (≈ 11,2 px avec l'ancien
 * viewBox 420). Mêmes textes, coupés autrement ; la colonne de gauche est un tracé à coins arrondis à gauche seulement. */
export function SchemaCrowdfunding() {
  const rows = [
    { c: 'var(--accent)', soft: 'var(--accent-soft)', nom: 'Don', sous: ['avec ou sans', 'contrepartie'], recoit: ['Vous recevez : une contrepartie', '(un objet, une place…) ou rien'], risque: ['Risque : le projet échoue,', 'la contrepartie n’est pas livrée'] },
    { c: 'var(--primary)', soft: 'var(--surface-2)', nom: 'Prêt', sous: ['avec intérêts'], recoit: ['Vous recevez : des intérêts', 'si le prêt est remboursé'], risque: ['Risque : l’emprunteur', 'ne rembourse pas (défaut)'] },
    { c: 'var(--warn)', soft: 'var(--warn-soft)', nom: 'Titres', sous: ['actions ou', 'obligations'], recoit: ['Vous recevez : dividendes ou', 'intérêts, selon le titre'], risque: ['Risque : perte partielle ou', 'totale, titres difficiles', 'à revendre'] },
  ];
  const COL = 100;
  let y = 44;
  const placed = rows.map((r) => {
    const h = 24 + r.recoit.length * 16 + 10 + (r.risque.length - 1) * 16 + 14;
    const row = { ...r, y, h };
    y += h + 8;
    return row;
  });
  const H = y + 20;
  return (
    <figure className="illustration">
      <svg viewBox={`0 0 340 ${H}`} role="img" aria-labelledby="ill-cf-t ill-cf-d" className="ill-svg">
        <title id="ill-cf-t">Financement participatif : trois façons de participer</title>
        <desc id="ill-cf-d">Sur une plateforme, on peut financer un projet de trois façons. Le don, avec ou sans contrepartie : le risque est que le projet échoue et que la contrepartie ne soit pas livrée. Le prêt avec intérêts : le risque est le défaut de remboursement. La souscription de titres, actions ou obligations non cotées : les risques sont la perte partielle ou totale du capital et la difficulté à revendre les titres.</desc>
        <text x={170} y={14} textAnchor="middle" className="ill-sub">Sur une plateforme, trois façons</text>
        <text x={170} y={31} textAnchor="middle" className="ill-sub">de financer un projet</text>
        {placed.map((r) => {
          const top = r.y + (r.h - (18 + r.sous.length * 16)) / 2;
          const risk = r.y + 24 + r.recoit.length * 16 + 10;
          return (
            <g key={r.nom}>
              <rect x={1} y={r.y} width={338} height={r.h} rx={12} fill="var(--surface)" />
              <path d={`M 13 ${r.y} H ${1 + COL} V ${r.y + r.h} H 13 A 12 12 0 0 1 1 ${r.y + r.h - 12} V ${r.y + 12} A 12 12 0 0 1 13 ${r.y} Z`} fill={r.soft} />
              <path d={`M ${1 + COL} ${r.y} V ${r.y + r.h}`} stroke={r.c} strokeWidth={2} />
              <rect x={1} y={r.y} width={338} height={r.h} rx={12} fill="none" stroke={r.c} strokeWidth={2} />
              <text x={51} y={top + 15} textAnchor="middle" className="ill-step">{r.nom}</text>
              {r.sous.map((t, k) => <text key={t} x={51} y={top + 34 + k * 16} textAnchor="middle" className="ill-sub">{t}</text>)}
              {r.recoit.map((t, k) => <text key={t} x={110} y={r.y + 24 + k * 16} className="ill-in">{t}</text>)}
              {r.risque.map((t, k) => <text key={t} x={110} y={risk + k * 16} className="ill-sub">{t}</text>)}
            </g>
          );
        })}
        <text x={170} y={H - 8} textAnchor="middle" className="ill-sub">Schéma de principe, sans chiffre</text>
      </svg>
    </figure>
  );
}

/** Schéma « Comment fonctionne une foncière cotée » : principe qualitatif (aucun chiffre), repris de La finance pour tous (page « Les sociétés foncières »). */
/* ViewBox 340 (chantier 112, étape 8), même construction que le schéma SCPI : mêmes textes, coupés en deux lignes quand il le faut. */
export function SchemaFonciereCotee() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 352" role="img" aria-labelledby="ill-fc-t ill-fc-d" className="ill-svg">
        <title id="ill-fc-t">Comment fonctionne une foncière cotée</title>
        <desc id="ill-fc-d">Les investisseurs achètent et revendent des actions de la foncière en Bourse, au prix du marché. La foncière possède des immeubles de bureaux et de commerces qu’elle loue. Les loyers lui permettent de verser des dividendes aux actionnaires.</desc>
        <rect x={1} y={2} width={190} height={76} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={96} y={28} textAnchor="middle" className="ill-step">Les investisseurs</text>
        <text x={96} y={50} textAnchor="middle" className="ill-sub">achètent des</text>
        <text x={96} y={68} textAnchor="middle" className="ill-sub">actions en Bourse</text>
        <path d="M 96 78 V 126 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <text x={106} y={100} textAnchor="start" className="ill-in">revendables</text>
        <text x={106} y={117} textAnchor="start" className="ill-in">en Bourse</text>
        <rect x={1} y={126} width={190} height={64} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={96} y={152} textAnchor="middle" className="ill-step">La foncière cotée</text>
        <text x={96} y={174} textAnchor="middle" className="ill-sub">société dont le prix varie</text>
        <path d="M 96 190 V 238 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <text x={106} y={212} textAnchor="start" className="ill-in">possède</text>
        <text x={106} y={229} textAnchor="start" className="ill-in">et loue</text>
        <rect x={1} y={238} width={190} height={76} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={96} y={264} textAnchor="middle" className="ill-step">Des immeubles loués</text>
        <text x={96} y={286} textAnchor="middle" className="ill-sub">surtout bureaux</text>
        <text x={96} y={304} textAnchor="middle" className="ill-sub">et commerces</text>
        <path d="M 191 276 H 208 V 40 H 199 m 8 -7 l -8 7 l 8 7" {...arrow} />
        <text x={216} y={140} textAnchor="start" className="ill-in">les loyers</text>
        <text x={216} y={158} textAnchor="start" className="ill-in">financent les</text>
        <text x={216} y={176} textAnchor="start" className="ill-in">dividendes versés</text>
        <text x={216} y={194} textAnchor="start" className="ill-in">aux actionnaires</text>
        <text x={170} y={342} textAnchor="middle" className="ill-sub">Schéma de principe, sans chiffre</text>
      </svg>
    </figure>
  );
}

/** Schéma « Capital-investissement : de l’épargne à la revente » : repris de l’AMF (page « Capital-investissement : FCPR, FCPI, FIP », consultée le 2026-11-05) : 50 % minimum de titres non cotés pour un FCPR, pas de rachat en cours de vie du fonds, durée de vie pouvant atteindre 10 ans, voire plus. */
/* ViewBox 340 (chantier 112, étape 8) : deux colonnes plus étroites, mêmes textes coupés en deux lignes quand il le faut. */
export function SchemaCapitalInvestissement() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 414" role="img" aria-labelledby="ill-ci-t ill-ci-d" className="ill-svg">
        <title id="ill-ci-t">Capital-investissement : l’argent est bloqué pendant la vie du fonds</title>
        <desc id="ill-ci-d">Vous achetez des parts d’un fonds de capital-investissement. Le fonds investit dans des sociétés non cotées : au moins la moitié de son actif pour un FCPR. Pendant la vie du fonds, qui peut atteindre 10 ans, voire plus, vous ne pouvez pas obtenir le rachat de vos parts. Vous récupérez votre argent à la fin, quand le fonds a revendu ses titres et est dissous. Vous pouvez perdre une partie ou la totalité de votre mise.</desc>
        <rect x={1} y={2} width={180} height={74} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={91} y={26} textAnchor="middle" className="ill-step">Vous</text>
        <text x={91} y={48} textAnchor="middle" className="ill-sub">achetez des parts</text>
        <text x={91} y={65} textAnchor="middle" className="ill-sub">du fonds</text>
        <path d="M 91 76 V 112 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <text x={101} y={99} textAnchor="start" className="ill-in">votre argent</text>
        <rect x={1} y={112} width={180} height={64} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={91} y={138} textAnchor="middle" className="ill-step">Le fonds</text>
        <text x={91} y={160} textAnchor="middle" className="ill-sub">FCPR, FCPI ou FIP</text>
        <path d="M 91 176 V 212 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <text x={101} y={199} textAnchor="start" className="ill-in">il investit</text>
        <rect x={1} y={212} width={180} height={96} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={91} y={238} textAnchor="middle" className="ill-step">Des sociétés</text>
        <text x={91} y={256} textAnchor="middle" className="ill-step">non cotées</text>
        <text x={91} y={279} textAnchor="middle" className="ill-sub">50 % minimum</text>
        <text x={91} y={296} textAnchor="middle" className="ill-sub">pour un FCPR</text>
        <rect x={192} y={2} width={147} height={306} rx={12} fill="var(--surface-2)" stroke="var(--line)" strokeWidth={2} />
        <text x={265.5} y={34} textAnchor="middle" className="ill-step">Pendant la vie</text>
        <text x={265.5} y={54} textAnchor="middle" className="ill-step">du fonds</text>
        <text x={265.5} y={92} textAnchor="middle" className="ill-in">aucun rachat</text>
        <text x={265.5} y={110} textAnchor="middle" className="ill-in">possible</text>
        <text x={265.5} y={138} textAnchor="middle" className="ill-sub">durée : jusqu’à</text>
        <text x={265.5} y={156} textAnchor="middle" className="ill-sub">10 ans, voire plus</text>
        <path d="M 265.5 174 V 214 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <text x={265.5} y={244} textAnchor="middle" className="ill-in">À la fin : le fonds</text>
        <text x={265.5} y={262} textAnchor="middle" className="ill-in">revend ses titres,</text>
        <text x={265.5} y={280} textAnchor="middle" className="ill-in">puis il est dissous</text>
        <rect x={1} y={324} width={338} height={56} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={170} y={347} textAnchor="middle" className="ill-in">Risque : perdre une partie</text>
        <text x={170} y={366} textAnchor="middle" className="ill-in">ou la totalité de la mise</text>
        <text x={170} y={404} textAnchor="middle" className="ill-sub">Schéma de principe d’après l’AMF</text>
      </svg>
    </figure>
  );
}

/** Schéma « PER : déduire à l’entrée, bloqué, imposé à la sortie » : principe qualitatif (aucun chiffre), repris de Service-Public.fr (fiche F34982, vérifiée le 12 octobre 2026, consultée le 2026-11-15) : versements volontaires déductibles du revenu imposable ou non (renonciation possible), PER bloqué jusqu’à la retraite sauf accident de la vie et achat de la résidence principale, sortie en capital, en rente viagère ou partiellement en capital et en rente, versements déduits imposés au barème de l’impôt sur le revenu.
 * ViewBox 340 : à 375 px, le dessin s'affiche presque à sa taille (textes ~12 à 14,5 px au lieu de ~11 px avec l'ancien viewBox 420). */
export function SchemaPer() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 368" role="img" aria-labelledby="ill-per-t ill-per-d" className="ill-svg">
        <title id="ill-per-t">PER : un impôt réduit à l’entrée, de l’argent bloqué, une sortie imposée</title>
        <desc id="ill-per-d">Pendant votre vie active, vous versez de l’argent sur votre PER. Ces versements peuvent être déduits de votre revenu imposable, ce qui réduit votre impôt de l’année ; vous pouvez aussi y renoncer. L’épargne reste ensuite bloquée jusqu’à la retraite, sauf cas prévus : accident de la vie ou achat de la résidence principale. À la retraite, vous récupérez l’épargne en capital, en rente viagère ou en partie des deux. La sortie est imposée : les versements déduits sont ajoutés à vos revenus imposables de l’année.</desc>
        <rect x={1} y={2} width={338} height={98} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={170} y={27} textAnchor="middle" className="ill-step">1. Vous versez sur votre PER</text>
        <text x={170} y={51} textAnchor="middle" className="ill-in">Versement déductible du revenu imposable</text>
        <text x={170} y={71} textAnchor="middle" className="ill-sub">votre impôt de l’année baisse</text>
        <text x={170} y={88} textAnchor="middle" className="ill-sub">(vous pouvez aussi renoncer à la déduction)</text>
        <path d="M 170 100 V 126 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={1} y={126} width={338} height={96} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={170} y={151} textAnchor="middle" className="ill-step">2. Jusqu’à la retraite :</text>
        <text x={170} y={170} textAnchor="middle" className="ill-step">épargne bloquée</text>
        <text x={170} y={194} textAnchor="middle" className="ill-sub">Sauf cas prévus : accident de la vie,</text>
        <text x={170} y={211} textAnchor="middle" className="ill-sub">achat de la résidence principale</text>
        <path d="M 170 222 V 248 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <text x={184} y={240} textAnchor="start" className="ill-sub">départ à la retraite</text>
        <rect x={1} y={248} width={338} height={86} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={170} y={273} textAnchor="middle" className="ill-step">3. Vous récupérez l’épargne</text>
        <text x={170} y={297} textAnchor="middle" className="ill-in">En capital, en rente viagère ou les deux</text>
        <text x={170} y={319} textAnchor="middle" className="ill-sub">La sortie est imposée</text>
        <text x={170} y={360} textAnchor="middle" className="ill-sub">Schéma de principe d’après Service-Public.fr</text>
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
/* ViewBox 340 (chantier 112, étape 3) : à 375 px, les textes s'affichent presque à leur taille
 * (≈ 11,2 px et cadres collés aux bords avec l'ancien viewBox 420). Mêmes textes et mêmes règles. */
export function SchemaLmnp() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const L = 1;
  const R = 175;
  const BW = 164;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 312" role="img" aria-labelledby="ill-lmnp-t ill-lmnp-d" className="ill-svg">
        <title id="ill-lmnp-t">LMNP : deux façons de calculer le revenu imposable</title>
        <desc id="ill-lmnp-d">Dans les deux cas, on part des loyers encaissés. Au régime micro-BIC, on retire un abattement forfaitaire pour frais : aucun justificatif à fournir. Au régime réel, on retire les charges réelles, dont l’amortissement du logement et des meubles : il faut pouvoir les justifier. Ce qui reste est le revenu imposable.</desc>
        <rect x={1} y={2} width={338} height={50} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={170} y={32} textAnchor="middle" className="ill-step">Loyers encaissés dans l’année</text>
        <path d={`M ${L + BW / 2} 52 V 80 m -7 -8 l 7 8 l 7 -8 M ${R + BW / 2} 52 V 80 m -7 -8 l 7 8 l 7 -8`} {...arrow} />
        <rect x={L} y={80} width={BW} height={154} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={L + BW / 2} y={106} textAnchor="middle" className="ill-step">Micro-BIC</text>
        <text x={L + BW / 2} y={134} textAnchor="middle" className="ill-in">On retire un</text>
        <text x={L + BW / 2} y={152} textAnchor="middle" className="ill-in">abattement</text>
        <text x={L + BW / 2} y={170} textAnchor="middle" className="ill-in">forfaitaire</text>
        <text x={L + BW / 2} y={198} textAnchor="middle" className="ill-sub">Simple : pas de</text>
        <text x={L + BW / 2} y={216} textAnchor="middle" className="ill-sub">frais à justifier</text>
        <rect x={R} y={80} width={BW} height={154} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={R + BW / 2} y={106} textAnchor="middle" className="ill-step">Régime réel</text>
        <text x={R + BW / 2} y={134} textAnchor="middle" className="ill-in">On retire les charges</text>
        <text x={R + BW / 2} y={152} textAnchor="middle" className="ill-in">réelles et</text>
        <text x={R + BW / 2} y={170} textAnchor="middle" className="ill-in">l’amortissement</text>
        <text x={R + BW / 2} y={198} textAnchor="middle" className="ill-sub">du logement et des</text>
        <text x={R + BW / 2} y={216} textAnchor="middle" className="ill-sub">meubles ; à justifier</text>
        <path d="M 170 234 V 252 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={1} y={254} width={338} height={38} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={170} y={278} textAnchor="middle" className="ill-step">= revenu imposable (BIC)</text>
        <text x={170} y={308} textAnchor="middle" className="ill-sub">Schéma de principe d’après Service-Public.fr</text>
      </svg>
    </figure>
  );
}

/** Schéma « Location nue : micro-foncier ou régime réel » : repris de Service-Public.fr (fiche F1991 « Revenus locatifs (location non meublée) », vérifiée le 15 avril 2026, consultée le 2026-11-07) : micro-foncier jusqu’à 15 000 € de revenus fonciers, abattement forfaitaire de 30 %, travaux et charges non déductibles ; régime réel au-delà de 15 000 €, option possible en dessous (irrévocable pendant 3 ans), recettes diminuées des frais et charges réels et justifiés. */
/* ViewBox 340 (chantier 112, étape 3) : à 375 px, les textes s'affichent presque à leur taille
 * (≈ 11,2 px et cadres collés aux bords avec l'ancien viewBox 420). Mêmes textes et mêmes règles. */
export function SchemaLocationNue() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const L = 1;
  const R = 175;
  const BW = 164;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 338" role="img" aria-labelledby="ill-ln-t ill-ln-d" className="ill-svg">
        <title id="ill-ln-t">Location nue : micro-foncier ou régime réel</title>
        <desc id="ill-ln-d">On part des loyers encaissés. Jusqu’à 15 000 euros de revenus fonciers bruts par an, le micro-foncier s’applique : un abattement forfaitaire de 30 pour cent est retiré et les travaux et charges ne sont pas déductibles. Au-delà de 15 000 euros, le régime réel s’applique, et on peut aussi le choisir en dessous, pour trois ans minimum : on retire les frais et charges réels et justifiés. Ce qui reste est le revenu foncier imposable.</desc>
        <rect x={1} y={2} width={338} height={50} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={170} y={32} textAnchor="middle" className="ill-step">Loyers encaissés dans l’année</text>
        <path d={`M ${L + BW / 2} 52 V 80 m -7 -8 l 7 8 l 7 -8 M ${R + BW / 2} 52 V 80 m -7 -8 l 7 8 l 7 -8`} {...arrow} />
        <rect x={L} y={80} width={BW} height={178} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={L + BW / 2} y={106} textAnchor="middle" className="ill-step">Micro-foncier</text>
        <text x={L + BW / 2} y={126} textAnchor="middle" className="ill-sub">jusqu’à 15 000 €</text>
        <text x={L + BW / 2} y={143} textAnchor="middle" className="ill-sub">par an</text>
        <text x={L + BW / 2} y={170} textAnchor="middle" className="ill-in">On retire un</text>
        <text x={L + BW / 2} y={188} textAnchor="middle" className="ill-in">abattement de 30 %</text>
        <text x={L + BW / 2} y={216} textAnchor="middle" className="ill-sub">Travaux et charges</text>
        <text x={L + BW / 2} y={233} textAnchor="middle" className="ill-sub">non déductibles</text>
        <text x={L + BW / 2} y={250} textAnchor="middle" className="ill-sub">en plus</text>
        <rect x={R} y={80} width={BW} height={178} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={R + BW / 2} y={106} textAnchor="middle" className="ill-step">Régime réel</text>
        <text x={R + BW / 2} y={126} textAnchor="middle" className="ill-sub">au-delà de 15 000 €</text>
        <text x={R + BW / 2} y={143} textAnchor="middle" className="ill-sub">par an</text>
        <text x={R + BW / 2} y={170} textAnchor="middle" className="ill-in">On retire les frais</text>
        <text x={R + BW / 2} y={188} textAnchor="middle" className="ill-in">et charges réels</text>
        <text x={R + BW / 2} y={216} textAnchor="middle" className="ill-sub">À justifier ; choix</text>
        <text x={R + BW / 2} y={233} textAnchor="middle" className="ill-sub">possible en dessous,</text>
        <text x={R + BW / 2} y={250} textAnchor="middle" className="ill-sub">pour 3 ans</text>
        <path d="M 170 258 V 276 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={1} y={278} width={338} height={38} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={170} y={302} textAnchor="middle" className="ill-step">= revenu foncier imposable</text>
        <text x={170} y={334} textAnchor="middle" className="ill-sub">Schéma de principe d’après Service-Public.fr</text>
      </svg>
    </figure>
  );
}

/** Schéma « ETF : un fonds qui suit un indice, acheté en Bourse comme une action » : principe qualitatif (aucun chiffre), repris de l’AMF (communiqué « ETF et risques associés », 14 février 2017, consulté le 2026-11-05) : un fonds indiciel coté vise à répliquer la performance d’un indice de référence, en achetant les titres qui le composent ou par réplication synthétique ; il est négociable en Bourse comme une simple action. */
/* ViewBox 340 (comme les schémas PEL, LEP et Livret A) : à 375 px, les textes s'affichent presque à leur taille
 * (≈ 13 à 15 px au lieu de ≈ 11,2 px avec l'ancien viewBox 420). */
export function SchemaEtf() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const titres = Array.from({ length: 8 }, (_, i) => 101 + i * 18);
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 352" role="img" aria-labelledby="ill-etf-t ill-etf-d" className="ill-svg">
        <title id="ill-etf-t">ETF : un fonds qui suit un indice, acheté en Bourse</title>
        <desc id="ill-etf-d">Un indice de référence mesure l’évolution d’un ensemble d’entreprises. Le fonds ETF cherche à en répliquer la performance, en achetant les titres de l’indice ou par des produits dérivés. Vous achetez des parts du fonds en Bourse, comme une action : vous suivez l’indice, à la hausse comme à la baisse.</desc>
        <rect x={1} y={2} width={338} height={66} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={170} y={28} textAnchor="middle" className="ill-step">Un indice de référence</text>
        {titres.map((x) => <rect key={x} x={x} y={40} width={12} height={12} rx={3} fill="var(--accent)" opacity={0.55} />)}
        <path d="M 170 68 V 92 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={1} y={94} width={338} height={146} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={170} y={120} textAnchor="middle" className="ill-step">Le fonds (ETF)</text>
        <text x={170} y={146} textAnchor="middle" className="ill-in">Il cherche à répliquer</text>
        <text x={170} y={164} textAnchor="middle" className="ill-in">la performance de l’indice</text>
        <text x={170} y={192} textAnchor="middle" className="ill-sub">en achetant les titres de l’indice</text>
        <text x={170} y={210} textAnchor="middle" className="ill-sub">ou par des produits dérivés</text>
        <text x={170} y={228} textAnchor="middle" className="ill-sub">(réplication synthétique)</text>
        <path d="M 170 240 V 264 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={1} y={266} width={338} height={60} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={170} y={290} textAnchor="middle" className="ill-step">Vous : achat de parts en Bourse</text>
        <text x={170} y={312} textAnchor="middle" className="ill-sub">comme une action : vous suivez l’indice</text>
        <text x={170} y={348} textAnchor="middle" className="ill-sub">Schéma de principe d’après l’AMF</text>
      </svg>
    </figure>
  );
}

/** Schéma « Cryptos : passer par un prestataire agréé, sans garantie des dépôts » : principe qualitatif (aucun chiffre), repris de l’AMF (« Investir en crypto-actifs : quel professionnel choisir ? », 27 juillet 2026, consulté le 2026-11-06) : depuis le 1er juillet 2026, il faut le statut PSCA (agrément AMF en France) pour proposer des services sur crypto-actifs ; le FGDR ne couvre pas les crypto-actifs en cas de faillite de la plateforme. */
export function SchemaCrypto() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 362" role="img" aria-labelledby="ill-cr-t ill-cr-d" className="ill-svg">
        <title id="ill-cr-t">Cryptos : passer par un prestataire agréé, sans garantie des dépôts</title>
        <desc id="ill-cr-d">Pour acheter des crypto-actifs, vous passez par un prestataire de services sur crypto-actifs (PSCA), agréé par l’AMF en France. Depuis le 1er juillet 2026, l’ancien statut PSAN ne suffit plus. Attention : si la plateforme fait faillite, le fonds de garantie des dépôts (FGDR) ne couvre pas les crypto-actifs.</desc>
        <rect x={1} y={2} width={338} height={48} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={170} y={31} textAnchor="middle" className="ill-step">Vous</text>
        <path d="M 170 50 V 74 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={1} y={76} width={338} height={128} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={170} y={102} textAnchor="middle" className="ill-step">Un prestataire agréé (PSCA)</text>
        <text x={170} y={128} textAnchor="middle" className="ill-in">Agrément de l’AMF en France</text>
        <text x={170} y={156} textAnchor="middle" className="ill-sub">Depuis le 1er juillet 2026, l’ancien</text>
        <text x={170} y={174} textAnchor="middle" className="ill-sub">statut PSAN ne suffit plus : à vérifier</text>
        <text x={170} y={192} textAnchor="middle" className="ill-sub">sur la liste blanche de l’AMF</text>
        <path d="M 170 204 V 228 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={1} y={230} width={338} height={98} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={170} y={254} textAnchor="middle" className="ill-step">Vos crypto-actifs :</text>
        <text x={170} y={274} textAnchor="middle" className="ill-step">aucune garantie des dépôts</text>
        <text x={170} y={298} textAnchor="middle" className="ill-sub">le FGDR ne les couvre pas</text>
        <text x={170} y={316} textAnchor="middle" className="ill-sub">si la plateforme fait faillite</text>
        <text x={170} y={356} textAnchor="middle" className="ill-sub">Schéma de principe d’après l’AMF</text>
      </svg>
    </figure>
  );
}

/** Schéma « Obligation : prêter, puis le prix selon les taux » : principe qualitatif (aucun chiffre), repris de La finance pour tous (page « Obligations », « effet balançoire »). */
export function SchemaObligation() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 328" role="img" aria-labelledby="ill-ob-t ill-ob-d" className="ill-svg">
        <title id="ill-ob-t">Une obligation : un prêt, et un prix qui varie avec les taux</title>
        <desc id="ill-ob-d">En achetant une obligation, vous prêtez de l’argent à un État ou à une entreprise, qui vous verse des intérêts (coupons) puis vous rembourse à l’échéance. Si vous revendez avant l’échéance, le prix dépend des taux : quand les taux montent, le prix des obligations déjà émises baisse ; quand les taux baissent, il monte.</desc>
        <rect x={1} y={20} width={124} height={60} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={63} y={46} textAnchor="middle" className="ill-step">Vous</text>
        <text x={63} y={66} textAnchor="middle" className="ill-sub">le prêteur</text>
        <rect x={215} y={20} width={124} height={60} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={277} y={46} textAnchor="middle" className="ill-step">L’émetteur</text>
        <text x={277} y={66} textAnchor="middle" className="ill-sub">État, entreprise</text>
        <text x={170} y={14} textAnchor="middle" className="ill-in">vous prêtez</text>
        <path d="M 132 36 H 207 m -8 -7 l 8 7 l -8 7" {...arrow} />
        <path d="M 208 64 H 133 m 8 -7 l -8 7 l 8 7" {...arrow} />
        <text x={170} y={100} textAnchor="middle" className="ill-in">intérêts (coupons)</text>
        <text x={170} y={116} textAnchor="middle" className="ill-in">puis remboursement</text>
        <line x1={1} y1={134} x2={339} y2={134} stroke="var(--line)" strokeWidth={2} strokeDasharray="4 6" />
        <text x={170} y={160} textAnchor="middle" className="ill-step">Si vous revendez avant l’échéance</text>
        <text x={170} y={180} textAnchor="middle" className="ill-sub">le prix suit les taux, comme une balançoire</text>
        <rect x={1} y={196} width={162} height={100} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={82} y={222} textAnchor="middle" className="ill-step">Les taux montent</text>
        <path d="M 82 234 V 262 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <text x={82} y={284} textAnchor="middle" className="ill-step">le prix baisse</text>
        <rect x={177} y={196} width={162} height={100} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={258} y={222} textAnchor="middle" className="ill-step">Les taux baissent</text>
        <path d="M 258 262 V 234 m -7 8 l 7 -8 l 7 8" {...arrow} />
        <text x={258} y={284} textAnchor="middle" className="ill-step">le prix monte</text>
        <text x={170} y={322} textAnchor="middle" className="ill-sub">Schéma de principe, sans chiffre</text>
      </svg>
    </figure>
  );
}

/**
 * Schéma « Obligation : ce que vous recevez, et ce que vous risquez en revendant avant » (exemple fictif de la fiche,
 * constat du 2026-11-17 : le paragraphe de l'exemple restait abstrait). Coupons et remboursement recalculés par
 * `bondCoupons`, perte du fonds par `sensitivityChangePct` (sources : `OBLIGATION_EXAMPLE`). Les deux barres du bas sont
 * proportionnelles à la valeur du fonds.
 */
export function SchemaObligationBilan({ children }: { children: ReactNode }) {
  const { amount, ratePct, years, sensitivity, rateRisePoints } = OBLIGATION_EXAMPLE;
  const { coupon, totalCoupons, received } = bondCoupons(amount, ratePct, years);
  const change = sensitivityChangePct(sensitivity, rateRisePoints);
  const after = 100 + change;
  const pct = (n: number) => `${n.toLocaleString('fr-FR')}\u00a0%`;
  const kept = (338 * after) / 100;
  const ans = Array.from({ length: years }, (_, k) => k + 1);
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 356" role="img" aria-labelledby="ill-obb-t ill-obb-d" className="ill-svg">
        <title id="ill-obb-t">Obligation : ce que vous recevez, et ce que vous risquez en revendant avant</title>
        <desc id="ill-obb-d">{`Exemple fictif. Gardée jusqu’à l’échéance, une obligation de ${fmtEur(amount)} à ${ratePct} % sur ${years} ans verse ${fmtEur(coupon)} chaque année, puis rend les ${fmtEur(amount)} la dernière année : ${fmtEur(received)} reçus au total, dont ${fmtEur(totalCoupons)} d’intérêts, si l’émetteur rembourse, avant impôt et frais. Revendu avant l’échéance, un fonds obligataire de sensibilité ${sensitivity} perd environ ${pct(-change)} de sa valeur si les taux montent brutalement de ${rateRisePoints} point : il ne vaut plus qu’environ ${pct(after)} de sa valeur d’avant.`}</desc>
        <text x={0} y={16} className="ill-year" textAnchor="start">Gardée jusqu’à l’échéance</text>
        <text x={339} y={16} className="ill-sub" textAnchor="end">un coupon par an</text>
        {ans.map((a) => {
          const x = 1 + (a - 1) * 68;
          return (
            <g key={a}>
              <rect x={x} y={28} width={62} height={30} rx={8} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
              <text x={x + 31} y={48} className="ill-in" textAnchor="middle">{fmtEur(coupon)}</text>
              <text x={x + 31} y={76} className="ill-sub" textAnchor="middle">{`an ${a}`}</text>
            </g>
          );
        })}
        <rect x={1} y={88} width={338} height={34} rx={8} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={170} y={110} className="ill-step" textAnchor="middle">{`an ${years} : vos ${fmtEur(amount)} vous sont rendus`}</text>
        <text x={0} y={150} className="ill-total" textAnchor="start" style={{ fill: 'var(--accent)' }}>{`Reçu au total : ${fmtEur(received)}`}</text>
        <text x={0} y={170} className="ill-sub" textAnchor="start">{`pour ${fmtEur(amount)} prêtés, si l’émetteur rembourse`}</text>
        <text x={0} y={188} className="ill-sub" textAnchor="start">avant impôt et frais</text>
        <line x1={1} y1={204} x2={339} y2={204} stroke="var(--line)" strokeWidth={2} strokeDasharray="4 6" />
        <text x={0} y={228} className="ill-year" textAnchor="start">{`Revendu avant : un fonds de sensibilité ${sensitivity}`}</text>
        <text x={0} y={248} className="ill-sub" textAnchor="start">{`les taux montent brutalement de ${rateRisePoints}\u00a0point`}</text>
        <rect x={1} y={260} width={338} height={28} rx={6} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={10} y={279} className="ill-in" textAnchor="start">{`valeur du fonds avant : ${pct(100)}`}</text>
        <rect x={1} y={298} width={kept} height={28} rx={6} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <rect x={1 + kept} y={298} width={338 - kept} height={28} rx={4} fill="var(--danger)" />
        <text x={10} y={317} className="ill-in" textAnchor="start">{`après : environ ${pct(after)}`}</text>
        <text x={0} y={348} className="ill-sub" textAnchor="start">si vous vendez à ce moment</text>
        <text x={339} y={348} className="ill-loss" textAnchor="end">{`environ \u2212${pct(-change)}`}</text>
      </svg>
      <figcaption>{children}</figcaption>
    </figure>
  );
}

/**
 * Schéma « ETF : ce que deviennent 200 € par mois » (exemple fictif de la fiche, constat du 2026-11-17 : l'exemple tenait
 * en une ligne, sans dessin, sur une fiche d'entrée). Valeurs recalculées par `etfMilestones` (sources : `ETF_EXAMPLE`).
 * Chaque barre est proportionnelle à la valeur : versements à gauche, gains à droite ; la dernière barre montre la même
 * valeur après une baisse supposée, part perdue en rouge, et la ligne pointillée marque les sommes versées.
 */
export function SchemaEtfBilan({ children }: { children: ReactNode }) {
  const { monthly, ratePct, years, step, dropPct } = ETF_EXAMPLE;
  const { milestones, afterDrop } = etfMilestones(monthly, ratePct, years, step, dropPct);
  const last = milestones[milestones.length - 1];
  const X = 40;
  const scale = 230 / last.value;
  const versedX = X + last.contributed * scale;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 356" role="img" aria-labelledby="ill-etfb-t ill-etfb-d" className="ill-svg">
        <title id="ill-etfb-t">{`ETF : ce que deviennent ${fmtEur(monthly)} par mois en ${years} ans`}</title>
        <desc id="ill-etfb-d">{`Exemple fictif, à ${ratePct} % par an nets de frais, avant impôt. ${milestones.map((m) => `Après ${m.year} ans : ${fmtEur(m.contributed)} versés, environ ${fmtEur(m.value)}`).join(' ; ')}. Les gains, environ ${fmtEur(last.gains)}, arrivent surtout à la fin. Si la Bourse baisse de ${dropPct} % l’année ${years}, il reste environ ${fmtEur(afterDrop)}, plus que les ${fmtEur(last.contributed)} versés.`}</desc>
        <text x={0} y={16} className="ill-year" textAnchor="start">{`${fmtEur(monthly)} par mois, ${ratePct} % par an`}</text>
        <rect x={1} y={27} width={14} height={14} rx={3} fill="var(--surface-2)" stroke="var(--primary)" strokeWidth={2} />
        <text x={21} y={39} className="ill-sub" textAnchor="start">vos versements</text>
        <rect x={151} y={27} width={14} height={14} rx={3} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={171} y={39} className="ill-sub" textAnchor="start">les gains</text>
        {milestones.map((m, i) => {
          const y = 54 + i * 38;
          const wc = m.contributed * scale;
          const wg = m.gains * scale;
          return (
            <g key={m.year}>
              <text x={0} y={y + 16} className="ill-sub" textAnchor="start">{`an ${m.year}`}</text>
              <rect x={X} y={y} width={wc} height={22} rx={4} fill="var(--surface-2)" stroke="var(--primary)" strokeWidth={2} />
              <rect x={X + wc} y={y} width={wg} height={22} rx={4} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
              <text x={339} y={y + 16} className="ill-in" textAnchor="end">{fmtEur(m.value)}</text>
            </g>
          );
        })}
        <text x={0} y={216} className="ill-total" textAnchor="start" style={{ fill: 'var(--accent)' }}>{`Gains en ${years} ans : ${fmtEur(last.gains)}`}</text>
        <text x={0} y={236} className="ill-sub" textAnchor="start">{`presque la moitié pendant les ${step} dernières années`}</text>
        <line x1={1} y1={252} x2={339} y2={252} stroke="var(--line)" strokeWidth={2} strokeDasharray="4 6" />
        <text x={0} y={276} className="ill-year" textAnchor="start">{`Si la Bourse baisse de ${dropPct} % l’année ${years}`}</text>
        <text x={0} y={304} className="ill-sub" textAnchor="start">{`an ${years}`}</text>
        <rect x={X} y={288} width={afterDrop * scale} height={22} rx={4} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <rect x={X + afterDrop * scale} y={288} width={(last.value - afterDrop) * scale} height={22} rx={4} fill="var(--danger)" />
        <text x={339} y={304} className="ill-in" textAnchor="end">{fmtEur(afterDrop)}</text>
        <path d={`M ${versedX} 284 V 318`} stroke="var(--ink-2)" strokeWidth={1.5} strokeDasharray="4 3" />
        <text x={versedX} y={332} className="ill-sub" textAnchor="middle">{`${fmtEur(last.contributed)} versés`}</text>
        <text x={0} y={352} className="ill-sub" textAnchor="start">moins qu’espéré, mais plus que le versé</text>
      </svg>
      <figcaption>{children}</figcaption>
    </figure>
  );
}

/**
 * Schéma « Assurance-vie : sur un retrait, seuls les gains sont imposés » (exemple fictif de la fiche, constat du
 * 2026-11-18 : seule grande fiche d'enveloppe dont l'exemple restait un paragraphe). Valeurs de `ASSURANCE_VIE_EXAMPLE`,
 * recalculées par `assuranceVieRetrait` ; barre du haut proportionnelle aux montants, jauge proportionnelle à
 * l'abattement. Aucun chiffre réglementaire nouveau : 4 600 € et 17,2 % viennent de la rubrique Fiscalité de la fiche.
 */
export function SchemaAssuranceVieBilan({ children }: { children: ReactNode }) {
  const { paid, value, allowance, socialPct } = ASSURANCE_VIE_EXAMPLE;
  const r = assuranceVieRetrait(paid, value, allowance, socialPct);
  const X0 = 10;
  const W = 320;
  const wPaid = (paid / value) * W;
  const wUsed = (Math.min(r.gains, allowance) / allowance) * W;
  const pct = String(socialPct).replace('.', ',');
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 316" role="img" aria-labelledby="ill-avb-t ill-avb-d" className="ill-svg">
        <title id="ill-avb-t">{`Assurance-vie : sur un retrait de ${fmtEur(value)}, seuls les ${fmtEur(r.gains)} de gains sont imposés`}</title>
        <desc id="ill-avb-d">{`Exemple fictif : ${fmtEur(paid)} versés il y a plus de 8 ans valent ${fmtEur(value)}, retirés en totalité. Les ${fmtEur(paid)} de versements reviennent sans impôt. Les ${fmtEur(r.gains)} de gains restent sous l’abattement annuel de ${fmtEur(allowance)} : pas d’impôt sur le revenu. Les prélèvements sociaux de ${pct} % prennent ${fmtEur(r.social)}. Il reste ${fmtEur(r.net)}.`}</desc>
        <text x={X0} y={20} className="ill-step">{`Vous retirez ${fmtEur(value)} (exemple fictif)`}</text>
        <rect x={X0} y={32} width={wPaid} height={44} rx={6} fill="var(--surface-2)" stroke="var(--primary)" strokeWidth={2} />
        <rect x={X0 + wPaid} y={32} width={W - wPaid} height={44} rx={6} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={X0 + wPaid / 2} y={59} textAnchor="middle" className="ill-total">{`${fmtEur(paid)} versés`}</text>
        <text x={X0 + wPaid + (W - wPaid) / 2} y={59} textAnchor="middle" className="ill-total">{fmtEur(r.gains)}</text>
        <text x={X0} y={96} className="ill-sub" textAnchor="start">versements : rendus sans impôt</text>
        <text x={X0 + W} y={96} className="ill-sub" textAnchor="end">gains : imposés</text>
        <line x1={X0} y1={112} x2={X0 + W} y2={112} stroke="var(--line)" strokeWidth={1} />
        <text x={X0} y={136} className="ill-step">{`Impôt sur le revenu : ${fmtEur(r.overAllowance)}`}</text>
        <rect x={X0} y={148} width={W} height={16} rx={8} fill="var(--surface-2)" stroke="var(--line)" strokeWidth={1.5} />
        <rect x={X0} y={148} width={wUsed} height={16} rx={8} fill="var(--accent)" />
        <text x={X0} y={184} className="ill-sub" textAnchor="start">{`${fmtEur(r.gains)} de gains`}</text>
        <text x={X0 + W} y={184} className="ill-sub" textAnchor="end">{`${fmtEur(allowance)} exonérés`}</text>
        <text x={X0} y={202} className="ill-sub" textAnchor="start">abattement annuel après 8 ans, personne seule</text>
        <line x1={X0} y1={218} x2={X0 + W} y2={218} stroke="var(--line)" strokeWidth={1} />
        <text x={X0} y={242} className="ill-step">{`Prélèvements sociaux : ${fmtEur(r.social)}`}</text>
        <text x={X0} y={260} className="ill-sub" textAnchor="start">{`${pct} % des ${fmtEur(r.gains)} de gains`}</text>
        <line x1={X0} y1={276} x2={X0 + W} y2={276} stroke="var(--line)" strokeWidth={1} />
        <text x={X0} y={302} className="ill-total" textAnchor="start" style={{ fill: 'var(--accent)' }}>{`Il vous reste ${fmtEur(r.net)} sur ${fmtEur(value)}`}</text>
      </svg>
      <figcaption>{children}</figcaption>
    </figure>
  );
}

export const CTO_EXAMPLE_GAIN = 1000;

/** Schéma « Compte-titres : sur un gain, ce qui reste après le PFU » : exemple fictif de 1 000 € de plus-value réalisée, taux de 2026 (12,8 % + 18,6 % = 31,4 %, Service-Public F21618, consulté le 2026-11-06). Chiffres recalculés par src/cto.test.ts.
 * ViewBox 340 (chantier 112) : à 375 px, les textes s'affichent presque à leur taille (≈ 13 à 14,5 px au lieu de ≈ 11,2 px
 * avec l'ancien viewBox 420). Mêmes chiffres et mêmes règles ; barre toujours proportionnelle aux montants. */
export function SchemaCto() {
  const r = pfuSplit(CTO_EXAMPLE_GAIN);
  const X0 = 10;
  const W = 320;
  const wIr = (r.ir / CTO_EXAMPLE_GAIN) * W;
  const wPs = (r.ps / CTO_EXAMPLE_GAIN) * W;
  const wNet = W - wIr - wPs;
  const COL2 = 176;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 222" role="img" aria-labelledby="ill-cto-t ill-cto-d" className="ill-svg">
        <title id="ill-cto-t">{`Compte-titres : sur un gain de ${fmtEur(CTO_EXAMPLE_GAIN)}, il vous reste ${fmtEur(r.net)}`}</title>
        <desc id="ill-cto-d">{`Exemple fictif : vous vendez des titres avec ${fmtEur(CTO_EXAMPLE_GAIN)} de plus-value. Le prélèvement forfaitaire unique de 31,4 % retire ${fmtEur(r.ir)} d’impôt sur le revenu (12,8 %) et ${fmtEur(r.ps)} de prélèvements sociaux (18,6 %), soit ${fmtEur(r.total)}. Il vous reste ${fmtEur(r.net)}.`}</desc>
        <text x={X0} y={20} className="ill-step">Un gain de {fmtEur(CTO_EXAMPLE_GAIN)} (exemple fictif)</text>
        <rect x={X0} y={32} width={wIr} height={44} fill="var(--warn)" />
        <rect x={X0 + wIr} y={32} width={wPs} height={44} fill="var(--primary)" />
        <rect x={X0 + wIr + wPs} y={32} width={wNet} height={44} fill="var(--accent)" />
        <rect x={X0} y={32} width={W} height={44} rx={8} fill="none" stroke="var(--ink-2)" strokeWidth={1.5} />
        <text x={X0 + wIr + wPs + wNet / 2} y={59} textAnchor="middle" className="ill-on-dark ill-total">{fmtEur(r.net)} pour vous</text>
        <path d={`M ${X0 + wIr / 2} 80 V 104`} fill="none" stroke="var(--warn)" strokeWidth={2} />
        <path d={`M ${X0 + wIr + wPs / 2} 80 V 92 H ${COL2 + 6} V 104`} fill="none" stroke="var(--primary)" strokeWidth={2} strokeLinejoin="round" />
        <text x={X0} y={124} className="ill-step">{fmtEur(r.ir)}</text>
        <text x={X0} y={142} className="ill-sub">impôt sur le revenu</text>
        <text x={X0} y={159} className="ill-sub">(12,8 %)</text>
        <text x={COL2} y={124} className="ill-step">{fmtEur(r.ps)}</text>
        <text x={COL2} y={142} className="ill-sub">prélèvements sociaux</text>
        <text x={COL2} y={159} className="ill-sub">(18,6 %)</text>
        <line x1={X0} y1={180} x2={X0 + W} y2={180} stroke="var(--line)" strokeWidth={1} />
        <text x={170} y={204} textAnchor="middle" className="ill-sub">Total retiré : {fmtEur(r.total)}, soit 31,4 % du gain</text>
      </svg>
      <figcaption>
        <strong>Illustration, exemple fictif</strong> : taux de 2026 sur une plus-value réalisée, sans option pour le barème progressif. Barre proportionnelle aux montants.
      </figcaption>
    </figure>
  );
}

/** Schéma « Actions en direct : répartir sur 15 lignes limite l’effet d’une défaillance » : reprend l’exemple fictif de la fiche (15 lignes de 1 000 €, perte maximale 1 000 €, soit 6,7 % de 15 000 €), recalculé par test. Aucune information factuelle nouvelle. */
export function SchemaActions() {
  const cells = Array.from({ length: 15 }, (_, i) => ({ x: 11 + (i % 5) * 65, y: 42 + Math.floor(i / 5) * 46, bad: i === 7 }));
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 300" role="img" aria-labelledby="ill-act-t ill-act-d" className="ill-svg">
        <title id="ill-act-t">Actions : une seule entreprise défaillante sur quinze</title>
        <desc id="ill-act-d">Exemple fictif : un portefeuille de quinze actions de 1 000 € chacune, soit 15 000 €. Si une seule entreprise fait défaillance, la perte est au plus de 1 000 €, soit 6,7 % du total.</desc>
        <text x={170} y={20} textAnchor="middle" className="ill-step">15 entreprises × 1 000 € = 15 000 €</text>
        {cells.map((c, i) => (
          <g key={i}>
            <rect x={c.x} y={c.y} width={58} height={36} rx={8} fill={c.bad ? 'var(--warn-soft)' : 'var(--accent-soft)'} stroke={c.bad ? 'var(--warn)' : 'var(--accent)'} strokeWidth={2} />
            <text x={c.x + 29} y={c.y + 23} textAnchor="middle" className="ill-in">{c.bad ? '0 €' : '1 000 €'}</text>
          </g>
        ))}
        <rect x={1} y={184} width={338} height={82} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={170} y={208} textAnchor="middle" className="ill-step">Une entreprise défaillante :</text>
        <text x={170} y={228} textAnchor="middle" className="ill-step">− 1 000 € au plus</text>
        <text x={170} y={252} textAnchor="middle" className="ill-sub">soit 6,7 % du total (1 000 € sur 15 000 €)</text>
        <text x={170} y={292} textAnchor="middle" className="ill-sub">Exemple fictif, schéma d’illustration</text>
      </svg>
    </figure>
  );
}

/** Montants de l'exemple fictif de la fiche Donation (Service-Public F14203 et F36656, consultés le 2026-11-06) : abattement parent → enfant 100 000 €, don familial d'argent 31 865 €. */
export const DONATION_ABATTEMENT = 100_000;

export const DONATION_DON_ARGENT = 31_865;

export const DONATION_PAR_PARENT = DONATION_ABATTEMENT + DONATION_DON_ARGENT;

export const DONATION_TOTAL_DEUX_PARENTS = 2 * DONATION_PAR_PARENT;

/** Schéma « Donation : deux parents, un enfant » : reprend l'exemple fictif de la fiche (2 × (100 000 € + 31 865 €) = 263 730 € sans droits), recalculé par test.
 * ViewBox 340 (chantier 112) : les deux parents côte à côte, l'enfant dessous ; à 375 px, les textes s'affichent presque
 * à leur taille (≈ 13 à 14,5 px au lieu de ≈ 11,2 px avec l'ancien viewBox 420). Mêmes montants et mêmes règles. */
export function SchemaDonation() {
  const parent = (x: number, n: number) => (
    <g key={n}>
      <rect x={x} y={4} width={156} height={142} rx={10} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
      <text x={x + 78} y={26} textAnchor="middle" className="ill-step">Parent {n}</text>
      <text x={x + 78} y={50} textAnchor="middle" className="ill-step">{fmtEur(DONATION_ABATTEMENT)}</text>
      <text x={x + 78} y={67} textAnchor="middle" className="ill-sub">d’abattement</text>
      <text x={x + 78} y={89} textAnchor="middle" className="ill-step">+ {fmtEur(DONATION_DON_ARGENT)}</text>
      <text x={x + 78} y={106} textAnchor="middle" className="ill-sub">don d’argent</text>
      <line x1={x + 14} y1={118} x2={x + 142} y2={118} stroke="var(--line)" strokeWidth={1.5} />
      <text x={x + 78} y={137} textAnchor="middle" className="ill-step">= {fmtEur(DONATION_PAR_PARENT)}</text>
      <path d={`M ${x + 78} 146 V 162 H 170 V 180`} fill="none" stroke="var(--primary)" strokeWidth={2} strokeLinejoin="round" />
    </g>
  );
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 308" role="img" aria-labelledby="ill-don-t ill-don-d" className="ill-svg">
        <title id="ill-don-t">{`Donation : deux parents peuvent donner ${fmtEur(DONATION_TOTAL_DEUX_PARENTS)} à un enfant sans droits`}</title>
        <desc id="ill-don-d">{`Exemple fictif : chaque parent de moins de 80 ans peut donner à son enfant majeur ${fmtEur(DONATION_ABATTEMENT)} (abattement) plus ${fmtEur(DONATION_DON_ARGENT)} (don familial d’argent), soit ${fmtEur(DONATION_PAR_PARENT)}. Pour deux parents, l’enfant reçoit ${fmtEur(DONATION_TOTAL_DEUX_PARENTS)} sans droits. Les abattements se renouvellent tous les 15 ans.`}</desc>
        {parent(4, 1)}
        {parent(180, 2)}
        <path d="M 164 174 L 170 181 L 176 174" fill="none" stroke="var(--primary)" strokeWidth={2} strokeLinejoin="round" />
        <rect x={70} y={184} width={200} height={76} rx={10} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={170} y={207} textAnchor="middle" className="ill-step">Enfant majeur</text>
        <text x={170} y={231} textAnchor="middle" className="ill-num">{fmtEur(DONATION_TOTAL_DEUX_PARENTS)}</text>
        <text x={170} y={250} textAnchor="middle" className="ill-sub">sans droits</text>
        <text x={170} y={283} textAnchor="middle" className="ill-sub">Abattements renouvelés tous les 15 ans.</text>
        <text x={170} y={302} textAnchor="middle" className="ill-sub">Parents de moins de 80 ans, enfant majeur.</text>
      </svg>
      <figcaption className="fig-short">
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

/* ViewBox 340 (chantier 112, étape 12) : à 375 px, les textes s'affichent presque à leur taille (≈ 12,5 à 14 px au lieu de
 * ≈ 11,2 px avec l'ancien viewBox 420). Mêmes chiffres et mêmes règles ; barres toujours proportionnelles aux montants. */
export function SchemaOr() {
  const taxe = orTaxe(OR_EXAMPLE_PRICE);
  const reste = OR_EXAMPLE_PRICE - taxe;
  const X0 = 6;
  const W = 328;
  const wTaxe = (taxe / OR_EXAMPLE_PRICE) * W;
  const cas = [
    { y: 0, titre: 'Cas A : pièce payée 1 900 €', gain: 'gain de 100 €' },
    { y: 110, titre: 'Cas B : pièce payée 1 000 €', gain: 'gain de 1 000 €' },
  ];
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 280" role="img" aria-labelledby="ill-or-t ill-or-d" className="ill-svg">
        <title id="ill-or-t">{`Or physique : la taxe forfaitaire est de ${fmtEur(taxe)} sur une vente à ${fmtEur(OR_EXAMPLE_PRICE)}, quel que soit le gain`}</title>
        <desc id="ill-or-d">{`Exemple fictif : une pièce d’or revendue ${fmtEur(OR_EXAMPLE_PRICE)} sous le régime forfaitaire. La taxe est de 11 % du prix de vente plus 0,5 % de CRDS, soit ${fmtEur(taxe)}, que le gain soit de 100 € ou de 1 000 €. Il reste ${fmtEur(reste)} au vendeur.`}</desc>
        {cas.map((c) => (
          <g key={c.y}>
            <text x={X0} y={c.y + 16} className="ill-step">{c.titre}</text>
            <text x={X0 + W} y={c.y + 16} textAnchor="end" className="ill-sub">{c.gain}</text>
            <rect x={X0} y={c.y + 28} width={W} height={38} fill="var(--accent)" />
            <rect x={X0} y={c.y + 28} width={wTaxe} height={38} fill="var(--warn)" />
            <rect x={X0} y={c.y + 28} width={W} height={38} rx={8} fill="none" stroke="var(--ink-2)" strokeWidth={1.5} />
            <text x={X0 + wTaxe + (W - wTaxe) / 2} y={c.y + 52} textAnchor="middle" className="ill-on-dark ill-total">{fmtEur(reste)} pour vous</text>
            <text x={X0} y={c.y + 86} className="ill-sub">Taxe : {fmtEur(taxe)} (à gauche, en orange)</text>
          </g>
        ))}
        <line x1={X0} y1={218} x2={X0 + W} y2={218} stroke="var(--line)" strokeWidth={1} />
        <text x={170} y={244} textAnchor="middle" className="ill-sub">Même taxe dans les deux cas :</text>
        <text x={170} y={264} textAnchor="middle" className="ill-sub">11,5 % du prix de vente de {fmtEur(OR_EXAMPLE_PRICE)}</text>
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

/** Frise « vie d'un PEL » : durées proportionnelles aux années, règles seulement (aucun montant fictif).
 * ViewBox 340 (comme le schéma des quinzaines du Livret A) : à 375 px, le dessin s'affiche presque à sa taille
 * (textes ~13,5 px au lieu de ~11,5 px avec l'ancien viewBox 420) ; chaque étape de la légende tient sur deux lignes. */
export function SchemaPel() {
  const X0 = 1;
  const W = 338;
  const x = (y: number) => X0 + (y / PEL_LIVRET_AGE) * W;
  const fills = ['var(--primary)', 'var(--accent)', 'var(--warn)'];
  const legendY = (i: number) => 146 + i * 43;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 312" role="img" aria-labelledby="ill-pel-t ill-pel-d" className="ill-svg">
        <title id="ill-pel-t">Vie d’un PEL : taux figé à l’ouverture, 4 ans minimum, 10 ans maximum de versements, livret ordinaire à 15 ans</title>
        <desc id="ill-pel-d">Le taux est fixé à l’ouverture du plan et ne change pas. De 0 à 4 ans : durée minimale, avec au moins 540 € versés par an. De 4 à 10 ans : le plan peut être prolongé d’année en année. De 10 à 15 ans : plus de versements, mais les intérêts continuent au taux du contrat. À 15 ans, le PEL devient un livret ordinaire au taux fixé par la banque.</desc>
        <text x={X0} y={18} className="ill-step">Taux fixé à l’ouverture (2,00 % en 2026),</text>
        <text x={X0} y={38} className="ill-step">le même pendant tout le plan</text>
        <line x1={X0} x2={X0 + W} y1={48} y2={48} stroke="var(--ink-2)" strokeWidth={1.5} strokeDasharray="5 4" />
        <clipPath id="ill-pel-clip"><rect x={X0} y={60} width={W} height={40} rx={8} /></clipPath>
        {PEL_PHASES.map((p, i) => (
          <g key={p.label} clipPath="url(#ill-pel-clip)">
            <rect x={x(p.from)} y={60} width={x(p.to) - x(p.from)} height={40} fill={fills[i]} />
            <text x={(x(p.from) + x(p.to)) / 2} y={85} textAnchor="middle" className="ill-on-dark ill-total">{p.to - p.from} ans</text>
          </g>
        ))}
        <rect x={X0} y={60} width={W} height={40} rx={8} fill="none" stroke="var(--ink-2)" strokeWidth={1.5} />
        {[0, 4, 10, 15].map((y) => (
          <g key={y}>
            <line x1={x(y)} x2={x(y)} y1={100} y2={110} stroke="var(--ink-2)" strokeWidth={1.5} />
            <text x={x(y)} y={126} textAnchor={y === 0 ? 'start' : y === PEL_LIVRET_AGE ? 'end' : 'middle'} className="ill-sub">{y === 0 ? 'Ouverture' : `${y} ans`}</text>
          </g>
        ))}
        {PEL_PHASES.map((p, i) => (
          <g key={p.label}>
            <rect x={X0} y={legendY(i)} width={16} height={16} rx={4} fill={fills[i]} />
            <text x={X0 + 26} y={legendY(i) + 13} className="ill-step">{p.label}</text>
            <text x={X0 + 26} y={legendY(i) + 32} className="ill-sub">{p.detail}</text>
          </g>
        ))}
        <line x1={X0} x2={X0 + W} y1={276} y2={276} stroke="var(--line)" strokeWidth={1.5} />
        <text x={X0} y={292} className="ill-sub"><tspan className="ill-step" style={{ fill: 'var(--ink)' }}>À 15 ans</tspan> : le PEL devient un livret</text>
        <text x={X0} y={310} className="ill-sub">ordinaire, au taux fixé par la banque.</text>
      </svg>
      <figcaption className="fig-short">
        <strong>Illustration</strong> : PEL ouverts depuis 2018, durées proportionnelles aux années.
      </figcaption>
    </figure>
  );
}

/** Fiche LEP : la condition de revenus à l'ouverture et pour garder le livret (Service-Public F2367, consulté le 2026-11-14).
 * Aucun chiffre : les plafonds sont dans la carte « Fiscalité » de la fiche. ViewBox 340 (comme les schémas PEL et Livret A) :
 * à 375 px, les textes s'affichent presque à leur taille (≈ 13 px au lieu de ≈ 10,5 px avec l'ancien viewBox 420). */
export function SchemaLep() {
  const L = 1;
  const R = 175;
  const BW = 164;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 284" role="img" aria-labelledby="ill-lep-t ill-lep-d" className="ill-svg">
        <title id="ill-lep-t">LEP : le revenu fiscal de référence décide de l’ouverture, et deux années de suite au-dessus du plafond entraînent la clôture</title>
        <desc id="ill-lep-d">Pour ouvrir un LEP, la banque regarde le revenu fiscal de référence de l’avis d’imposition. En dessous du plafond (ou égal), le livret peut être ouvert ; au-dessus, il ne peut pas l’être. Une fois le livret ouvert, un dépassement du plafond une seule année n’oblige pas à le fermer, si l’année suivante repasse sous le plafond. Deux années consécutives au-dessus du plafond entraînent la clôture obligatoire.</desc>
        <text x={L} y={18} className="ill-step">1. Pour ouvrir le livret</text>
        <rect x={60} y={32} width={220} height={46} rx={10} fill="none" stroke="var(--ink-2)" strokeWidth={1.5} />
        <text x={170} y={51} textAnchor="middle" className="ill-in" fontSize={13}>Revenu fiscal de référence</text>
        <text x={170} y={69} textAnchor="middle" className="ill-sub">(sur l’avis d’imposition)</text>
        <path d="M120 78 L83 102 M220 78 L257 102" stroke="var(--ink-2)" strokeWidth={1.5} fill="none" />
        <rect x={L} y={102} width={BW} height={52} rx={10} fill="var(--accent)" />
        <text x={L + BW / 2} y={124} textAnchor="middle" className="ill-on-dark ill-total">≤ plafond</text>
        <text x={L + BW / 2} y={143} textAnchor="middle" className="ill-on-dark" fontSize={13}>ouverture possible</text>
        <rect x={R} y={102} width={BW} height={52} rx={10} fill="var(--warn)" />
        <text x={R + BW / 2} y={124} textAnchor="middle" className="ill-on-dark ill-total">&gt; plafond</text>
        <text x={R + BW / 2} y={143} textAnchor="middle" className="ill-on-dark" fontSize={13}>pas d’ouverture</text>
        <text x={L} y={190} className="ill-step">2. Ensuite, chaque année</text>
        <rect x={L} y={204} width={BW} height={76} rx={10} fill="var(--primary)" />
        <text x={L + BW / 2} y={228} textAnchor="middle" className="ill-on-dark ill-total">1 an au-dessus</text>
        <text x={L + BW / 2} y={248} textAnchor="middle" className="ill-on-dark" fontSize={13}>livret gardé si l’année</text>
        <text x={L + BW / 2} y={266} textAnchor="middle" className="ill-on-dark" fontSize={13}>suivante repasse sous</text>
        <rect x={R} y={204} width={BW} height={76} rx={10} fill="var(--warn)" />
        <text x={R + BW / 2} y={228} textAnchor="middle" className="ill-on-dark ill-total">2 ans de suite</text>
        <text x={R + BW / 2} y={248} textAnchor="middle" className="ill-on-dark" fontSize={13}>au-dessus du plafond :</text>
        <text x={R + BW / 2} y={266} textAnchor="middle" className="ill-on-dark" fontSize={13}>clôture obligatoire</text>
      </svg>
      <figcaption>
        <strong>Illustration</strong> : un seul LEP par personne, chaque époux ou partenaire de Pacs peut avoir le sien. Pour une ouverture en 2026, la banque regarde le revenu fiscal de référence de 2024 ou de 2025, selon la date de la demande.
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

/** Fiche Unités de compte : le nombre d'unités est garanti, pas leur valeur (Service-Public F15274).
 * ViewBox 340 (chantier 112, étape 12) : à 375 px, textes presque à leur taille au lieu de ≈ 11,2 px avec l'ancien viewBox 420.
 * Mêmes montants et mêmes règles ; barres proportionnelles aux montants. */
export function SchemaUniteDeCompte() {
  const cas = [
    { prix: 8, label: 'Les marchés baissent', fill: 'var(--warn)' },
    { prix: 10, label: 'Valeur inchangée', fill: 'var(--primary)' },
    { prix: 12, label: 'Les marchés montent', fill: 'var(--accent)' },
  ];
  const X0 = 6;
  const W = 328;
  const max = ucValeur(UC_NOMBRE, 12);
  const base = ucValeur(UC_NOMBRE, UC_PRIX_ACHAT);
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 296" role="img" aria-labelledby="ill-uc-t ill-uc-d" className="ill-svg">
        <title id="ill-uc-t">Unités de compte : le nombre d’unités reste le même, c’est leur valeur qui varie</title>
        <desc id="ill-uc-d">{`Exemple fictif : vous achetez ${UC_NOMBRE} unités de compte à ${fmtEur(UC_PRIX_ACHAT)} l’unité, soit ${fmtEur(base)}. Vous gardez ${UC_NOMBRE} unités quoi qu’il arrive. Si l’unité vaut ${fmtEur(8)}, votre épargne vaut ${fmtEur(ucValeur(UC_NOMBRE, 8))} ; si elle vaut ${fmtEur(10)}, ${fmtEur(base)} ; si elle vaut ${fmtEur(12)}, ${fmtEur(ucValeur(UC_NOMBRE, 12))}. L’assureur garantit le nombre d’unités, pas leur valeur.`}</desc>
        <text x={X0} y={18} className="ill-step">{`Vous achetez ${UC_NOMBRE} unités à ${fmtEur(UC_PRIX_ACHAT)}`}</text>
        <text x={X0} y={40} className="ill-sub">{`soit ${fmtEur(base)}. Plus tard, vous avez toujours`}</text>
        <text x={X0} y={58} className="ill-sub">{`${UC_NOMBRE} unités. Leur valeur, non :`}</text>
        {cas.map((c, i) => {
          const y = 70 + i * 54;
          const w = (ucValeur(UC_NOMBRE, c.prix) / max) * W;
          return (
            <g key={c.prix}>
              <text x={X0} y={y + 13} className="ill-sub">{`${c.label} : l’unité vaut ${fmtEur(c.prix)}`}</text>
              <rect x={X0} y={y + 20} width={w} height={28} rx={7} fill={c.fill} />
              <text x={X0 + 10} y={y + 39} className="ill-on-dark ill-total">{`${UC_NOMBRE} unités = ${fmtEur(ucValeur(UC_NOMBRE, c.prix))}`}</text>
            </g>
          );
        })}
        <rect x={X0} y={240} width={W} height={50} rx={10} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={1.5} />
        <text x={170} y={261} textAnchor="middle" className="ill-sub">L’assureur garantit le nombre d’unités,</text>
        <text x={170} y={280} textAnchor="middle" className="ill-sub">pas leur valeur : perte possible en capital.</text>
      </svg>
      <figcaption>
        <strong>Illustration, exemple fictif</strong> : les valeurs de l’unité sont inventées pour montrer le principe, ce n’est pas une prévision. Barres proportionnelles aux montants.
      </figcaption>
    </figure>
  );
}

/** Fiche Fonds en euros : principe qualitatif (aucun chiffre), repris de Service-Public F15274 (consulté le 2026-11-07) : sommes valorisées en euros, placées par l’assureur sur des actifs peu risqués, valeur des fonds investis garantie par l’assureur, garantie en capital en contrepartie d’un faible rendement, intérêts annuels ajoutés au capital. */
/* ViewBox 340 (chantier 112, étape 3) : à 375 px, les textes s'affichent presque à leur taille
 * (≈ 11,2 px et cadres collés aux bords avec l'ancien viewBox 420). Mêmes textes et mêmes règles. */
export function SchemaFondsEuros() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 336" role="img" aria-labelledby="ill-fe-t ill-fe-d" className="ill-svg">
        <title id="ill-fe-t">Fonds en euros : capital garanti par l’assureur, intérêts ajoutés chaque année</title>
        <desc id="ill-fe-d">Vous versez de l’argent sur un contrat d’assurance-vie en fonds en euros. L’assureur le place sur des actifs peu risqués et garantit la valeur des fonds investis. Chaque année, il verse des intérêts qui s’ajoutent au capital et produisent à leur tour des intérêts. La contrepartie de cette garantie en capital est un faible rendement.</desc>
        <rect x={40} y={2} width={260} height={52} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={170} y={24} textAnchor="middle" className="ill-step">Vous versez</text>
        <text x={170} y={44} textAnchor="middle" className="ill-sub">sur un contrat d’assurance-vie</text>
        <path d="M 170 54 V 80 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={1} y={80} width={338} height={104} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={170} y={106} textAnchor="middle" className="ill-step">L’assureur place votre argent</text>
        <text x={170} y={132} textAnchor="middle" className="ill-in">Sur des actifs peu risqués</text>
        <text x={170} y={158} textAnchor="middle" className="ill-sub">La valeur des fonds investis est garantie</text>
        <text x={170} y={175} textAnchor="middle" className="ill-sub">par l’assureur : c’est la garantie en capital</text>
        <path d="M 170 184 V 208 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={1} y={208} width={338} height={98} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={170} y={232} textAnchor="middle" className="ill-step">Chaque année, des intérêts</text>
        <text x={170} y={251} textAnchor="middle" className="ill-step">s’ajoutent au capital</text>
        <text x={170} y={276} textAnchor="middle" className="ill-sub">contrepartie de la garantie :</text>
        <text x={170} y={293} textAnchor="middle" className="ill-sub">un faible rendement</text>
        <text x={170} y={330} textAnchor="middle" className="ill-sub">Schéma de principe d’après Service-Public</text>
      </svg>
    </figure>
  );
}

/** Fiche Compte à terme : principe qualitatif (aucun chiffre), repris de La finance pour tous, « Comptes à terme » (consultée le 2026-11-14) : prêt à la banque pour une durée choisie, taux ou formule connu au départ, trois formes (taux fixe ; taux progressif par paliers ; taux révisable indexé sur un indice de référence), pénalité sur les intérêts en cas de retrait anticipé.
 * Chaque formule porte une petite courbe de principe (taux dans le temps, sans échelle) : plate, en paliers qui montent, en paliers qui montent ou descendent à chaque période.
 * ViewBox 340 : à 375 px, le dessin s'affiche presque à sa taille (textes ~13,5 px au lieu de ~11 px avec l'ancien viewBox 420). */
export function SchemaCompteATerme() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const courbe = { fill: 'none', stroke: 'var(--primary)', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  // Pictogramme : cadre de 64 × 38 unités à droite de la carte ; axe du temps en bas, axe du taux à gauche.
  const PX = 258;
  const rows = [
    { y: 98, t: 'Taux fixe', a: 'Somme versée en une fois', b: 'Capital et intérêts rendus à l’échéance', d: 'M 6 18 H 60' },
    { y: 178, t: 'Taux progressif', a: 'Somme versée en une fois', b: 'Taux plus haut si l’argent reste longtemps', d: 'M 6 28 H 22 V 19 H 40 V 10 H 60' },
    { y: 258, t: 'Taux révisable', a: 'Taux lié à un indice de référence', b: 'Renouvelé à chaque période', d: 'M 6 20 H 20 V 11 H 34 V 25 H 48 V 15 H 60' },
  ];
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 414" role="img" aria-labelledby="ill-cat-t ill-cat-d" className="ill-svg">
        <title id="ill-cat-t">Compte à terme : un prêt à la banque pour une durée choisie</title>
        <desc id="ill-cat-d">Vous prêtez une somme à la banque pour une durée choisie avec elle. Le taux ou la formule de calcul est connu dès le départ. Il existe trois formes : à taux fixe, le taux reste le même ; à taux progressif, il monte par paliers ; à taux révisable, il suit un indice de référence et peut monter ou baisser à chaque période. Retirer l’argent avant l’échéance entraîne une pénalité sur les intérêts. Les petites courbes sont des dessins de principe, sans échelle.</desc>
        <rect x={0} y={2} width={340} height={70} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={170} y={26} textAnchor="middle" className="ill-step">Vous prêtez à la banque</text>
        <text x={170} y={45} textAnchor="middle" className="ill-sub">pour une durée choisie avec elle</text>
        <text x={170} y={62} textAnchor="middle" className="ill-sub">Taux, ou formule de calcul, connu au départ</text>
        <path d="M 170 72 V 94 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        {rows.map((r) => (
          <g key={r.t}>
            <rect x={0} y={r.y} width={340} height={72} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
            <text x={14} y={r.y + 24} className="ill-step">{r.t}</text>
            <text x={14} y={r.y + 44} className="ill-sub">{r.a}</text>
            <text x={14} y={r.y + 62} className="ill-sub">{r.b}</text>
            <g transform={`translate(${PX} ${r.y + 8})`} aria-hidden="true">
              <rect x={0} y={0} width={66} height={38} rx={6} fill="var(--surface-2)" />
              <path d="M 4 4 V 34 H 62" fill="none" stroke="var(--ink-2)" strokeWidth={1.2} strokeLinecap="round" opacity={0.6} />
              <path d={r.d} {...courbe} />
            </g>
          </g>
        ))}
        <path d="M 170 330 V 352 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={0} y={354} width={340} height={58} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={170} y={378} textAnchor="middle" className="ill-step">Retrait avant l’échéance :</text>
        <text x={170} y={398} textAnchor="middle" className="ill-sub">pénalité sur les intérêts</text>
      </svg>
      <figcaption className="fig-short">Courbes : le taux au fil du temps, sans échelle.</figcaption>
    </figure>
  );
}

/** Fiche Assurance-vie : transmission au décès, repris de impots.gouv.fr (« Je suis bénéficiaire d’une assurance-vie, comment la déclarer ? », consulté le 2026-11-08), contrats souscrits depuis le 13 octobre 1998 : primes versées avant 70 ans, 152 500 € exonérés par bénéficiaire puis 20 % jusqu’à 700 000 € et 31,25 % au-delà ; primes versées après 70 ans, droits de succession après un abattement global de 30 500 €. */
/* ViewBox 340 (chantier 112, étape 2) : à 375 px, les textes s'affichent presque à leur taille et les deux cadres
 * gardent leur marge (≈ 11,2 px et cadres collés aux bords avec l'ancien viewBox 420). */
export function SchemaAssuranceVieDeces() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const L = 1;
  const R = 175;
  const BW = 164;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 306" role="img" aria-labelledby="ill-avd-t ill-avd-d" className="ill-svg">
        <title id="ill-avd-t">Assurance-vie : ce qui se passe au décès de l’assuré</title>
        <desc id="ill-avd-d">Au décès de l’assuré, l’assureur verse le capital aux bénéficiaires désignés dans le contrat. Le traitement dépend de l’âge de l’assuré au moment du versement des primes. Primes versées avant 70 ans : 152 500 euros sont exonérés par bénéficiaire, puis 20 pour cent jusqu’à 700 000 euros et 31,25 pour cent au-delà. Primes versées après 70 ans : droits de succession, après un abattement global de 30 500 euros. Règles pour les contrats souscrits depuis le 13 octobre 1998.</desc>
        <rect x={1} y={2} width={338} height={74} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={170} y={26} textAnchor="middle" className="ill-step">Décès de l’assuré</text>
        <text x={170} y={47} textAnchor="middle" className="ill-sub">L’assureur verse le capital</text>
        <text x={170} y={65} textAnchor="middle" className="ill-sub">aux bénéficiaires désignés</text>
        <path d={`M ${L + BW / 2} 76 V 100 m -7 -8 l 7 8 l 7 -8`} {...arrow} />
        <path d={`M ${R + BW / 2} 76 V 100 m -7 -8 l 7 8 l 7 -8`} {...arrow} />
        <rect x={L} y={100} width={BW} height={170} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={L + BW / 2} y={124} textAnchor="middle" className="ill-step">Primes versées</text>
        <text x={L + BW / 2} y={142} textAnchor="middle" className="ill-step">avant 70 ans</text>
        <text x={L + BW / 2} y={170} textAnchor="middle" className="ill-sub">Par bénéficiaire :</text>
        <text x={L + BW / 2} y={194} textAnchor="middle" className="ill-in">152 500 € sans impôt</text>
        <text x={L + BW / 2} y={216} textAnchor="middle" className="ill-in">puis 20 % jusqu’à</text>
        <text x={L + BW / 2} y={234} textAnchor="middle" className="ill-in">700 000 €</text>
        <text x={L + BW / 2} y={256} textAnchor="middle" className="ill-in">puis 31,25 % au-delà</text>
        <rect x={R} y={100} width={BW} height={170} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={R + BW / 2} y={124} textAnchor="middle" className="ill-step">Primes versées</text>
        <text x={R + BW / 2} y={142} textAnchor="middle" className="ill-step">après 70 ans</text>
        <text x={R + BW / 2} y={170} textAnchor="middle" className="ill-sub">Droits de succession</text>
        <text x={R + BW / 2} y={194} textAnchor="middle" className="ill-in">après un abattement</text>
        <text x={R + BW / 2} y={212} textAnchor="middle" className="ill-in">global de 30 500 €</text>
        <text x={R + BW / 2} y={236} textAnchor="middle" className="ill-in">pour tous les contrats</text>
        <text x={170} y={296} textAnchor="middle" className="ill-sub">Contrats souscrits depuis le 13 octobre 1998</text>
      </svg>
    </figure>
  );
}

/**
 * Schéma « Forêt : parts de groupement forestier » : principe qualitatif, empilé pour rester lisible à 375 px (viewBox 340).
 * Seuls chiffres : 25 % et la conservation jusqu’au 31 décembre de la huitième année suivant l’achat, confirmés sur le BOFiP
 * (BOI-IR-RICI-60-20-20, consulté le 2026-11-08 et le 2026-11-14).
 */
export function SchemaForet() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const boxes = [
    { y: 2, title: 'L’épargnant', sub: 'achète des parts, en argent', fill: 'var(--accent-soft)', stroke: 'var(--accent)' },
    { y: 76, title: 'Le groupement forestier', sub: 'plan simple de gestion agréé', fill: 'var(--surface)', stroke: 'var(--primary)' },
    { y: 150, title: 'Des forêts', sub: 'bois, tempêtes, incendies…', fill: 'var(--warn-soft)', stroke: 'var(--warn)' },
  ];
  const links = [
    { y: 50, label: 'son argent' },
    { y: 124, label: 'possède et gère' },
  ];
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 360" role="img" aria-labelledby="ill-foret-t ill-foret-d" className="ill-svg">
        <title id="ill-foret-t">Comment fonctionne un groupement forestier</title>
        <desc id="ill-foret-d">L’épargnant achète des parts du groupement forestier avec de l’argent. Le groupement possède des forêts et les gère selon un plan simple de gestion agréé. En échange, l’État accorde à l’épargnant un crédit d’impôt de 25 % des sommes retenues, dans la limite d’un plafond, à condition de garder les parts jusqu’au 31 décembre de la huitième année suivant l’achat.</desc>
        {boxes.map((b) => (
          <g key={b.title}>
            <rect x={0} y={b.y} width={276} height={48} rx={12} fill={b.fill} stroke={b.stroke} strokeWidth={2} />
            <text x={138} y={b.y + 21} textAnchor="middle" className="ill-step">{b.title}</text>
            <text x={138} y={b.y + 39} textAnchor="middle" className="ill-sub">{b.sub}</text>
          </g>
        ))}
        {links.map((l) => (
          <g key={l.label}>
            <path d={`M 138 ${l.y + 2} V ${l.y + 24} m -7 -8 l 7 8 l 7 -8`} {...arrow} />
            <text x={152} y={l.y + 18} textAnchor="start" className="ill-in">{l.label}</text>
          </g>
        ))}
        <path d="M 312 210 V 26 H 282 m 8 -7 l -8 7 l 8 7" {...arrow} />
        <rect x={0} y={210} width={340} height={124} rx={12} fill="var(--surface)" stroke="var(--accent)" strokeWidth={2} />
        <text x={170} y={234} textAnchor="middle" className="ill-step">En échange, l’État accorde</text>
        <text x={170} y={254} textAnchor="middle" className="ill-in">un crédit d’impôt de 25 % des sommes retenues</text>
        <text x={170} y={272} textAnchor="middle" className="ill-sub">dans la limite d’un plafond</text>
        <line x1={16} x2={324} y1={286} y2={286} stroke="var(--line)" strokeWidth={1} />
        <text x={170} y={306} textAnchor="middle" className="ill-sub">si les parts sont gardées jusqu’au 31 décembre</text>
        <text x={170} y={324} textAnchor="middle" className="ill-sub">de la huitième année suivant l’achat</text>
        <text x={170} y={354} textAnchor="middle" className="ill-sub">Schéma de principe</text>
      </svg>
    </figure>
  );
}

/** Schéma « Objets d’art : la taxe dépend du prix de vente » : seuil 5 000 €, taux 6 % + CRDS 0,5 % = 6,5 % du prix de cession (BOFiP BOI-RPPM-PVBMC-20-10, consulté le 2026-11-09). */
/* ViewBox 340 (chantier 112, étape 12) : à 375 px, textes presque à leur taille au lieu de ≈ 11,2 px avec l'ancien viewBox 420.
 * Mêmes textes et mêmes règles, coupés autrement pour tenir dans des colonnes de 158 unités. */
export function SchemaObjetsArt() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 368" role="img" aria-labelledby="ill-art-t ill-art-d" className="ill-svg">
        <title id="ill-art-t">À la vente d’un objet d’art, la taxe dépend du prix de vente</title>
        <desc id="ill-art-d">Vous vendez un objet d’art, de collection ou une antiquité. Si le prix de vente est inférieur ou égal à 5 000 euros, il n’y a aucune taxe forfaitaire. Au-delà de 5 000 euros, la taxe forfaitaire est de 6 % du prix, plus 0,5 % de CRDS, soit 6,5 % du prix de vente et non du gain. En pratique, le seuil s’apprécie objet par objet.</desc>
        <rect x={20} y={2} width={300} height={54} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={170} y={26} textAnchor="middle" className="ill-step">Vous vendez un objet d’art</text>
        <text x={170} y={45} textAnchor="middle" className="ill-sub">ou de collection, ou une antiquité</text>
        <path d="M 83 56 V 94 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <path d="M 257 56 V 94 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={4} y={96} width={158} height={60} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={83} y={121} textAnchor="middle" className="ill-in">Prix de vente</text>
        <text x={83} y={143} textAnchor="middle" className="ill-step">5 000 € ou moins</text>
        <rect x={178} y={96} width={158} height={60} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={257} y={121} textAnchor="middle" className="ill-in">Prix de vente</text>
        <text x={257} y={143} textAnchor="middle" className="ill-step">plus de 5 000 €</text>
        <path d="M 83 156 V 194 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <path d="M 257 156 V 194 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={4} y={196} width={158} height={96} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={83} y={238} textAnchor="middle" className="ill-step">Aucune taxe</text>
        <text x={83} y={258} textAnchor="middle" className="ill-sub">forfaitaire</text>
        <rect x={178} y={196} width={158} height={96} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={257} y={222} textAnchor="middle" className="ill-step">6,5 % du prix</text>
        <text x={257} y={243} textAnchor="middle" className="ill-in">6 % + 0,5 % de CRDS</text>
        <text x={257} y={264} textAnchor="middle" className="ill-sub">sur le prix,</text>
        <text x={257} y={281} textAnchor="middle" className="ill-sub">pas sur le gain</text>
        <text x={170} y={316} textAnchor="middle" className="ill-in">En pratique, le seuil s’apprécie</text>
        <text x={170} y={333} textAnchor="middle" className="ill-in">objet par objet.</text>
        <text x={170} y={360} textAnchor="middle" className="ill-sub">Schéma de principe</text>
      </svg>
    </figure>
  );
}

/** Schéma « Formation : votre CPF vous suit » : principe qualitatif, sans chiffre (Service-Public F10705, vérifiée le 27 juin 2026, consultée le 2026-11-09). */
/* ViewBox 340 (chantier 112, étape 12) : à 375 px, textes presque à leur taille au lieu de ≈ 11,2 px avec l'ancien viewBox 420.
 * Les trois situations sont empilées (une ligne chacune) au lieu de trois colonnes trop étroites. Mêmes textes et mêmes règles. */
export function SchemaCpf() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const situations = ['Vous travaillez chez un employeur', 'Vous changez d’employeur', 'Vous perdez votre emploi'];
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 352" role="img" aria-labelledby="ill-cpf-t ill-cpf-d" className="ill-svg">
        <title id="ill-cpf-t">Votre compte personnel de formation vous suit</title>
        <desc id="ill-cpf-d">Quelle que soit votre situation (en poste, changement d’employeur, perte d’emploi), vous gardez vos droits sur votre compte personnel de formation. Si une formation coûte plus que le montant disponible, vous pouvez demander un complément à votre employeur, à l’Agefiph ou à la région.</desc>
        {situations.map((t, i) => (
          <g key={t}>
            <rect x={20} y={2 + i * 38} width={300} height={32} rx={10} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
            <text x={170} y={23 + i * 38} textAnchor="middle" className="ill-in">{t}</text>
          </g>
        ))}
        <path d="M 170 110 V 138 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={4} y={140} width={332} height={60} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={170} y={165} textAnchor="middle" className="ill-step">Votre CPF vous suit</text>
        <text x={170} y={187} textAnchor="middle" className="ill-sub">vous gardez vos droits</text>
        <path d="M 170 200 V 210" {...arrow} />
        <text x={170} y={227} textAnchor="middle" className="ill-in">si la formation coûte plus</text>
        <path d="M 170 234 V 252 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={4} y={254} width={332} height={72} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={170} y={278} textAnchor="middle" className="ill-step">Un complément est possible</text>
        <text x={170} y={299} textAnchor="middle" className="ill-in">demandé à votre employeur,</text>
        <text x={170} y={316} textAnchor="middle" className="ill-in">à l’Agefiph ou à la région</text>
        <text x={170} y={346} textAnchor="middle" className="ill-sub">Schéma de principe</text>
      </svg>
    </figure>
  );
}

/* ViewBox 340 (chantier 112, étape 11) : à 375 px, textes presque à leur taille au lieu de 11,2 px avec l'ancien viewBox 420.
 * Mêmes textes et mêmes principes. */
/** Schéma « Créer son entreprise : deux sources de valeur » : principe qualitatif, sans chiffre (reprend le texte « Fonctionnement » de la fiche). */
export function SchemaCreationEntreprise() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 320" role="img" aria-labelledby="ill-ce-t ill-ce-d" className="ill-svg">
        <title id="ill-ce-t">Créer son entreprise : deux sources de valeur, un risque réel</title>
        <desc id="ill-ce-d">Le patrimoine se construit de deux façons : les bénéfices accumulés année après année, et la valeur de l’entreprise lors d’une cession. Le risque de perdre toute la mise est réel.</desc>
        <rect x={1} y={2} width={160} height={76} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={81} y={28} textAnchor="middle" className="ill-step">Les bénéfices</text>
        <text x={81} y={50} textAnchor="middle" className="ill-in">accumulés au fil</text>
        <text x={81} y={66} textAnchor="middle" className="ill-in">des années</text>
        <rect x={179} y={2} width={160} height={76} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={259} y={28} textAnchor="middle" className="ill-step">La revente</text>
        <text x={259} y={50} textAnchor="middle" className="ill-in">valeur de l’entreprise</text>
        <text x={259} y={66} textAnchor="middle" className="ill-in">lors d’une cession</text>
        <path d="M 81 78 V 114 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <path d="M 259 78 V 114 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={1} y={114} width={338} height={62} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={170} y={140} textAnchor="middle" className="ill-step">Votre patrimoine</text>
        <text x={170} y={162} textAnchor="middle" className="ill-sub">si l’activité trouve ses clients</text>
        <rect x={1} y={196} width={338} height={84} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={170} y={224} textAnchor="middle" className="ill-step">Sinon, la mise peut être perdue</text>
        <text x={170} y={248} textAnchor="middle" className="ill-in">le risque de perte totale</text>
        <text x={170} y={266} textAnchor="middle" className="ill-in">est réel</text>
        <text x={170} y={308} textAnchor="middle" className="ill-sub">Schéma de principe</text>
      </svg>
    </figure>
  );
}

/** Schéma « Racheter une entreprise : les bénéfices remboursent la dette » : principe qualitatif, sans chiffre (reprend le texte « Fonctionnement » de la fiche). */
export function SchemaRepriseEntreprise() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 320" role="img" aria-labelledby="ill-re-t ill-re-d" className="ill-svg">
        <title id="ill-re-t">Racheter une entreprise : les bénéfices remboursent la dette</title>
        <desc id="ill-re-d">On rachète une entreprise en s’endettant. Ses bénéfices servent à rembourser la dette d’acquisition. Le risque porte sur le prix payé (la valorisation) et sur la continuité de l’activité.</desc>
        <rect x={1} y={2} width={156} height={76} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={79} y={28} textAnchor="middle" className="ill-step">1. Le rachat</text>
        <text x={79} y={50} textAnchor="middle" className="ill-in">financé en partie</text>
        <text x={79} y={66} textAnchor="middle" className="ill-in">par un emprunt</text>
        <rect x={183} y={2} width={156} height={76} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={261} y={28} textAnchor="middle" className="ill-step">2. L’activité</text>
        <text x={261} y={50} textAnchor="middle" className="ill-in">ses bénéfices</text>
        <text x={261} y={66} textAnchor="middle" className="ill-in">remboursent la dette</text>
        <path d="M 160 40 H 179 m -6 -6 l 6 6 l -6 6" {...arrow} />
        <path d="M 261 78 V 114 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={1} y={114} width={338} height={62} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={170} y={140} textAnchor="middle" className="ill-step">Une fois la dette remboursée</text>
        <text x={170} y={162} textAnchor="middle" className="ill-sub">l’entreprise est à vous</text>
        <rect x={1} y={196} width={338} height={84} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={170} y={224} textAnchor="middle" className="ill-step">Deux risques</text>
        <text x={170} y={248} textAnchor="middle" className="ill-in">le prix payé était trop élevé (valorisation)</text>
        <text x={170} y={266} textAnchor="middle" className="ill-in">ou l’activité ne continue pas (continuité)</text>
        <text x={170} y={308} textAnchor="middle" className="ill-sub">Schéma de principe</text>
      </svg>
    </figure>
  );
}

/**
 * Schéma « Racheter une entreprise : ce que le prêt prend sur le résultat » (exemple fictif de la fiche, montants recalculés
 * par `repriseDebtShare`). Barres proportionnelles : le même remboursement face au résultat, puis au résultat diminué.
 */
export function SchemaRepriseBilan({ children }: { children: ReactNode }) {
  const { profit, loan, years, ratePct, dropPct } = REPRISE_EXAMPLE;
  const r = repriseDebtShare(profit, loan, ratePct, years, dropPct);
  const k = 338 / profit;
  const xr = 1 + r.yearly * k;
  const pct = (n: number) => `${n.toLocaleString('fr-FR')} %`;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 206" role="img" aria-labelledby="ill-reb-t ill-reb-d" className="ill-svg">
        <title id="ill-reb-t">Racheter une entreprise : ce que le prêt prend sur le résultat</title>
        <desc id="ill-reb-d">{`Exemple fictif : ${fmtEur(loan)} empruntés sur ${years} ans à un taux fictif de ${pct(ratePct)}, soit ${fmtEur(r.monthly)} par mois et ${fmtEur(r.yearly)} par an. Sur un résultat de ${fmtEur(profit)} par an, le prêt en prend ${pct(r.sharePct)} et il reste ${fmtEur(r.left)}. Si le résultat baisse de ${pct(dropPct)}, à ${fmtEur(r.droppedProfit)}, il ne reste que ${fmtEur(r.leftAfterDrop)}. Sans impôt sur les bénéfices ni assurance du prêt.`}</desc>
        <text x={0} y={16} className="ill-year" textAnchor="start">{`Résultat : ${fmtEur(profit)} par an`}</text>
        <rect x={1} y={26} width={r.yearly * k - 2} height={28} rx={4} fill="var(--primary)" />
        <text x={(1 + xr) / 2} y={45} className="ill-in ill-on-dark" textAnchor="middle">{fmtEur(r.yearly)}</text>
        <rect x={xr + 1} y={27} width={339 - xr - 2} height={26} rx={4} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={(xr + 339) / 2} y={45} className="ill-in" textAnchor="middle">{fmtEur(r.left)}</text>
        <text x={1} y={72} className="ill-sub" textAnchor="start">remboursement du prêt</text>
        <text x={xr + 1} y={72} className="ill-sub" textAnchor="start">il reste</text>

        <text x={0} y={106} className="ill-year" textAnchor="start">{`Résultat en baisse de ${pct(dropPct)} : ${fmtEur(r.droppedProfit)}`}</text>
        <rect x={1} y={116} width={r.yearly * k - 2} height={28} rx={4} fill="var(--primary)" />
        <text x={(1 + xr) / 2} y={135} className="ill-in ill-on-dark" textAnchor="middle">{fmtEur(r.yearly)}</text>
        <rect x={xr + 1} y={117} width={r.leftAfterDrop * k - 2} height={26} rx={4} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={xr + r.leftAfterDrop * k + 8} y={135} className="ill-in" textAnchor="start">{`reste ${fmtEur(r.leftAfterDrop)}`}</text>

        <text x={0} y={178} className="ill-total" textAnchor="start">{`Le prêt prend ${pct(r.sharePct)} du résultat`}</text>
        <text x={0} y={198} className="ill-sub" textAnchor="start">{`${fmtEur(r.monthly)} par mois, ${years} ans, taux fictif de ${pct(ratePct)}`}</text>
      </svg>
      <figcaption>{children}</figcaption>
    </figure>
  );
}

/** Schéma « Activité numérique : un revenu récurrent, mais fragile » : principe qualitatif, sans chiffre (reprend le texte « Fonctionnement » de la fiche). */
export function SchemaActiviteNumerique() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 320" role="img" aria-labelledby="ill-an-t ill-an-d" className="ill-svg">
        <title id="ill-an-t">Activité numérique : un revenu récurrent, mais fragile</title>
        <desc id="ill-an-d">La valeur d’une activité en ligne repose sur son revenu récurrent et sa croissance, et l’activité peut se revendre. Mais ce revenu peut s’effondrer : concurrence, dépendance à une plateforme.</desc>
        <rect x={1} y={2} width={338} height={64} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={170} y={30} textAnchor="middle" className="ill-step">Un revenu récurrent</text>
        <text x={170} y={52} textAnchor="middle" className="ill-in">abonnements, ventes, contenus</text>
        <path d="M 170 66 V 100 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={1} y={100} width={338} height={64} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={170} y={128} textAnchor="middle" className="ill-step">La valeur de l’activité</text>
        <text x={170} y={150} textAnchor="middle" className="ill-sub">elle peut se revendre</text>
        <rect x={1} y={186} width={338} height={90} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={170} y={214} textAnchor="middle" className="ill-step">Mais le revenu peut s’effondrer</text>
        <text x={170} y={238} textAnchor="middle" className="ill-in">concurrence,</text>
        <text x={170} y={256} textAnchor="middle" className="ill-in">dépendance à une plateforme</text>
        <text x={170} y={308} textAnchor="middle" className="ill-sub">Schéma de principe</text>
      </svg>
    </figure>
  );
}

/**
 * Schéma « Financement participatif : ce qu’un défaut coûte » (exemple fictif de la fiche, montants recalculés par
 * `crowdfundingScenario`). Chaque carré représente un prêt de 100 € ; un carré barré est un projet en défaut total.
 */
export function SchemaCrowdfundingBilan({ children }: { children: ReactNode }) {
  const { projects, ticket, ratePct, defaults } = CROWDFUNDING_EXAMPLE;
  const rows = defaults.map((d) => crowdfundingScenario(projects, ticket, ratePct, d));
  const titre = (d: number) => (d === 0 ? 'Les 20 projets remboursent' : `${d} projet${d > 1 ? 's' : ''} sur ${projects} en défaut`);
  const bilan = (g: number) => (g >= 0 ? `Bilan : ${fmtEur(g)} gagnés` : `Bilan : ${fmtEur(-g)} perdus`);
  const alt = rows.map((r) => `${titre(r.defaults)} : vous récupérez ${fmtEur(r.recovered)}, ${r.gain >= 0 ? `soit ${fmtEur(r.gain)} gagnés` : `soit ${fmtEur(-r.gain)} perdus`}.`).join(' ');
  const step = 16.4;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 268" role="img" aria-labelledby="ill-cfb-t ill-cfb-d" className="ill-svg">
        <title id="ill-cfb-t">Financement participatif : ce qu’un seul défaut coûte</title>
        <desc id="ill-cfb-d">{`Exemple fictif : ${fmtEur(projects * ticket)} répartis en ${projects} prêts de ${fmtEur(ticket)} à ${ratePct} % sur un an. ${alt}`}</desc>
        {rows.map((r, i) => {
          const y = 4 + i * 78;
          const color = r.gain > 0 ? (r.defaults === 0 ? 'var(--accent)' : 'var(--warn)') : 'var(--danger)';
          return (
            <g key={r.defaults}>
              {i > 0 && <line x1={0} x2={340} y1={y - 8} y2={y - 8} stroke="var(--line)" strokeWidth={1} />}
              <text x={0} y={y + 14} className="ill-year" textAnchor="start">{titre(r.defaults)}</text>
              {Array.from({ length: projects }, (_, k) => {
                const ko = k >= projects - r.defaults;
                const x = 1 + k * step;
                return (
                  <g key={k}>
                    <rect x={x} y={y + 24} width={13} height={13} rx={3} fill={ko ? 'var(--surface)' : 'var(--accent-soft)'} stroke={ko ? 'var(--danger)' : 'var(--accent)'} strokeWidth={1.5} />
                    {ko && <path d={`M ${x + 3} ${y + 27} l 7 7 m 0 -7 l -7 7`} stroke="var(--danger)" strokeWidth={1.8} strokeLinecap="round" />}
                  </g>
                );
              })}
              <text x={0} y={y + 60} className="ill-total" textAnchor="start" style={{ fill: color }}>{bilan(r.gain)}</text>
              <text x={336} y={y + 60} className="ill-sub" textAnchor="end">{`${fmtEur(r.recovered)} récupérés`}</text>
            </g>
          );
        })}
        <rect x={1} y={242} width={13} height={13} rx={3} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={1.5} />
        <text x={20} y={253} className="ill-sub" textAnchor="start">{`prêt de ${fmtEur(ticket)} remboursé`}</text>
        <rect x={190} y={242} width={13} height={13} rx={3} fill="var(--surface)" stroke="var(--danger)" strokeWidth={1.5} />
        <path d="M 193 245 l 7 7 m 0 -7 l -7 7" stroke="var(--danger)" strokeWidth={1.8} strokeLinecap="round" />
        <text x={209} y={253} className="ill-sub" textAnchor="start">projet en défaut</text>
      </svg>
      <figcaption>{children}</figcaption>
    </figure>
  );
}

/**
 * Schéma « SCPI : combien de temps pour compenser les frais d’entrée » (exemple fictif de la fiche, montants recalculés par
 * `scpiFeesPayback`). Frais de souscription : 6 % à 12 % du montant souscrit (La finance pour tous, mise à jour le
 * 2 janvier 2024, consultée le 2026-11-13). Les longueurs des barres sont proportionnelles aux montants.
 */
export function SchemaScpiBilan({ children }: { children: ReactNode }) {
  const { amount, entryFeePct, distributionPct } = SCPI_EXAMPLE;
  const { fees, yearly, years } = scpiFeesPayback(amount, entryFeePct, distributionPct);
  const scale = 240 / fees;
  const years_ = Array.from({ length: years }, (_, k) => k + 1);
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 196" role="img" aria-labelledby="ill-scpib-t ill-scpib-d" className="ill-svg">
        <title id="ill-scpib-t">SCPI : les loyers distribués compensent d’abord les frais d’entrée</title>
        <desc id="ill-scpib-d">{`Exemple fictif : ${fmtEur(amount)} souscrits avec ${entryFeePct} % de frais d’entrée, soit ${fmtEur(fees)} de frais. Avec ${fmtEur(yearly)} distribués par an, il faut ${years} ans pour les compenser, à prix de part constant et avant impôt.`}</desc>
        <text x={0} y={18} className="ill-year" textAnchor="start">{`Frais d’entrée : ${entryFeePct}\u00a0% de ${fmtEur(amount)}`}</text>
        <rect x={1} y={28} width={fees * scale} height={24} rx={4} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={fees * scale + 10} y={45} className="ill-in" textAnchor="start">{fmtEur(fees)}</text>
        <text x={0} y={90} className="ill-year" textAnchor="start">{`Loyers distribués : ${distributionPct}\u00a0% par an`}</text>
        {years_.map((k) => {
          const x = 1 + (k - 1) * yearly * scale;
          return (
            <g key={k}>
              <rect x={x} y={100} width={yearly * scale - 4} height={24} rx={4} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
              <text x={x + (yearly * scale - 4) / 2} y={117} className="ill-in" textAnchor="middle">{`année ${k} : ${fmtEur(yearly)}`}</text>
            </g>
          );
        })}
        <path d={`M ${fees * scale + 1} 22 V 132`} stroke="var(--ink-2)" strokeWidth={1.5} strokeDasharray="4 3" />
        <text x={0} y={162} className="ill-total" textAnchor="start" style={{ fill: 'var(--accent)' }}>{`Après ${years} ans, frais compensés`}</text>
        <text x={0} y={184} className="ill-sub" textAnchor="start">ensuite, les loyers deviennent un gain</text>
      </svg>
      <figcaption>{children}</figcaption>
    </figure>
  );
}

/**
 * Schéma « Location nue : ce que le micro-foncier impose » (exemple fictif de la fiche, montants recalculés par
 * `microFoncierExample`). Abattement de 30 % jusqu'à 15 000 € de loyers par an (Service-Public F1991) ; tranche à 30 %
 * (Service-Public F1419) ; prélèvements sociaux de 17,2 % sur les revenus fonciers (Service-Public F2329) ; consultés le
 * 2026-11-14. Les longueurs des barres sont proportionnelles aux montants.
 */
export function SchemaLocationNueBilan({ children }: { children: ReactNode }) {
  const { monthlyRent, allowancePct, marginalRatePct, socialPct } = LOCATION_NUE_EXAMPLE;
  const r = microFoncierExample(monthlyRent, allowancePct, marginalRatePct);
  const k = 338 / r.rents;
  const xa = 1 + r.allowance * k;
  const pct = (n: number) => `${n.toLocaleString('fr-FR')}\u00a0%`;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 186" role="img" aria-labelledby="ill-lnb-t ill-lnb-d" className="ill-svg">
        <title id="ill-lnb-t">Location nue au micro-foncier : la part des loyers qui est imposée</title>
        <desc id="ill-lnb-d">{`Exemple fictif : ${fmtEur(monthlyRent)} de loyer par mois, soit ${fmtEur(r.rents)} par an. Le micro-foncier retire d’office ${allowancePct} %, soit ${fmtEur(r.allowance)} : ${fmtEur(r.taxable)} s’ajoutent aux autres revenus. Dans la tranche à ${marginalRatePct} %, cela fait ${fmtEur(r.incomeTax)} d’impôt sur le revenu, ${pct(r.incomeTaxPctOfRents)} des loyers, plus ${socialPct.toLocaleString('fr-FR')} % de prélèvements sociaux.`}</desc>
        <text x={0} y={16} className="ill-year" textAnchor="start">{`Loyers : ${fmtEur(r.rents)} par an (12 × ${fmtEur(monthlyRent)})`}</text>
        <rect x={1} y={26} width={r.allowance * k - 3} height={26} rx={4} fill="var(--surface)" stroke="var(--ink-3)" strokeWidth={1.5} strokeDasharray="4 3" />
        <text x={(1 + xa - 3) / 2} y={44} className="ill-in" textAnchor="middle">{fmtEur(r.allowance)}</text>
        <rect x={xa} y={26} width={339 - xa} height={26} rx={4} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={(xa + 339) / 2} y={44} className="ill-in" textAnchor="middle">{fmtEur(r.taxable)}</text>
        <text x={1} y={70} className="ill-sub" textAnchor="start">{`${pct(allowancePct)} retirés`}</text>
        <text x={xa} y={70} className="ill-sub" textAnchor="start">ajoutés à vos autres revenus</text>

        <text x={0} y={104} className="ill-year" textAnchor="start">{`Impôt dans la tranche à ${pct(marginalRatePct)}`}</text>
        <rect x={xa} y={114} width={r.incomeTax * k} height={26} rx={4} fill="var(--danger)" />
        <text x={xa + (r.incomeTax * k) / 2} y={132} className="ill-in" textAnchor="middle" style={{ fill: '#fff' }}>{fmtEur(r.incomeTax)}</text>
        <text x={xa + r.incomeTax * k + 8} y={132} className="ill-sub" textAnchor="start">{`sur ces ${fmtEur(r.taxable)}`}</text>

        <text x={0} y={166} className="ill-total" textAnchor="start" style={{ fill: 'var(--danger)' }}>{`Impôt : ${fmtEur(r.incomeTax)}, soit ${pct(r.incomeTaxPctOfRents)} des loyers`}</text>
        <text x={0} y={184} className="ill-sub" textAnchor="start">{`plus ${pct(socialPct)} de prélèvements sociaux`}</text>
      </svg>
      <figcaption>{children}</figcaption>
    </figure>
  );
}

/**
 * Schéma « Donation : le barème, tranche par tranche » (exemple fictif de la fiche). Abattement de 100 000 € d'un parent à un
 * enfant et barème en ligne directe : Service-Public F14203 (vérifiée le 13 mai 2026, consultée le 2026-11-16), qui détaille
 * le même calcul (403,60 €, 403,70 €, 573,45 €, 16 813,60 €, total 18 194 €). Montants recalculés par
 * `detailDroitsLigneDirecte`. La barre des sommes taxées est découpée à la vraie taille de chaque tranche (constat du
 * 2026-11-17) : on voit que l'essentiel est taxé au dernier taux atteint, et pourquoi le taux moyen reste en dessous.
 */
export function SchemaDonationBilan({ children }: { children: ReactNode }) {
  const { value } = DONATION_EXAMPLE;
  const taxable = Math.max(0, value - DONATION_ABATTEMENT);
  const tranches = detailDroitsLigneDirecte(taxable);
  const total = Math.round(tranches.reduce((s, t) => s + t.droits, 0));
  const rate = (t: number) => `${Math.round(t * 100)}\u00a0%`;
  const xa = 1 + (DONATION_ABATTEMENT / value) * 338;
  const last = tranches[tranches.length - 1];
  const small = tranches.slice(0, -1);
  const smallSum = small.reduce((s, t) => s + t.base, 0);
  const avg = Math.round((total / taxable) * 1000) / 10;
  // Barre des sommes taxées : 338 unités pour la part taxable ; couleur plus soutenue quand le taux monte.
  const W = 338;
  const shade = (i: number) => 0.18 + (0.62 * (i + 1)) / tranches.length;
  let cursor = 1;
  const segs = tranches.map((t, i) => {
    const w = (t.base / taxable) * W;
    const seg = { x: cursor, w, t, i };
    cursor += w;
    return seg;
  });
  const lastSeg = segs[segs.length - 1];
  const smallEnd = lastSeg.x;
  const rowY = (i: number) => 204 + i * 22;
  const lineY = rowY(tranches.length - 1) + 12;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 352" role="img" aria-labelledby="ill-donb-t ill-donb-d" className="ill-svg">
        <title id="ill-donb-t">Donation : les droits se calculent tranche par tranche</title>
        <desc id="ill-donb-d">{`Exemple fictif : un appartement de ${fmtEur(value)} donné par un parent à son enfant. Les ${fmtEur(DONATION_ABATTEMENT)} de l’abattement sont sans droits ; les ${fmtEur(taxable)} restants sont taxés par tranches, dessinées à leur vraie taille : ${tranches.map((t) => `${rate(t.taux)} sur ${fmtEur(t.base)}, soit ${fmtEur2(t.droits)}`).join(' ; ')}. Les ${fmtEur(last.base)} de la dernière tranche forment l’essentiel de la somme taxée. Total : ${fmtEur(total)} de droits, environ ${avg.toLocaleString('fr-FR')} % des ${fmtEur(taxable)} taxés, car les premières tranches sont taxées moins fort.`}</desc>
        <text x={0} y={16} className="ill-year" textAnchor="start">{`Appartement donné : ${fmtEur(value)}`}</text>
        <rect x={1} y={26} width={xa - 4} height={26} rx={4} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={(1 + xa - 4) / 2} y={44} className="ill-in" textAnchor="middle">{fmtEur(DONATION_ABATTEMENT)}</text>
        <rect x={xa} y={26} width={339 - xa} height={26} rx={4} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={(xa + 339) / 2} y={44} className="ill-in" textAnchor="middle">{fmtEur(taxable)}</text>
        <text x={1} y={70} className="ill-sub" textAnchor="start">abattement : sans droits</text>
        <text x={xa} y={70} className="ill-sub" textAnchor="start">taxés au barème</text>

        <text x={0} y={98} className="ill-year" textAnchor="start">{`Les ${fmtEur(taxable)} taxés, à leur vraie taille`}</text>
        <rect x={1} y={110} width={W} height={34} rx={4} fill="var(--warn-soft)" />
        {segs.map((s) => (
          <rect key={s.t.taux} x={s.x} y={110} width={s.w} height={34} fill="var(--warn)" fillOpacity={shade(s.i)} />
        ))}
        {segs.slice(1).map((s) => (
          <line key={s.t.taux} x1={s.x} x2={s.x} y1={110} y2={144} stroke="var(--surface)" strokeWidth={1.5} />
        ))}
        <rect x={1} y={110} width={W} height={34} rx={4} fill="none" stroke="var(--warn)" strokeWidth={2} />
        <text x={(lastSeg.x + 339) / 2} y={132} className="ill-in ill-on-dark" textAnchor="middle">{`${fmtEur(last.base)} à ${rate(last.taux)}`}</text>
        <path d={`M2 152 v6 H${smallEnd - 1} v-6`} fill="none" stroke="var(--ink-2)" strokeWidth={1.5} />
        <text x={1} y={176} className="ill-sub" textAnchor="start">{`${fmtEur(smallSum)} seulement à ${small.map((t) => Math.round(t.taux * 100)).join(', ').replace(/, (\d+)$/, ' et $1')}\u00a0%`}</text>

        {tranches.map((t, i) => {
          const y = rowY(i);
          const isLast = i === tranches.length - 1;
          return (
            <g key={t.taux}>
              <rect x={1} y={y - 12} width={14} height={14} rx={3} fill="var(--warn)" fillOpacity={shade(i)} stroke="var(--warn)" strokeWidth={1} />
              <text x={24} y={y} className={isLast ? 'ill-step' : 'ill-sub'} textAnchor="start">{`${rate(t.taux)} sur ${fmtEur(t.base)}`}</text>
              <text x={339} y={y} className={isLast ? 'ill-step' : 'ill-in'} textAnchor="end">{fmtEur2(t.droits)}</text>
            </g>
          );
        })}
        <line x1={0} x2={340} y1={lineY} y2={lineY} stroke="var(--line)" strokeWidth={1} />
        <text x={0} y={lineY + 22} className="ill-total" textAnchor="start" style={{ fill: 'var(--danger)' }}>{`Droits à payer : ${fmtEur(total)}`}</text>
        <text x={0} y={lineY + 42} className="ill-sub" textAnchor="start">{`environ ${avg.toLocaleString('fr-FR')}\u00a0% des ${fmtEur(taxable)} taxés, pas ${rate(last.taux)} :`}</text>
        <text x={0} y={lineY + 60} className="ill-sub" textAnchor="start">les premiers euros sont taxés moins fort</text>
      </svg>
      <figcaption>{children}</figcaption>
    </figure>
  );
}

/**
 * Schéma « PEE : ce qui l’alimente, combien de temps c’est bloqué, ce qui est imposé » (schéma de principe, sans montant).
 * Règles : Service-Public F2142 (vérifiée le 1er janvier 2026) et F2140, consultées le 2026-11-18.
 */
export function SchemaPee() {
  const arrow = { fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 384" role="img" aria-labelledby="ill-pee-t ill-pee-d" className="ill-svg">
        <title id="ill-pee-t">PEE : vos sommes, le complément de l’entreprise, 5 ans de blocage</title>
        <desc id="ill-pee-d">Deux sources alimentent le plan d’épargne entreprise. D’un côté, vous : votre prime d’intéressement ou de participation, et vos versements volontaires. De l’autre, l’entreprise, qui peut compléter vos versements : c’est l’abondement, jusqu’à 3 fois ce que vous versez. L’ensemble est placé sur le PEE et bloqué au moins 5 ans, sauf cas de déblocage anticipé : mariage ou Pacs, troisième enfant, achat de la résidence principale, départ de l’entreprise, entre autres. À la sortie, les gains ne sont pas soumis à l’impôt sur le revenu, mais les prélèvements sociaux sont dus.</desc>
        <rect x={1} y={2} width={150} height={96} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={76} y={26} textAnchor="middle" className="ill-step">Vous</text>
        <text x={76} y={50} textAnchor="middle" className="ill-sub">intéressement,</text>
        <text x={76} y={68} textAnchor="middle" className="ill-sub">participation,</text>
        <text x={76} y={86} textAnchor="middle" className="ill-sub">vos versements</text>
        <text x={170} y={57} textAnchor="middle" className="ill-step">+</text>
        <rect x={189} y={2} width={150} height={96} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={264} y={26} textAnchor="middle" className="ill-step">L’entreprise</text>
        <text x={264} y={50} textAnchor="middle" className="ill-in">abondement</text>
        <text x={264} y={68} textAnchor="middle" className="ill-sub">jusqu’à 3 fois</text>
        <text x={264} y={86} textAnchor="middle" className="ill-sub">vos versements</text>
        <path d="M 76 98 V 112 Q 76 120 84 120 H 162 Q 170 120 170 128 V 140 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <path d="M 264 98 V 112 Q 264 120 256 120 H 178 Q 170 120 170 128" {...arrow} />
        <rect x={1} y={140} width={338} height={118} rx={12} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        <text x={170} y={166} textAnchor="middle" className="ill-step">Votre PEE : bloqué au moins 5 ans</text>
        <text x={170} y={190} textAnchor="middle" className="ill-in">placé dans les fonds choisis</text>
        <text x={170} y={214} textAnchor="middle" className="ill-sub">Sauf cas prévus : mariage ou Pacs,</text>
        <text x={170} y={232} textAnchor="middle" className="ill-sub">3e enfant, achat de la résidence</text>
        <text x={170} y={250} textAnchor="middle" className="ill-sub">principale, départ de l’entreprise…</text>
        <path d="M 170 258 V 284 m -7 -8 l 7 8 l 7 -8" {...arrow} />
        <rect x={1} y={284} width={338} height={72} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={170} y={309} textAnchor="middle" className="ill-step">À la sortie</text>
        <text x={170} y={331} textAnchor="middle" className="ill-in">gains sans impôt sur le revenu</text>
        <text x={170} y={348} textAnchor="middle" className="ill-sub">prélèvements sociaux dus</text>
        <text x={170} y={378} textAnchor="middle" className="ill-sub">Schéma de principe d’après Service-Public.fr</text>
      </svg>
    </figure>
  );
}

/**
 * Schéma « ce que rapportent 10 000 € en un an », commun aux fiches Compte à terme, PEL et LEP : le placement face au
 * Livret A, à la même échelle, avec la part retenue par l'impôt. Exemples fictifs des fiches (`TERM_DEPOSIT_EXAMPLE`,
 * `PEL_EXAMPLE`, LEP au plafond), taux des livrets pris dans `LIVRETS` ; montants recalculés par
 * `src/data/ficheExemples.test.ts`. Longueurs des barres proportionnelles aux montants.
 */
export type LivretBilanKind = 'compte-a-terme' | 'pel' | 'lep';

const pct2 = (n: number) => `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/[  ]/g, ' ')} %`;
const eurAuto = (n: number) => (Number.isInteger(n) ? fmtEur(n) : fmtEur2(n));

export function livretBilan(kind: LivretBilanKind) {
  const livretA = LIVRETS.find((l) => l.id === 'livretA')!;
  const lep = LIVRETS.find((l) => l.id === 'lep')!;
  const livretPct = livretA.rate * 100;
  const livretRow = { label: `Livret A à ${pct2(livretPct)}`, net: 0, tax: 0, gross: 0 };
  if (kind === 'compte-a-terme') {
    const { amount, grossPct, pfuPct } = TERM_DEPOSIT_EXAMPLE;
    const r = termDepositVsLivretA(amount, grossPct, pfuPct, livretPct);
    const gap = Math.round((r.net - r.livret) * 100) / 100;
    return {
      amount, pfuPct, name: 'Compte à terme',
      rows: [{ label: `Compte à terme à ${grossPct} % brut`, gross: r.gross, tax: r.tax, net: r.net }, { ...livretRow, gross: r.livret, net: r.livret }],
      ahead: gap > 0,
      lines: [`Après impôt : ${eurAuto(gap)} de plus`, `seulement si le taux brut dépasse ${pct2(r.breakEvenPct)} ;`, 'le Livret A reste disponible à tout moment'],
    };
  }
  if (kind === 'pel') {
    const { amount, ratePct, pfuPct } = PEL_EXAMPLE;
    const r = pelVsLivretA(amount, ratePct, pfuPct, livretPct);
    return {
      amount, pfuPct, name: 'PEL',
      rows: [{ label: `PEL ouvert en 2026, à ${pct2(ratePct)}`, gross: r.gross, tax: r.tax, net: r.net }, { ...livretRow, gross: r.livret, net: r.livret }],
      ahead: r.net > r.livret,
      lines: [`Après impôt : ${eurAuto(r.livret - r.net)} de moins`, 'le PEL ne passe devant que si le taux', `du Livret A descend sous ${pct2(r.breakEvenPct)}`],
    };
  }
  const r = lepVsLivretA(lep.cap, lep.rate * 100, livretPct);
  return {
    amount: lep.cap, pfuPct: 0, name: 'LEP',
    rows: [{ label: `LEP à ${pct2(lep.rate * 100)}`, gross: r.lep, tax: 0, net: r.lep }, { ...livretRow, gross: r.livret, net: r.livret }],
    ahead: r.gap > 0,
    lines: [`${fmtEur(r.gap)} de plus par an au LEP`, 'tous deux sans impôt ; le LEP est réservé', 'aux foyers sous un plafond de revenus'],
  };
}

export function SchemaLivretBilan({ kind, children }: { kind: LivretBilanKind; children: ReactNode }) {
  const { amount, pfuPct, name, rows, lines, ahead } = livretBilan(kind);
  const BAR = 206;
  const s = BAR / Math.max(...rows.map((r) => r.gross));
  const taxed = rows.some((r) => r.tax > 0);
  const ROW = 72;
  const legendY = rows.length * ROW + 4;
  const sepY = legendY + (taxed ? 32 : 0);
  const H = sepY + 74;
  const id = `ill-livb-${kind}`;
  const desc = `Exemple fictif : ${fmtEur(amount)} placés pendant un an. `
    + rows.map((r) => (r.tax > 0
      ? `${r.label} : ${eurAuto(r.gross)} d’intérêts, dont ${eurAuto(r.tax)} retenus par l’impôt (${pfuPct.toLocaleString('fr-FR')} %), il reste ${eurAuto(r.net)}.`
      : `${r.label} : ${eurAuto(r.net)} d’intérêts, sans impôt.`)).join(' ')
    + ` ${lines[0]}, ${lines[1]} ${lines[2]}.`;
  return (
    <figure className="illustration">
      <svg viewBox={`0 0 340 ${H}`} role="img" aria-labelledby={`${id}-t ${id}-d`} className="ill-svg">
        <title id={`${id}-t`}>{`${name} ou Livret A : ce que rapportent ${fmtEur(amount)} en un an`}</title>
        <desc id={`${id}-d`}>{desc}</desc>
        {rows.map((r, i) => {
          const y = i * ROW;
          const wNet = r.net * s;
          const wTax = r.tax * s;
          return (
            <g key={r.label}>
              <text x={0} y={y + 16} className="ill-step" textAnchor="start">{r.label}</text>
              <rect x={1} y={y + 26} width={wNet} height={30} rx={4} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
              <text x={1 + wNet / 2} y={y + 46} className="ill-in" textAnchor="middle">{eurAuto(r.net)}</text>
              {r.tax > 0 && (
                <>
                  <rect x={1 + wNet} y={y + 26} width={wTax} height={30} rx={4} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
                  <text x={1 + wNet + wTax / 2} y={y + 46} className="ill-in" textAnchor="middle">{eurAuto(r.tax)}</text>
                </>
              )}
              <text x={1 + wNet + wTax + 10} y={y + 46} className="ill-sub" textAnchor="start">{r.tax > 0 ? `${eurAuto(r.gross)} bruts` : 'sans impôt'}</text>
            </g>
          );
        })}
        {taxed && (
          <g transform={`translate(1 ${legendY})`}>
            <rect width={14} height={14} rx={3} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
            <text x={22} y={12} className="ill-sub" textAnchor="start">Ce qui vous reste</text>
            <rect x={164} width={14} height={14} rx={3} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
            <text x={186} y={12} className="ill-sub" textAnchor="start">{`Impôt : ${pfuPct.toLocaleString('fr-FR')} %`}</text>
          </g>
        )}
        <line x1={1} x2={339} y1={sepY} y2={sepY} stroke="var(--line)" strokeWidth={1.5} />
        <text x={0} y={sepY + 24} className="ill-total" textAnchor="start" style={{ fill: ahead ? 'var(--accent)' : 'var(--ink)' }}>{lines[0]}</text>
        <text x={0} y={sepY + 44} className="ill-sub" textAnchor="start">{lines[1]}</text>
        <text x={0} y={sepY + 63} className="ill-sub" textAnchor="start">{lines[2]}</text>
      </svg>
      <figcaption>{children}</figcaption>
    </figure>
  );
}

const pctFr = (n: number) => `${String(n).replace('.', ',')} %`;
/** Montant à l'euro s'il est rond (« 2 500 € »), au centime sinon (« 1 562,50 € »), comme dans le texte des fiches. */
const eurExact = (n: number) => (Number.isInteger(n) ? fmtEur(n) : fmtEur2(n));

/** Exemple fictif de la fiche PEA : gains retirés après 8 ans, en compte-titres puis en PEA (taux du cas général 2026). */
export const PEA_EXAMPLE = { gain: 20000, years: 8 };

/**
 * Schéma « PEA : sur 20 000 € de gains, ce qui vous reste » (exemple fictif de la fiche, constat du 2026-11-19 : l'exemple
 * de la fiche PEA, page d'entrée de l'épargnant, restait un paragraphe de quatre montants). Deux barres de même longueur,
 * proportionnelles aux montants : ce qui reste (à gauche), prélèvements sociaux, puis impôt sur le revenu. En PEA après
 * 5 ans, seul l'impôt sur le revenu disparaît : l'écart entre les deux barres vertes est exactement ce morceau.
 * Taux de `pfu.ts` (Service-Public F21618 et F2329, consultées le 2026-11-19) ; aucun chiffre nouveau.
 */
export function SchemaPeaBilan({ children }: { children: ReactNode }) {
  const { gain, years } = PEA_EXAMPLE;
  const cto = pfuSplit(gain);
  const peaTax = cto.ps;
  const peaNet = gain - peaTax;
  const X0 = 10;
  const W = 320;
  const s = W / gain;
  const ctoNetEnd = X0 + cto.net * s;
  const peaNetEnd = X0 + peaNet * s;
  const bar = (y: number, segs: { w: number; fill: string }[]) => {
    let x = X0;
    const id = `ill-peab-c${y}`;
    return (
      <>
        <clipPath id={id}><rect x={X0} y={y} width={W} height={40} rx={8} /></clipPath>
        <g clipPath={`url(#${id})`}>
          {segs.map((g, i) => {
            const r = <rect key={i} x={x} y={y} width={g.w} height={40} fill={g.fill} />;
            x += g.w;
            return r;
          })}
        </g>
        <rect x={X0} y={y} width={W} height={40} rx={8} fill="none" stroke="var(--ink-2)" strokeWidth={1.5} />
      </>
    );
  };
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 330" role="img" aria-labelledby="ill-peab-t ill-peab-d" className="ill-svg">
        <title id="ill-peab-t">{`PEA ou compte-titres : sur ${fmtEur(gain)} de gains, ce qui vous reste`}</title>
        <desc id="ill-peab-d">{`Exemple fictif : ${fmtEur(gain)} de gains retirés après ${years} ans. En compte-titres, le prélèvement forfaitaire unique de ${pctFr(PFU_TOTAL_PCT)} prend ${fmtEur(cto.total)} : ${fmtEur(cto.ir)} d’impôt sur le revenu et ${fmtEur(cto.ps)} de prélèvements sociaux ; il vous reste ${fmtEur(cto.net)}. En PEA de plus de 5 ans, seuls les prélèvements sociaux de ${pctFr(PFU_PS_PCT)} sont dus, soit ${fmtEur(peaTax)} ; il vous reste ${fmtEur(peaNet)}, ${fmtEur(peaNet - cto.net)} de plus : l’impôt sur le revenu évité.`}</desc>
        <text x={X0} y={20} className="ill-step">{`${fmtEur(gain)} de gains retirés après ${years} ans`}</text>
        <rect x={X0} y={34} width={14} height={14} rx={3} fill="var(--accent)" />
        <text x={X0 + 20} y={46} className="ill-sub">pour vous</text>
        <rect x={X0 + 100} y={34} width={14} height={14} rx={3} fill="var(--primary)" />
        <text x={X0 + 120} y={46} className="ill-sub">prélèvements sociaux</text>
        <rect x={X0} y={56} width={14} height={14} rx={3} fill="var(--warn)" />
        <text x={X0 + 20} y={68} className="ill-sub">{`impôt sur le revenu (${pctFr(PFU_IR_PCT)})`}</text>

        <text x={X0} y={102} className="ill-step">Compte-titres</text>
        <text x={X0 + W} y={102} className="ill-sub" textAnchor="end">{`impôt : ${fmtEur(cto.total)}`}</text>
        {bar(112, [{ w: cto.net * s, fill: 'var(--accent)' }, { w: cto.ps * s, fill: 'var(--primary)' }, { w: cto.ir * s, fill: 'var(--warn)' }])}
        <text x={X0 + 12} y={137} className="ill-on-dark ill-total">{`${fmtEur(cto.net)} pour vous`}</text>

        <text x={X0} y={186} className="ill-step">{`PEA de plus de 5 ans`}</text>
        <text x={X0 + W} y={186} className="ill-sub" textAnchor="end">{`impôt : ${fmtEur(peaTax)}`}</text>
        {bar(196, [{ w: peaNet * s, fill: 'var(--accent)' }, { w: peaTax * s, fill: 'var(--primary)' }])}
        <text x={X0 + 12} y={221} className="ill-on-dark ill-total">{`${fmtEur(peaNet)} pour vous`}</text>

        <path d={`M ${ctoNetEnd} 106 V 242`} stroke="var(--ink-2)" strokeWidth={1.5} strokeDasharray="4 3" />
        <path d={`M ${ctoNetEnd} 248 V 254 H ${peaNetEnd} V 248`} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" />
        <text x={X0 + W} y={272} className="ill-total" textAnchor="end" style={{ fill: 'var(--accent)' }}>{`+${fmtEur(peaNet - cto.net)} en PEA`}</text>
        <line x1={X0} y1={286} x2={X0 + W} y2={286} stroke="var(--line)" strokeWidth={1} />
        <text x={X0} y={306} className="ill-sub">{`Après 5 ans, le PEA évite l’impôt sur le revenu ;`}</text>
        <text x={X0} y={324} className="ill-sub">{`les prélèvements sociaux restent dus.`}</text>
      </svg>
      <figcaption>{children}</figcaption>
    </figure>
  );
}

/** Exemple fictif de la fiche Forêt : 10 000 € de parts, crédit de 25 %, plafond d'une personne seule puis d'un couple. */
export const FOREST_EXAMPLE = { amount: 10000, ratePct: 25, caps: [{ label: 'Personne seule', cap: 6250 }, { label: 'Couple marié ou pacsé', cap: 12500 }] };

/**
 * Schéma « Forêt : ce que coûtent vraiment 10 000 € de parts » (exemple fictif de la fiche, constat du 2026-11-18 :
 * l'exemple restait un paragraphe dense de cinq montants). Une barre par foyer, proportionnelle aux montants : ce que
 * les parts coûtent une fois le crédit d'impôt déduit, puis le crédit. Valeurs recalculées par `forestCredit` ; taux et
 * plafonds de la rubrique Fiscalité (BOFiP BOI-IR-RICI-60-20-20, reconsulté le 2026-11-19), aucun chiffre nouveau.
 */
export function SchemaForetBilan({ children }: { children: ReactNode }) {
  const { amount, ratePct, caps } = FOREST_EXAMPLE;
  const rows = caps.map((c) => ({ ...c, ...forestCredit(amount, c.cap, ratePct) }));
  const X0 = 10;
  const W = 320;
  const s = W / amount;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 300" role="img" aria-labelledby="ill-forb-t ill-forb-d" className="ill-svg">
        <title id="ill-forb-t">{`Forêt : ce que coûtent vraiment ${fmtEur(amount)} de parts`}</title>
        <desc id="ill-forb-d">{`Exemple fictif : ${fmtEur(amount)} versés pour des parts de groupement forestier, crédit d’impôt de ${ratePct} % des sommes retenues. ${rows.map((r) => `${r.label} : ${fmtEur(r.retained)} retenus, ${eurExact(r.credit)} de crédit (${pctFr(r.effectivePct)} de la somme versée), les parts coûtent ${eurExact(r.netCost)}`).join(' ; ')}. Hors frais du groupement.`}</desc>
        <text x={X0} y={20} className="ill-step">{`${fmtEur(amount)} de parts achetées`}</text>
        <rect x={X0} y={34} width={14} height={14} rx={3} fill="var(--surface-2)" stroke="var(--primary)" strokeWidth={2} />
        <text x={X0 + 20} y={46} className="ill-sub">votre coût</text>
        <rect x={X0 + 110} y={34} width={14} height={14} rx={3} fill="var(--accent)" />
        <text x={X0 + 130} y={46} className="ill-sub">{`crédit d’impôt (${ratePct} %)`}</text>
        {rows.map((r, i) => {
          const y = 80 + i * 96;
          const wCost = r.netCost * s;
          return (
            <g key={r.label}>
              <text x={X0} y={y} className="ill-step">{r.label}</text>
              <text x={X0 + W} y={y} className="ill-sub" textAnchor="end">{`crédit : ${eurExact(r.credit)}`}</text>
              <rect x={X0} y={y + 10} width={wCost} height={40} rx={8} fill="var(--surface-2)" stroke="var(--primary)" strokeWidth={2} />
              <rect x={X0 + wCost} y={y + 10} width={W - wCost} height={40} rx={8} fill="var(--accent)" />
              <text x={X0 + 12} y={y + 35} className="ill-total">{`coût : ${eurExact(r.netCost)}`}</text>
              <text x={X0} y={y + 70} className="ill-sub">
                {r.retained < amount
                  ? `plafond : ${fmtEur(r.retained)} retenus, soit ${pctFr(r.effectivePct)} des ${fmtEur(amount)}`
                  : `${fmtEur(r.retained)} retenus en entier, soit ${pctFr(r.effectivePct)}`}
              </text>
            </g>
          );
        })}
        <line x1={X0} y1={262} x2={X0 + W} y2={262} stroke="var(--line)" strokeWidth={1} />
        <text x={X0} y={286} className="ill-sub">Hors frais du groupement ; barres à l’échelle.</text>
      </svg>
      <figcaption>{children}</figcaption>
    </figure>
  );
}
