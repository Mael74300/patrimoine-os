export type HeaderArtName =
  | 'guides' | 'simulateurs' | 'encyclopedie' | 'comparateur' | 'entrepreneuriat'
  | 'glossaire' | 'plan-du-site' | 'introuvable'
  | 'sim-epargne' | 'sim-credit' | 'sim-budget' | 'sim-immobilier' | 'sim-retraite';

/** Scène du bandeau d'un simulateur, selon son thème (même découpage que la liste des simulateurs). */
export const SIM_THEME_ART: Record<string, HeaderArtName> = {
  epargne: 'sim-epargne',
  credit: 'sim-credit',
  budget: 'sim-budget',
  immobilier: 'sim-immobilier',
  retraite: 'sim-retraite',
  entreprise: 'entrepreneuriat',
};

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
    case 'glossaire': // bulle « ? » devenue bulle expliquée, et trois lettres en tuiles
      scene = <>
        <path d="M24 26h70a12 12 0 0 1 12 12v30a12 12 0 0 1-12 12H52l-16 14V80H24a12 12 0 0 1-12-12V38a12 12 0 0 1 12-12z" {...white} />
        <path d="M51 44a8 8 0 1 1 11 7c-3 1-4 3-4 6" {...line} />
        <circle cx="58" cy="66" r="2.5" fill="var(--primary)" />
        <path d="M112 54h16M122 46l8 8-8 8" {...line} stroke="var(--accent)" />
        <path d="M148 18h70a12 12 0 0 1 12 12v42a12 12 0 0 1-12 12h-12v14l-16-14h-42a12 12 0 0 1-12-12V30a12 12 0 0 1 12-12z" {...soft} />
        <path d="M152 38h54M152 52h62M152 66h40" {...line} strokeWidth={2.5} />
        <rect x="60" y="104" width="34" height="34" rx="7" {...gold} />
        <path d="M69 130l8-18 8 18M72 124h10" {...line} strokeWidth={2.5} />
        <rect x="104" y="104" width="34" height="34" rx="7" {...white} />
        <path d="M115 112v18h7a5 5 0 0 0 0-10h-7 6a4 4 0 0 0 0-8z" {...line} strokeWidth={2.5} />
        <rect x="148" y="104" width="34" height="34" rx="7" {...soft} />
        <path d="M172 115a9 9 0 1 0 0 12" {...line} strokeWidth={2.5} />
      </>;
      break;
    case 'plan-du-site': // carte pliée en trois volets, chemin en pointillés jusqu'à une épingle
      scene = <>
        <path d="M30 40l56-16 64 16 60-16v100l-60 16-64-16-56 16z" {...white} />
        <path d="M86 24l64 16v100l-64-16z" {...soft} />
        <path d="M86 24v100M150 40v100" {...line} />
        <path d="M48 112c14-6 22-22 38-24s30 18 48 10 22-30 42-34" {...line} stroke="var(--accent)" strokeDasharray="2 9" />
        <circle cx="48" cy="112" r="5" {...gold} />
        <path d="M184 70c0-14-11-22-11-32a11 11 0 0 1 22 0c0 10-11 18-11 32z" {...gold} />
        <circle cx="184" cy="38" r="4" {...white} />
      </>;
      break;
    case 'introuvable': // panneau indicateur à deux directions sur un chemin qui se sépare
      scene = <>
        <path d="M24 134h192" {...line} />
        <path d="M120 134V22" {...line} strokeWidth={4} />
        <circle cx="120" cy="20" r="5" {...gold} />
        <path d="M120 34h66l16 14-16 14h-66z" {...soft} />
        <path d="M134 48h40" {...line} strokeWidth={2.5} />
        <path d="M120 72H56L40 86l16 14h64z" {...white} />
        <path d="M66 86h40" {...line} strokeWidth={2.5} />
        <path d="M96 134a24 10 0 0 1 48 0z" {...soft} />
        <path d="M44 128v-8M50 128v-12M56 128v-7M184 128v-8M190 128v-12M196 128v-7" {...line} stroke="var(--accent)" strokeWidth={2.5} />
        <circle cx="62" cy="40" r="20" {...gold} />
        <path d="M55 35a7 7 0 1 1 10 6c-2 1-3 3-3 5" {...line} />
        <circle cx="62" cy="52" r="2.2" fill="var(--primary)" />
      </>;
      break;
    case 'sim-epargne': // bocal de pièces, une pièce qui tombe, pousse sur une petite pile
      scene = <>
        <path d="M24 132h192" {...line} opacity=".35" />
        <path d="M104 9V3M116 9V3" {...line} opacity=".5" />
        <circle cx="110" cy="22" r="9" {...gold} />
        <path d="M78 52h64v6c10 6 14 14 14 24v40a10 10 0 0 1-10 10H74a10 10 0 0 1-10-10V82c0-10 4-18 14-24z" {...white} />
        <rect x="72" y="38" width="76" height="14" rx="6" {...soft} />
        <path d="M100 45h20" {...line} />
        {[122, 110, 98].map((y) => <path key={y} d={`M86 ${y}v-8a24 8 0 0 1 48 0v8a24 8 0 0 1-48 0z`} {...gold} />)}
        {[128, 118].map((y) => <path key={y} d={`M170 ${y}v-8a20 7 0 0 1 40 0v8a20 7 0 0 1-40 0z`} {...gold} />)}
        <path d="M190 104V74" {...line} />
        <path d="M190 92c-16 0-24-11-24-22 16 0 24 8 24 22zM190 84c0-15 8-24 24-24 0 15-8 24-24 24z" {...soft} />
      </>;
      break;
    case 'sim-credit': // contrat signé, pièce en euro et clé
      scene = <>
        <rect x="30" y="20" width="98" height="114" rx="10" {...white} />
        <rect x="44" y="34" width="48" height="10" rx="5" {...soft} />
        <path d="M44 64h68M44 80h68M44 96h46M44 124h70" {...line} strokeWidth={2.5} />
        <path d="M48 117c6-8 10 2 15-3s9 4 14-2 8 3 12-1" {...line} stroke="var(--accent)" />
        <circle cx="122" cy="36" r="17" {...gold} />
        <path d="M128 29a9 9 0 1 0 0 14M112 34h12M112 39h12" {...line} strokeWidth={2.5} />
        <path d="M188 70l32 32M204 86l8-8M213 95l7-7" {...line} strokeWidth={6} />
        <circle cx="172" cy="56" r="21" {...gold} />
        <circle cx="168" cy="52" r="7" {...white} />
      </>;
      break;
    case 'sim-budget': // répartition en anneau et portefeuille
      scene = <>
        <circle cx="76" cy="76" r="46" {...white} />
        <path d="M76 76V30A46 46 0 0 1 115.8 99z" {...soft} />
        <path d="M76 76l39.8 23A46 46 0 0 1 60.3 119.2z" {...gold} />
        <circle cx="76" cy="76" r="19" {...white} />
        <rect x="150" y="36" width="58" height="30" rx="4" {...soft} />
        <circle cx="179" cy="51" r="6" {...line} />
        <rect x="140" y="56" width="84" height="64" rx="10" {...white} />
        <rect x="188" y="76" width="36" height="24" rx="6" {...soft} />
        <circle cx="200" cy="88" r="4" {...gold} />
        <path d="M152 74h22" {...line} strokeWidth={2.5} />
      </>;
      break;
    case 'sim-immobilier': // maison, immeuble et arbre
      scene = <>
        <path d="M18 130h204" {...line} />
        <rect x="42" y="76" width="68" height="54" rx="3" {...white} />
        <path d="M30 80 76 40l46 40z" {...soft} />
        <rect x="66" y="100" width="20" height="30" rx="3" {...gold} />
        <rect x="50" y="88" width="12" height="12" rx="2" {...line} />
        <rect x="92" y="88" width="12" height="12" rx="2" {...line} />
        <rect x="138" y="34" width="58" height="96" rx="4" {...white} />
        {[46, 66, 86].map((y) => <g key={y}><rect x="148" y={y} width="14" height="11" rx="2" {...soft} /><rect x="172" y={y} width="14" height="11" rx="2" {...soft} /></g>)}
        <rect x="158" y="108" width="18" height="22" rx="2" {...gold} />
        <path d="M216 130v-22" {...line} />
        <circle cx="216" cy="96" r="13" {...soft} />
      </>;
      break;
    case 'sim-retraite': // soleil couchant sur l'horizon et sablier : combien de temps dure le capital
      scene = <>
        <path d="M18 112h126" {...line} />
        <path d="M44 112a36 36 0 0 1 72 0z" {...gold} />
        <path d="M80 66V54M54 86l-9-8M106 86l9-8M38 100l-11-4M122 100l11-4" {...line} />
        <path d="M34 124c10-6 20-6 30 0s20 6 30 0M64 136c10-6 20-6 30 0s20 6 30 0" {...line} opacity=".5" />
        <path d="M166 32c0 26 22 30 22 43s-22 17-22 43h44c0-26-22-30-22-43s22-17 22-43z" {...white} />
        <path d="M173 44h30c-2 11-9 17-15 21-6-4-13-10-15-21z" {...gold} />
        <path d="M188 72v30" {...line} stroke="var(--gold)" strokeWidth={2} />
        <path d="M172 118c4-11 10-15 16-15s12 4 16 15z" {...gold} />
        <rect x="156" y="22" width="64" height="10" rx="5" {...soft} />
        <rect x="156" y="118" width="64" height="10" rx="5" {...soft} />
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
