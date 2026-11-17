import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Compare from './pages/Compare';
import { projectGrowth } from './lib/finance';
import { projectionSplit, totalContributed } from './lib/calc/compareSummary';
import { fmtEur } from './lib/finance';
import { VERSEMENT_CAPS } from './data/versementCaps';

describe('Comparateur : projection', () => {
  const html = renderToString(createElement(MemoryRouter, null, createElement(Compare))).replace(/<!-- -->/g, '');

  it('place les réglages de chaque placement avant le graphique', () => {
    const hyp = html.indexOf('cmp-hyp-set');
    const chart = html.indexOf('Comparaison des projections');
    expect(hyp).toBeGreaterThan(0);
    expect(hyp).toBeLessThan(chart);
    expect(html.indexOf('Concrètement')).toBeGreaterThan(chart);
  });

  it('donne à chaque champ un nom accessible qui cite le placement', () => {
    for (const name of ['Livret A et LDDS', 'Assurance-vie', 'ETF actions diversifiés']) {
      expect(html).toContain(`Rendement brut supposé (${name})`);
      expect(html).toContain(`Frais annuels (${name})`);
    }
  });

  it('ne répète plus la valeur finale sous les champs : gains listés une fois, recalculés', () => {
    expect(html).not.toContain('Valeur à ');
    // Hypothèses par défaut (fictives) : 10 000 € puis 100 € par mois pendant 15 ans.
    const defaults = [
      { r: 0.017, f: 0 },
      { r: 0.035, f: 0.006 },
      { r: 0.06, f: 0.002 },
    ];
    for (const d of defaults) {
      const v = projectGrowth({ initial: 10000, monthly: 100, annualReturn: d.r, annualFees: d.f, years: 15, inflation: 0 })[15].value;
      const { gains } = projectionSplit(v, totalContributed(10000, 100, 15));
      expect(html).toContain(`${fmtEur(gains)}</strong> de gains`);
    }
    expect(html).toContain(fmtEur(28000));
  });

  it('propose un exemple de départ réalisable : 28 000 € versés, sous le plafond du Livret A et du LDDS', () => {
    const t = html.replace(/[\u00a0\u202f]/g, ' ');
    expect(totalContributed(10000, 100, 15)).toBeLessThanOrEqual(VERSEMENT_CAPS['livret-a'].cap);
    expect(t).not.toContain('Plafond dépassé');
    expect(t).not.toContain('chart-band');
  });

  it('libellé du plafond cumulé repris des données des livrets', () => {
    const c = VERSEMENT_CAPS['livret-a'];
    expect(fmtEur(c.cap).replace(/[\u00a0\u202f]/g, ' ')).toBe('34 950 €');
    expect(c.detail?.replace(/[\u00a0\u202f]/g, ' ')).toBe('22 950 € sur le Livret A et 12 000 € sur le LDDS');
  });

  it('ne s’arrête pas sur une impasse : pistes de lecture en bas de page', () => {
    expect(html).toContain('Pour aller plus loin');
    for (const to of ['/guides/choisir-son-enveloppe', '/simulateurs/frais']) expect(html).toContain(`href="${to}"`);
  });
});
