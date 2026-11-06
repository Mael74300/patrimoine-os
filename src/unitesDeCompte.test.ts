import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaUniteDeCompte, UC_NOMBRE, UC_PRIX_ACHAT, ucValeur } from './components/Illustrations';
import { investments } from './data/investments';

describe('schéma de la fiche Unités de compte', () => {
  it('le nombre d’unités reste constant, la valeur varie', () => {
    expect(ucValeur(UC_NOMBRE, UC_PRIX_ACHAT)).toBe(1000);
    expect(ucValeur(UC_NOMBRE, 8)).toBe(800);
    expect(ucValeur(UC_NOMBRE, 12)).toBe(1200);
  });
  it('affiche les montants recalculés et la mention fictif', () => {
    const svg = renderToStaticMarkup(createElement(SchemaUniteDeCompte)).replace(/[  ]/g, ' ');
    for (const m of ['100 unités', '800 €', '1 000 €', '1 200 €', 'fictif']) expect(svg).toContain(m);
  });
  it('la fiche ne prétend plus que les arbitrages ne sont pas imposés (non confirmé)', () => {
    const f = investments.find((i) => i.slug === 'unites-de-compte')!;
    expect(JSON.stringify(f)).not.toMatch(/Arbitrages sans fiscalité|ne sont pas imposés/);
    expect(f.howItWorks).toContain('nombre d\'unités est garanti');
  });
});
