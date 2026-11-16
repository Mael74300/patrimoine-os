import { describe, it, expect } from 'vitest';
import { detailDroitsLigneDirecte, droitsDonationLigneDirecte } from './donation';

describe('droits de donation en ligne directe', () => {
  it('reproduit l’exemple de Service-Public : 18 194 € sur 100 000 € taxables', () => {
    expect(droitsDonationLigneDirecte(100_000)).toBe(18_194);
  });
  it('rien à payer sous l’abattement, 5 % sur la première tranche', () => {
    expect(droitsDonationLigneDirecte(0)).toBe(0);
    expect(droitsDonationLigneDirecte(-5)).toBe(0);
    expect(droitsDonationLigneDirecte(8_072)).toBe(404);
  });
  it('détaille les tranches comme Service-Public (403,60 €, 403,70 €, 573,45 €, 16 813,60 €)', () => {
    const d = detailDroitsLigneDirecte(100_000);
    expect(d.map((t) => [t.base, t.taux, t.droits])).toEqual([
      [8_072, 0.05, 403.6],
      [4_037, 0.1, 403.7],
      [3_823, 0.15, 573.45],
      [84_068, 0.2, 16_813.6],
    ]);
    expect(Math.round(d.reduce((s, t) => s + t.droits, 0))).toBe(droitsDonationLigneDirecte(100_000));
    expect(detailDroitsLigneDirecte(0)).toEqual([]);
  });
});
