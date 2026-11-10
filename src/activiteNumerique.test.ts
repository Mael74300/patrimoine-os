import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaActiviteNumerique } from './components/Illustrations';
import { investmentBySlug } from './data/investments';

describe('schéma de la fiche Activité numérique', () => {
  it('reprend le principe de la fiche, sans chiffre', () => {
    const svg = renderToStaticMarkup(createElement(SchemaActiviteNumerique)).replace(/[  ]/g, ' ');
    for (const m of ['revenu récurrent', 'revendre', 's’effondrer', 'concurrence', 'plateforme']) expect(svg).toContain(m);
    expect(svg).not.toMatch(/\d\s?(%|€)/);
  });
  it('est cohérent avec la rubrique Fonctionnement de la fiche', () => {
    const how = investmentBySlug['activite-numerique'].howItWorks;
    for (const m of ['revenu récurrent', 'revendre', 'concurrence', 'plateforme']) expect(how).toContain(m);
  });
});
