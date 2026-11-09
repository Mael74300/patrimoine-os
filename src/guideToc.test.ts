import { describe, expect, it } from 'vitest';
import { guides } from './data/guides';
import { sectionId } from './pages/Guides';

describe('Sommaire des guides', () => {
  it('chaque rubrique a une ancre non vide et unique dans son guide', () => {
    for (const g of guides) {
      const ids = g.sections.map((s) => sectionId(s.heading));
      for (const id of ids) expect(id.length).toBeGreaterThan(4);
      expect(new Set(ids).size, g.slug).toBe(ids.length);
    }
  });
  it('retire les accents et la ponctuation', () => {
    expect(sectionId('Où placer cette réserve ?')).toBe('rub-ou-placer-cette-reserve');
  });
});
