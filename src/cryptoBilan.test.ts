import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync } from 'node:fs';
import { SchemaCryptoBilan, CRYPTO_BILAN } from './components/Illustrations';
import { recoveryAfterDrop } from './lib/calc/ficheExemples';
import { investmentBySlug } from './data/investments';

/**
 * Fiche Cryptomonnaies, exemple chiffré en schéma (constat du 2026-11-21) : 1 000 € tombent à 300 € après −70 %,
 * remontent à 510 € après +70 % ; il faut +233 % pour revenir au départ. Pure arithmétique, recalculée ici.
 */
const TAILLES: Record<string, { px: number; em: number }> = {
  'ill-step': { px: 14.5, em: 0.56 },
  'ill-in': { px: 12, em: 0.56 },
  'ill-sub': { px: 13, em: 0.52 },
};
const svg = renderToStaticMarkup(createElement(SchemaCryptoBilan)).replace(/<!-- -->/g, '').replace(/&#x27;/g, "'").replace(/[\u00a0\u202f]/g, ' ');

describe('fiche Cryptomonnaies : exemple chiffré en schéma', () => {
  it('recalcule l’exemple : 300 €, 510 €, +233 %', () => {
    expect(CRYPTO_BILAN).toEqual({ mise: 1000, baissePct: 70 });
    expect(recoveryAfterDrop(1000, 70)).toEqual({ afterDrop: 300, recoveryPct: 233, sameRiseValue: 510 });
    for (const m of ['1 000 €', '300 €', '510 €', 'baisse de 70 %', 'hausse de 70 %', 'Pour revenir à 1 000 € : +233 %', 'depuis 300 €, soit plus que tripler', 'manque']) expect(svg).toContain(m);
    expect(1000 / 300).toBeGreaterThan(3);
    const desc = /<desc[^>]*>([^<]+)<\/desc>/.exec(svg)![1];
    expect(desc).toMatch(/^Exemple fictif/);
  });

  it('colonnes proportionnelles aux montants, la part manquante va jusqu’au niveau de départ', () => {
    const cols = [...svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="80" height="([\d.]+)" rx="4" fill="var\(--(?!none)[^"]+"/g)].map((m) => ({ y: Number(m[2]), h: Number(m[3]) }));
    expect(cols).toHaveLength(3);
    expect(cols[1].h / cols[0].h).toBeCloseTo(0.3, 5);
    expect(cols[2].h / cols[0].h).toBeCloseTo(0.51, 5);
    const manque = /<rect x="246" y="([\d.]+)" width="80" height="([\d.]+)" rx="4" fill="none"/.exec(svg)!;
    expect(Number(manque[1])).toBeCloseTo(cols[0].y, 5);
    expect(Number(manque[1]) + Number(manque[2])).toBeCloseTo(cols[2].y, 5);
  });

  it('le texte de la fiche reste cohérent et ne recopie pas le dessin', () => {
    const ex = investmentBySlug.cryptomonnaies.example.replace(/[\u00a0\u202f]/g, ' ');
    expect(ex).toMatch(/^Exemple fictif/);
    for (const m of ['1 000 €', '300 €', 'baisse de 70 %', 'la même hausse ne suffit pas']) expect(ex).toContain(m);
    expect(ex).not.toContain('510 €');
    expect(ex).not.toContain('233 %');
  });

  it('chaque texte tient dans le dessin, viewBox 340, léger et accessible', () => {
    expect(svg).toMatch(/viewBox="0 0 340 \d+"/);
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
    const hauteur = Number(/viewBox="0 0 340 (\d+)"/.exec(svg)![1]);
    const ts = [...svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)"(?: text-anchor="(middle|end)")? class="([\w -]+)"[^>]*>([^<]+)<\/text>/g)];
    expect(ts.length).toBeGreaterThan(8);
    for (const [, xs, ys, a, classe, contenu] of ts) {
      const x = Number(xs);
      const t = TAILLES[classe];
      expect(t, classe).toBeDefined();
      const l = contenu.length * t.em * t.px;
      const [debut, fin] = a === 'middle' ? [x - l / 2, x + l / 2] : a === 'end' ? [x - l, x] : [x, x + l];
      expect(debut, contenu).toBeGreaterThanOrEqual(2);
      expect(fin, contenu).toBeLessThanOrEqual(338);
      expect(Number(ys), contenu).toBeLessThanOrEqual(hauteur - 4);
    }
  });

  it('la fiche affiche le schéma dans « Exemple chiffré »', () => {
    const page: string = readFileSync('src/pages/InvestmentPage.tsx', 'utf8');
    expect(page).toContain("if (inv.slug === 'cryptomonnaies') return <SchemaCryptoBilan>{ex}</SchemaCryptoBilan>;");
  });
});
