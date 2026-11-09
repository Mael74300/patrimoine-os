import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaRepriseEntreprise } from './components/Illustrations';
import { investmentBySlug } from './data/investments';

describe('schéma de la fiche Racheter une entreprise', () => {
  it('reprend le principe de la fiche, sans chiffre', () => {
    const svg = renderToStaticMarkup(createElement(SchemaRepriseEntreprise)).replace(/[  ]/g, ' ');
    for (const m of ['emprunt', 'bénéfices', 'dette', 'valorisation', 'continuité']) expect(svg).toContain(m);
    expect(svg).not.toMatch(/\d\s?(%|€)/);
  });
  it('est cohérent avec la rubrique Fonctionnement de la fiche', () => {
    const how = investmentBySlug['reprise-entreprise'].howItWorks;
    for (const m of ['bénéfices', 'dette', 'valorisation', 'continuité']) expect(how).toContain(m);
  });
});
