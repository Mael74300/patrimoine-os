import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaRegle72 } from './components/Illustrations';
import { regle72Rows } from './lib/illustrationData';
import { guideBySlug } from './data/guides';

describe('schéma « règle de 72 »', () => {
  const guide = guideBySlug['regle-de-72-doubler-son-capital'];
  const texte = guide.sections.map((s) => s.body.join(' ')).join(' ');
  it('recalcule les durées citées dans le guide', () => {
    const r = regle72Rows().map((x) => [x.rate, x.exact.toFixed(2), x.rule]);
    expect(r).toEqual([[0.02, '35.00', 36], [0.04, '17.67', 18], [0.06, '11.90', 12], [0.08, '9.01', 9], [0.12, '6.12', 6]]);
    expect(texte).toContain('à 2 %, 35,00 ans contre 36');
    expect(texte).toContain('à 4 %, 17,67 ans contre 18');
    expect(texte).toContain('à 8 %, 9,01 ans contre 9');
    expect(texte).toContain('à 12 %, 6,12 ans contre 6');
    expect(texte).toContain('≈ 11,90 ans');
  });
  it('est accessible, léger et marqué « exemple fictif »', () => {
    const html = renderToStaticMarkup(createElement(SchemaRegle72));
    expect(html).toContain('role="img"');
    expect(html).toContain('exemple fictif');
    expect(html.length).toBeLessThan(15000);
  });
});
