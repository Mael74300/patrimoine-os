import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Compare from './pages/Compare';
import { projectGrowth } from './lib/finance';
import { projectionSplit, totalContributed } from './lib/calc/compareSummary';
import { fmtEur } from './lib/finance';

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
    // Hypothèses par défaut (fictives) : 10 000 € puis 200 € par mois pendant 15 ans.
    const defaults = [
      { r: 0.017, f: 0 },
      { r: 0.035, f: 0.006 },
      { r: 0.06, f: 0.002 },
    ];
    for (const d of defaults) {
      const v = projectGrowth({ initial: 10000, monthly: 200, annualReturn: d.r, annualFees: d.f, years: 15, inflation: 0 })[15].value;
      const { gains } = projectionSplit(v, totalContributed(10000, 200, 15));
      expect(html).toContain(`${fmtEur(gains)}</strong> de gains`);
    }
    expect(html).toContain(fmtEur(46000));
  });

  it('signale le plafond du Livret A et du LDDS dépassé par les réglages par défaut (46 000 € versés)', () => {
    const t = html.replace(/[\u00a0\u202f]/g, ' ');
    expect(t).toContain('Plafond dépassé : Livret A et LDDS.');
    expect(t).toContain('34 950 €');
    expect(t).toContain('22 950 € sur le Livret A et 12 000 € sur le LDDS');
    expect(t).toContain('au bout de 10 ans et 5 mois');
    expect(t).not.toContain('Plafond dépassé : Assurance-vie');
  });

  it('ne s’arrête pas sur une impasse : pistes de lecture en bas de page', () => {
    expect(html).toContain('Pour aller plus loin');
    for (const to of ['/guides/choisir-son-enveloppe', '/simulateurs/frais']) expect(html).toContain(`href="${to}"`);
  });
});
