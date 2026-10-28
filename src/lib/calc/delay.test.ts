import { describe, expect, it } from 'vitest';
import { delayCost } from './delay';

// Exemples fictifs.
describe('Coût d’attendre', () => {
  it('rendement nul : capital = total versé, le coût est le versement des mois perdus', () => {
    const r = delayCost({ monthly: 100, annualReturn: 0, years: 10, delayYears: 2 });
    expect(r.startNow).toBeCloseTo(12000, 6);
    expect(r.startLater).toBeCloseTo(9600, 6);
    expect(r.cost).toBeCloseTo(2400, 6);
    expect(r.catchUpMonthly).toBeCloseTo(125, 6);
  });

  it('rendement positif : le coût dépasse les seuls versements manqués', () => {
    const r = delayCost({ monthly: 200, annualReturn: 0.05, years: 20, delayYears: 5 });
    const m = Math.pow(1.05, 1 / 12) - 1;
    expect(r.startNow).toBeCloseTo((200 * (Math.pow(1 + m, 240) - 1)) / m, 6);
    expect(r.startLater).toBeCloseTo((200 * (Math.pow(1 + m, 180) - 1)) / m, 6);
    expect(r.cost).toBeGreaterThan(200 * 60);
    expect(r.investedNow - r.investedLater).toBe(12000);
  });

  it('le versement de rattrapage redonne bien le capital visé', () => {
    const r = delayCost({ monthly: 150, annualReturn: 0.04, years: 15, delayYears: 3 });
    const m = Math.pow(1.04, 1 / 12) - 1;
    const rebuilt = (r.catchUpMonthly as number) * ((Math.pow(1 + m, 144) - 1) / m);
    expect(rebuilt).toBeCloseTo(r.startNow, 4);
  });

  it('délai nul : aucun coût ; délai égal à l’horizon : pas de rattrapage possible', () => {
    expect(delayCost({ monthly: 100, annualReturn: 0.05, years: 10, delayYears: 0 }).cost).toBeCloseTo(0, 9);
    const all = delayCost({ monthly: 100, annualReturn: 0.05, years: 10, delayYears: 10 });
    expect(all.startLater).toBe(0);
    expect(all.catchUpMonthly).toBeNull();
  });

  it('entrées invalides : jamais NaN', () => {
    const r = delayCost({ monthly: NaN, annualReturn: NaN, years: -3, delayYears: Infinity });
    expect(Number.isFinite(r.cost)).toBe(true);
    expect(r.months).toBe(0);
  });
});
