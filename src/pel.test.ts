import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaPel, PEL_PHASES, PEL_LIVRET_AGE } from './components/Illustrations';
import { investments } from './data/investments';

describe('schéma de la fiche PEL', () => {
  it('phases contiguës de 0 à 15 ans (4, 6 puis 5 ans)', () => {
    expect(PEL_PHASES.map((p) => [p.from, p.to])).toEqual([[0, 4], [4, 10], [10, 15]]);
    expect(PEL_LIVRET_AGE).toBe(15);
  });
  it('cohérent avec les chiffres de la fiche (4 à 10 ans, 540 €, 2,00 %)', () => {
    const pel = investments.find((i) => i.slug === 'pel')!;
    const tax = pel.tax.text.replace(/[  ]/g, ' ');
    expect(tax).toContain('4 ans minimum, 10 ans maximum');
    expect(tax).toContain('2,00 %');
    const svg = renderToStaticMarkup(createElement(SchemaPel)).replace(/[  ]/g, ' ');
    expect(svg).toContain('540 €');
    expect(svg).toContain('2,00 %');
  });
});
