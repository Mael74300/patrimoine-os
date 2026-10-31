import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaRendement } from './components/Illustrations';
import { rendementSteps } from './lib/illustrationData';
import { guideBySlug } from './data/guides';

describe('schéma « rendement locatif : du brut au net »', () => {
  const guide = guideBySlug['rentabilite-locative'];
  const texte = guide.sections.map((s) => [s.heading, ...s.body].join(' ')).join(' ');
  const steps = rendementSteps();
  it('recalcule les chiffres du guide (6 % brut, environ 3,6 % net)', () => {
    expect(steps[0].value).toBeCloseTo(0.06, 6);
    expect(texte).toContain('9 000 / 150 000 = 6 %');
    expect(steps[3].value).toBeCloseTo(0.036, 3);
    expect(texte).toContain('environ 3,6 %');
    expect(steps.map((s) => s.value)).toEqual([...steps.map((s) => s.value)].sort((a, b) => b - a));
  });
  it('est placé sous une section existante, accessible et léger', () => {
    expect(guide.sections.some((s) => s.heading === 'Le rendement net de charges')).toBe(true);
    const svg = renderToStaticMarkup(createElement(SchemaRendement));
    expect(svg).toContain('role="img"');
    expect(svg).toContain('6,0 %');
    expect(svg).toContain('3,6 %');
    expect(svg.length).toBeLessThan(15000);
  });
});
