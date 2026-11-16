import { describe, expect, it } from 'vitest';
import { interleave, splitNext } from './nextLinks';

describe('splitNext', () => {
  it('montre deux simulateurs et deux fiches quand les deux abondent', () => {
    expect(splitNext(['s1', 's2', 's3', 's4'], ['f1', 'f2', 'f3'])).toEqual([['s1', 's2', 'f1', 'f2'], ['s3', 's4', 'f3']]);
  });
  it('complète avec l’autre type quand l’un manque', () => {
    expect(splitNext(['s1'], ['f1', 'f2', 'f3', 'f4'])).toEqual([['s1', 'f1', 'f2', 'f3'], ['f4']]);
    expect(splitNext(['s1', 's2', 's3', 's4', 's5'], ['f1'])).toEqual([['s1', 's2', 's3', 'f1'], ['s4', 's5']]);
  });
  it('ne replie rien sous le seuil et garde tous les éléments', () => {
    expect(splitNext(['s1', 's2'], ['f1'])).toEqual([['s1', 's2', 'f1'], []]);
    expect(splitNext([], [])).toEqual([[], []]);
  });
});

describe('interleave', () => {
  it('alterne les deux listes, la plus longue termine seule', () => {
    expect(interleave(['s1', 's2', 's3'], ['g1'])).toEqual(['s1', 'g1', 's2', 's3']);
    expect(interleave([], ['g1', 'g2'])).toEqual(['g1', 'g2']);
    expect(interleave(['s1'], [])).toEqual(['s1']);
  });
});
