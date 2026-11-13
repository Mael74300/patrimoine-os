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
