import { describe, expect, it } from 'vitest';
import { prepayVsInvest, prepayVsInvestByReturn } from './prepayVsInvest';

const I = { balance: 150000, annualRate: 0.035, remainingYears: 15, lump: 20000, annualReturn: 0.06, annualFees: 0.005, taxRate: 0.314 };

describe('rembourser ou investir', () => {
  it('rembourser raccourcit le crédit et économise des intérêts', () => {
    const r = prepayVsInvest(I);
    expect(r.monthsSaved).toBeGreaterThan(0);
    expect(r.monthsIfPrepaid).toBeLessThan(180);
    expect(r.interestSaved).toBeGreaterThan(0);
  });

  it('rendement nul : rembourser est toujours meilleur', () => {
    const r = prepayVsInvest({ ...I, annualReturn: 0, annualFees: 0, taxRate: 0 });
    expect(r.advantageInvest).toBeLessThan(0);
  });

  it('rendement élevé : investir est meilleur', () => {
    expect(prepayVsInvest({ ...I, annualReturn: 0.15 }).advantageInvest).toBeGreaterThan(0);
  });

  it('rendement d’équilibre : les deux options s’équivalent', () => {
    const r = prepayVsInvest(I);
    expect(r.breakEvenReturn).not.toBeNull();
    const at = prepayVsInvest({ ...I, annualReturn: r.breakEvenReturn as number });
    expect(Math.abs(at.advantageInvest)).toBeLessThan(1);
    expect(r.breakEvenReturn as number).toBeGreaterThan(I.annualRate);
  });

  it('crédit sans intérêt, sans impôt ni frais : investir au même taux ne coûte rien', () => {
    const r = prepayVsInvest({ ...I, annualRate: 0, annualReturn: 0, annualFees: 0, taxRate: 0 });
    expect(Math.abs(r.advantageInvest)).toBeLessThan(1e-6);
  });

  it('somme plafonnée au capital restant dû ; entrées nulles ou invalides sans NaN', () => {
    expect(prepayVsInvest({ ...I, lump: 999999 }).lump).toBe(150000);
    const z = prepayVsInvest({ balance: 0, annualRate: NaN, remainingYears: 0, lump: -5, annualReturn: NaN, annualFees: NaN, taxRate: NaN });
    for (const v of Object.values(z)) if (v !== null) expect(Number.isFinite(v)).toBe(true);
  });

  it('durée nulle : aucune évolution', () => {
    const r = prepayVsInvest({ ...I, remainingYears: 0 });
    expect(r.monthsSaved).toBe(0);
    expect(r.interestSaved).toBe(0);
  });

  it('gamme de rendements : mêmes valeurs que le calcul, courbes croisées au rendement d’équilibre', () => {
    const pts = prepayVsInvestByReturn(I);
    expect(pts.map((p) => Math.round(p.annualReturn * 100))).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    for (const p of pts) {
      const r = prepayVsInvest({ ...I, annualReturn: p.annualReturn });
      expect(p.wealthPrepay).toBeCloseTo(r.wealthPrepay, 6);
      expect(p.wealthInvest).toBeCloseTo(r.wealthInvest, 6);
    }
    const be = prepayVsInvest(I).breakEvenReturn as number;
    for (const p of pts) {
      if (p.annualReturn < be - 1e-9) expect(p.wealthPrepay).toBeGreaterThan(p.wealthInvest);
      if (p.annualReturn > be + 1e-9) expect(p.wealthInvest).toBeGreaterThan(p.wealthPrepay);
    }
  });

  it('gamme étendue jusqu’au rendement saisi au-delà de 10 %, plafonnée à 30 %', () => {
    expect(prepayVsInvestByReturn({ ...I, annualReturn: 0.125 }).at(-1)?.annualReturn).toBeCloseTo(0.13, 9);
    expect(prepayVsInvestByReturn({ ...I, annualReturn: 0.1 }).length).toBe(11);
    expect(prepayVsInvestByReturn({ ...I, annualReturn: 0.9 }).length).toBe(31);
    expect(prepayVsInvestByReturn({ ...I, annualReturn: NaN }).length).toBe(11);
  });
});
