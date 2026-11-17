import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaEtfBilan } from './components/schemas/fiches';
import { etfMilestones } from './lib/calc/ficheExemples';
import { ETF_EXAMPLE } from './lib/illustrationData';
import { investmentBySlug } from './data/investments';

/**
 * Fiche ETF actions diversifiés : l'exemple chiffré reçoit son schéma (constat du 2026-11-17). Mêmes montants que le texte
 * de la fiche, recalculés ; barres proportionnelles à la valeur ; textes dans le dessin à 375 px (largeur estimée d'un
 * caractère : 0,52 em en texte normal, 0,56 em en gras, comme pour les autres schémas).
 */
const norm = (t: string) => t.replace(/[\u00a0\u202f]/g, ' ');
const svg = norm(renderToStaticMarkup(createElement(SchemaEtfBilan, null, 'Exemple fictif')).replace(/&#x27;/g, "'"));
const TAILLES: Record<string, { px: number; em: number }> = {
  'ill-year': { px: 14, em: 0.56 },
  'ill-total': { px: 14, em: 0.56 },
  'ill-in': { px: 12, em: 0.56 },
  'ill-sub': { px: 13, em: 0.52 },
};

describe('fiche ETF : schéma de l’exemple chiffré', () => {
  const { monthly, ratePct, years, step, dropPct } = ETF_EXAMPLE;
  const r = etfMilestones(monthly, ratePct, years, step, dropPct);

  it('valeurs recalculées : 14 000, 32 700, 57 700 et 91 100 €, gains 43 100 €, 63 800 € après −30 %', () => {
    expect(ETF_EXAMPLE).toEqual({ monthly: 200, ratePct: 6, years: 20, step: 5, dropPct: 30 });
    expect(r.milestones.map((m) => [m.year, m.contributed, m.value])).toEqual([[5, 12000, 14000], [10, 24000, 32700], [15, 36000, 57700], [20, 48000, 91100]]);
    expect(r.milestones[3].gains).toBe(43100);
    expect(r.lastStepShare).toBeGreaterThan(0.45);
    expect(r.lastStepShare).toBeLessThan(0.5);
    expect(r.afterDrop).toBe(63800);
    expect(r.afterDrop).toBeGreaterThan(r.milestones[3].contributed);
  });

  it('le texte de la fiche cite les mêmes montants', () => {
    const t = norm(investmentBySlug['etf-monde'].example);
    expect(t).toMatch(/^Exemple fictif/);
    for (const s of ['200 € par mois pendant 20 ans', '6 % par an nette de frais', '48 000 € versés', 'environ 91 100 €', '43 100 € de gains', 'presque la moitié', '5 dernières années', 'baissait de 30 %', 'environ 63 800 €', 'Avant impôt']) expect(t).toContain(s);
  });

  it('le schéma affiche les mêmes montants', () => {
    for (const v of ['>14 000 €<', '>32 700 €<', '>57 700 €<', '>91 100 €<', '>63 800 €<', 'Gains en 20 ans : 43 100 €', 'presque la moitié', 'baisse de 30 % l’année 20', '48 000 € versés', 'Exemple fictif']) expect(svg).toContain(v);
  });

  it('barres proportionnelles : versements puis gains, part perdue de 30 %', () => {
    const rects = [...svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="22"/g)].map((m) => m.slice(1).map(Number));
    expect(rects).toHaveLength(10);
    const scale = 230 / 91100;
    r.milestones.forEach((m, i) => {
      expect(rects[2 * i][2]).toBeCloseTo(m.contributed * scale, 6);
      expect(rects[2 * i + 1][2]).toBeCloseTo(m.gains * scale, 6);
      expect(rects[2 * i + 1][0]).toBeCloseTo(40 + m.contributed * scale, 6);
    });
    expect(rects[8][2]).toBeCloseTo(63800 * scale, 6);
    expect(rects[9][2]).toBeCloseTo((91100 - 63800) * scale, 6);
  });

  it('viewBox 340, accessible, léger, chaque texte dans le dessin', () => {
    expect(svg).toMatch(/viewBox="0 0 340 356"/);
    expect(svg).toContain('role="img"');
    expect(svg).toMatch(/<desc[^>]*>Exemple fictif/);
    expect(svg.length).toBeLessThan(15000);
    const ts = [...svg.matchAll(/<text x="([\d.]+)" y="[\d.]+" class="([\w -]+)" text-anchor="(start|end|middle)"[^>]*>([^<]+)<\/text>/g)];
    expect(ts.length).toBeGreaterThanOrEqual(16);
    for (const m of ts) {
      const taille = TAILLES[m[2]];
      expect(taille, m[2]).toBeDefined();
      const x = Number(m[1]);
      const l = m[4].length * taille.em * taille.px;
      const [g, d] = m[3] === 'end' ? [x - l, x] : m[3] === 'middle' ? [x - l / 2, x + l / 2] : [x, x + l];
      expect(g, m[4]).toBeGreaterThanOrEqual(0);
      expect(d, m[4]).toBeLessThanOrEqual(340);
    }
  });
});
