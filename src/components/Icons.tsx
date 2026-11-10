// Icônes décoratives (accueil, Encyclopédie, Simulateurs, Guides) : séparées des schémas pour ne pas charger
// tous les schémas des guides et des fiches sur les pages qui n'en ont pas besoin.
export type SituationIconName = 'pousse' | 'pieces' | 'maison' | 'soleil';

/** Icônes décoratives des parcours d'accueil : même trait (2,5), même grille 48 × 48, couleurs du thème. */
export function SituationIcon({ name }: { name: SituationIconName }) {
  const line = { fill: 'none', stroke: 'var(--primary)', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const soft = { fill: 'var(--accent-soft)', stroke: 'var(--accent)', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <svg viewBox="0 0 48 48" width={48} height={48} aria-hidden="true" focusable="false" className="situation-icon">
      {name === 'pousse' && (
        <>
          <path d="M24 42V24" {...line} />
          <path d="M24 28c-9 0-13-5-13-12 8 0 13 4 13 12z" {...soft} />
          <path d="M24 24c0-7 4-11 12-11 0 7-4 11-12 11z" {...soft} />
          <path d="M16 42h16" {...line} />
        </>
      )}
      {name === 'pieces' && (
        <>
          <ellipse cx="24" cy="35" rx="14" ry="5.5" {...soft} />
          <path d="M10 27v8M38 27v8" {...line} />
          <ellipse cx="24" cy="27" rx="14" ry="5.5" {...soft} />
          <path d="M10 19v8M38 19v8" {...line} />
          <ellipse cx="24" cy="19" rx="14" ry="5.5" {...soft} />
        </>
      )}
      {name === 'maison' && (
        <>
          <path d="M6 23 24 8l18 15" {...line} />
          <path d="M11 20v22h26V20" {...soft} />
          <path d="M20 42V30h8v12" {...line} />
        </>
      )}
      {name === 'soleil' && (
        <>
          <path d="M6 36h36" {...line} />
          <path d="M14 36a10 10 0 0 1 20 0z" {...soft} />
          <path d="M24 12v6M10 20l4 4M38 20l-4 4" {...line} />
        </>
      )}
    </svg>
  );
}

/** Icônes décoratives des familles d'investissement : même grille 48 × 48 et même trait que `SituationIcon`. */
export function FamilyIcon({ id, size = 40 }: { id: string; size?: number }) {
  const line = { fill: 'none', stroke: 'var(--primary)', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const soft = { fill: 'var(--accent-soft)', stroke: 'var(--accent)', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  let shape: JSX.Element;
  switch (id) {
    case 'epargne': // tirelire
      shape = <><ellipse cx="22" cy="28" rx="14" ry="10" {...soft} /><path d="M34 24l6-3v8l-5-2M14 37v4M28 37v4M17 16c3-2 8-2 11 0" {...line} /><path d="M20 20h6" {...line} /></>;
      break;
    case 'actions': // courbe en hausse
      shape = <><path d="M8 8v32h34" {...line} /><path d="M14 33l9-10 7 6 11-14" {...soft} fill="none" /><path d="M34 15h7v7" {...line} /></>;
      break;
    case 'obligations': // titre avec sceau
      shape = <><rect x="9" y="8" width="30" height="32" rx="3" {...soft} /><path d="M16 17h16M16 24h16" {...line} /><circle cx="29" cy="33" r="4" {...line} /></>;
      break;
    case 'enveloppes': // enveloppe
      shape = <><rect x="7" y="12" width="34" height="24" rx="3" {...soft} /><path d="M8 14l16 12 16-12" {...line} /></>;
      break;
    case 'immobilier': // immeuble
      shape = <><rect x="12" y="6" width="24" height="36" rx="2" {...soft} /><path d="M19 14h2M27 14h2M19 22h2M27 22h2M19 30h2M27 30h2M21 42v-6h6v6" {...line} /></>;
      break;
    case 'pierre-papier': // maison + feuille
      shape = <><path d="M5 24 18 12l13 12" {...line} /><path d="M9 22v16h18V22" {...soft} /><rect x="30" y="20" width="12" height="18" rx="2" {...line} /><path d="M33 26h6M33 31h6" {...line} /></>;
      break;
    case 'credit-immo': // maison + flèche de levier
      shape = <><path d="M6 24 20 11l14 13" {...line} /><path d="M10 22v18h20V22" {...soft} /><path d="M36 38V20M31 25l5-5 5 5" {...line} /></>;
      break;
    case 'entreprise': // mallette
      shape = <><rect x="7" y="16" width="34" height="23" rx="3" {...soft} /><path d="M18 16v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4M7 27h34" {...line} /><path d="M22 27v3h4v-3" {...line} /></>;
      break;
    case 'numerique': // écran
      shape = <><rect x="6" y="9" width="36" height="25" rx="3" {...soft} /><path d="M18 41h12M24 34v7" {...line} /><path d="M13 27l6-6 5 4 8-8" {...line} /></>;
      break;
    case 'private': // fusée / jeune pousse en cercle
      shape = <><circle cx="24" cy="24" r="16" {...soft} /><path d="M24 33V22M24 25c-5 0-7-3-7-7 5 0 7 3 7 7zM24 22c0-4 2-6 7-6 0 4-2 6-7 6z" {...line} /></>;
      break;
    case 'metaux': // lingot
      shape = <><path d="M5 34l6-14h26l6 14z" {...soft} /><path d="M15 27h18M12 34h24" {...line} /></>;
      break;
    case 'crypto': // pièce à B stylisé (cercle et barres)
      shape = <><circle cx="24" cy="24" r="16" {...soft} /><path d="M20 15v18M20 17h6a4 4 0 0 1 0 8h-6M20 25h7a4 4 0 0 1 0 8h-7M23 12v3M28 12v3M23 33v3M28 33v3" {...line} /></>;
      break;
    case 'collection': // cadre de tableau
      shape = <><rect x="7" y="8" width="34" height="32" rx="2" {...line} /><rect x="13" y="14" width="22" height="20" {...soft} /><path d="M15 31l7-8 5 5 3-3 5 6" {...line} /></>;
      break;
    case 'terres': // champ et soleil
      shape = <><circle cx="34" cy="14" r="5" {...soft} /><path d="M5 40l8-16h22l8 16zM11 32h26M8 38h32" {...line} /></>;
      break;
    case 'energie': // éclair
      shape = <><path d="M27 5 11 27h12l-2 16 16-23H25z" {...soft} /></>;
      break;
    case 'retraite': // sablier
      shape = <><path d="M13 7h22M13 41h22M15 7c0 9 9 12 9 17s-9 8-9 17M33 7c0 9-9 12-9 17s9 8 9 17" {...line} /><path d="M18 36c3-3 9-3 12 0v5H18z" {...soft} /></>;
      break;
    case 'levier': // balance à bascule
      shape = <><path d="M24 22l-9 18h18z" {...soft} /><path d="M6 30 42 14" {...line} /><circle cx="9" cy="34" r="4" {...soft} /><circle cx="39" cy="10" r="4" {...soft} /></>;
      break;
    case 'capital-humain': // toque de diplômé
      shape = <><path d="M24 10 4 20l20 10 20-10z" {...soft} /><path d="M12 25v9c6 5 18 5 24 0v-9M44 20v12" {...line} /></>;
      break;
    case 'transmission': // deux mains / cœur
      shape = <><path d="M24 40C10 30 7 22 7 17a8 8 0 0 1 17-3 8 8 0 0 1 17 3c0 5-3 13-17 23z" {...soft} /></>;
      break;
    default: // étoile discrète
      shape = <path d="M24 7l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z" {...soft} />;
  }
  return <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" focusable="false" className="family-icon">{shape}</svg>;
}

/** Icônes décoratives des thèmes de simulateurs : même trait et mêmes couleurs que `FamilyIcon`, grille 48 × 48. */
export function SimThemeIcon({ id, size = 36 }: { id: string; size?: number }) {
  const line = { fill: 'none', stroke: 'var(--primary)', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const soft = { fill: 'var(--accent-soft)', stroke: 'var(--accent)', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  let shape: JSX.Element;
  switch (id) {
    case 'epargne': // plante qui pousse sur une pile de pièces
      shape = <><ellipse cx="24" cy="39" rx="14" ry="5" {...soft} /><path d="M10 31v8M38 31v8" {...line} /><ellipse cx="24" cy="31" rx="14" ry="5" {...soft} /><path d="M24 26V14M24 19c-5 0-8-3-8-8 5 0 8 3 8 8zM24 16c0-4 3-6 8-6 0 4-3 6-8 6z" {...line} /></>;
      break;
    case 'credit': // calculette
      shape = <><rect x="10" y="6" width="28" height="36" rx="4" {...soft} /><path d="M16 14h16" {...line} /><path d="M17 23h2M24 23h2M31 23h2M17 31h2M24 31h2M31 31h2M17 38h2M24 38h9" {...line} /></>;
      break;
    case 'budget': // camembert
      shape = <><circle cx="24" cy="24" r="16" {...soft} /><path d="M24 24V8M24 24l13.9 8" {...line} /><circle cx="24" cy="24" r="16" {...line} /></>;
      break;
    case 'immobilier': // maison
      shape = <><path d="M6 23 24 8l18 15" {...line} /><path d="M11 20v22h26V20" {...soft} /><path d="M20 42V30h8v12" {...line} /></>;
      break;
    case 'retraite': // soleil couchant
      shape = <><path d="M6 36h36" {...line} /><path d="M14 36a10 10 0 0 1 20 0z" {...soft} /><path d="M24 12v6M10 20l4 4M38 20l-4 4" {...line} /></>;
      break;
    case 'entreprise': // mallette
      shape = <><rect x="7" y="16" width="34" height="23" rx="3" {...soft} /><path d="M18 16v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4M7 27h34" {...line} /><path d="M22 27v3h4v-3" {...line} /></>;
      break;
    default: // autres : courbe en hausse
      shape = <><path d="M8 8v32h34" {...line} /><path d="M14 33l9-10 7 6 11-14" {...line} /></>;
  }
  return <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" focusable="false" className="sim-theme-icon">{shape}</svg>;
}

/** Icônes décoratives des quatre parcours de la page Guides : même trait et même grille 48 × 48 que `SimThemeIcon`. */
export function GuideGroupIcon({ index, size = 36 }: { index: number; size?: number }) {
  const line = { fill: 'none', stroke: 'var(--primary)', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const soft = { fill: 'var(--accent-soft)', stroke: 'var(--accent)', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  let shape: JSX.Element;
  switch (index) {
    case 0: // drapeau de départ
      shape = <><path d="M12 42V7" {...line} /><path d="M12 9h26l-6 8 6 8H12z" {...soft} /></>;
      break;
    case 1: // engrenage : les mécanismes
      shape = <><circle cx="24" cy="24" r="11" {...soft} /><circle cx="24" cy="24" r="4.5" {...line} /><path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.6 10.6l4.2 4.2M33.2 33.2l4.2 4.2M10.6 37.4l4.2-4.2M33.2 14.8l4.2-4.2" {...line} /></>;
      break;
    case 2: // balance : choisir
      shape = <><path d="M24 8v32M15 40h18" {...line} /><path d="M9 14h30" {...line} /><path d="M9 14l-5 12h10zM39 14l-5 12h10z" {...soft} /><path d="M4 26a5 4 0 0 0 10 0M34 26a5 4 0 0 0 10 0" {...line} /></>;
      break;
    default: // maison et clé : immobilier et crédit
      shape = <><path d="M5 22 22 8l17 14" {...line} /><path d="M10 19v21h24V19" {...soft} /><path d="M18 40V29h8v11" {...line} /><circle cx="39" cy="38" r="3.5" {...soft} /><path d="M39 34.5V28M39 31h4" {...line} /></>;
  }
  return <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" focusable="false" className="sim-theme-icon">{shape}</svg>;
}

