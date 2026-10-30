import { describe, expect, it } from 'vitest';
import { search, searchSuggestions } from './lib/search';
import { guides } from './data/guides';
import { investments } from './data/investments';
import { simulators } from './lib/search';

describe('recherche', () => {
  it('trouve un mot au pluriel', () => {
    expect(search('livrets').length).toBeGreaterThan(0);
    expect(search('simulateurs de crédits').length).toBeGreaterThan(0);
  });
  it('les suggestions pointent vers des pages existantes', () => {
    const ok = new Set([
      ...guides.map((g) => `/guides/${g.slug}`),
      ...investments.map((i) => `/encyclopedie/${i.slug}`),
      ...simulators.map((s) => `/simulateurs/${s.slug}`),
    ]);
    for (const s of searchSuggestions) expect(ok.has(s.to), s.to).toBe(true);
  });
});
