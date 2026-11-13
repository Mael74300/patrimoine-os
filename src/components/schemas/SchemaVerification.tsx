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
