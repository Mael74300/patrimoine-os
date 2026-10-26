import { describe, expect, it } from 'vitest';
import { glossary } from './glossary';
import { guides } from './guides';
import { investments } from './investments';
import { simulators } from '../lib/search';

const routes = new Set([
  ...guides.map((g) => `/guides/${g.slug}`),
  ...investments.map((i) => `/encyclopedie/${i.slug}`),
  ...simulators.map((s) => `/simulateurs/${s.slug}`),
]);

describe('glossaire', () => {
  it('termes uniques, définitions renseignées, au moins un lien par terme', () => {
    expect(new Set(glossary.map((t) => t.term)).size).toBe(glossary.length);
    for (const t of glossary) {
      expect(t.definition.length).toBeGreaterThan(40);
      expect(t.links.length).toBeGreaterThan(0);
    }
  });
  it('tous les liens internes pointent vers une page existante', () => {
    for (const t of glossary) for (const l of t.links) expect(routes.has(l.to), `${t.term} → ${l.to}`).toBe(true);
  });
});
