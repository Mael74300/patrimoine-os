import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaCompteATerme } from './components/Illustrations';

describe('schéma de la fiche Compte à terme', () => {
  it('reprend le principe sourcé (La finance pour tous), sans chiffre', () => {
    const svg = renderToStaticMarkup(createElement(SchemaCompteATerme)).replace(/[  ]/g, ' ');
    for (const m of ['Taux fixe', 'Taux progressif', 'Taux révisable', 'pénalité sur les intérêts']) expect(svg).toContain(m);
    expect(svg).not.toMatch(/\d\s?(%|€)/);
  });
});
