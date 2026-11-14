import { fmtEur, fmtMonths, type LoanSplit } from '../../lib/finance';

/**
 * Calculateur de crédit : « où part chaque mensualité ». Aire empilée, à l'échelle, de la mensualité hors assurance :
 * en bas le capital remboursé, en haut les intérêts, en moyenne mensuelle année par année (src/lib/calc/loan.ts, loanSplit).
 * Aucun chiffre réglementaire : tout vient des saisies du visiteur.
 */
const X0 = 10;
const X1 = 330;
const TOP = 34;
const BASE = 168;

export function SchemaMensualite({ split, years }: { split: LoanSplit; years: number }) {
  const n = split.years.length;
  const max = split.payment;
  const x = (t: number) => X0 + (t / n) * (X1 - X0);
  const y = (v: number) => BASE - (Math.max(0, Math.min(v, max)) / max) * (BASE - TOP);
  // Un point au milieu de chaque année, prolongé jusqu'aux bords.
  const pts = split.years.map((yr, i) => ({ x: x(i + 0.5), cap: y(yr.principal), tot: y(yr.principal + yr.interest) }));
  // Aux bords : la première et la dernière mensualité exactes.
  const capLine = [{ x: X0, cap: y(split.first.principal) }, ...pts, { x: X1, cap: y(split.last.principal) }];
  const totLine = [{ x: X0, tot: y(split.first.principal + split.first.interest) }, ...pts, { x: X1, tot: y(split.last.principal + split.last.interest) }];
  const capPath = `M ${X0} ${BASE} ` + capLine.map((p) => `L ${p.x.toFixed(1)} ${p.cap.toFixed(1)}`).join(' ') + ` L ${X1} ${BASE} Z`;
  const intPath =
    totLine.map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(1)} ${p.tot.toFixed(1)}`).join(' ') + ' ' +
    [...capLine].reverse().map((p) => `L ${p.x.toFixed(1)} ${p.cap.toFixed(1)}`).join(' ') + ' Z';
  const noInterest = split.first.interest < 0.5;
  // Libellés dans les aires seulement s'il y a la place (hauteur de la bande au début du prêt).
  const capStart = y(split.first.principal);
  const intLabel = !noInterest && capStart - TOP >= 30;
  const capLeft = BASE - capStart >= 30;
  const halfX = x(split.halfMonth / 12);
  const halfLabelX = Math.min(Math.max(halfX, X0 + 115), X1 - 115);
  const half = fmtMonths(split.halfMonth);
  const desc = noInterest
    ? `Sans intérêts, chaque mensualité de ${fmtEur(split.payment)} rembourse uniquement le capital. La moitié du capital est remboursée au bout de ${half}.`
    : `Mensualité de ${fmtEur(split.payment)} hors assurance. La première paie ${fmtEur(split.first.interest)} d’intérêts et rembourse ${fmtEur(split.first.principal)} de capital ; la dernière paie ${fmtEur(split.last.interest)} d’intérêts et rembourse ${fmtEur(split.last.principal)} de capital. La moitié du capital emprunté est remboursée au bout de ${half}, sur ${fmtMonths(Math.round(years * 12))}.`;
  return (
    <figure className="illustration ill-mens">
      <svg viewBox="0 0 340 220" role="img" aria-labelledby="ill-mens-t ill-mens-d" className="ill-svg">
        <title id="ill-mens-t">Où part chaque mensualité : intérêts et capital remboursé, du début à la fin du prêt</title>
        <desc id="ill-mens-d">{desc}</desc>
        <text x={X0} y={18} className="ill-sub" textAnchor="start">{`Mensualité hors assurance : ${fmtEur(split.payment)}`}</text>
        <path d={capPath} fill="var(--accent-soft)" stroke="none" />
        {!noInterest && <path d={intPath} fill="var(--warn-soft)" stroke="none" />}
        <polyline points={capLine.map((p) => `${p.x.toFixed(1)},${p.cap.toFixed(1)}`).join(' ')} fill="none" stroke="var(--accent)" strokeWidth={2} />
        <line x1={halfX} x2={halfX} y1={TOP} y2={BASE} stroke="var(--ink-2)" strokeWidth={1.5} strokeDasharray="4 4" />
        <line x1={X0} x2={X1} y1={TOP} y2={TOP} stroke="var(--warn)" strokeWidth={2} />
        <line x1={X0} x2={X1} y1={BASE} y2={BASE} stroke="var(--ink-3)" strokeWidth={1.5} />
        {intLabel && <text x={X0 + 10} y={TOP + 24} className="ill-step ill-halo-warn" textAnchor="start">Intérêts</text>}
        <text x={capLeft ? X0 + 10 : X1 - 10} y={BASE - 14} className="ill-step ill-halo-accent" textAnchor={capLeft ? 'start' : 'end'}>Capital remboursé</text>
        <circle cx={halfX} cy={BASE} r={4} fill="var(--ink-2)" />
        <text x={X0} y={BASE + 18} className="ill-sub" textAnchor="start">Début</text>
        <text x={X1} y={BASE + 18} className="ill-sub" textAnchor="end">{`Fin : ${fmtMonths(Math.round(years * 12))}`}</text>
        <text x={halfLabelX} y={BASE + 40} className="ill-in" textAnchor="middle">{`Moitié remboursée : ${half}`}</text>
      </svg>
      <figcaption>
        {noInterest ? (
          <>Sans intérêts, toute la mensualité rembourse le capital.</>
        ) : (
          <>
            <strong>Première mensualité</strong> : {fmtEur(split.first.interest)} d’intérêts et {fmtEur(split.first.principal)} de capital.{' '}
            <strong>Dernière</strong> : {fmtEur(split.last.interest)} d’intérêts et {fmtEur(split.last.principal)} de capital.
            {' '}Les intérêts se calculent sur ce qui reste dû : lourds au début, ils fondent ensuite.
          </>
        )}
        {' '}Montants hors assurance, tirés de vos saisies.
      </figcaption>
    </figure>
  );
}
