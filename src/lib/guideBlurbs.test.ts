import { describe, expect, it } from 'vitest';
import { guides } from '../data/guides';
import { guideBlurbs } from './guideBlurbs';

describe('accroches des guides', () => {
  it('chaque guide a une accroche courte, sans chiffre', () => {
    expect(Object.keys(guideBlurbs).sort()).toEqual(guides.map((g) => g.slug).sort());
    for (const [slug, b] of Object.entries(guideBlurbs)) {
      expect(b.length, slug).toBeLessThanOrEqual(70);
      expect(/\d/.test(b), slug).toBe(false);
    }
  });
});
