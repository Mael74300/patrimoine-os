import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync } from 'node:fs';
import { SchemaOrBilan, OR_BILAN, orTaxe } from './components/Illustrations';
import { abattementDetentionMeubles } from './lib/calc/ficheExemples';
import { investmentBySlug } from './data/investments';

/**
 * Fiche Or, exemple chiffré en schéma (constat du 2026-11-21) : la même pièce sous les deux régimes, puis la part du gain
 * exonérée selon la durée de détention. Mêmes règles que la rubrique Fiscalité (BOFiP BOI-RPPM-PVBMC-20-10 et -20-20,
 * consultés le 2026-11-21) ; montants recalculés ici.
 */
const TAILLES: Record<string, { px: number; em: number }> = {
  'ill-step': { px: 14.5, em: 0.56 },
  'ill-in': { px: 12, em: 0.56 },
  'ill-sub': { px: 13, em: 0.52 },
  'ill-total': { px: 14, em: 0.56 },
};
const svg = renderToStaticMarkup(createElement(SchemaOrBilan)).replace(/<!-- -->/g, '').replace(/&#x27;/g, "'").replace(/[  ]/g, ' ');

describe('fiche Or : exemple chiffré en schéma', () => {
  it('recalcule l’exemple : 230 € de taxe forfaitaire, 0 € sur option après 23 ans', () => {
    expect(OR_BILAN).toMatchObject({ achat: 1000, vente: 2000, annees: 23 });
    expect(orTaxe(OR_BILAN.vente)).toBe(230);
    expect(abattementDetentionMeubles(OR_BILAN.annees)).toBe(1);
    for (const m of ['1 770 € pour vous', '230 € de taxe', '11,5 %', '1 000 € payés', '1 000 € de gain', '2 000 € pour vous, 0 € d’impôt', 'votre pièce : 23 ans']) expect(svg).toContain(m);
  });

  it('la courbe suit la règle : rien avant 3 ans, 5 % par année ensuite, tout après 22 ans', () => {
    expect(abattementDetentionMeubles(2)).toBe(0);
    expect(abattementDetentionMeubles(3)).toBe(0.05);
    expect(abattementDetentionMeubles(12)).toBe(0.5);
    expect(abattementDetentionMeubles(21)).toBe(0.95);
    expect(abattementDetentionMeubles(22)).toBe(1);
    const desc = /<desc[^>]*>([^<]+)<\/desc>/.exec(svg)![1];
    for (const m of ['0 % à 2 ans', '50 % à 12 ans', '100 % à 22 ans', '5 % par année de détention au-delà de la deuxième', 'Exemple fictif']) expect(desc).toContain(m);
  });

  it('mêmes montants que le texte de la fiche', () => {
    const or = investmentBySlug.or;
    const ex = or.example.replace(/[  ]/g, ' ');
    for (const m of ['1 000 €', '2 000 €', '23 ans', '230 €', ': 0 €', '22 ans']) expect(ex).toContain(m);
    const tax = or.tax.text.replace(/[  ]/g, ' ');
    for (const m of ['11,5 %', '5 % par année de détention au-delà de la deuxième', 'exonéré après 22 ans']) expect(tax).toContain(m);
  });

  it('barres proportionnelles aux montants', () => {
    const rects = [...svg.matchAll(/<rect x="([\d.]+)" y="(26|120)" width="([\d.]+)"/g)].map((m) => ({ y: m[2], w: Number(m[3]) }));
    const taxe = rects.find((r) => r.y === '26')!;
    expect(taxe.w / 338).toBeCloseTo(230 / 2000, 5);
    const achat = rects.find((r) => r.y === '120')!;
    expect(achat.w / 338).toBeCloseTo(1000 / 2000, 5);
  });

  it('chaque texte tient dans le dessin, viewBox 340, léger et accessible', () => {
    expect(svg).toMatch(/viewBox="0 0 340 \d+"/);
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
    const hauteur = Number(/viewBox="0 0 340 (\d+)"/.exec(svg)![1]);
    const cadres = [...svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g)].map((m) => m.slice(1).map(Number));
    const ts = [...svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)"(?: text-anchor="(middle|end)")? class="([\w -]+)"[^>]*>([^<]+)<\/text>/g)];
    expect(ts.length).toBeGreaterThan(10);
    for (const [, xs, ys, a, classe, contenu] of ts) {
      const x = Number(xs);
      const y = Number(ys);
      const t = TAILLES[classe];
      expect(t, classe).toBeDefined();
      const l = contenu.length * t.em * t.px;
      const [debut, fin] = a === 'middle' ? [x - l / 2, x + l / 2] : a === 'end' ? [x - l, x] : [x, x + l];
      const cadre = cadres.find(([cx, cy, w, h]) => x >= cx && x <= cx + w && y > cy && y < cy + h);
      const [g, d] = cadre ? [cadre[0], cadre[0] + cadre[2]] : [0, 340];
      expect(debut, contenu).toBeGreaterThanOrEqual(g + (cadre && a !== undefined ? 4 : 0) - 0.5);
      expect(fin, contenu).toBeLessThanOrEqual(d - 2);
      expect(y, contenu).toBeLessThanOrEqual(hauteur - 4);
    }
  });

  it('la fiche affiche le schéma dans « Exemple chiffré », et celui du compte-titres n’y est plus en double', () => {
    const page: string = readFileSync('src/pages/InvestmentPage.tsx', 'utf8');
    expect(page).toContain("if (inv.slug === 'or') return <SchemaOrBilan>{ex}</SchemaOrBilan>;");
    expect(page).toContain("if (inv.slug === 'compte-titres') return <SchemaCto>{ex}</SchemaCto>;");
    expect(page).not.toContain("inv.slug === 'compte-titres' && <SchemaCto />");
  });
});
