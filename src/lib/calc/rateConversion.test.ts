import { describe, expect, it } from 'vitest';
import { rateConversion } from './rateConversion';

// Exemples fictifs.
describe('Conversion de taux', () => {
  it('le taux équivalent capitalisé n fois redonne le taux annuel', () => {
    for (const n of [2, 4, 12, 365]) {
      const r = rateConversion({ annualRate: 0.05, periods: n });
      expect(Math.pow(1 + r.equivalentRate, n) - 1).toBeCloseTo(0.05, 12);
    }
  });

  it('5 % annuel : équivalent mensuel ≈ 0,4074 %, proportionnel 0,4167 %', () => {
    const r = rateConversion({ annualRate: 0.05, periods: 12 });
    expect(r.equivalentRate).toBeCloseTo(0.004074123, 8);
    expect(r.proportionalRate).toBeCloseTo(0.05 / 12, 12);
    expect(r.nominalRate).toBeCloseTo(12 * r.equivalentRate, 12);
  });

  it('le taux proportionnel capitalisé dépasse le taux annuel (taux positif, n > 1)', () => {
    const r = rateConversion({ annualRate: 0.05, periods: 12 });
    expect(r.effectiveFromProportional).toBeCloseTo(Math.pow(1 + 0.05 / 12, 12) - 1, 12);
    expect(r.gap).toBeGreaterThan(0);
  });

  it('une seule période ou taux nul : aucun écart', () => {
    expect(rateConversion({ annualRate: 0.05, periods: 1 }).gap).toBeCloseTo(0, 12);
    const z = rateConversion({ annualRate: 0, periods: 12 });
    expect(z.equivalentRate).toBe(0);
    expect(z.gap).toBe(0);
  });

  it('entrées invalides : jamais NaN', () => {
    const r = rateConversion({ annualRate: NaN, periods: Infinity });
    for (const v of [r.equivalentRate, r.proportionalRate, r.nominalRate, r.effectiveFromProportional, r.gap]) expect(Number.isFinite(v)).toBe(true);
  });
});
