import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaPetitsVersements } from './components/Illustrations';
import { petitsVersementsRows } from './lib/illustrationData';
import { guideBySlug } from './data/guides';

describe('schéma « petits versements »', () => {
  const guide = guideBySlug['epargne-limitee'];
  const texte = guide.sections.map((s) => s.body.join(' ')).join(' ');
  it('recalcule les montants cités dans le guide', () => {
    const r = petitsVersementsRows();
    expect(r.map((x) => [x.paid, x.total, x.gains])).toEqual([[18000, 34400, 16400], [45000, 78200, 33200]]);
    expect(texte).toContain('environ 34 400 € pour 18 000 € versés');
    expect(texte).toContain('environ 78 200 € pour 45 000 € versés');
  });
  it('est accessible, léger et marqué « exemple fictif »', () => {
    const html = renderToStaticMarkup(createElement(SchemaPetitsVersements));
    expect(html).toContain('role="img"');
    expect(html).toContain('exemple fictif');
    expect(html.length).toBeLessThan(15000);
  });
});
