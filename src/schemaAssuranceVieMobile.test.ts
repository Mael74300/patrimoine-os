import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaAssuranceVie, SchemaAssuranceVieDeces } from './components/Illustrations';

/**
 * Fiche Assurance-vie : les deux schémas redessinés en viewBox 340 (chantier 112, étape 2, constat du 2026-11-15) :
 * à 375 px, ils affichaient leurs textes vers 11,2 px et leurs cadres touchaient les bords de l'écran.
 * Chaque ligne doit tenir dans le cadre qui la contient, avec 6 unités de marge.
 * Largeur estimée d'un caractère : 0,52 em (texte normal) ou 0,56 em (texte gras), comme pour les fiches de marché.
 */
const TAILLES: Record<string, { px: number; em: number }> = {
  'ill-step': { px: 14.5, em: 0.56 },
  'ill-in': { px: 12, em: 0.56 },
  'ill-sub': { px: 13, em: 0.52 },
};
const schemas = { SchemaAssuranceVie, SchemaAssuranceVieDeces };

describe('fiche Assurance-vie : schémas lisibles à 375 px', () => {
  for (const [nom, composant] of Object.entries(schemas)) {
    const svg = renderToStaticMarkup(createElement(composant));
    const cadres = [...svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g)].map((m) => m.slice(1).map(Number));
    const textes = [...svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)" text-anchor="middle" class="([\w-]+)">([^<]+)<\/text>/g)];

    it(`${nom} : viewBox 340, léger et accessible`, () => {
      expect(svg).toMatch(/viewBox="0 0 340 \d+"/);
      expect(svg).toContain('role="img"');
      expect(svg.length).toBeLessThan(15000);
    });

    it(`${nom} : chaque texte tient dans son cadre (ou dans le dessin)`, () => {
      expect(textes.length).toBeGreaterThan(8);
      for (const [, xs, ys, classe, contenu] of textes) {
        const [x, y] = [Number(xs), Number(ys)];
        const t = TAILLES[classe];
        expect(t, classe).toBeDefined();
        const demi = (contenu.replace(/&#x27;/g, "'").length * t.em * t.px) / 2;
        const cadre = cadres.find(([cx, cy, w, h]) => x > cx && x < cx + w && y > cy && y < cy + h);
        const [gauche, droite] = cadre ? [cadre[0], cadre[0] + cadre[2]] : [0, 340];
        expect(x - demi, contenu).toBeGreaterThanOrEqual(gauche + 6);
        expect(x + demi, contenu).toBeLessThanOrEqual(droite - 6);
      }
    });
  }

  it('les deux cadres côte à côte gardent un écart et restent dans le dessin', () => {
    for (const composant of [SchemaAssuranceVie, SchemaAssuranceVieDeces]) {
      const svg = renderToStaticMarkup(createElement(composant));
      expect(svg).toMatch(/<rect x="1" y="\d+" width="164"/);
      expect(svg).toMatch(/<rect x="175" y="\d+" width="164"/);
    }
  });
});
