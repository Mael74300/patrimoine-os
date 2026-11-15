import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaFondsEuros, SchemaLmnp, SchemaLocationNue, SchemaScpi } from './components/Illustrations';

/**
 * Fiches Fonds en euros, LMNP, Location nue et SCPI : schémas redessinés en viewBox 340 (chantier 112, étape 3,
 * constat du 2026-11-15) : à 375 px, ils affichaient leurs textes vers 11,2 px et leurs cadres touchaient les bords.
 * Chaque ligne doit tenir dans le cadre qui la contient (ou dans le dessin), avec 6 unités de marge.
 * Largeur estimée d'un caractère : 0,52 em (texte normal) ou 0,56 em (texte gras), comme pour les autres fiches.
 */
const TAILLES: Record<string, { px: number; em: number }> = {
  'ill-step': { px: 14.5, em: 0.56 },
  'ill-in': { px: 12, em: 0.56 },
  'ill-sub': { px: 13, em: 0.52 },
};
const schemas = { SchemaFondsEuros, SchemaLmnp, SchemaLocationNue, SchemaScpi };
const longueur = (t: string) => t.replace(/&#x27;/g, "'").length;

describe('fiches Fonds en euros, LMNP, Location nue et SCPI : schémas lisibles à 375 px', () => {
  for (const [nom, composant] of Object.entries(schemas)) {
    const svg = renderToStaticMarkup(createElement(composant));
    const cadres = [...svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g)].map((m) => m.slice(1).map(Number));
    const textes = [...svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)" text-anchor="(middle|start)" class="([\w-]+)">([^<]+)<\/text>/g)];

    it(`${nom} : viewBox 340, léger et accessible`, () => {
      expect(svg).toMatch(/viewBox="0 0 340 \d+"/);
      expect(svg).toContain('role="img"');
      expect(svg.length).toBeLessThan(15000);
    });

    it(`${nom} : chaque texte tient dans son cadre (ou dans le dessin)`, () => {
      expect(textes.length).toBeGreaterThan(8);
      for (const [, xs, ys, ancre, classe, contenu] of textes) {
        const [x, y] = [Number(xs), Number(ys)];
        const t = TAILLES[classe];
        expect(t, classe).toBeDefined();
        const larg = longueur(contenu) * t.em * t.px;
        const [debut, fin] = ancre === 'middle' ? [x - larg / 2, x + larg / 2] : [x, x + larg];
        const cadre = cadres.find(([cx, cy, w, h]) => x > cx && x < cx + w && y > cy && y < cy + h);
        const [gauche, droite] = cadre ? [cadre[0], cadre[0] + cadre[2]] : [0, 340];
        expect(debut, contenu).toBeGreaterThanOrEqual(gauche + 6);
        expect(fin, contenu).toBeLessThanOrEqual(droite - 6);
      }
    });
  }

  it('SCPI : les légendes des flèches ne touchent pas la boucle des loyers (x = 212)', () => {
    const svg = renderToStaticMarkup(createElement(SchemaScpi));
    expect(svg).toContain('H 212 V 31');
    for (const [, x, contenu] of svg.matchAll(/<text x="(106)" y="\d+" text-anchor="start" class="ill-in">([^<]+)<\/text>/g)) {
      expect(Number(x) + contenu.length * 0.56 * 12, contenu).toBeLessThanOrEqual(212 - 4);
    }
  });

  it('LMNP et Location nue : deux cadres côte à côte avec un écart, dans le dessin', () => {
    for (const composant of [SchemaLmnp, SchemaLocationNue]) {
      const svg = renderToStaticMarkup(createElement(composant));
      expect(svg).toMatch(/<rect x="1" y="80" width="164"/);
      expect(svg).toMatch(/<rect x="175" y="80" width="164"/);
    }
  });
});
