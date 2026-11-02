import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaMois } from './components/Illustrations';
import { moisParts } from './lib/illustrationData';

const base = { income: 4000, existingPayments: 300, newPayment: 1000, livingCosts: 1500 };

describe('schéma « où part votre mois »', () => {
  it('découpe les revenus : le total des parts égale les revenus', () => {
    const m = moisParts(base);
    expect(m.parts.map((p) => [p.key, p.value])).toEqual([['existing', 300], ['added', 1000], ['living', 1500], ['rest', 1200]]);
    expect(m.parts.reduce((a, p) => a + p.value, 0)).toBe(4000);
    expect(m.limit).toBeCloseTo(1400);
    expect(m.shortfall).toBe(0);
  });
  it('signale un déficit sans reste à vivre', () => {
    const m = moisParts({ ...base, livingCosts: 3000 });
    expect(m.parts.some((p) => p.key === 'rest')).toBe(false);
    expect(m.shortfall).toBe(300);
    expect(m.scale).toBe(4300);
  });
  it('est accessible et léger ; vide si pas de revenus', () => {
    const html = renderToStaticMarkup(createElement(SchemaMois, base)).replace(/[  ]/g, ' ');
    expect(html).toContain('role="img"');
    expect(html).toContain('1 200 € : reste à vivre');
    expect(html.length).toBeLessThan(15000);
    expect(renderToStaticMarkup(createElement(SchemaMois, { ...base, income: 0 }))).toBe('');
  });
});
