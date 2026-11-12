import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaPatrimoineNet } from './components/Illustrations';
import { NW_DEFAULT, patrimoineParts } from './lib/illustrationData';
import { netWorth } from './lib/finance';
import { debtShareLabel, netWorthTakeaway } from './lib/takeaways';
import { guideBySlug } from './data/guides';

describe('schéma « patrimoine net »', () => {
  const guide = guideBySlug['patrimoine-net'];
  const texte = guide.sections.map((s) => [s.heading, ...s.body].join(' ')).join(' ').replace(/\u00a0/g, ' ');
  it('recalcule l’exemple fictif de la définition (250 000 + 15 000 − 180 000 = 85 000 €)', () => {
    const p = patrimoineParts();
    expect(p.assets).toBe(265000);
    expect(p.net).toBe(85000);
    expect(texte).toContain('estimé 250 000 €');
    expect(texte).toContain('180 000 € de crédit restant dû');
    expect(texte).toContain('15 000 € d’épargne');
    expect(texte).toContain('patrimoine net de 85 000 €');
  });
  it('est accessible, léger et marqué « exemple fictif »', () => {
    const html = renderToStaticMarkup(createElement(SchemaPatrimoineNet)).replace(/[  ]/g, ' ');
    expect(html).toContain('role="img"');
    expect(html).toContain('exemple fictif');
    expect(html).toContain('85 000');
    expect(html.length).toBeLessThan(15000);
  });
});

describe('calculateur « patrimoine net » du guide', () => {
  it('part du même exemple fictif que le schéma (85 000 €)', () => {
    const p = patrimoineParts();
    const r = netWorth(NW_DEFAULT.items);
    expect(r.assets).toBe(p.assets);
    expect(r.debts).toBe(p.debt);
    expect(r.net).toBe(85000);
    expect(NW_DEFAULT.items.every((i) => i.amount >= 0)).toBe(true);
  });
  it('traduit le résultat en mots simples', () => {
    const r = netWorth(NW_DEFAULT.items);
    expect(netWorthTakeaway(r).replace(/[\u00a0\u202f]/g, ' ')).toBe('Si vous vendiez tout au prix estimé et remboursiez vos dettes, il vous resterait 85 000 €, avant frais et impôts de vente.');
    expect(debtShareLabel(r).replace(/[\u00a0\u202f]/g, ' ')).toBe('soit 68 % de ce que vous possédez');
    expect(netWorthTakeaway({ assets: 100000, debts: 120000, net: -20000 }).replace(/[\u00a0\u202f]/g, ' ')).toContain('dépassent de 20 000 €');
    expect(netWorthTakeaway({ assets: 0, debts: 0, net: 0 })).toContain('Saisissez');
    expect(debtShareLabel({ assets: 0, debts: 5000 })).toBe('');
  });
});
