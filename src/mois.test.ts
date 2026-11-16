import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaMois } from './components/Illustrations';
import { incomeBreakdown } from './lib/calc/debtRatio';

const base = { income: 4000, existingPayments: 300, newPayment: 1000, livingCosts: 1500 };

describe('barre « où partent vos revenus » (simulateur d’endettement)', () => {
  it('découpe les revenus : le total des parts égale les revenus, largeurs et parts cohérentes', () => {
    const m = incomeBreakdown(base);
    expect(m.parts.map((p) => [p.key, p.value])).toEqual([['existing', 300], ['added', 1000], ['living', 1500], ['rest', 1200]]);
    expect(m.parts.reduce((a, p) => a + p.value, 0)).toBe(4000);
    expect(m.parts.reduce((a, p) => a + p.width, 0)).toBeCloseTo(100);
    expect(m.parts[1].share).toBeCloseTo(0.25);
    expect(m.limit).toBeCloseTo(1400);
    expect(m.marker).toBeCloseTo(35);
    expect(m.credits).toBe(1300);
    expect(m.margin).toBeCloseTo(100);
    expect(m.shortfall).toBe(0);
  });
  it('signale un déficit sans reste à vivre ; l’échelle devient le total des dépenses', () => {
    const m = incomeBreakdown({ ...base, livingCosts: 3000 });
    expect(m.parts.some((p) => p.key === 'rest')).toBe(false);
    expect(m.shortfall).toBe(300);
    expect(m.scale).toBe(4300);
    expect(m.marker).toBeCloseTo((1400 / 4300) * 100);
  });
  it('marge négative quand les crédits dépassent le repère ; parts nulles omises', () => {
    const m = incomeBreakdown({ ...base, existingPayments: 0, newPayment: 1600 });
    expect(m.margin).toBeCloseTo(-200);
    expect(m.parts.map((p) => p.key)).toEqual(['added', 'living', 'rest']);
  });
  it('affiche les montants, le repère et la marge ; vide si pas de revenus', () => {
    const html = renderToStaticMarkup(createElement(SchemaMois, base)).replace(/[\u00a0\u202f]/g, ' ').replace(/<!-- -->/g, '');
    expect(html).toContain('role="img"');
    expect(html).toContain('Repère 35 % = 1 400 €');
    expect(html).toContain('Reste à vivre');
    expect(html).toContain('1 200 €');
    expect(html).toContain('il reste 100 € de marge');
    expect(html).toContain('Crédits : 32,5 %');
    const over = renderToStaticMarkup(createElement(SchemaMois, { ...base, newPayment: 1300 })).replace(/[\u00a0\u202f]/g, ' ').replace(/<!-- -->/g, '');
    expect(over).toContain('ils dépassent le trait de 200 €');
    expect(renderToStaticMarkup(createElement(SchemaMois, { ...base, income: 0 }))).toBe('');
  });
});
