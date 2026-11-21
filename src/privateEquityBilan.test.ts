import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync } from 'node:fs';
import { SchemaPrivateEquityBilan, PRIVATE_EQUITY_BILAN } from './components/Illustrations';
import { fundFeesOnSubscribed } from './lib/calc/ficheExemples';

/**
 * Fiche Capital-investissement, exemple chiffré en schéma (constat du 2026-11-21) : 5 000 € souscrits, bloqués 8 ans,
 * frais de 3 % par an des sommes souscrites (150 € par an, 1 200 € en tout) ; le fonds doit valoir 6 200 € pour rendre
 * la mise, soit 24 % de gains à trouver d'abord. Pure arithmétique, recalculée ici.
 */
const TAILLES: Record<string, { px: number; em: number }> = {
  'ill-step': { px: 14.5, em: 0.56 },
  'ill-in': { px: 12, em: 0.56 },
  'ill-sub': { px: 13, em: 0.52 },
};
const svg = renderToStaticMarkup(createElement(SchemaPrivateEquityBilan)).replace(/<!-- -->/g, '').replace(/&#x27;/g, "'").replace(/[  ]/g, ' ');

describe('fiche Capital-investissement : exemple chiffré en schéma', () => {
  it('recalcule l’exemple : 8 × 150 €, 1 200 €, 6 200 €, +24 %', () => {
    expect(PRIVATE_EQUITY_BILAN).toEqual({ mise: 5000, fraisPct: 3, ans: 8 });
    expect(fundFeesOnSubscribed(5000, 3, 8)).toEqual({ yearly: 150, total: 1200 });
    expect(svg.match(/>−150 €</g)).toHaveLength(8);
    for (let i = 1; i <= 8; i++) expect(svg).toContain(`>année ${i}<`);
    for (const m of ['Frais : 3 % de 5 000 €, chaque année', '5 000 € : votre mise', '>1 200 €<', 'frais : 8 × 150 €', 'total : 6 200 €', 'À regagner d’abord : +1 200 € (+24 %)']) expect(svg).toContain(m);
    const desc = /<desc[^>]*>([^<]+)<\/desc>/.exec(svg)![1];
    expect(desc).toMatch(/^Exemple fictif/);
    expect(desc).toContain('24 % de la mise');
  });

  it('barre à l’échelle : la mise et les frais cumulés, proportionnels aux montants', () => {
    const bar = [...svg.matchAll(/<rect x="([\d.]+)" y="182" width="([\d.]+)" height="34"/g)].map((m) => ({ x: Number(m[1]), w: Number(m[2]) }));
    expect(bar).toHaveLength(2);
    const [mise, frais] = bar;
    expect(mise.w / frais.w).toBeCloseTo(5000 / 1200, 5);
    expect(frais.x).toBeCloseTo(mise.x + mise.w, 5);
    expect(mise.w + frais.w).toBeCloseTo(336, 5);
  });

  it('chaque texte tient dans le dessin, viewBox 340, léger et accessible', () => {
    expect(svg).toMatch(/viewBox="0 0 340 \d+"/);
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
    const hauteur = Number(/viewBox="0 0 340 (\d+)"/.exec(svg)![1]);
    const ts = [...svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)"(?: text-anchor="(start|middle|end)")? class="([\w -]+)"[^>]*>([^<]+)<\/text>/g)];
    expect(ts.length).toBeGreaterThan(20);
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
    expect(page).toContain("if (inv.slug === 'private-equity') return <SchemaPrivateEquityBilan>{ex}</SchemaPrivateEquityBilan>;");
  });
});
