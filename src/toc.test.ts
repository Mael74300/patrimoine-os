import { describe, expect, it } from 'vitest';
import { activeSection, sectionId } from './lib/toc';
import { investments } from './data/investments';

describe('Sommaire : rubrique en cours', () => {
  it('rien avant la première rubrique', () => {
    expect(activeSection([300, 900, 1500], 120)).toBe(-1);
  });
  it('la dernière rubrique passée sous la ligne de lecture', () => {
    expect(activeSection([-400, 100, 700], 120)).toBe(1);
    expect(activeSection([-900, -300, 120], 120)).toBe(2);
  });
  it('en bas de page, la dernière rubrique visible l’emporte', () => {
    expect(activeSection([-900, -300, 400, 650], 120, true, 800)).toBe(3);
    expect(activeSection([-900, -300, 400, 950], 120, true, 800)).toBe(2);
    expect(activeSection([-900, -300, 400, 650], 120, false, 800)).toBe(1);
  });
});

describe('Sommaire des fiches', () => {
  const fixed = ['rub-definition', 'rub-fonctionnement', 'rub-en-pratique', 'rub-avantages-et-inconvenients', 'rub-exemple-chiffre', 'rub-pour-aller-plus-loin', 'rub-sources-et-verification'];
  it('l’ancre de « Comment investir » ne recoupe aucune autre rubrique', () => {
    for (const inv of investments) {
      const id = sectionId(inv.howToTitle ?? 'Comment investir');
      expect(fixed, inv.slug).not.toContain(id);
      expect(id.length).toBeGreaterThan(4);
    }
  });
});
