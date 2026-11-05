import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaCapitalInvestissement } from './components/Illustrations';
import { investmentBySlug } from './data/investments';

describe('schéma « Capital-investissement »', () => {
  const svg = renderToStaticMarkup(createElement(SchemaCapitalInvestissement));
  const fiche = investmentBySlug['private-equity'];

  it('reprend les règles de la fiche (pas de rachat, 10 ans voire plus)', () => {
    expect(fiche.howItWorks).toContain('ne peuvent pas être rachetées');
    expect(fiche.howItWorks).toContain('10 ans, voire plus');
    expect(svg).toContain('aucun rachat possible');
    expect(svg).toContain('jusqu’à 10 ans,');
    expect(svg).toContain('50 % minimum pour un FCPR');
  });
  it('reste léger et accessible', () => {
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
  });
});
