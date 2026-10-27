import { describe, expect, it } from 'vitest';
import { taeg, taegByFees, taegByInsurance } from './taeg';

const B = { principal: 200000, annualRate: 0.036, years: 20, insuranceRate: 0, fees: 0 };

describe('TAEG', () => {
  it('sans assurance ni frais : TAEG = taux nominal converti en taux effectif annuel, (1 + 0,036/12)^12 − 1', () => {
    const r = taeg(B);
    expect(r.taeg).toBeCloseTo(Math.pow(1 + 0.036 / 12, 12) - 1, 8);
    expect(r.months).toBe(240);
    expect(r.totalCost).toBeCloseTo(r.totalInterest, 4);
  });

  it('taux nul, sans frais : TAEG nul', () => {
    expect(taeg({ ...B, annualRate: 0 }).taeg).toBeCloseTo(0, 10);
  });

  it('les frais et l’assurance augmentent le TAEG', () => {
    const base = taeg(B).taeg;
    expect(taeg({ ...B, fees: 3000 }).taeg).toBeGreaterThan(base);
    expect(taeg({ ...B, insuranceRate: 0.003 }).taeg).toBeGreaterThan(base);
  });

  it('le TAEG actualise bien les flux : valeur actuelle des mensualités = capital reçu', () => {
    const r = taeg({ ...B, fees: 2500, insuranceRate: 0.0025 });
    const i = Math.pow(1 + r.taeg, 1 / 12) - 1;
    const pv = (r.monthlyTotal * (1 - Math.pow(1 + i, -r.months))) / i;
    expect(pv).toBeCloseTo(r.netReceived, 3);
  });

  it('coût total = intérêts + assurance + frais', () => {
    const r = taeg({ ...B, fees: 2500, insuranceRate: 0.0025 });
    expect(r.totalCost).toBeCloseTo(r.totalInterest + r.totalInsurance + 2500, 4);
    expect(r.totalInsurance).toBeCloseTo(((200000 * 0.0025) / 12) * 240, 6);
  });

  it('entrées nulles ou invalides : aucun NaN', () => {
    for (const input of [{ ...B, principal: 0 }, { ...B, years: 0 }, { ...B, principal: NaN }, { ...B, fees: 1e9 }]) {
      const r = taeg(input);
      expect(Number.isFinite(r.taeg)).toBe(true);
      expect(Number.isFinite(r.totalCost)).toBe(true);
    }
  });

  it('comparaisons : TAEG croissant avec les frais et avec l’assurance', () => {
    const f = taegByFees({ principal: 200000, annualRate: 0.036, years: 20, insuranceRate: 0 }, [0, 1000, 3000]);
    expect(f[0].taeg).toBeLessThan(f[1].taeg);
    expect(f[1].taeg).toBeLessThan(f[2].taeg);
    const a = taegByInsurance({ principal: 200000, annualRate: 0.036, years: 20, fees: 0 }, [0, 0.002, 0.004]);
    expect(a[0].taeg).toBeLessThan(a[2].taeg);
  });
});
