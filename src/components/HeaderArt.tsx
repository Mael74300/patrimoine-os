export type HeaderArtName = 'guides' | 'simulateurs' | 'encyclopedie' | 'comparateur' | 'entrepreneuriat';

/** Scènes décoratives des bandeaux de rubrique (240 × 150) : même trait, mêmes couleurs que les icônes ; aucune donnée chiffrée. */
export function HeaderArt({ name }: { name: HeaderArtName }) {
  const line = { fill: 'none', stroke: 'var(--primary)', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const soft = { fill: 'var(--accent-soft)', stroke: 'var(--accent)', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const white = { fill: '#fff', stroke: 'var(--primary)', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const gold = { fill: 'var(--gold)', stroke: 'var(--primary)', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  let scene: JSX.Element;
  switch (name) {
    case 'guides': // livre ouvert, ampoule au-dessus
      scene = <>
        <path d="M30 128c30-12 60-12 90 0 30-12 60-12 90 0" {...line} opacity=".35" />
        <path d="M120 124V62C98 50 66 50 36 60v62c30-10 62-10 84 2z" {...white} />
        <path d="M120 124V62c22-12 54-12 84-2v62c-30-10-62-10-84 2z" {...soft} />
        <path d="M54 76c18-4 38-4 52 2M54 92c18-4 38-4 52 2M134 78c14-6 34-6 52-2M134 94c14-6 34-6 52-2" {...line} />
        <path d="M120 22a17 17 0 0 0-9 31v5h18v-5a17 17 0 0 0-9-31z" {...gold} />
        <path d="M113 64h14M85 20l-7-6M155 20l7-6M70 40h-9M170 40h9" {...line} />
      </>;
      break;
    case 'simulateurs': // calculatrice et courbe
      scene = <>
        <rect x="26" y="18" width="84" height="116" rx="12" {...white} />
        <rect x="38" y="30" width="60" height="24" rx="6" {...soft} />
        <path d="M46 66h12M72 66h12M46 84h12M72 84h12M46 102h12M72 102h12" {...line} strokeWidth={6} />
        <rect x="40" y="114" width="56" height="10" rx="5" {...gold} />
        <path d="M130 124h92M130 124V40" {...line} />
        <path d="M138 108l24-22 20 12 34-50" {...line} stroke="var(--accent)" />
        <path d="M206 54h14v14" {...line} stroke="var(--accent)" />
        <circle cx="162" cy="86" r="5" {...gold} /><circle cx="182" cy="98" r="5" {...gold} />
      </>;
      break;
    case 'encyclopedie': // étagère de volumes et loupe
      scene = <>
        <path d="M20 128h150" {...line} />
        <rect x="30" y="52" width="26" height="76" rx="4" {...white} />
        <rect x="60" y="34" width="26" height="94" rx="4" {...soft} />
        <rect x="90" y="60" width="26" height="68" rx="4" {...gold} />
        <rect x="120" y="44" width="26" height="84" rx="4" {...white} />
        <path d="M37 68h12M67 52h12M97 76h12M127 60h12M37 112h12M67 112h12" {...line} strokeWidth={2.5} />
        <circle cx="188" cy="62" r="26" {...white} fill="var(--accent-soft)" />
        <path d="M207 82l22 24" {...line} strokeWidth={7} />
        <path d="M176 58a14 14 0 0 1 12-10" {...line} stroke="var(--accent)" />
      </>;
      break;
    case 'comparateur': // balance, deux plateaux
      scene = <>
        <path d="M120 30v94M86 128h68" {...line} />
        <circle cx="120" cy="26" r="6" {...gold} />
        <path d="M44 44h152" {...line} />
        <path d="M44 44 24 92h40zM196 44l-20 48h40z" {...soft} />
        <path d="M24 92a20 14 0 0 0 40 0M176 92a20 14 0 0 0 40 0" {...line} />
        <path d="M34 78h20M186 66h20M186 78h20" {...line} strokeWidth={2.5} />
      </>;
      break;
    default: // entrepreneuriat : pousse et boutique
      scene = <>
        <path d="M24 128h192" {...line} />
        <rect x="136" y="64" width="70" height="64" rx="6" {...white} />
        <path d="M130 64l8-24h66l8 24z" {...soft} />
        <path d="M130 64a9 9 0 0 0 18 0 9 9 0 0 0 18 0 9 9 0 0 0 18 0 9 9 0 0 0 18 0" {...line} />
        <rect x="160" y="92" width="22" height="36" rx="3" {...gold} />
        <ellipse cx="68" cy="120" rx="34" ry="8" {...gold} />
        <path d="M68 118V68" {...line} />
        <path d="M68 86C48 86 40 72 40 58c20 0 28 10 28 28zM68 76c0-18 10-30 30-30 0 18-10 30-30 30z" {...soft} />
      </>;
      break;
  }
  return <svg viewBox="0 0 240 150" aria-hidden="true" focusable="false" className="header-art">{scene}</svg>;
}

/** Scène décorative du bandeau d'accueil (260 × 200), pensée pour le fond bleu : piles de pièces de plus en plus hautes et pousse. Aucune donnée chiffrée. */
export function HomeArt() {
  const w = { fill: 'rgba(255,255,255,.12)', stroke: '#fff', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const g = { fill: 'var(--gold)', stroke: '#fff', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const l = { fill: 'none', stroke: '#fff', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const pile = (x: number, n: number) => Array.from({ length: n }, (_, i) => {
    const y = 172 - i * 16;
    return <path key={`${x}-${i}`} d={`M${x - 26} ${y}v-10a26 9 0 0 1 52 0v10a26 9 0 0 1-52 0z`} {...(i === n - 1 ? g : w)} />;
  });
  return (
    <svg viewBox="0 0 260 200" aria-hidden="true" focusable="false" className="home-art">
      <path d="M8 184h244" {...l} opacity=".5" />
      {pile(50, 2)}
      {pile(130, 4)}
      {pile(210, 6)}
      <path d="M50 118c34-6 60-26 80-56M210 66V44" {...l} strokeDasharray="2 9" opacity=".7" />
      <path d="M210 52V28" {...l} />
      <path d="M210 40C192 40 184 28 184 14c18 0 26 10 26 26zM210 32c0-16 10-26 28-26 0 16-10 26-28 26z" fill="var(--accent-soft)" stroke="#fff" strokeWidth={3} strokeLinejoin="round" />
    </svg>
  );
}
