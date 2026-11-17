import { describe, expect, it } from 'vitest';
import { projectGrowth } from './lib/finance';
import { impossibleFromYear, projectionSplit, totalContributed } from './lib/calc/compareSummary';

describe('comparateur : décomposition versé / gains', () => {
  it('total versé = départ + versements mensuels', () => {
    expect(totalContributed(10000, 200, 15)).toBe(46000);
    expect(totalContributed(0, 0, 10)).toBe(0);
  });
  it('concorde avec la projection', () => {
    const p = projectGrowth({ initial: 10000, monthly: 200, annualReturn: 0.017, annualFees: 0, years: 15, inflation: 0 });
    const s = projectionSplit(p[15].value, totalContributed(10000, 200, 15));
    expect(s.contributed).toBeCloseTo(p[15].contributed, 6);
    expect(s.gains).toBeCloseTo(p[15].gains, 6);
    expect(s.gains).toBeGreaterThan(0);
  });
  it('gains négatifs si le rendement net est négatif', () => {
    const p = projectGrowth({ initial: 10000, monthly: 0, annualReturn: 0.01, annualFees: 0.03, years: 5, inflation: 0 });
    expect(projectionSplit(p[5].value, 10000).gains).toBeLessThan(0);
  });
});

describe('comparateur : début des versements impossibles', () => {
  it('plafond : mois du dépassement converti en années', () => {
    // 10 000 € puis 200 € par mois, plafond 34 950 € : dépassé au 125e versement (10 ans et 5 mois).
    expect(impossibleFromYear(10000, 200, 15, 34950)).toBeCloseTo(125 / 12, 10);
    expect(impossibleFromYear(40000, 0, 5, 34950)).toBe(0);
    expect(impossibleFromYear(10000, 100, 15, 34950)).toBeNull();
  });
  it('durée de versements : la fin des versements, si elle vient avant le plafond', () => {
    const pel = { depositYears: 10, contractYears: 15 };
    expect(impossibleFromYear(1000, 100, 12, 61200, pel)).toBe(10);
    expect(impossibleFromYear(1000, 0, 12, 61200, pel)).toBeNull();
    expect(impossibleFromYear(1000, 100, 10, 61200, pel)).toBeNull();
    expect(impossibleFromYear(50000, 1000, 12, 61200, pel)).toBeCloseTo(12 / 12, 10);
  });
  it('sans plafond ni durée : toujours réalisable', () => {
    expect(impossibleFromYear(10000, 200, 15)).toBeNull();
  });
});
