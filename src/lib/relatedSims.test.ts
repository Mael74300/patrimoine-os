import { describe, expect, it } from 'vitest';
import { guideBySlug } from '../data/guides';
import { investmentBySlug } from '../data/investments';
import { readingForSimulator, simsForGuide, simsForInvestment } from './relatedSims';
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

describe('pistes de lecture en bas des simulateurs', () => {
  it('chaque simulateur propose au moins une piste, sans doublon, vers des pages existantes', () => {
    for (const s of simSlugs) {
      const links = readingForSimulator(s);
      expect(links.length, s).toBeGreaterThan(0);
      expect(links.length).toBeLessThanOrEqual(4);
      expect(new Set(links.map((l) => l.to)).size).toBe(links.length);
      for (const l of links) expect(l.to).toMatch(/^\/(guides|encyclopedie)\/[a-z0-9-]+$/);
    }
  });
  it('un simulateur inconnu ne produit aucune piste', () => {
    expect(readingForSimulator('inconnu')).toEqual([]);
  });
});
