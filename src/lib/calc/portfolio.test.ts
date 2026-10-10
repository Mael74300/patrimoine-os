import { describe, expect, it } from 'vitest';
import { netWorth } from './networth';
import { rebalance, summarizePortfolio } from './portfolio';
import { fmtEur } from './format';

const lines = [
  { id: 'a', label: 'ETF', amount: 6000, expectedReturn: 0.06, fees: 0.002, risk: 4 },
  { id: 'b', label: 'Fonds euros', amount: 3000, expectedReturn: 0.025, fees: 0.006, risk: 1 },
  { id: 'c', label: 'Livret', amount: 1000, expectedReturn: 0.017, fees: 0, risk: 1 },
];

describe('portefeuille', () => {
  it('pondérations et moyennes', () => {
    const s = summarizePortfolio(lines);
    expect(s.weights.map((w) => w.weight)).toEqual([0.6, 0.3, 0.1]);
    expect(s.weightedRisk).toBeCloseTo(2.8, 12);
    expect(s.annualFeesEuro).toBeCloseTo(30, 8);
  });
  it('portefeuille vide ou montants négatifs', () => {
    expect(summarizePortfolio([]).total).toBe(0);
    expect(summarizePortfolio([{ ...lines[0], amount: -10 }]).total).toBe(0);
  });
  it('rééquilibrage', () => {
    const d = rebalance(lines, { a: 0.5, b: 0.3, c: 0.2 });
    expect(d.a).toBeCloseTo(-1000, 8);
    expect(d.c).toBeCloseTo(1000, 8);
  });
});

describe('patrimoine net et formatage', () => {
  it('actifs − dettes', () => {
    const r = netWorth([
      { id: '1', label: 'Logement', amount: 250000, kind: 'actif' },
      { id: '2', label: 'Crédit', amount: 180000, kind: 'dette' },
    ]);
    expect(r.net).toBe(70000);
    expect(r.debtRatio).toBeCloseTo(0.72, 10);
  });
  it('pas de « −0 € » ni de NaN affiché', () => {
    expect(fmtEur(-0.2)).toBe(fmtEur(0));
    expect(fmtEur(NaN)).toBe('—');
  });
});
