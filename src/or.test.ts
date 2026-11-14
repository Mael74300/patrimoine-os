import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaOr, OR_EXAMPLE_PRICE, orTaxe } from './components/Illustrations';
import { investments } from './data/investments';
import { abattementDetentionMeubles } from './lib/calc/ficheExemples';

describe('schéma de la fiche Or', () => {
  it('taxe de 11 % + 0,5 % de CRDS : 230 € sur 2 000 €', () => {
    expect(orTaxe(OR_EXAMPLE_PRICE)).toBe(230);
  });
  it('cohérent avec l’exemple écrit de la fiche', () => {
    const or = investments.find((i) => i.slug === 'or')!;
    const ex = or.example.replace(/[\u202f\u00a0]/g, ' ');
    expect(ex).toContain('2 000 €');
    expect(ex).toContain('230 €');
    const svg = renderToStaticMarkup(createElement(SchemaOr)).replace(/ | /g, ' ');
    expect(svg).toContain('230');
    expect(svg).toContain('1 770');
  });
  it('option pour les plus-values : exemple de 23 ans recalculé, gain entièrement exonéré', () => {
    expect(abattementDetentionMeubles(2)).toBe(0);
    expect(abattementDetentionMeubles(10)).toBe(0.4);
    expect(abattementDetentionMeubles(22)).toBe(1);
    expect(abattementDetentionMeubles(23)).toBe(1);
    const or = investments.find((i) => i.slug === 'or')!;
    const ex = or.example.replace(/[\u202f\u00a0]/g, ' ');
    expect(ex).toMatch(/^Exemple fictif/);
    const gain = 2000 - 1000;
    expect(gain * (1 - abattementDetentionMeubles(23))).toBe(0);
    for (const m of ['1 000 €', 'il y a 23 ans', 'Taxe forfaitaire : 230 €', ': 0 €', 'après 22 ans', 'après 22 ans de détention']) expect(ex).toContain(m);
    expect(orTaxe(2000)).toBe(230);
    const tax = or.tax.text.replace(/[\u202f\u00a0]/g, ' ');
    for (const m of ['11,5 %', '5 000 €', 'date et le prix d’achat', 'plus de 22 ans', '5 % par année de détention au-delà de la deuxième', 'exonéré après 22 ans']) expect(tax).toContain(m);
  });
});
