import { describe, expect, it } from 'vitest';
import { DISCLAIMER_TEXT } from './components/ui';

const sources = import.meta.glob('./pages/Sim*.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const simPages = Object.keys(sources).filter((f) => !/Sim(Moved|ulators)\.tsx$/.test(f));

describe('Avertissement du bas des simulateurs', () => {
  it('chaque simulateur affiche l’avertissement', () => {
    expect(simPages.length).toBeGreaterThanOrEqual(21);
    for (const f of simPages) {
      const src = sources[f];
      expect(src, f).toMatch(/<Disclaimer( kind=("\w+"|\{[^}]+\}))? \/>/);
    }
  });

  it('ne parle de rendements que là où la page en calcule', () => {
    for (const f of simPages) {
      const src = sources[f];
      const usesDefault = /<Disclaimer \/>/.test(src);
      const mentionsReturn = /rendement/i.test(src.replace(/import[^;]+;/g, ''));
      if (usesDefault) expect(mentionsReturn, `${f} n’a aucun rendement : choisir un autre kind`).toBe(true);
    }
  });

  it('Comparer des crédits : avertissement « crédit » sauf sur l’onglet In fine, qui place une épargne', () => {
    const src = sources['./pages/SimComparerCredits.tsx'];
    expect(src).toMatch(/<Disclaimer kind=\{tab === 'infine' \? 'rendement' : 'credit'\} \/>/);
  });

  it('garde la mention « pas de conseil personnalisé » et des phrases courtes', () => {
    for (const t of Object.values(DISCLAIMER_TEXT)) {
      expect(t.split(/\s+/).length).toBeLessThanOrEqual(22);
      expect(t).not.toMatch(/conseil/);
    }
  });
});
