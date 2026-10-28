import { describe, expect, it } from 'vitest';
import { inFine } from './inFine';

// Exemples fictifs.
const base = { principal: 200000, annualRate: 0.03, years: 20, savingsReturn: 0.03 };

describe('Crédit in fine ou amortissable', () => {
  it('intérêts in fine = capital × taux ÷ 12 par mois', () => {
    const r = inFine(base);
    expect(r.inFineInterest).toBeCloseTo(500, 8);
    expect(r.inFineCost).toBeCloseTo(500 * 240, 6);
  });

  it('l\'épargne mensuelle reconstitue exactement le capital à l\'échéance', () => {
    const r = inFine({ ...base, savingsReturn: 0.04 });
    const m = Math.pow(1.04, 1 / 12) - 1;
    let cap = 0;
    for (let i = 0; i < 240; i++) cap = cap * (1 + m) + r.monthlySaving;
    expect(cap).toBeCloseTo(200000, 4);
  });

  it('rendement nul : épargne = capital ÷ mois et aucun gain', () => {
    const r = inFine({ ...base, savingsReturn: 0 });
    expect(r.monthlySaving).toBeCloseTo(200000 / 240, 8);
    expect(r.savingsGain).toBeCloseTo(0, 6);
    expect(r.inFineNetCost).toBeCloseTo(r.inFineCost, 6);
  });

  it('la mensualité amortissable reste celle du crédit classique (≈ 1 109,20 € à 3 % sur 20 ans)', () => {
    expect(inFine(base).amortizingPayment).toBeCloseTo(1109.2, 1);
  });

  it('épargne rémunérée au taux du crédit : coût net in fine ≈ coût amortissable', () => {
    // Même taux : emprunter en in fine et épargner au même taux revient au même coût net.
    const r = inFine({ ...base, savingsReturn: 0.03 });
    expect(Math.abs(r.netCostGap) / r.amortizingCost).toBeLessThan(0.02);
  });

  it('rendement de l\'épargne plus faible que le taux du crédit : l\'in fine coûte plus', () => {
    expect(inFine({ ...base, savingsReturn: 0.01 }).netCostGap).toBeGreaterThan(0);
    expect(inFine({ ...base, savingsReturn: 0.06 }).netCostGap).toBeLessThan(0);
  });

  it('l\'assurance s\'ajoute dans les deux cas', () => {
    const r = inFine({ ...base, insuranceRate: 0.003 });
    expect(r.inFineMonthlyTotal - r.monthlySaving - r.inFineInterest).toBeCloseTo((200000 * 0.003) / 12, 6);
    expect(r.amortizingMonthlyTotal - r.amortizingPayment).toBeCloseTo((200000 * 0.003) / 12, 6);
  });

  it('entrées invalides : jamais NaN', () => {
    for (const v of Object.values(inFine({ principal: NaN, annualRate: Infinity, years: NaN, savingsReturn: NaN }))) expect(Number.isFinite(v)).toBe(true);
  });
});
