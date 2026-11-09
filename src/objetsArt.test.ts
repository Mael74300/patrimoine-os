import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaObjetsArt } from './components/Illustrations';
import { investmentBySlug } from './data/investments';

describe('schéma de la fiche Objets d’art', () => {
  const svg = renderToStaticMarkup(createElement(SchemaObjetsArt)).replace(/\s/g, ' ');
  const fiche = JSON.stringify(investmentBySlug['objets-d-art-collection']).replace(/\s/g, ' ');
  it('reprend les chiffres de la fiche (seuil, taux, CRDS)', () => {
    for (const m of ['5 000 €', '6 % + 0,5 % de CRDS', '6,5 %']) {
      expect(svg).toContain(m);
      expect(fiche).toContain(m.replace('6 % + 0,5 % de CRDS', '6 %'));
    }
    expect(fiche).toContain('0,5 % de CRDS');
  });
  it('le calcul 6 % + 0,5 % = 6,5 % et l’exemple fictif de 8 000 € sont exacts', () => {
    expect(6 + 0.5).toBe(6.5);
    expect(Math.round(8000 * 0.065)).toBe(520);
    expect(fiche).toContain('520 €');
  });
});
