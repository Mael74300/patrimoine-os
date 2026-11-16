import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync } from 'node:fs';
import SimEntreprise from './pages/SimEntreprise';
import { BUSINESS_SCENARIOS, fmtEur, lowestCash, projectBusiness } from './lib/finance';
import entreprise from './pages/SimEntreprise.tsx?raw';

const css: string = readFileSync('src/styles.css', 'utf8');
const DEFAULTS = {
  revenueY1: 120000, revenueGrowth: 0.1, grossMarginRate: 0.6, fixedCosts: 30000, fixedCostsGrowth: 0.02,
  founderPay: 24000, socialRate: 0.45, corporateTaxRate: 0.25, smallBusinessRate: true, receivableDays: 30,
  initialCash: 15000, initialInvestment: 10000, valuationMultiple: 5, years: 5,
};

describe('Simulateur Entreprise : scénarios côte à côte (scn-table)', () => {
  const html = renderToString(createElement(MemoryRouter, { initialEntries: ['/simulateurs/entreprise'] }, createElement(SimEntreprise)));
  const table = html.slice(html.indexOf('<table class="scn-table'), html.indexOf('</table>', html.indexOf('<table class="scn-table')));

  it('une ligne par indicateur, une colonne par scénario, en-têtes de ligne et de colonne', () => {
    expect(entreprise).not.toContain('stack-table');
    expect((table.match(/<th scope="col"/g) ?? []).length).toBe(4);
    expect((table.match(/<th scope="row"/g) ?? []).length).toBe(5);
    expect((table.match(/<td /g) ?? []).length).toBe(15);
    for (const l of ['Pessimiste', 'Central', 'Optimiste']) expect(table).toContain(l);
  });

  it('les montants affichés sont ceux du calcul, dans l’ordre pessimiste, central, optimiste', () => {
    const runs = (['pessimiste', 'central', 'optimiste'] as const).map((k) => projectBusiness(DEFAULTS, BUSINESS_SCENARIOS[k]));
    const start = DEFAULTS.initialCash - DEFAULTS.initialInvestment;
    const lows = runs.map((r) => fmtEur(lowestCash(r, start)));
    const lowRow = table.slice(table.indexOf('Trésorerie la plus basse'));
    const cells = [...lowRow.matchAll(/<td [^>]*>([^<]*)<\/td>/g)].slice(0, 3).map((m) => m[1]);
    expect(cells).toEqual(lows);
    // Trésorerie négative en rouge
    expect(lowRow).toMatch(/class="r neg"/);
  });

  it('sur mobile : trois colonnes sans défilement, repli une ligne par scénario pour les montants très longs', () => {
    expect(css).toMatch(/\.scn-table tr \{[^}]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
    expect(css).toMatch(/\.scn-long tr \{ grid-template-columns: minmax\(0, 1fr\); \}/);
    expect(css).toContain(':not(.scn-wrap)');
    expect(entreprise).toMatch(/fmtEur\(v\)\.length > 10/);
  });
});
