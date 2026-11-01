import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaEpargneMois } from './components/Illustrations';
import { epargneMoisRows } from './lib/illustrationData';
import { guideBySlug } from './data/guides';

describe('schéma « combien épargner par mois »', () => {
  const guide = guideBySlug['combien-epargner-par-mois-objectif'];
  const texte = guide.sections.map((s) => s.body.join(' ')).join(' ');
  it('recalcule les versements cités dans le guide', () => {
    const r = epargneMoisRows().map((x) => [x.years, Math.round(x.plain), Math.round(x.withRate)]);
    expect(r).toEqual([[3, 556, 542], [5, 333, 320], [10, 167, 153]]);
    expect(texte).toContain('environ 542 € par mois sur 3 ans, 320 € sur 5 ans et 153 € sur 10 ans');
    expect(texte).toContain('≈ 333 € par mois');
  });
  it('est accessible, léger et marqué « exemple fictif »', () => {
    const html = renderToStaticMarkup(createElement(SchemaEpargneMois));
    expect(html).toContain('role="img"');
    expect(html).toContain('exemple fictif');
    expect(html.length).toBeLessThan(15000);
  });
});
