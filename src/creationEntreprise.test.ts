import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaCreationEntreprise } from './components/Illustrations';
import { investmentBySlug } from './data/investments';

describe('schéma de la fiche Créer son entreprise', () => {
  it('reprend le principe de la fiche, sans chiffre', () => {
    const svg = renderToStaticMarkup(createElement(SchemaCreationEntreprise)).replace(/[  ]/g, ' ');
    for (const m of ['bénéfices', 'revente', 'Votre patrimoine', 'perte totale']) expect(svg).toContain(m);
    expect(svg).not.toMatch(/\d\s?(%|€)/);
  });
  it('est cohérent avec la rubrique Fonctionnement de la fiche', () => {
    const how = investmentBySlug['creation-entreprise'].howItWorks;
    for (const m of ['bénéfices', 'cession', 'perte totale']) expect(how).toContain(m);
  });
});
