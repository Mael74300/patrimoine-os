import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { HeaderArt, HomeArt, type HeaderArtName } from './components/Illustrations';

const noms: HeaderArtName[] = ['guides', 'simulateurs', 'encyclopedie', 'comparateur', 'entrepreneuriat'];

describe('illustrations des bandeaux de rubrique', () => {
  it('sont décoratives, distinctes et légères', () => {
    const rendus = noms.map((n) => renderToStaticMarkup(createElement(HeaderArt, { name: n })));
    rendus.forEach((svg) => {
      expect(svg).toContain('aria-hidden="true"');
      expect(svg.length).toBeLessThan(15000);
      expect(svg).not.toMatch(/https?:|<image|<text/);
    });
    expect(new Set(rendus).size).toBe(rendus.length);
  });

  it("l'illustration d'accueil est décorative, légère et sans chiffre", () => {
    const svg = renderToStaticMarkup(createElement(HomeArt));
    expect(svg).toContain('aria-hidden="true"');
    expect(svg.length).toBeLessThan(15000);
    expect(svg).not.toMatch(/https?:|<image|<text/);
  });
});
