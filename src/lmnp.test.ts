import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaLmnp } from './components/Illustrations';
import { investmentBySlug } from './data/investments';

describe('schéma « LMNP »', () => {
  const svg = renderToStaticMarkup(createElement(SchemaLmnp));
  const fiche = investmentBySlug['lmnp'];

  it('reprend les règles de la fiche (abattement forfaitaire, charges réelles et amortissement)', () => {
    expect(fiche.howItWorks).toContain('abattement forfaitaire');
    expect(fiche.howItWorks).toContain('amortissement du logement et des meubles');
    expect(svg).toContain('abattement forfaitaire');
    expect(svg).toContain('amortissement');
    expect(svg).toContain('Micro-BIC');
  });
  it('ne contient aucun chiffre (principe qualitatif)', () => {
    const texte = svg.replace(/<[^>]+>/g, ' ').replace(/ill-lmnp-[td]/g, '');
    expect(texte).not.toMatch(/\d/);
  });
  it('reste léger et accessible', () => {
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
  });
});
