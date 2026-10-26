import { describe, expect, it } from 'vitest';
import { feeImpact } from './fees';

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
});
