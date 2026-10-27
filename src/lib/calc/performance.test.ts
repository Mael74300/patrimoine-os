import { describe, expect, it } from 'vitest';
import { performance } from './performance';

// Exemples fictifs.
describe('Rendement réel (TRI)', () => {
  it('versement unique : rendement annuel = (finale / initial)^(1/années) − 1', () => {
    const r = performance({ initial: 10000, monthly: 0, months: 36, finalValue: 12000 });
    expect(r.annualized).toBeCloseTo(Math.pow(1.2, 1 / 3) - 1, 6);
    expect(r.invested).toBe(10000);
    expect(r.gain).toBe(2000);
    expect(r.cumulative).toBeCloseTo(0.2, 9);
  });

  it('valeur finale égale au total versé : rendement nul', () => {
    const r = performance({ initial: 1000, monthly: 100, months: 24, finalValue: 3400 });
    expect(r.annualized).toBeCloseTo(0, 6);
  });

  it('retrouve le taux d’un plan connu : 5 % par an sur versements mensuels', () => {
    const m = Math.pow(1.05, 1 / 12) - 1;
    const n = 120;
    const finalValue = 5000 * Math.pow(1 + m, n) + (200 * (Math.pow(1 + m, n) - 1)) / m;
    const r = performance({ initial: 5000, monthly: 200, months: n, finalValue });
    expect(r.annualized).toBeCloseTo(0.05, 6);
  });

  it('perte : rendement négatif', () => {
    const r = performance({ initial: 10000, monthly: 0, months: 12, finalValue: 9000 });
    expect(r.annualized).toBeCloseTo(-0.1, 6);
    expect(r.gain).toBe(-1000);
  });

  it('valeur finale nulle : perte totale', () => {
    expect(performance({ initial: 1000, monthly: 0, months: 12, finalValue: 0 }).annualized).toBe(-1);
  });

  it('rien versé ou durée nulle : rendement non défini', () => {
    expect(performance({ initial: 0, monthly: 0, months: 12, finalValue: 100 }).annualized).toBeNull();
    expect(performance({ initial: 1000, monthly: 0, months: 0, finalValue: 1100 }).annualized).toBeNull();
  });

  it('entrées aberrantes : aucun NaN', () => {
    const r = performance({ initial: NaN, monthly: -5, months: NaN, finalValue: Infinity });
    expect(Number.isNaN(r.gain)).toBe(false);
    expect(r.annualized).toBeNull();
  });
});
