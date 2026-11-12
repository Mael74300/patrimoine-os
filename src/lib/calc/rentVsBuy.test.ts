import { describe, expect, it } from 'vitest';
import { advantageByHorizon, advantageByPriceGrowth, breakEvenBand, rentVsBuy } from './rentVsBuy';

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

  it('série annuelle : le dernier point reprend les patrimoines finaux', () => {
    const r = rentVsBuy(B);
    const last = r.series[r.series.length - 1];
    expect(last.year).toBe(20);
    expect(last.buyer).toBeCloseTo(r.buyerWealth, 6);
    expect(last.renter).toBeCloseTo(r.renterWealth, 6);
  });

  it('point d’équilibre : si acheter l’emporte à l’horizon, le mois renvoyé est dans la période', () => {
    const r = rentVsBuy({ ...B, priceGrowth: 0.04 });
    expect(r.advantage).toBeGreaterThan(0);
    expect(r.breakEvenMonth).not.toBeNull();
    expect(r.breakEvenMonth!).toBeLessThanOrEqual(240);
  });
});

describe('breakEvenBand (zone « l’achat l’emporte » du graphique)', () => {
  it('place le mois d’équilibre sur l’axe des années (index 0 = fin de la 1re année)', () => {
    expect(breakEvenBand(145, 15)).toEqual({ from: 145 / 12 - 1, to: 14 });
    expect(breakEvenBand(24, 15)).toEqual({ from: 1, to: 14 });
  });
  it('commence au bord gauche si l’achat l’emporte dès la 1re année', () => {
    expect(breakEvenBand(3, 10)).toEqual({ from: 0, to: 9 });
  });
  it('aucune zone sans point d’équilibre, ou réduite à la dernière année', () => {
    expect(breakEvenBand(null, 15)).toBeNull();
    expect(breakEvenBand(180, 15)).toBeNull();
    expect(breakEvenBand(12, 1)).toBeNull();
  });
  it('concorde avec le calcul : la série est en faveur de l’achat sur toute la zone', () => {
    const r = rentVsBuy({ ...B, horizonYears: 15 });
    const band = breakEvenBand(r.breakEvenMonth, r.series.length);
    expect(band).not.toBeNull();
    const first = Math.ceil(band!.from);
    for (let i = first; i < r.series.length; i++) expect(r.series[i].buyer).toBeGreaterThan(r.series[i].renter);
    if (first > 0) expect(r.series[first - 1].buyer).toBeLessThanOrEqual(r.series[first - 1].renter);
  });
});
