import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaRetraits } from './components/Illustrations';

describe('schéma « retraits réguliers »', () => {
  it('est accessible, léger, sans chiffre et marqué comme illustration', () => {
    const html = renderToStaticMarkup(createElement(SchemaRetraits));
    expect(html).toContain('role="img"');
    expect(html).toContain('Illustration, sans chiffres');
    expect(html.replace(/<[^>]+>/g, ' ')).not.toMatch(/\d/);
    expect(html.length).toBeLessThan(15000);
  });
});
