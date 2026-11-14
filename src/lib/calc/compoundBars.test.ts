import { describe, expect, it } from 'vitest';
import { compoundRow, compoundScale, compoundSplit, delayRows, dureeRow, placerRow, rendementRow, simpleCompoundRows, stepUpRows } from './compoundBars';
import { presentValue } from './presentValue';
import { timeToTarget } from './timeToTarget';
import { requiredReturn, futureValue } from './requiredReturn';
import { simpleVsCompound } from './simpleVsCompound';
import { delayCost } from './delay';
import { stepUp } from './stepUp';

const sum = (s: ReturnType<typeof compoundSplit>) => s.start + s.deposits + s.interest + s.extra + s.lost;

describe('compoundBars', () => {
  it('Combien placer (valeurs par défaut fictives) : la barre mesure exactement l’objectif', () => {
    const input = { target: 30000, years: 10, annualRate: 0.04, monthly: 100 };
    const r = presentValue(input);
    const row = placerRow(r, input);
    expect(row.final).toBeCloseTo(30000, 6);
    expect(row.start).toBeCloseTo(r.initial, 6);
    expect(row.deposits).toBeCloseTo(12000, 6);
    expect(row.interest).toBeCloseTo(r.gain, 6);
    expect(sum(compoundSplit(row, compoundScale([row])))).toBeCloseTo(100, 6);
  });

  it('Combien placer : si les versements suffisent seuls, la barre montre le capital réellement atteint', () => {
    const input = { target: 5000, years: 10, annualRate: 0.04, monthly: 100 };
    const r = presentValue(input);
    expect(r.noInitialNeeded).toBe(true);
    const row = placerRow(r, input);
    expect(row.start).toBe(0);
    expect(row.final).toBeCloseTo(futureValue(0, 100, 0.04, 120), 6);
    expect(row.final).toBeGreaterThan(5000);
  });

  it('En combien de temps : versements + intérêts = capital à l’arrivée ; null si non atteint', () => {
    const r = timeToTarget({ initial: 2000, monthly: 300, annualRate: 0.04, target: 30000 });
    const row = dureeRow(r, 2000)!;
    expect(row.start).toBe(2000);
    expect(row.final).toBeCloseTo(r.finalValue, 6);
    expect(row.interest).toBeCloseTo(r.interest, 6);
    expect(dureeRow(timeToTarget({ initial: 0, monthly: 0, annualRate: 0.04, target: 30000 }), 0)).toBeNull();
  });

  it('Quel rendement : la barre mesure l’objectif ; null si les versements suffisent', () => {
    const r = requiredReturn({ initial: 5000, monthly: 200, years: 15, target: 60000 });
    const row = rendementRow(r, { initial: 5000, target: 60000 })!;
    expect(row.final).toBeCloseTo(60000, 6);
    expect(row.deposits).toBeCloseTo(36000, 6);
    expect(row.interest).toBeCloseTo(60000 - 41000, 6);
    const easy = requiredReturn({ initial: 5000, monthly: 200, years: 15, target: 10000 });
    expect(rendementRow(easy, { initial: 5000, target: 10000 })).toBeNull();
  });

  it('Simples ou composés (10 000 € à 5 % sur 20 ans, fictif) : même base, les composés ajoutent l’écart', () => {
    const r = simpleVsCompound({ initial: 10000, annualRate: 0.05, years: 20 });
    const rows = simpleCompoundRows(r, 10000)!;
    expect(rows.simple.final).toBeCloseTo(20000, 6);
    expect(rows.compound.final).toBeCloseTo(10000 * Math.pow(1.05, 20), 6);
    expect(rows.compound.extra).toBeCloseTo(r.gap, 6);
    const scale = compoundScale([rows.simple, rows.compound]);
    expect(sum(compoundSplit(rows.compound, scale))).toBeCloseTo(100, 6);
    expect(sum(compoundSplit(rows.simple, scale))).toBeCloseTo((20000 / rows.compound.final) * 100, 6);
    expect(simpleCompoundRows(simpleVsCompound({ initial: 10000, annualRate: -0.02, years: 10 }), 10000)).toBeNull();
    expect(simpleCompoundRows(simpleVsCompound({ initial: 10000, annualRate: 0.05, years: 0 }), 10000)).toBeNull();
  });

  it('Coût d’attendre et Épargne qui augmente : chaque barre reprend capital et versements des cartes', () => {
    const d = delayCost({ monthly: 200, annualReturn: 0.05, years: 25, delayYears: 5 });
    const dr = delayRows(d);
    expect(dr.now.final).toBeCloseTo(d.startNow, 6);
    expect(dr.later.final).toBeCloseTo(d.startLater, 6);
    expect(dr.now.deposits).toBeCloseTo(60000, 6);
    expect(dr.later.deposits).toBeCloseTo(48000, 6);
    const s = stepUp({ monthly: 200, annualIncrease: 0.03, annualReturn: 0.05, years: 25 });
    const sr = stepUpRows(s);
    expect(sr.flat.final).toBeCloseTo(s.flatCapital, 6);
    expect(sr.stepped.final).toBeCloseTo(s.steppedCapital, 6);
  });

  it('rendement négatif : la part perdue est hachurée, prise d’abord sur les versements', () => {
    const row = compoundRow(1000, 2000, -500);
    const sp = compoundSplit(row, compoundScale([row]));
    expect(sp.lost).toBeCloseTo((500 / 3000) * 100, 6);
    expect(sp.deposits).toBeCloseTo((1500 / 3000) * 100, 6);
    expect(sp.start).toBeCloseTo((1000 / 3000) * 100, 6);
    expect(sum(sp)).toBeCloseTo(100, 6);
  });

  it('valeurs nulles ou invalides : aucune largeur', () => {
    const row = compoundRow(NaN, NaN, NaN);
    expect(compoundScale([row])).toBe(0);
    expect(sum(compoundSplit(row, 0))).toBe(0);
  });
});
