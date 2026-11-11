import { describe, expect, it } from 'vitest';
import { feeImpact, feeSplit } from './fees';

const I = { initial: 10000, monthly: 300, annualReturn: 0.06, years: 25, inflation: 0.02 };

describe('impact des frais', () => {
  it('sans frais : aucun coût, et plus de frais = moins de capital', () => {
    const [a, b, c] = feeImpact(I, [0, 0.005, 0.02]);
    expect(a.cost).toBe(0);
    expect(b.finalValue).toBeLessThan(a.finalValue);
    expect(c.finalValue).toBeLessThan(b.finalValue);
    expect(c.cost).toBeGreaterThan(b.cost);
  });

  it('cohérent avec le rendement net : 6 % brut et 2 % de frais ≈ 3,88 % net', () => {
    const [r] = feeImpact({ ...I, initial: 10000, monthly: 0, years: 10 }, [0.02]);
    expect(r.finalValue).toBeCloseTo(10000 * Math.pow(1.06 * 0.98, 10), 4);
  });

  it('rendement nul : les frais rongent le capital initial seulement', () => {
    const [r] = feeImpact({ ...I, annualReturn: 0, monthly: 0, years: 1 }, [0.01]);
    expect(r.finalValue).toBeCloseTo(9900, 4);
    expect(r.shareOfGains).toBe(0);
  });

  it('part des gains absorbée entre 0 et 1, série de la bonne longueur', () => {
    const [r] = feeImpact(I, [0.015]);
    expect(r.shareOfGains).toBeGreaterThan(0);
    expect(r.shareOfGains).toBeLessThan(1);
    expect(r.series).toHaveLength(I.years + 1);
    expect(r.realValue).toBeLessThan(r.finalValue);
  });

  it('entrées invalides ou durée nulle : pas de NaN', () => {
    const r = feeImpact({ initial: NaN, monthly: -5, annualReturn: NaN, years: 0, inflation: NaN }, [NaN, -1, 5]);
    for (const x of r) expect(Object.values(x).every((v) => Array.isArray(v) || Number.isFinite(v))).toBe(true);
  });

  it('barres : versements + gains conservés + frais = capital sans frais (exemple fictif par défaut du simulateur)', () => {
    const [zero, a, c] = feeImpact(I, [0, 0.002, 0.02]);
    expect(a.contributed).toBe(10000 + 300 * 12 * 25);
    for (const r of [zero, a, c]) {
      expect(r.finalValue + r.cost).toBeCloseTo(zero.finalValue, 6);
      const b = feeSplit(r, zero.finalValue);
      expect(b.paid + b.kept + b.lost).toBeCloseTo(100, 6);
      expect(b.paid).toBeCloseTo((100 * 100000) / zero.finalValue, 6);
    }
    expect(feeSplit(zero, zero.finalValue).lost).toBe(0);
    expect(feeSplit(c, zero.finalValue).lost).toBeGreaterThan(feeSplit(a, zero.finalValue).lost);
  });

  it('barres : perte ou échelle nulle, jamais plus de 100 % ni de NaN', () => {
    const [r] = feeImpact({ ...I, annualReturn: -0.05 }, [0.02]);
    const b = feeSplit(r, Math.max(r.contributed, r.finalValue + r.cost));
    expect(b.kept).toBe(0);
    expect(b.paid + b.kept + b.lost).toBeLessThanOrEqual(100);
    expect(feeSplit(r, 0)).toEqual({ paid: 0, kept: 0, lost: 0 });
    const n = feeSplit({ finalValue: NaN, cost: NaN, contributed: NaN }, 1000);
    expect(Object.values(n).every(Number.isFinite)).toBe(true);
  });
});
