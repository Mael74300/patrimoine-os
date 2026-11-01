import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaFrais } from './components/Illustrations';
import { fraisRows } from './lib/illustrationData';
import { guideBySlug } from './data/guides';

describe('schéma « effet des frais »', () => {
  const guide = guideBySlug['comparer-les-frais'];
  const texte = guide.sections.map((s) => s.body.join(' ')).join(' ');
  it('recalcule les montants cités dans le guide', () => {
    const r = fraisRows();
    expect(r.map((x) => [x.fees, x.final])).toEqual([[0, 42900], [0.002, 40800], [0.015, 29400]]);
    expect(texte).toContain('environ 40 800 € avec 0,2 % de frais annuels');
    expect(texte).toContain('environ 29 400 € avec 1,5 %');
  });
  it('est accessible, léger et marqué « exemple fictif »', () => {
    const html = renderToStaticMarkup(createElement(SchemaFrais));
    expect(html).toContain('role="img"');
    expect(html).toContain('exemple fictif');
    expect(html.length).toBeLessThan(15000);
  });
});
