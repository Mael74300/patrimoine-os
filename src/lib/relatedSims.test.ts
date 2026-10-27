import { describe, expect, it } from 'vitest';
import { guideBySlug } from '../data/guides';
import { investmentBySlug } from '../data/investments';
import { simsForGuide, simsForInvestment } from './relatedSims';
import { simulators } from './search';

const simSlugs = new Set(simulators.map((s) => s.slug));

describe('liens fiches / guides vers simulateurs', () => {
  it('les clés désignent des fiches et des guides existants', () => {
    for (const k of Object.keys(simsForInvestment)) expect(investmentBySlug[k], k).toBeDefined();
    for (const k of Object.keys(simsForGuide)) expect(guideBySlug[k], k).toBeDefined();
  });
  it('les simulateurs cités existent, sans doublon', () => {
    for (const list of [...Object.values(simsForInvestment), ...Object.values(simsForGuide)]) {
      for (const s of list) expect(simSlugs.has(s), s).toBe(true);
      expect(new Set(list).size).toBe(list.length);
    }
  });
  it('chaque guide et chaque simulateur reçoit au moins un lien entrant', () => {
    for (const slug of Object.keys(guideBySlug)) expect(simsForGuide[slug]?.length, slug).toBeGreaterThan(0);
    const used = new Set([...Object.values(simsForInvestment), ...Object.values(simsForGuide)].flat());
    for (const s of simSlugs) expect(used.has(s), s).toBe(true);
  });
});
