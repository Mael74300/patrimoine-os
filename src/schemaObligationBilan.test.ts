import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaObligationBilan } from './components/schemas/fiches';
import { bondCoupons, sensitivityChangePct } from './lib/calc/ficheExemples';
import { OBLIGATION_EXAMPLE } from './lib/illustrationData';
import { investmentBySlug } from './data/investments';

/**
 * Fiche Obligations : l'exemple chiffré reçoit son schéma (constat du 2026-11-17). Mêmes montants que le texte de la fiche,
 * recalculés ; barres du bas proportionnelles à la valeur du fonds ; textes dans le dessin à 375 px (largeur estimée d'un
 * caractère : 0,52 em en texte normal, 0,56 em en gras, comme pour les autres schémas).
 */
const svg = renderToStaticMarkup(createElement(SchemaObligationBilan, null, 'Exemple fictif')).replace(/&#x27;/g, "'").replace(/[  ]/g, ' ');
const TAILLES: Record<string, { px: number; em: number }> = {
  'ill-year': { px: 14, em: 0.56 },
  'ill-total': { px: 14, em: 0.56 },
  'ill-step': { px: 14.5, em: 0.56 },
  'ill-in': { px: 12, em: 0.56 },
  'ill-sub': { px: 13, em: 0.52 },
  'ill-loss': { px: 13, em: 0.56 },
};

describe('fiche Obligations : schéma de l’exemple chiffré', () => {
  const { amount, ratePct, years, sensitivity, rateRisePoints } = OBLIGATION_EXAMPLE;

  it('mêmes données que le texte de la fiche', () => {
    expect(OBLIGATION_EXAMPLE).toEqual({ amount: 1000, ratePct: 3, years: 5, sensitivity: 5, rateRisePoints: 1 });
    expect(bondCoupons(amount, ratePct, years)).toEqual({ coupon: 30, totalCoupons: 150, received: 1150 });
    expect(sensitivityChangePct(sensitivity, rateRisePoints)).toBe(-5);
    const t = investmentBySlug.obligations.example.replace(/[  ]/g, ' ');
    for (const s of ['1 000 €', 'pendant 5 ans', 'coupon de 3 %', '30 € chaque année', '150 € en tout', 'sensibilité est de 5', 'environ 5 %', 'de 1 point']) expect(t).toContain(s);
  });

  it('montants affichés : 5 coupons de 30 €, 1 000 € rendus, 1 150 € au total, environ −5 %', () => {
    expect(svg.match(/>30 €</g)?.length).toBe(5);
    for (const v of ['an 5 : vos 1 000 € vous sont rendus', 'Reçu au total : 1 150 €', 'sensibilité 5', 'de 1 point', 'avant : 100 %', 'environ 95 %', 'environ −5 %', 'Exemple fictif', 'avant impôt et frais']) expect(svg).toContain(v);
  });

  it('la barre « après » mesure 95 % de la barre « avant », la part perdue 5 %', () => {
    expect(svg).toMatch(/<rect x="1" y="260" width="338"/);
    const kept = Number(svg.match(/<rect x="1" y="298" width="([\d.]+)"/)![1]);
    expect(kept).toBeCloseTo(338 * 0.95, 6);
    const lost = Number(svg.match(/<rect x="[\d.]+" y="298" width="([\d.]+)"[^>]*fill="var\(--danger\)"/)![1]);
    expect(lost).toBeCloseTo(338 * 0.05, 6);
  });

  it('viewBox 340, accessible, léger, chaque texte dans le dessin', () => {
    expect(svg).toMatch(/viewBox="0 0 340 356"/);
    expect(svg).toContain('role="img"');
    expect(svg).toMatch(/<desc[^>]*>Exemple fictif/);
    expect(svg.length).toBeLessThan(15000);
    const ts = [...svg.matchAll(/<text x="([\d.]+)" y="[\d.]+" class="([\w -]+)" text-anchor="(start|end|middle)"[^>]*>([^<]+)<\/text>/g)];
    expect(ts.length).toBeGreaterThanOrEqual(18);
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
