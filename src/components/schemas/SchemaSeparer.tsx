/** Schéma « séparer l’entreprise et le patrimoine » : une partie des bénéfices part vers une épargne personnelle diversifiée. Aucun chiffre ; reprend le texte de la page Entrepreneuriat.
 * ViewBox 340 (2026-11-15) : textes à 12 px et plus à 375 px (contre ~11 px avec l'ancien viewBox 420). */
import type { ReactNode } from 'react';

/** `children` (facultatif) : texte de la page placé en légende. Sur grand écran, il se range à droite du dessin
 * (même présentation que les légendes des schémas des guides) au lieu de laisser un cadre pleine largeur presque vide. */
export function SchemaSeparer({ children }: { children?: ReactNode } = {}) {
  const savings = ['Livrets', 'PEA', 'Assurance-vie'];
  return (
    <figure className="illustration">
      <svg viewBox="0 0 340 296" role="img" aria-labelledby="ill-sep-t ill-sep-d" className="ill-svg">
        <title id="ill-sep-t">Séparer l’entreprise et le patrimoine personnel</title>
        <desc id="ill-sep-d">Une partie des bénéfices de l’entreprise est investie régulièrement dans une épargne personnelle diversifiée (livrets, PEA, assurance-vie), ce qui réduit la dépendance à une seule activité.</desc>
        <rect x={70} y={2} width={200} height={62} rx={12} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
        <text x={170} y={28} textAnchor="middle" className="ill-step">Votre entreprise</text>
        <text x={170} y={50} textAnchor="middle" className="ill-sub">une seule activité</text>
        <path d="M 170 64 V 112 m -7 -8 l 7 8 l 7 -8" fill="none" stroke="var(--ink-2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <text x={182} y={93} textAnchor="start" className="ill-in">une partie des bénéfices</text>
        <rect x={1} y={122} width={338} height={134} rx={14} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={170} y={148} textAnchor="middle" className="ill-step">Votre épargne personnelle</text>
        {savings.map((s, i) => (
          <g key={s}>
            <rect x={9 + i * 110} y={166} width={104} height={40} rx={10} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
            <text x={61 + i * 110} y={191} textAnchor="middle" className="ill-in">{s}</text>
          </g>
        ))}
        <text x={170} y={234} textAnchor="middle" className="ill-sub">diversifiée, hors de la société</text>
        <text x={170} y={282} textAnchor="middle" className="ill-sub">Moins de dépendance à une seule activité</text>
      </svg>
      {children && <figcaption className="fig-text">{children}</figcaption>}
    </figure>
  );
}
