import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ACTIONS_EXAMPLE, SchemaActions } from './components/Illustrations';
import { investmentBySlug } from './data/investments';
import { concentrationLoss } from './lib/calc/ficheExemples';

/** Schéma de l'exemple chiffré de la fiche Actions en direct : 15 000 € sur 15 lignes, puis sur 3 (exemple fictif). */
describe('schéma « Actions en direct » : 15 lignes ou 3', () => {
  const svg = renderToStaticMarkup(createElement(SchemaActions)).replace(/[  ]/g, ' ');
  const texte = svg.replace(/<[^>]+>/g, ' ');
  const ex = investmentBySlug['actions-individuelles']!.example.replace(/[  ]/g, ' ');
  const a = concentrationLoss(ACTIONS_EXAMPLE.total, ACTIONS_EXAMPLE.many);
  const b = concentrationLoss(ACTIONS_EXAMPLE.total, ACTIONS_EXAMPLE.few);

  it('reprend les montants de l’exemple de la fiche, recalculés', () => {
    expect(a).toEqual({ lines: 15, perLine: 1000, maxLossPct: 6.7 });
    expect(b).toEqual({ lines: 3, perLine: 5000, maxLossPct: 33.3 });
    for (const t of ['15 lignes de 1 000 €', '3 lignes de 5 000 €', '6,7 %', '33,3 %']) {
      expect(ex).toContain(t);
      expect(texte).toContain(t);
    }
    expect(texte).toContain('15 000 € placés en actions');
    expect(texte).toContain('perte 5 fois plus lourde');
  });
  it('deux rangées de même longueur : une case défaillante sur 15, puis sur 3', () => {
    const cases = [...svg.matchAll(/<rect x="([\d.]+)" y="(90|206)" width="([\d.]+)"[^>]*fill="var\(--(accent|warn)-soft\)"/g)];
    for (const [y, n] of [['90', 15], ['206', 3]] as const) {
      const r = cases.filter((c) => c[2] === y);
      expect(r).toHaveLength(n);
      expect(r.filter((c) => c[4] === 'warn')).toHaveLength(1);
      const last = r[r.length - 1]!;
      expect(Number(r[0]![1])).toBe(1);
      expect(Number(last[1]) + Number(last[3])).toBeCloseTo(339, 5);
    }
    expect(svg.match(/>5 000 €</g)).toHaveLength(2);
    expect(svg.match(/>0 €</g)).toHaveLength(1);
  });
  it('chaque texte aligné à gauche tient dans la largeur du dessin', () => {
    const em: Record<string, number> = { 'ill-step': 0.56 * 14.5, 'ill-total': 0.56 * 14, 'ill-sub': 0.52 * 13 };
    const textes = [...svg.matchAll(/<text x="([\d.]+)" y="[\d.]+" class="([\w-]+)">([^<]+)<\/text>/g)];
    expect(textes.length).toBeGreaterThan(6);
    for (const [, x, classe, contenu] of textes) expect(Number(x) + contenu.length * em[classe]!, contenu).toBeLessThanOrEqual(339);
  });
  it('est marqué fictif, léger et accessible, avec l’exemple en légende', () => {
    expect(texte).toContain('Exemple fictif');
    expect(svg).toContain('role="img"');
    expect(svg).toContain('<desc');
    expect(svg.length).toBeLessThan(15000);
    const avec = renderToStaticMarkup(createElement(SchemaActions, null, 'légende'));
    expect(avec).toContain('<figcaption>légende</figcaption>');
  });
});
