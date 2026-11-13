import { capitalViseRows, CAPITAL_VISE_EXAMPLE } from '../../lib/illustrationData';

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
