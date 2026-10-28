import { describe, expect, it } from 'vitest';
import { doubling } from './doubling';

// Exemples fictifs.
describe('Temps pour doubler un capital', () => {
  it('doubler à 6 % : durée exacte = ln 2 / ln 1,06, règle de 72 = 12 ans', () => {
    const r = doubling({ initial: 10000, annualReturn: 0.06, inflation: 0, multiple: 2 });
    expect(r.exactYears).toBeCloseTo(Math.log(2) / Math.log(1.06), 9);
    expect(r.exactYears as number).toBeCloseTo(11.896, 3);
    expect(r.rule72Years).toBeCloseTo(12, 9);
    expect(r.target).toBe(20000);
    // Le capital placé 11,896 ans à 6 % vaut bien le double.
    expect(10000 * Math.pow(1.06, r.exactYears as number)).toBeCloseTo(20000, 6);
  });

  it('autre multiple : tripler à 5 %', () => {
    const r = doubling({ initial: 1000, annualReturn: 0.05, inflation: 0, multiple: 3 });
    expect(1000 * Math.pow(1.05, r.exactYears as number)).toBeCloseTo(3000, 6);
    expect(r.rule72Years).toBeCloseTo((72 * (Math.log(3) / Math.log(2))) / 5, 9);
  });

  it('inflation : la durée en pouvoir d’achat est plus longue', () => {
    const r = doubling({ initial: 5000, annualReturn: 0.05, inflation: 0.02, multiple: 2 });
    expect(r.realReturn).toBeCloseTo(1.05 / 1.02 - 1, 12);
    expect(r.realYears as number).toBeGreaterThan(r.exactYears as number);
  });

  it('rendement nul, négatif ou multiple ≤ 1 : pas de durée, jamais NaN', () => {
    expect(doubling({ initial: 100, annualReturn: 0, inflation: 0, multiple: 2 }).exactYears).toBeNull();
    expect(doubling({ initial: 100, annualReturn: -0.02, inflation: 0, multiple: 2 }).rule72Years).toBeNull();
    expect(doubling({ initial: 100, annualReturn: 0.05, inflation: 0.05, multiple: 2 }).realYears).toBeNull();
    expect(doubling({ initial: 100, annualReturn: 0.05, inflation: 0, multiple: 1 }).exactYears).toBeNull();
    const bad = doubling({ initial: NaN, annualReturn: NaN, inflation: NaN, multiple: NaN });
    expect(Number.isFinite(bad.target)).toBe(true);
    expect(bad.multiple).toBe(2);
  });
});
