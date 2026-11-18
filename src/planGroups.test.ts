import { describe, expect, it } from 'vitest';
import { guides } from './data/guides';
import { simulators } from './lib/search';
import { guidePlanGroups, simulatorGroups } from './lib/planGroups';

describe('Plan du site : simulateurs et guides rangés par thème', () => {
  it('chaque simulateur apparaît une seule fois, sous un thème', () => {
    const liens = simulatorGroups().flatMap((g) => g.links.map((l) => l.to));
    expect([...liens].sort()).toEqual(simulators.map((s) => `/simulateurs/${s.slug}`).sort());
    expect(simulatorGroups().every((g) => g.links.length > 0)).toBe(true);
  });
  it('chaque guide apparaît une seule fois, sous son groupe', () => {
    const liens = guidePlanGroups().flatMap((g) => g.links.map((l) => l.to));
    expect([...liens].sort()).toEqual(guides.map((g) => `/guides/${g.slug}`).sort());
    expect(guidePlanGroups()[0].title).toBe('Pour démarrer');
  });
});
