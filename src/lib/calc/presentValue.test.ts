import { describe, expect, it } from 'vitest';
import { presentValue } from './presentValue';
import { futureValue } from './requiredReturn';

describe('presentValue', () => {
  it('aller-retour : placer le capital calculé produit le capital visé', () => {
    const r = presentValue({ target: 50000, years: 12, annualRate: 0.04, monthly: 150 });
    expect(futureValue(r.initial, 150, 0.04, 144)).toBeCloseTo(50000, 4);
  });

  it('exemple fictif : 20 000 € dans 10 ans à 5 % sans versement ≈ 12 278,27 €', () => {
    const r = presentValue({ target: 20000, years: 10, annualRate: 0.05, monthly: 0 });
    expect(r.initial).toBeCloseTo(20000 / Math.pow(1.05, 10), 6);
    expect(r.initial).toBeCloseTo(12278.27, 2);
  });

  it('rendement nul : objectif − versements', () => {
    const r = presentValue({ target: 10000, years: 5, annualRate: 0, monthly: 100 });
    expect(r.initial).toBeCloseTo(4000, 8);
    expect(r.gain).toBeCloseTo(0, 8);
  });

  it('versements suffisants : aucun capital de départ', () => {
    const r = presentValue({ target: 5000, years: 5, annualRate: 0.03, monthly: 200 });
    expect(r.noInitialNeeded).toBe(true);
    expect(r.initial).toBe(0);
  });

  it('durée nulle : il faut tout l\'objectif tout de suite', () => {
    expect(presentValue({ target: 8000, years: 0, annualRate: 0.05, monthly: 100 }).initial).toBe(8000);
  });

  it('entrées non finies : jamais de NaN', () => {
    const r = presentValue({ target: NaN, years: Infinity, annualRate: NaN, monthly: NaN });
    expect(Number.isFinite(r.initial)).toBe(true);
    expect(Number.isFinite(r.gain)).toBe(true);
  });

  it('un rendement plus élevé réduit le capital nécessaire', () => {
    const a = presentValue({ target: 30000, years: 10, annualRate: 0.02, monthly: 0 }).initial;
    const b = presentValue({ target: 30000, years: 10, annualRate: 0.06, monthly: 0 }).initial;
    expect(b).toBeLessThan(a);
  });
});
