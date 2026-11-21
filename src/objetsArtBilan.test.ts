import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync } from 'node:fs';
import { SchemaObjetsArtBilan, ART_BILAN } from './components/Illustrations';
import { abattementDetentionMeubles, artResale } from './lib/calc/ficheExemples';
import { investmentBySlug } from './data/investments';

/**
 * Fiche Objets d’art, exemple chiffré en schéma (constat du 2026-11-21) : tableau adjugé 5 000 €, 1 000 € de frais
 * d’acheteur (≈ 20 %), 6 000 € payés ; revendu 8 000 € : 520 € de taxe (6,5 %), 7 480 € restent, +1 480 € ; revendu
 * 6 000 € : 390 € de taxe, 5 610 € restent, −390 € ; revendu 8 000 € après plus de 22 ans, sur option : 0 €, +2 000 €.
 * Pure arithmétique sur les taux de la fiche, recalculée ici.
 */
const TAILLES: Record<string, { px: number; em: number }> = {
  'ill-step': { px: 14.5, em: 0.56 },
  'ill-in': { px: 12, em: 0.56 },
  'ill-sub': { px: 13, em: 0.52 },
};
const svg = renderToStaticMarkup(createElement(SchemaObjetsArtBilan)).replace(/<!-- -->/g, '').replace(/&#x27;/g, "'").replace(/[\u00a0\u202f]/g, ' ');
const fiche = investmentBySlug['objets-d-art-collection']!;
const n = (t: string) => t.replace(/[\u00a0\u202f]/g, ' ');

describe('fiche Objets d’art : exemple chiffré en schéma', () => {
  it('mêmes taux que les rubriques Frais et Fiscalité de la fiche', () => {
    expect(ART_BILAN).toEqual({ adjuge: 5000, fraisPct: 20, taxePct: 6.5, seuil: 5000, haut: 8000, plat: 6000 });
    expect(n(fiche.fees.text)).toContain('de l’ordre de 20 %');
    expect(n(fiche.tax.text)).toContain('6,5 % au total');
    expect(n(fiche.tax.text)).toContain('inférieur ou égal à 5 000 €');
    expect(n(fiche.tax.text)).toContain('exonéré après 22 ans');
    expect(abattementDetentionMeubles(23)).toBe(1);
  });

  it('recalcule l’exemple : 6 000 € payés, 520 € et 390 € de taxe, +1 480 €, −390 €, +2 000 €', () => {
    const r = artResale(5000, 20, 6.5, 5000, [8000, 6000]);
    expect(r.cost).toBe(6000);
    expect(r.sales.map((s) => [s.tax, s.net, s.vsCost])).toEqual([[520, 7480, 1480], [390, 5610, -390]]);
    for (const m of ['Achat : 5 000 € adjugé, plus les frais', '5 000 € adjugé', '= 6 000 €', 'dont 1 000 € de frais d’acheteur (≈ 20 %)',
      'Revendu 8 000 € (taxe par défaut)', '7 480 € pour vous', '520 € de taxe : 6,5 % du prix', 'gain : +1 480 €',
      'Revendu 6 000 €, le prix payé', '5 610 € pour vous', '390 € de taxe quand même', 'perte : −390 €',
      'Revendu 8 000 € après plus de 22 ans', '8 000 € pour vous', 'sur option : 0 € d’impôt', 'gain : +2 000 €',
      'pointillés : les 6 000 € payés à l’achat']) expect(svg).toContain(m);
    const desc = /<desc[^>]*>([^<]+)<\/desc>/.exec(svg)![1];
    expect(desc).toMatch(/^Exemple fictif/);
    expect(desc).toContain('facture conservée');
  });

  it('barres à l’échelle : 8 000 € = toute la largeur, trait pointillé au prix payé', () => {
    const k = 338 / 8000;
    const rects = [...svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="30"/g)].map((m) => ({ x: +m[1], y: +m[2], w: +m[3] }));
    const largeurs = rects.map((r) => r.w);
    for (const v of [5000, 1000, 7480, 520, 5610, 390, 8000]) expect(largeurs.some((w) => Math.abs(w - v * k) < 1e-6), `${v}`).toBe(true);
    expect(rects).toHaveLength(7); // pas de case de taxe à 0 €
    const traits = [...svg.matchAll(/<line x1="([\d.]+)" x2="\1" y1="([\d.]+)" y2="([\d.]+)"/g)];
    expect(traits).toHaveLength(4); // un trait par barre, aucun sur les textes
    const x = Number(traits[0]![1]);
    for (const t of traits) expect(Number(t[1])).toBeCloseTo(x, 6);
    expect(x).toBeCloseTo(1 + 6000 * k, 6);
    // La revente au prix payé s'arrête au trait : la taxe fait passer sous le prix payé.
    const plat = rects.filter((r) => r.y === 204);
    expect(plat[1]!.x + plat[1]!.w).toBeCloseTo(x, 6);
  });

  it('chaque texte tient dans le dessin, viewBox 340, léger et accessible', () => {
    expect(svg).toMatch(/viewBox="0 0 340 \d+"/);
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
    const hauteur = Number(/viewBox="0 0 340 (\d+)"/.exec(svg)![1]);
    const ts = [...svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)"(?: text-anchor="(start|middle|end)")? class="([\w -]+)"[^>]*>([^<]+)<\/text>/g)];
    expect(ts.length).toBeGreaterThan(15);
    for (const [, xs, ys, a, classe, contenu] of ts) {
      const x = Number(xs);
      const t = TAILLES[classe];
      expect(t, classe).toBeDefined();
      const l = contenu.length * t.em * t.px;
      const [debut, fin] = a === 'middle' ? [x - l / 2, x + l / 2] : a === 'end' ? [x - l, x] : [x, x + l];
      expect(debut, contenu).toBeGreaterThanOrEqual(0);
      expect(fin, contenu).toBeLessThanOrEqual(340);
      expect(Number(ys), contenu).toBeLessThanOrEqual(hauteur - 4);
    }
  });

  it('la fiche affiche le schéma dans « Exemple chiffré » ; le texte en est la légende', () => {
    const page: string = readFileSync('src/pages/InvestmentPage.tsx', 'utf8');
    expect(page).toContain("if (inv.slug === 'objets-d-art-collection') return <SchemaObjetsArtBilan>{ex}</SchemaObjetsArtBilan>;");
    const ex = n(fiche.example);
    expect(ex).toMatch(/^Exemple fictif/);
    expect(ex).toContain('À retenir : la taxe porte sur le prix, pas sur le gain');
  });
});
