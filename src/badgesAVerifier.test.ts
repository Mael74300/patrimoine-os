import { describe, expect, it } from 'vitest';
import { investmentBySlug, investments } from './data/investments';
import { needsCheck } from './data/types';

const simImmobilier = import.meta.glob<string>('./pages/SimImmobilier.tsx', { query: '?raw', import: 'default', eager: true })['./pages/SimImmobilier.tsx']!;

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

  it('les frais de la location nue et de la location meublée revus le 2026-11-12 sont sourcés', () => {
    const cases: [string, string[], string][] = [
      ['location-nue', ['6 % à 8 %', '2 % à 3,5 %'], 'les-frais-a-supporter-lors-de-lacquisition'],
    ];
    for (const [slug, values, source] of cases) {
      const f = investmentBySlug[slug]!;
      expect(f.fees.verified, slug).toBe(true);
      expect(f.fees.asOf, slug).toBe('12 novembre 2026');
      for (const v of values) {
        expect(plain(f.fees.text), `${slug} : ${v}`).toContain(v);
        expect(plain(f.review.data.join(' ')), `${slug} (suivi) : ${v}`).toContain(v);
      }
      expect(f.sources.some((s) => s.url.includes(source)), `${slug} : source ${source}`).toBe(true);
    }
    // Fiche LMNP (2026-11-13) : la durée du bail n’est pas un frais, elle passe dans les inconvénients.
    const lmnp = investmentBySlug['lmnp']!;
    expect(lmnp.fees.verified).toBe(true);
    expect(lmnp.fees.asOf).toBe('13 novembre 2026');
    expect(plain(lmnp.fees.text)).not.toMatch(/bail/i);
    const bail = plain(lmnp.cons.join(' '));
    for (const v of ['1 an', '9 mois', '3 ans']) {
      expect(bail, `lmnp : ${v}`).toContain(v);
      expect(plain(lmnp.review.data.join(' ')), `lmnp (suivi) : ${v}`).toContain(v);
    }
    expect(lmnp.sources.some((s) => s.url.includes('F1165'))).toBe(true);
    for (const slug of ['location-nue', 'lmnp', 'credit-immobilier', 'private-equity', 'per']) {
      expect(investmentBySlug[slug]!.minCapital.advice, `${slug} : capital en conseil`).toBe(true);
    }
  });

  it('le simulateur immobilier cite la même fourchette de frais d’acquisition que la fiche Location nue', () => {
    const sim = plain(simImmobilier);
    expect(sim).toContain('6 à 8 % du prix dans l’ancien, 2 à 3,5 % dans le neuf');
    expect(sim).not.toContain('7 à 8 %');
  });

  it('les frais des actifs alternatifs revus le 2026-11-12 (étape 3) sont sourcés', () => {
    const cases: [string, string[], string][] = [
      ['private-equity', ['3,5 %', '3,2 %', '2,4 % à 2,5 %'], 'publication_performance_fonds_actifs_non_cotes'],
      ['or', ['0,165 % à 0,85 %'], 'acheter-de-l-or'],
      ['objets-d-art-collection', ['20 %'], 'collectionner-des-oeuvres-d-art'],
      ['groupements-forestiers', ['cinq commissions', 'note d’information'], '422-249-2'],
      ['cryptomonnaies', ['transparen'], 'quel-professionnel-choisir'],
    ];
    for (const [slug, values, source] of cases) {
      const f = investmentBySlug[slug]!;
      expect(f.fees.verified, slug).toBe(true);
      expect(f.fees.asOf, slug).toBe('12 novembre 2026');
      for (const v of values) {
        expect(plain(f.fees.text), `${slug} : ${v}`).toContain(v);
        expect(plain(f.review.data.join(' ')), `${slug} (suivi) : ${v}`).toContain(v);
      }
      expect(f.sources.some((s) => s.url.includes(source)), `${slug} : source ${source}`).toBe(true);
    }
    for (const slug of ['or', 'objets-d-art-collection', 'groupements-forestiers', 'crowdfunding']) {
      expect(investmentBySlug[slug]!.minCapital.advice, `${slug} : capital en conseil`).toBe(true);
    }
  });

  it('le nombre de rubriques à vérifier ne remonte pas (31 avant le 2026-11-10, 24 puis 17 avant les deux passes du 2026-11-12)', () => {
    const flagged = investments.flatMap((i) => [i.minCapital, i.fees, i.tax]).filter(needsCheck);
    expect(flagged.length).toBeLessThanOrEqual(8);
  });
});
