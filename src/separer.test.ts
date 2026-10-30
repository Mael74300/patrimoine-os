import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaSeparer } from './components/Illustrations';

describe('schéma « séparer l’entreprise et le patrimoine »', () => {
  const svg = renderToStaticMarkup(createElement(SchemaSeparer));
  it('reprend les enveloppes citées par la page, sans chiffre', () => {
    ['Livrets', 'PEA', 'Assurance-vie'].forEach((t) => expect(svg).toContain(t));
    expect(svg).not.toMatch(/\d\s?(%|€)/);
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
  });
});
