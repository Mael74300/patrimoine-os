import { describe, expect, it } from 'vitest';
import { coveragePercent, coverageRatio } from './coverage';

describe('couverture de l’épargne de précaution', () => {
  it('calcule la part couverte (exemple fictif : 2 500 € sur 7 000 €)', () => {
    expect(coverageRatio(2500, 7000)).toBeCloseTo(0.3571, 4);
    expect(coveragePercent(2500, 7000)).toBe(35);
  });
  it('plafonne à 100 % et gère les cas limites', () => {
    expect(coverageRatio(9000, 7000)).toBe(1);
    expect(coverageRatio(0, 7000)).toBe(0);
    expect(coverageRatio(100, 0)).toBe(0);
    expect(coverageRatio(-5, 100)).toBe(0);
  });
  it('n’affiche pas 100 % tant qu’il manque un euro', () => {
    expect(coveragePercent(6999, 7000)).toBe(99);
    expect(coveragePercent(7000, 7000)).toBe(100);
  });
});
