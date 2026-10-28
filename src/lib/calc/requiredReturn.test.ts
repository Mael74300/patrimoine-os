import { describe, expect, it } from 'vitest';
import { futureValue, requiredReturn } from './requiredReturn';

describe('requiredReturn', () => {
  it('retrouve le rendement qui produit exactement le capital visé (aller-retour)', () => {
    const target = futureValue(1000, 200, 0.05, 120);
    const r = requiredReturn({ initial: 1000, monthly: 200, years: 10, target });
    expect(r.annualRate).not.toBeNull();
    expect(r.annualRate!).toBeCloseTo(0.05, 6);
  });

  it('exemple fictif : 10 000 € sans versement, 10 000 → 20 000 en 10 ans ≈ 7,18 %', () => {
    const r = requiredReturn({ initial: 10000, monthly: 0, years: 10, target: 20000 });
    expect(r.annualRate!).toBeCloseTo(Math.pow(2, 1 / 10) - 1, 6);
  });

  it('objectif déjà atteint sans rendement : 0 %', () => {
    const r = requiredReturn({ initial: 5000, monthly: 100, years: 5, target: 8000 });
    expect(r.alreadyReached).toBe(true);
    expect(r.annualRate).toBe(0);
    expect(r.contributed).toBe(11000);
  });

  it('objectif inatteignable dans la plage : null', () => {
    const r = requiredReturn({ initial: 0, monthly: 10, years: 1, target: 1e9 });
    expect(r.annualRate).toBeNull();
  });

  it('durée nulle et objectif supérieur au capital : null, sans NaN', () => {
    const r = requiredReturn({ initial: 100, monthly: 10, years: 0, target: 500 });
    expect(r.annualRate).toBeNull();
    expect(Number.isNaN(r.contributed)).toBe(false);
  });

  it('entrées non finies neutralisées', () => {
    const r = requiredReturn({ initial: NaN, monthly: Infinity, years: NaN, target: NaN });
    expect(r.alreadyReached).toBe(true);
  });

  it('un versement plus élevé réduit le rendement nécessaire', () => {
    const a = requiredReturn({ initial: 1000, monthly: 100, years: 10, target: 30000 }).annualRate!;
    const b = requiredReturn({ initial: 1000, monthly: 200, years: 10, target: 30000 }).annualRate!;
    expect(b).toBeLessThan(a);
  });
});
