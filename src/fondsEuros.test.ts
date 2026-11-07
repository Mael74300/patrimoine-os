import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaFondsEuros } from './components/Illustrations';

describe('schéma de la fiche Fonds en euros', () => {
  it('reprend le principe sourcé (Service-Public F15274), sans chiffre', () => {
    const svg = renderToStaticMarkup(createElement(SchemaFondsEuros)).replace(/[  ]/g, ' ');
    for (const m of ['peu risqués', 'garantie en capital', 'faible rendement', 's’ajoutent au capital']) expect(svg).toContain(m);
    expect(svg).not.toMatch(/\d\s?(%|€)/);
  });
});
