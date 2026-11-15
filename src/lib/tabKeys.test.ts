import { describe, expect, it } from 'vitest';
// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync } from 'node:fs';
import { nextTabIndex } from './tabKeys';

describe('navigation au clavier dans les onglets', () => {
  it('passe à l’onglet suivant ou précédent, en boucle', () => {
    expect(nextTabIndex('ArrowRight', 0, 8)).toBe(1);
    expect(nextTabIndex('ArrowDown', 7, 8)).toBe(0);
    expect(nextTabIndex('ArrowLeft', 0, 8)).toBe(7);
    expect(nextTabIndex('ArrowUp', 3, 8)).toBe(2);
  });
  it('va au premier ou au dernier onglet', () => {
    expect(nextTabIndex('Home', 5, 8)).toBe(0);
    expect(nextTabIndex('End', 1, 4)).toBe(3);
  });
  it('ignore les autres touches', () => {
    expect(nextTabIndex('Enter', 2, 8)).toBeNull();
    expect(nextTabIndex('a', 2, 8)).toBeNull();
    expect(nextTabIndex('ArrowRight', 0, 0)).toBeNull();
  });
  it('les pages n’écrivent plus leurs onglets à la main (toutes passent par le composant commun, navigable au clavier)', () => {
    for (const f of ['SimInteretsComposes', 'SimComparerCredits', 'SimEntreprise', 'SimPatrimoine']) {
      const src = readFileSync(`src/pages/${f}.tsx`, 'utf8');
      expect(src, f).not.toContain('role="tab"');
      expect(src, f).toContain('<Tabs');
    }
  });
});
