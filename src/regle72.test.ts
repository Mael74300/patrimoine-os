import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaRegle72 } from './components/Illustrations';
import { regle72Rows } from './lib/illustrationData';
import { guideBySlug } from './data/guides';
import { fmtDuree } from './lib/finance';

describe('schéma « règle de 72 »', () => {
  const guide = guideBySlug['regle-de-72-doubler-son-capital'];
  const texte = guide.sections.map((s) => s.body.join(' ')).join(' ').replace(/\u00a0/g, ' ');
  it('recalcule les durées citées dans le guide', () => {
    const r = regle72Rows().map((x) => [x.rate, x.exact.toFixed(2), x.rule]);
    expect(r).toEqual([[0.02, '35.00', 36], [0.04, '17.67', 18], [0.06, '11.90', 12], [0.08, '9.01', 9], [0.12, '6.12', 6]]);
    expect(regle72Rows().map((x) => fmtDuree(x.exact).replace(/\u00a0/g, ' '))).toEqual(['35 ans', '17 ans et 8 mois', '11 ans et 11 mois', '9 ans', '6 ans et 1 mois']);
    expect(texte).toContain('à 2 %, la règle annonce 36 ans au lieu de 35 ;');
    expect(texte).toContain('à 12 %, 6 ans au lieu de 6 ans et 1 mois');
    expect(texte).toContain('Le calcul exact donne 11 ans et 11 mois à 6 %');
    expect(texte).not.toMatch(/\d,\d+ ans/);
  });
  it('écart d’un an au plus entre 2 % et 12 %, comme le dit le guide', () => {
    const exact = (r: number) => Math.log(2) / Math.log(1 + r);
    let max = 0;
    for (let p = 2; p <= 12.0001; p += 0.01) max = Math.max(max, Math.abs(72 / p - exact(p / 100)));
    expect(max).toBeLessThanOrEqual(1);
    expect(texte).toContain('d’un an au plus entre 2 % et 12 %');
  });
  it('exemple fictif 10 000 € à 6 % : environ 20 000 € au bout de 12 ans', () => {
    expect(Math.round(10000 * 1.06 ** 12)).toBe(20122);
    expect(texte).toContain('72 ÷ 6 = 12');
    expect(texte).toContain('10 000 € deviennent 20 000 €');
  });
  it('exemple fictif en pouvoir d’achat : 6 % et 2 % d’inflation', () => {
    const reel = 1.06 / 1.02 - 1;
    expect((reel * 100).toFixed(2)).toBe('3.92');
    expect((Math.log(2) / Math.log(1 + reel)).toFixed(2)).toBe('18.02');
    expect(fmtDuree(Math.log(2) / Math.log(1 + reel))).toBe('18\u00a0ans');
    expect(texte).toContain('rendement réel d’environ 3,9 %');
    expect(texte).toContain('en euros en 11 ans et 11 mois, en pouvoir d’achat en 18 ans environ');
    const faq = (guide.faq ?? []).map((f) => f.a).join(' ').replace(/[\u00a0\u202f]/g, ' ');
    expect(faq).toContain('environ 3,92 %');
    expect(faq).toContain('≈ 11,90 ans, soit environ 11 ans et 11 mois');
    expect(0.9 * 12).toBeCloseTo(10.8);
  });
  it('est accessible, léger et marqué « exemple fictif »', () => {
    const html = renderToStaticMarkup(createElement(SchemaRegle72));
    expect(html).toContain('role="img"');
    expect(html).toContain('exemple fictif');
    expect(html.length).toBeLessThan(15000);
    expect(html.replace(/\u00a0/g, ' ')).toContain('11 ans et 11 mois');
    expect(html).not.toMatch(/\d,\d ans/);
  });
});
