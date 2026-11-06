import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaOr, OR_EXAMPLE_PRICE, orTaxe } from './components/Illustrations';
import { investments } from './data/investments';

describe('schéma de la fiche Or', () => {
  it('taxe de 11 % + 0,5 % de CRDS : 230 € sur 2 000 €', () => {
    expect(orTaxe(OR_EXAMPLE_PRICE)).toBe(230);
  });
  it('cohérent avec l’exemple écrit de la fiche', () => {
    const or = investments.find((i) => i.slug === 'or')!;
    const ex = or.example.replace(/[\u202f\u00a0]/g, ' ');
    expect(ex).toContain('2 000 €');
    expect(ex).toContain('230 €');
    const svg = renderToStaticMarkup(createElement(SchemaOr)).replace(/ | /g, ' ');
    expect(svg).toContain('230');
    expect(svg).toContain('1 770');
  });
});
