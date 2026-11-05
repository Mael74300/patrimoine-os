import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaEtf } from './components/Illustrations';
import { investmentBySlug } from './data/investments';

describe('schéma « ETF »', () => {
  const svg = renderToStaticMarkup(createElement(SchemaEtf));
  const fiche = investmentBySlug['etf-monde'];

  it('reprend la définition de la fiche (suivre un indice, acheté en Bourse comme une action)', () => {
    expect(fiche.definition).toContain('suit la performance d\'un indice');
    expect(fiche.howItWorks).toContain('en Bourse comme une action');
    expect(svg).toContain('indice');
    expect(svg).toContain('comme une action');
  });
  it('ne contient aucun chiffre (principe qualitatif)', () => {
    const texte = svg.replace(/<[^>]+>/g, ' ').replace(/ill-etf-[td]/g, '');
    expect(texte).not.toMatch(/\d/);
  });
  it('reste léger et accessible', () => {
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
  });
});
