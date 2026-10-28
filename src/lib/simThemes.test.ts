import { describe, expect, it } from 'vitest';
import { simulators } from './search';
import { featuredSims, simBySlug, simThemes, unthemedSims } from './simThemes';

describe('classement des simulateurs par thème', () => {
  it('chaque simulateur appartient à exactement un thème', () => {
    const all = simThemes.flatMap((t) => t.slugs);
    expect(new Set(all).size).toBe(all.length);
    expect(unthemedSims().map((s) => s.slug)).toEqual([]);
    expect(all.length).toBe(simulators.length);
  });
  it('les thèmes et la sélection ne citent que des simulateurs existants', () => {
    for (const slug of [...simThemes.flatMap((t) => t.slugs), ...featuredSims]) expect(simBySlug(slug), slug).toBeDefined();
  });
});
