import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaCrypto, SchemaEtf, SchemaObligation } from './components/Illustrations';

/**
 * (Le schéma Actions, redessiné en comparaison 15 lignes / 3 lignes, a son propre test : actions-schema.test.ts.)
 * Fiches ETF, Actions, Obligations et Cryptomonnaies : schémas redessinés en viewBox 340 (chantier 112)
 * pour que leurs textes s'affichent à 13 px ou plus à 375 px. Chaque ligne doit tenir dans la largeur du dessin.
 * Largeur estimée d'un caractère : 0,52 em (texte normal) ou 0,56 em (texte gras), police système sans empattement.
 */
const TAILLES: Record<string, { px: number; em: number }> = {
  'ill-step': { px: 14.5, em: 0.56 },
  'ill-in': { px: 12, em: 0.56 },
  'ill-sub': { px: 13, em: 0.52 },
};
const schemas = { SchemaEtf, SchemaObligation, SchemaCrypto };

describe('schémas des fiches de marché en viewBox 340', () => {
  for (const [nom, composant] of Object.entries(schemas)) {
    const svg = renderToStaticMarkup(createElement(composant));
    it(`${nom} : viewBox 340, chaque texte dans le cadre`, () => {
      expect(svg).toMatch(/viewBox="0 0 340 \d+"/);
      const textes = [...svg.matchAll(/<text x="([\d.]+)" y="[\d.]+" text-anchor="middle" class="([\w-]+)">([^<]+)<\/text>/g)];
      expect(textes.length).toBeGreaterThan(4);
      for (const [, x, classe, contenu] of textes) {
        const t = TAILLES[classe];
        expect(t, classe).toBeDefined();
        const demi = (contenu.length * t.em * t.px) / 2;
        expect(Number(x) - demi, contenu).toBeGreaterThanOrEqual(6);
        expect(Number(x) + demi, contenu).toBeLessThanOrEqual(334);
      }
    });
    it(`${nom} : léger et accessible`, () => {
      expect(svg).toContain('role="img"');
      expect(svg.length).toBeLessThan(15000);
    });
  }

  it('obligation : « Les taux baissent » tient dans sa case de 162 unités', () => {
    const svg = renderToStaticMarkup(createElement(SchemaObligation));
    expect(svg).toContain('<rect x="1" y="196" width="162"');
    expect(svg).toContain('<rect x="177" y="196" width="162"');
    expect('Les taux baissent'.length * 0.56 * 14.5).toBeLessThan(162 - 16);
    expect(svg).toContain('>le prix baisse<');
    expect(svg).toContain('>le prix monte<');
  });
});
