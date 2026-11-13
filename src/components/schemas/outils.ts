/** Constantes de dessin et petites fonctions partagées par les schémas SVG. */
export const W = 420;

export const BASE = 262;

export const TOP = 40;

export const BAR_W = 84;

export const pct = (v: number) => `${v < 0 ? '−' : ''}${(Math.abs(v) * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;

/** Coupe un libellé en lignes d'au plus `max` caractères, aux espaces. */
export function wrapLabel(label: string, max: number): string[] {
  const lines: string[] = [];
  for (const word of label.split(' ')) {
    const last = lines[lines.length - 1];
    if (last !== undefined && (last + ' ' + word).length <= max) lines[lines.length - 1] = last + ' ' + word;
    else lines.push(word);
  }
  return lines;
}
