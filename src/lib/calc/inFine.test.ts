import { describe, expect, it } from 'vitest';
import { inFine, inFineBars } from './inFine';
import { amortize } from './loan';

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

  describe('barres', () => {
    const ex = { ...base, savingsReturn: 0.02, insuranceRate: 0.003 }; // exemple par défaut du simulateur, fictif

    it('coût : l\'échelle est le plus grand montant, la barre in fine se partage entre net et regagné', () => {
      const r = inFine(ex);
      const b = inFineBars(ex);
      expect(r.inFineCost).toBeCloseTo(132000, 6);
      expect(b.cost.inFineNet + b.cost.inFineRegained).toBeCloseTo(100, 8);
      expect(b.cost.inFineNet).toBeCloseTo((100 * r.inFineNetCost) / r.inFineCost, 8);
      expect(b.cost.amortizing).toBeCloseTo((100 * r.amortizingCost) / r.inFineCost, 8);
      expect(b.cost.inFineLost).toBe(0);
    });

    it('mi-parcours : capital remboursé = capital − restant dû de l\'échéancier, épargne versée avec ses gains', () => {
      const b = inFineBars(ex);
      expect(b.midMonth).toBe(120);
      const remainingAfter10 = amortize(ex).schedule[9].remaining;
      expect(b.amortizingRepaid).toBeCloseTo(200000 - remainingAfter10, 4);
      const r = inFine(ex);
      const m = Math.pow(1.02, 1 / 12) - 1;
      let cap = 0;
      for (let k = 0; k < 120; k++) cap = cap * (1 + m) + r.monthlySaving;
      expect(b.inFineSaved).toBeCloseTo(cap, 4);
      expect(b.inFineSavedPct).toBeCloseTo((100 * cap) / 200000, 8);
    });

    it('rendement négatif : la perte de l\'épargne s\'ajoute au bout de la barre', () => {
      const b = inFineBars({ ...ex, savingsReturn: -0.01 });
      expect(b.cost.inFineRegained).toBe(0);
      expect(b.cost.inFineLost).toBeGreaterThan(0);
      expect(b.cost.inFineNet + b.cost.inFineLost).toBeCloseTo(100, 8);
    });

    it('taux nul et entrées invalides : jamais NaN', () => {
      const z = inFineBars({ ...ex, annualRate: 0, insuranceRate: 0, savingsReturn: 0 });
      expect(z.amortizingRepaidPct).toBeCloseTo(50, 8);
      expect(z.inFineSavedPct).toBeCloseTo(50, 8);
      const bad = inFineBars({ principal: NaN, annualRate: NaN, years: NaN, savingsReturn: NaN });
      for (const v of [bad.midMonth, bad.amortizingRepaid, bad.inFineSaved, ...Object.values(bad.cost)]) expect(Number.isFinite(v)).toBe(true);
    });
  });
});
