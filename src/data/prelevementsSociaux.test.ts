import { describe, expect, it } from 'vitest';
import { investmentBySlug } from './investments';
import { PFU_IR_PCT, PFU_PS_PCT, PFU_TOTAL_PCT } from '../lib/calc/pfu';
import { splitSentences } from '../components/ui';
import { sentenceLead } from '../lib/sentenceLead';

/**
 * Hausse des prélèvements sociaux dite en clair (chantier 48). Service-Public F2329 (consulté le
 * 12 novembre 2026) : 17,2 % sur les revenus de placements de 2025, 18,6 % sur ceux de 2026 (cas
 * général) ; assurance-vie, PEL et CEL restent à 17,2 % en 2026. Service-Public F21618 : PFU 31,4 %
 * (12,8 % + 18,6 %), loi de financement de la Sécurité sociale pour 2026 citée en référence.
 * Frais du compte-titres : AMF, « Le compte-titres ordinaire, un support pour investir en bourse ».
 */
const norm = (t: string) => t.replace(/[  ]/g, ' ');
const pct = (n: number) => `${n.toLocaleString('fr-FR')} %`;

describe('prélèvements sociaux : hausse de 2026 expliquée', () => {
  it('les fiches au PFU disent ce qui a changé, avec le même taux que le calcul', () => {
    for (const slug of ['compte-titres', 'compte-a-terme', 'obligations', 'crowdfunding']) {
      const f = investmentBySlug[slug]!;
      const t = norm(f.tax.text);
      expect(t, slug).not.toContain('Hausse issue de');
      expect(t, slug).toContain(`passent de 17,2 % à ${pct(PFU_PS_PCT)} sur les revenus de 2026`);
      expect(f.sources.some((s) => s.url.endsWith('/F2329')), slug).toBe(true);
    }
  });

  it('fiches au PFU : fiscalité en trois points à amorce (défaut, option, changement de 2026), mêmes taux que le calcul', () => {
    for (const slug of ['compte-titres', 'compte-a-terme', 'obligations', 'crowdfunding']) {
      const parts = splitSentences(investmentBySlug[slug]!.tax.text).map(norm);
      const leads = parts.slice(0, 3).map((p) => sentenceLead(p)?.lead);
      expect(leads, slug).toEqual([slug === 'obligations' ? 'En compte-titres' : 'Par défaut', 'Sur option', 'Ce qui change en 2026']);
      expect(parts[0], slug).toContain(`prélèvement forfaitaire unique de ${pct(PFU_TOTAL_PCT)} sur les revenus de 2026 (${pct(PFU_IR_PCT)} d'impôt sur le revenu et ${pct(PFU_PS_PCT)} de prélèvements sociaux)`);
      expect(parts[1], slug).toContain(`à la place des ${pct(PFU_IR_PCT)} (option globale) ; les prélèvements sociaux restent dus`);
    }
  });

  it('assurance-vie : taux maintenu affirmé sans réserve vague, source citée', () => {
    const f = investmentBySlug['assurance-vie']!;
    const t = norm(f.tax.text);
    expect(t).not.toContain('selon les sources consultées');
    expect(t).toContain(`17,2 % sur les gains, taux inchangé en 2026 (la hausse à ${pct(PFU_PS_PCT)} ne concerne pas`);
    expect(f.sources.some((s) => s.url.endsWith('/F2329'))).toBe(true);
  });

  it('compte-titres : frais en points courts, chacun introduit par un repère', () => {
    const parts = splitSentences(investmentBySlug['compte-titres']!.fees.text);
    expect(parts.length).toBe(5);
    for (const p of parts.slice(1)) expect(sentenceLead(p), p).not.toBeNull();
    for (const k of ['courtage', 'tenue de compte', 'droits de garde', 'transfert', 'clôture']) {
      expect(parts.join(' ')).toContain(k);
    }
  });
});
