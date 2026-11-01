import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaPatrimoineNet } from './components/Illustrations';
import { patrimoineParts } from './lib/illustrationData';
import { guideBySlug } from './data/guides';

describe('schéma « patrimoine net »', () => {
  const guide = guideBySlug['patrimoine-net'];
  const texte = guide.sections.map((s) => [s.heading, ...s.body].join(' ')).join(' ');
  it('recalcule l’exemple fictif de la définition (250 000 + 15 000 − 180 000 = 85 000 €)', () => {
    const p = patrimoineParts();
    expect(p.assets).toBe(265000);
    expect(p.net).toBe(85000);
    expect(texte).toContain('estimé 250 000 €');
    expect(texte).toContain('180 000 € de crédit restant dû');
    expect(texte).toContain('15 000 € d’épargne');
    expect(texte).toContain('patrimoine net de 85 000 €');
  });
  it('est accessible, léger et marqué « exemple fictif »', () => {
    const html = renderToStaticMarkup(createElement(SchemaPatrimoineNet)).replace(/[  ]/g, ' ');
    expect(html).toContain('role="img"');
    expect(html).toContain('exemple fictif');
    expect(html).toContain('85 000');
    expect(html.length).toBeLessThan(15000);
  });
});
