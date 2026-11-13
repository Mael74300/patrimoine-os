import { describe, it, expect } from 'vitest';
import { droitsDonationLigneDirecte } from './donation';

describe('droits de donation en ligne directe', () => {
  it('reproduit l’exemple de Service-Public : 18 194 € sur 100 000 € taxables', () => {
    expect(droitsDonationLigneDirecte(100_000)).toBe(18_194);
  });
  it('rien à payer sous l’abattement, 5 % sur la première tranche', () => {
    expect(droitsDonationLigneDirecte(0)).toBe(0);
    expect(droitsDonationLigneDirecte(-5)).toBe(0);
    expect(droitsDonationLigneDirecte(8_072)).toBe(404);
  });
});
