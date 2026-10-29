import { describe, expect, it } from 'vitest';
import { diversificationRows, inflationBars, leverageBars, loanSlices, snowballGroups } from './illustrationData';

describe('schéma intérêts simples ou composés', () => {
  it('retrouve les chiffres du guide (10 000 € à 5 %)', () => {
    const [d10, d20] = snowballGroups();
    expect(Math.round(d10.compound.total)).toBe(16289);
    expect(Math.round(d20.compound.total)).toBe(26533);
    expect(Math.round(d10.simple.total)).toBe(15000);
    expect(Math.round(d20.simple.total)).toBe(20000);
    expect(Math.round(d20.compound.interest)).toBe(16533);
  });
});

describe('schéma « que contient une mensualité »', () => {
  it('retrouve les chiffres du guide (180 000 € à 3,5 % sur 20 ans)', () => {
    const { monthly, slices } = loanSlices();
    expect(Math.round(monthly)).toBe(1044);
    expect(Math.round(slices[0].interest)).toBe(6199); // « environ 6 200 € » dans le guide
    expect(Math.round(slices[0].principal)).toBe(6328);
    expect(Math.round(slices[1].interest)).toBe(3860);
    expect(Math.round(slices[2].interest)).toBe(234);
  });
  it('garde un total annuel constant : seule la répartition change', () => {
    const { monthly, slices } = loanSlices();
    for (const s of slices) expect(s.total).toBeCloseTo(monthly * 12, 6);
    expect(slices[0].interest).toBeGreaterThan(slices[1].interest);
    expect(slices[1].interest).toBeGreaterThan(slices[2].interest);
  });
});

describe('schéma inflation', () => {
  it('retrouve les chiffres du guide (10 000 €, 2 % d’inflation, 3 % de rendement, 10 ans)', () => {
    const [idle, placed] = inflationBars();
    expect(Math.round(idle.shown)).toBe(10000);
    expect(Math.round(idle.real)).toBe(8203);
    expect(Math.round(placed.shown)).toBe(13439);
    expect(Math.round(placed.real)).toBe(11025);
  });
});

describe('schéma diversification', () => {
  it('retrouve les chiffres du guide : −20 % en 100 % actions, −13,4 % avec 70 % d’actions et 30 % de placement prudent', () => {
    const [all, mix] = diversificationRows();
    expect(all.result).toBeCloseTo(-0.2, 10);
    expect(all.safe).toBe(0);
    expect(mix.stocks).toBeCloseTo(0.7, 10);
    expect(mix.safe).toBeCloseTo(0.3, 10);
    expect(mix.result).toBeCloseTo(-0.134, 10);
  });
});

describe('schéma « effet de levier »', () => {
  it('retrouve les chiffres du guide (200 000 € dont 20 000 € d’apport, loyers nets de 5 % ou 3 %)', () => {
    const { interest, down, bars } = leverageBars();
    expect(Math.round(interest)).toBe(6199); // « environ 6 200 € »
    expect(bars[0].income).toBe(10000);
    expect(Math.round(bars[0].left)).toBe(3801); // « environ 3 800 € »
    expect(Math.round((bars[0].left / down) * 100)).toBe(19); // « près de 19 % de l’apport »
    expect(bars[1].income).toBe(6000);
    expect(Math.round(bars[1].shortfall)).toBe(199); // « environ 200 € »
    expect(bars[1].left).toBe(0);
  });
});
