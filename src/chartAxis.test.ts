import { describe, expect, it } from 'vitest';
import { compact } from './components/ui';

describe('graduations des graphiques', () => {
  it('garde un vrai signe moins devant les valeurs négatives', () => {
    expect(compact(-200000)).toBe('−200 k€'.replace(' ', ' '));
    expect(compact(-1500000)).toContain('−');
    expect(compact(-500)).toMatch(/^−500/);
  });
  it('n’ajoute aucun signe aux valeurs positives ou nulles', () => {
    expect(compact(0)).toBe('0 €');
    expect(compact(200000)).toBe('200 k€');
    expect(compact(2500000)).toBe('2,5 M€');
  });
});
