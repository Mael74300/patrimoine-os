import { describe, expect, it } from 'vitest';
import { purchasingPower } from './purchasingPower';

const I = { amount: 10000, years: 10, inflation: 0.02, annualReturn: 0.03 };

describe('inflation et pouvoir d’achat', () => {
  it('somme inchangée : 10 000 € à 2 % pendant 10 ans valent ≈ 8 203 € d’aujourd’hui', () => {
    const r = purchasingPower(I);
    expect(r.idleRealValue).toBeCloseTo(10000 / Math.pow(1.02, 10), 6);
    expect(r.idleRealValue).toBeCloseTo(8203.48, 1);
    expect(r.idleLoss).toBeCloseTo(0.1797, 3);
    expect(r.nominalToKeepPower).toBeCloseTo(12189.94, 1);
  });

  it('placement : valeur courante, valeur réelle et rendement réel cohérents', () => {
    const r = purchasingPower(I);
    expect(r.investedValue).toBeCloseTo(10000 * Math.pow(1.03, 10), 6);
    expect(r.investedRealValue).toBeCloseTo(r.investedValue / Math.pow(1.02, 10), 6);
    expect(r.realReturn).toBeCloseTo(1.03 / 1.02 - 1, 10);
    expect(r.investedRealValue).toBeGreaterThan(10000);
  });

  it('rendement égal à l’inflation : pouvoir d’achat conservé', () => {
    const r = purchasingPower({ ...I, annualReturn: 0.02 });
    expect(r.investedRealValue).toBeCloseTo(10000, 6);
    expect(r.realReturn).toBeCloseTo(0, 10);
  });

  it('délais de doublement et de perte de moitié', () => {
    const r = purchasingPower(I);
    expect(r.yearsToHalve).toBeCloseTo(Math.log(2) / Math.log(1.02), 6);
    expect(r.yearsToDouble).toBeCloseTo(23.45, 1);
  });

  it('inflation nulle ou rendement nul : pas de délai, pas de perte', () => {
    const r = purchasingPower({ ...I, inflation: 0, annualReturn: 0 });
    expect(r.yearsToHalve).toBeNull();
    expect(r.yearsToDouble).toBeNull();
    expect(r.idleLoss).toBe(0);
    expect(r.idleRealValue).toBe(10000);
  });

  it('séries de la bonne longueur, point de départ égal à la somme', () => {
    const r = purchasingPower(I);
    expect(r.idleSeries).toHaveLength(11);
    expect(r.investedSeries[0]).toBe(10000);
    expect(r.idleSeries[10]).toBe(r.idleRealValue);
  });

  it('entrées invalides ou durée nulle : pas de NaN', () => {
    const r = purchasingPower({ amount: NaN, years: -3, inflation: NaN, annualReturn: NaN });
    for (const v of Object.values(r)) {
      if (Array.isArray(v)) expect(v.every(Number.isFinite)).toBe(true);
      else if (v !== null) expect(Number.isFinite(v)).toBe(true);
    }
    expect(purchasingPower({ ...I, years: 0 }).idleRealValue).toBe(10000);
  });
});
