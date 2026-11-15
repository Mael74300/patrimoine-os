/** Schéma « Comment une information est contrôlée » : processus du site (qualitatif, aucun chiffre), repris du texte de la page Méthode.
 * ViewBox 340 (2026-11-15) : trois cartes (la dernière plus large), textes à 12 px et plus à 375 px (contre ~11 px avec l'ancien viewBox 420). */
export function SchemaVerification() {
  const steps = [
    { a: 'Source', b: 'officielle,', c: 'consultée', fill: 'var(--surface)', stroke: 'var(--primary)' },
    { a: 'Fiche', b: 'datée, avec', c: 'ses sources', fill: 'var(--accent-soft)', stroke: 'var(--accent)' },
    { a: 'Contrôle', b: 'automatique', c: 'chaque semaine', fill: 'var(--warn-soft)', stroke: 'var(--warn)' },
  ];
  const CWS = [100, 100, 118];
  const GAP = 9;
  const x0 = (i: number) => 1 + CWS.slice(0, i).reduce((a, b) => a + b + GAP, 0);
  const cx = (i: number) => x0(i) + CWS[i] / 2;
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 262" role="img" aria-labelledby="ill-ver-t ill-ver-d" className="ill-svg">
        <title id="ill-ver-t">Comment une information est contrôlée</title>
        <desc id="ill-ver-d">Trois étapes : une source officielle est consultée, la fiche en garde la date et les sources, puis des contrôles automatiques passent chaque semaine. Quand un changement est repéré, une personne vérifie et décide : rien n’est modifié automatiquement.</desc>
        {steps.map((st, i) => (
          <g key={st.a}>
            <rect x={x0(i)} y={4} width={CWS[i]} height={86} rx={12} fill={st.fill} stroke={st.stroke} strokeWidth={2} />
            <text x={cx(i)} y={32} textAnchor="middle" className="ill-step">{st.a}</text>
            <text x={cx(i)} y={56} textAnchor="middle" className="ill-sub">{st.b}</text>
            <text x={cx(i)} y={74} textAnchor="middle" className="ill-sub">{st.c}</text>
            {i < 2 && <path d={`M ${x0(i) + CWS[i] + 1} 47 h 6 m -3 -3 l 3 3 l -3 3`} fill="none" stroke="var(--ink-2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />}
          </g>
        ))}
        <path d={`M ${cx(2)} 90 V 120 m -7 -8 l 7 8 l 7 -8`} fill="none" stroke="var(--ink-2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <text x={cx(2) - 14} y={110} textAnchor="end" className="ill-in">si un changement est repéré</text>
        <rect x={1} y={128} width={338} height={72} rx={14} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={170} y={158} textAnchor="middle" className="ill-step">Une personne vérifie et décide</text>
        <text x={170} y={182} textAnchor="middle" className="ill-sub">Aucune règle n’est modifiée automatiquement</text>
        <text x={170} y={230} textAnchor="middle" className="ill-sub">Information non confirmée : conservée</text>
        <text x={170} y={250} textAnchor="middle" className="ill-sub">et signalée « à vérifier »</text>
      </svg>
    </figure>
  );
}
