import { describe, expect, it } from 'vitest';
import { investmentBySlug, investments } from './data/investments';
import { needsCheck } from './data/types';

const plain = (t: string) => t.replace(/[  ]/g, ' ');

describe('badges « à vérifier » des fiches (chantier 12)', () => {
  it('un conseil pratique n’affirme ni chiffre ni règle et n’est jamais présenté comme vérifié', () => {
    const advice = investments.flatMap((i) => [i.minCapital, i.fees, i.tax]).filter((c) => c.advice);
    expect(advice.length).toBeGreaterThanOrEqual(2);
    for (const c of advice) {
      expect(c.verified).toBe(false);
      expect(needsCheck(c)).toBe(false);
      expect(c.text).not.toMatch(/\d|%|€/);
    }
  });

  it('les rubriques revues le 2026-11-10 sont sourcées et reprises dans le suivi de vérification', () => {
    const cases: [string, string[], string][] = [
      ['etf-monde', ['0,33 %', 'courtage'], 'frais-dun-portefeuille-boursier'],
      ['actions-individuelles', ['0,4 %', '1 milliard', '1er avril 2025'], 'BOI-TCA-FIN'],
      ['obligations', ['0,81 %'], 'loe-65'],
      ['foncieres-cotees', ['courtage'], 'frais-dun-portefeuille-boursier'],
      ['compte-a-terme', ['pénalité sur les intérêts'], 'comptes-a-terme'],
    ];
    for (const [slug, values, source] of cases) {
      const f = investmentBySlug[slug]!;
      expect(f.fees.verified, slug).toBe(true);
      expect(f.review.verifiedOn, slug).toBe('2026-11-10');
      for (const v of values) {
        expect(plain(f.fees.text), `${slug} : ${v}`).toContain(v);
        expect(plain(f.review.data.join(' ')), `${slug} (suivi) : ${v}`).toContain(v);
      }
      expect(f.sources.some((s) => s.url.includes(source)), `${slug} : source ${source}`).toBe(true);
    }
  });

  it('le nombre de rubriques à vérifier ne remonte pas (31 avant le 2026-11-10)', () => {
    const flagged = investments.flatMap((i) => [i.minCapital, i.fees, i.tax]).filter(needsCheck);
    expect(flagged.length).toBeLessThanOrEqual(24);
  });
});
