import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaRembourser } from './components/Illustrations';
import { rembourserParts } from './lib/illustrationData';
import { guideBySlug } from './data/guides';

describe('schéma « rembourser ou investir »', () => {
  const guide = guideBySlug['rembourser-credit-par-anticipation-ou-investir'];
  const texte = guide.sections.map((s) => [s.heading, ...s.body].join(' ')).join(' ');
  it('recalcule l’exemple fictif du guide (43 900 € contre 41 700 €, 45 mois, ≈ 21 250 €)', () => {
    const p = rembourserParts();
    expect(p.wealthPrepay).toBe(43900);
    expect(p.wealthInvest).toBe(41700);
    expect(p.gap).toBe(2200);
    expect(p.monthsSaved).toBe(45);
    expect(p.interestSaved).toBe(21250);
    expect(texte).toContain('Crédit de 150 000 € à 4 % sur 20 ans restants, 20 000 € disponibles, placement à 5 % par an');
    expect(texte).toContain('45 mois');
    expect(texte).toContain('21 250 €');
    expect(texte).toContain('43 900 €');
    expect(texte).toContain('41 700 €');
    expect(texte).toContain('2 200 €');
  });
  it('est accessible, léger et marqué « exemple fictif »', () => {
    const html = renderToStaticMarkup(createElement(SchemaRembourser)).replace(/[  ]/g, ' ');
    expect(html).toContain('role="img"');
    expect(html).toContain('exemple fictif');
    expect(html).toContain('43 900');
    expect(html.length).toBeLessThan(15000);
  });
});
