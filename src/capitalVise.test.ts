import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaCapitalVise } from './components/Illustrations';
import { capitalViseRows } from './lib/illustrationData';

describe('schéma « capital visé »', () => {
  it('recalcule dépenses ÷ taux de retrait', () => {
    expect(capitalViseRows().map((r) => [r.rate, Math.round(r.capital)])).toEqual([[0.03, 1000000], [0.04, 750000], [0.05, 600000]]);
  });
  it('est accessible, léger et marqué « exemple fictif »', () => {
    const html = renderToStaticMarkup(createElement(SchemaCapitalVise));
    expect(html).toContain('role="img"');
    expect(html).toContain('exemple fictif');
    expect(html.replace(/[\u00a0\u202f]/g, ' ')).toContain('1 000 000 €');
    expect(html.length).toBeLessThan(15000);
  });
});
