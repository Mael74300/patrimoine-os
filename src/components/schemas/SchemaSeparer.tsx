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
