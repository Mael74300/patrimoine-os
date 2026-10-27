import { describe, expect, it } from 'vitest';
import { advantageByHorizon, advantageByPriceGrowth, rentVsBuy } from './rentVsBuy';

// Exemple fictif.
const B = { price: 250000, downPayment: 50000, acquisitionRate: 0.08, loanRate: 0.035, loanYears: 20, ownerCostRate: 0.015, priceGrowth: 0.02, sellingRate: 0.05, monthlyRent: 900, rentGrowth: 0.02, investReturn: 0.04, horizonYears: 20 };

describe('Louer ou acheter', () => {
  it('horizon nul : patrimoines de départ (acheteur = valeur nette de revente, locataire = apport + frais)', () => {
    const r = rentVsBuy({ ...B, horizonYears: 0 });
    expect(r.months).toBe(0);
    expect(r.renterWealth).toBeCloseTo(50000 + 250000 * 0.08, 6);
    expect(r.buyerWealth).toBeCloseTo(250000 * 0.95 - 200000, 6);
  });

  it('prêt remboursé à l’horizon : dette nulle et valeur finale = prix × (1 + g)^20', () => {
    const r = rentVsBuy(B);
    expect(r.remainingDebt).toBeCloseTo(0, 4);
    expect(r.finalValue).toBeCloseTo(250000 * Math.pow(1.02, 20), 2);
  });

  it('sans intérêt, charges, frais ni rendement, loyer = mensualité : l’écart est le capital remboursé (le bien est acquis, les loyers sont perdus)', () => {
    const pay = 200000 / 240;
    const r = rentVsBuy({ ...B, loanRate: 0, ownerCostRate: 0, acquisitionRate: 0, sellingRate: 0, investReturn: 0, priceGrowth: 0, rentGrowth: 0, monthlyRent: pay });
    expect(r.advantage).toBeCloseTo(200000, 3);
  });

  it('plus la hausse des prix est forte, plus acheter est favorable', () => {
    const t = advantageByPriceGrowth(B, [0, 0.02, 0.04]);
    expect(t[0].advantage).toBeLessThan(t[1].advantage);
    expect(t[1].advantage).toBeLessThan(t[2].advantage);
  });

  it('horizon court : les frais d’acquisition et de revente pèsent, acheter est moins favorable qu’à long terme', () => {
    const t = advantageByHorizon(B, [2, 20]);
    expect(t[0].advantage).toBeLessThan(t[1].advantage);
  });

  it('série annuelle de la longueur de l’horizon et entrées invalides sans NaN', () => {
    expect(rentVsBuy(B).series).toHaveLength(20);
    const r = rentVsBuy({ ...B, price: NaN, monthlyRent: -5, horizonYears: Infinity });
    expect(Number.isFinite(r.advantage)).toBe(true);
  });

  it('point d’équilibre : si acheter l’emporte à l’horizon, le mois renvoyé est dans la période', () => {
    const r = rentVsBuy({ ...B, priceGrowth: 0.04 });
    expect(r.advantage).toBeGreaterThan(0);
    expect(r.breakEvenMonth).not.toBeNull();
    expect(r.breakEvenMonth!).toBeLessThanOrEqual(240);
  });
});
