import { describe, expect, it } from 'vitest';
import { advantageBars, advantageByHorizon, advantageByPriceGrowth, breakEvenBand, rentVsBuy, scenarioValues, wealthBars } from './rentVsBuy';

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

  it('scénarios : la valeur saisie est ajoutée une seule fois, dans l’ordre, et seulement si elle est dans la plage', () => {
    expect(scenarioValues([3, 5, 10, 15, 20], 15, 1, 50)).toEqual([3, 5, 10, 15, 20]);
    expect(scenarioValues([3, 5, 10, 15, 20], 8, 1, 50)).toEqual([3, 5, 8, 10, 15, 20]);
    expect(scenarioValues([3, 5, 10, 15, 20], 0, 1, 50)).toEqual([3, 5, 10, 15, 20]);
    expect(scenarioValues([-0.01, 0, 0.02, 0.04], 0.02 + 1e-12, -0.1, 0.15)).toEqual([-0.01, 0, 0.02, 0.04]);
    expect(scenarioValues([-0.01, 0, 0.02, 0.04], 0.03, -0.1, 0.15)).toEqual([-0.01, 0, 0.02, 0.03, 0.04]);
  });

  it('barres divergentes : côté gagnant, plus grand écart à 100 %, égalité sans barre', () => {
    // Exemple fictif : écarts selon l'horizon avec les réglages par défaut du simulateur (horizon 15 ans).
    const D = { ...B, horizonYears: 15 };
    const t = advantageByHorizon(D, [3, 5, 10, 15, 20]);
    const bars = advantageBars(t.map((d) => d.advantage));
    expect(bars.map((b) => b.side)).toEqual(['rent', 'rent', 'rent', 'buy', 'buy']);
    expect(bars[4].pct).toBeCloseTo(100, 6);
    expect(bars[0].pct).toBeCloseTo((Math.abs(t[0].advantage) / t[4].advantage) * 100, 6);
    expect(advantageBars([0.2, -50, 1000])).toEqual([{ side: 'tie', pct: 0 }, { side: 'rent', pct: 5 }, { side: 'buy', pct: 100 }]);
    expect(advantageBars([1, 100000])[0]).toEqual({ side: 'buy', pct: 2 });
    expect(advantageBars([0, NaN])).toEqual([{ side: 'tie', pct: 0 }, { side: 'tie', pct: 0 }]);
  });
});

describe('Détail des patrimoines (« Ce que possède chacun »)', () => {
  it('les parts additionnées redonnent les patrimoines', () => {
    for (const h of [0, 5, 15, 20, 30]) {
      const r = rentVsBuy({ ...B, horizonYears: h });
      expect(r.netSaleValue - r.remainingDebt + r.buyerSavings).toBeCloseTo(r.buyerWealth, 6);
      expect(r.renterFromStart + r.renterFromMonthly).toBeCloseTo(r.renterWealth, 6);
    }
  });

  it('mise de départ du locataire = (apport + frais d’achat) × (1 + rendement) sur la durée', () => {
    const r = rentVsBuy({ ...B, horizonYears: 15 });
    expect(r.renterFromStart).toBeCloseTo((50000 + 250000 * 0.08) * Math.pow(1.04, 15), 4);
    expect(r.netSaleValue).toBeCloseTo(r.finalValue * 0.95, 6);
  });

  it('dépense du premier mois = mensualité + charges de 1,5 % par an de la valeur', () => {
    const r = rentVsBuy(B);
    expect(r.firstOwnerOutflow).toBeCloseTo(r.monthlyPayment + 250000 * 0.015 / 12, 6);
  });

  it('exemple par défaut du simulateur (fictif, 15 ans) : le propriétaire n’épargne rien, le locataire place chaque mois', () => {
    const r = rentVsBuy({ ...B, horizonYears: 15 });
    expect(r.buyerSavings).toBe(0);
    expect(r.renterFromMonthly).toBeGreaterThan(0);
    expect(r.remainingDebt).toBeGreaterThan(0);
  });

  it('barres : même échelle, la plus longue à 100 %', () => {
    const r = rentVsBuy({ ...B, horizonYears: 15 });
    const b = wealthBars(r);
    const owner = b.owned + b.owed + b.savings;
    const renter = b.start + b.monthly;
    expect(Math.max(owner, renter)).toBeCloseTo(100, 6);
    expect(b.owed / (b.owned + b.owed)).toBeCloseTo(r.remainingDebt / r.netSaleValue, 6);
  });

  it('barres : prêt restant supérieur à la revente, tout le logement est dû ; valeurs nulles ou invalides sans NaN', () => {
    const b = wealthBars({ netSaleValue: 100, remainingDebt: 150, buyerSavings: 0, renterFromStart: 50, renterFromMonthly: 0 });
    expect(b.owned).toBe(0);
    expect(b.owed).toBeCloseTo(100, 6);
    const z = wealthBars({ netSaleValue: 0, remainingDebt: 0, buyerSavings: NaN, renterFromStart: 0, renterFromMonthly: 0 });
    expect(Object.values(z).every((v) => v === 0)).toBe(true);
  });
});
