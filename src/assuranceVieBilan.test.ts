import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaAssuranceVieBilan } from './components/schemas/fiches';
import { assuranceVieRetrait } from './lib/calc/ficheExemples';
import { ASSURANCE_VIE_EXAMPLE } from './lib/illustrationData';
import { investmentBySlug } from './data/investments';

/**
 * Fiche Assurance-vie : l'exemple chiffré reçoit son schéma (constat du 2026-11-18). Mêmes montants que le texte de la
 * fiche, recalculés ; mêmes taux que sa rubrique Fiscalité ; barres proportionnelles ; textes dans le dessin à 375 px
 * (largeur estimée d'un caractère : 0,52 em en texte normal, 0,56 em en gras, comme pour les autres schémas).
 */
const norm = (t: string) => t.replace(/[  ]/g, ' ');
const svg = norm(renderToStaticMarkup(createElement(SchemaAssuranceVieBilan, null, 'Exemple fictif')).replace(/&#x27;/g, "'"));
const TAILLES: Record<string, { px: number; em: number }> = {
  'ill-step': { px: 14.5, em: 0.56 },
  'ill-total': { px: 14, em: 0.56 },
  'ill-sub': { px: 13, em: 0.52 },
};

describe('fiche Assurance-vie : schéma de l’exemple chiffré', () => {
  const { paid, value, allowance, socialPct } = ASSURANCE_VIE_EXAMPLE;
  const r = assuranceVieRetrait(paid, value, allowance, socialPct);

  it('valeurs recalculées : 3 000 € de gains, 0 € au-delà de l’abattement, 516 € de prélèvements sociaux, 9 484 € restants', () => {
    expect(ASSURANCE_VIE_EXAMPLE).toEqual({ paid: 7000, value: 10000, allowance: 4600, socialPct: 17.2 });
    expect(r).toEqual({ gains: 3000, overAllowance: 0, allowanceLeft: 1600, social: 516, net: 9484 });
  });

  it('cas limites : gains au-delà de l’abattement, aucune plus-value', () => {
    expect(assuranceVieRetrait(10000, 16000, 4600, 17.2)).toMatchObject({ gains: 6000, overAllowance: 1400, allowanceLeft: 0, social: 1032 });
    expect(assuranceVieRetrait(10000, 9000, 4600, 17.2)).toMatchObject({ gains: 0, social: 0, net: 9000 });
  });

  it('le texte et la rubrique Fiscalité de la fiche citent les mêmes montants et taux', () => {
    const inv = investmentBySlug['assurance-vie'];
    const t = norm(inv.example);
    expect(t).toMatch(/^Exemple fictif/);
    for (const s of ['7 000 € versés', 'plus de 8 ans', '10 000 €', '3 000 € de gains', '4 600 € exonérés', '17,2 % de prélèvements sociaux', 'soit 516 €']) expect(t).toContain(s);
    const tax = norm(inv.tax.text);
    expect(tax).toContain('17,2 % des gains');
    expect(tax).toContain('chaque année, 4 600 € de gains retirés sans impôt');
  });

  it('le schéma affiche les mêmes montants', () => {
    for (const v of ['Vous retirez 10 000 €', '>7 000 € versés<', '>3 000 €<', 'Impôt sur le revenu : 0 €', '4 600 € exonérés', 'Prélèvements sociaux : 516 €', '17,2 % des 3 000 € de gains', 'Il vous reste 9 484 € sur 10 000 €', 'Exemple fictif']) expect(svg).toContain(v);
  });

  it('barres proportionnelles : versements et gains, gains rapportés à l’abattement', () => {
    const rects = [...svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="(\d+)"/g)].map((m) => m.slice(1).map(Number));
    expect(rects).toHaveLength(4);
    expect(rects[0][2]).toBeCloseTo((7000 / 10000) * 320, 6);
    expect(rects[1][0]).toBeCloseTo(10 + (7000 / 10000) * 320, 6);
    expect(rects[1][2]).toBeCloseTo((3000 / 10000) * 320, 6);
    expect(rects[2][2]).toBe(320);
    expect(rects[3][2]).toBeCloseTo((3000 / 4600) * 320, 6);
  });

  it('viewBox 340, accessible, léger, chaque texte dans le dessin', () => {
    expect(svg).toMatch(/viewBox="0 0 340 316"/);
    expect(svg).toContain('role="img"');
    expect(svg).toMatch(/<desc[^>]*>Exemple fictif/);
    expect(svg.length).toBeLessThan(15000);
    const ts = [...svg.matchAll(/<text x="([\d.]+)" y="[\d.]+"(?: text-anchor="(start|end|middle)")? class="([\w -]+)"(?: text-anchor="(start|end|middle)")?[^>]*>([^<]+)<\/text>/g)];
    expect(ts.length).toBe(12);
    for (const m of ts) {
      const taille = TAILLES[m[3]];
      expect(taille, m[3]).toBeDefined();
      const anchor = m[2] ?? m[4] ?? 'start';
      const x = Number(m[1]);
      const l = m[5].length * taille.em * taille.px;
      const [g, d] = anchor === 'end' ? [x - l, x] : anchor === 'middle' ? [x - l / 2, x + l / 2] : [x, x + l];
      expect(g, m[5]).toBeGreaterThanOrEqual(0);
      expect(d, m[5]).toBeLessThanOrEqual(340);
    }
  });
});
