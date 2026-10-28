import { describe, expect, it } from 'vitest';
import { snowballGroups } from './illustrationData';

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
