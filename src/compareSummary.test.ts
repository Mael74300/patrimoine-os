import { describe, expect, it } from 'vitest';
import { projectGrowth } from './lib/finance';
import { projectionSplit, totalContributed } from './lib/calc/compareSummary';

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
