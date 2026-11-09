import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaCpf } from './components/Illustrations';
import { investmentBySlug } from './data/investments';

describe('schéma de la fiche Formation et compétences', () => {
  it('reprend le principe sourcé (Service-Public F10705), sans chiffre', () => {
    const svg = renderToStaticMarkup(createElement(SchemaCpf)).replace(/[  ]/g, ' ');
    for (const m of ['Votre CPF vous suit', 'changez', 'perdez', 'Agefiph', 'région']) expect(svg).toContain(m);
    expect(svg).not.toMatch(/\d\s?(%|€)/);
  });
  it('est cohérent avec la rubrique Capital de la fiche', () => {
    const cap = JSON.stringify(investmentBySlug['capital-humain']);
    for (const m of ['Agefiph', 'région']) expect(cap).toContain(m);
  });
});
