import { describe, it, expect } from 'vitest';
import { investmentBySlug } from './data/investments';
import { guides } from './data/guides';

/**
 * Exonération temporaire des dons d'argent pour un logement neuf ou une rénovation énergétique,
 * reprise de Service-Public F36656 (page vérifiée le 1er janvier 2026, consultée le 2026-11-22) :
 * sommes versées du 15 février 2025 au 31 décembre 2026, 100 000 € par donateur et par bénéficiaire,
 * 300 000 € par bénéficiaire, argent utilisé avant la fin du 6e mois, résidence principale pendant 5 ans.
 * Le même dispositif est cité par la fiche Donation et par le guide PTZ : mêmes chiffres partout.
 */
const norm = (s: string) => s.replace(/[  ]/g, ' ');

describe('don d’argent pour un logement neuf', () => {
  const fiche = norm(investmentBySlug['donation']!.tax.text);
  const ptz = guides.find((g) => g.slug === 'pret-a-taux-zero-ptz')!;
  const faq = norm(ptz.faq?.find((f) => /parent peut-il/.test(f.q))?.a ?? '');

  it('la fiche Donation et le guide PTZ citent les mêmes limites', () => {
    for (const t of [fiche, faq]) {
      expect(t).toContain('31 décembre 2026');
      expect(t).toContain('100 000 € par donateur');
      expect(t).toContain('300 000 € par bénéficiaire');
      expect(t).toContain('6e mois');
      expect(t).toContain('5 ans');
    }
  });

  it('cite sa source et oblige à revoir la fiche dès la fin du dispositif', () => {
    expect(ptz.sources.some((s) => s.url.endsWith('/F36656'))).toBe(true);
    const r = investmentBySlug['donation']!.review;
    expect(r.nextReview <= '2027-01-02').toBe(true);
    expect(r.data.join(' ')).toContain('31 décembre 2026');
  });
});
