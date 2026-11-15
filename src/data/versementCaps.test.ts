import { describe, expect, it } from 'vitest';
import { investmentBySlug } from './investments';
import { LIVRETS } from './livrets';
import { DURATION_LIMITS, REGULATED_RATES, VERSEMENT_CAPS } from './versementCaps';
import { PEL_LIVRET_AGE, PEL_PHASES } from '../components/schemas/fiches';
import { fmtEur } from '../lib/finance';
import { durationExceeded, monthCapExceeded } from '../lib/calc/compareSummary';

const plain = (s: string) => s.replace(/[  ]/g, ' ');

describe('plafonds de versements du comparateur', () => {
  it('chaque plafond est celui écrit dans la fiche du placement (même chiffre partout)', () => {
    expect(VERSEMENT_CAPS['livret-a'].cap).toBe(22950 + 12000);
    const fiche = (slug: string) => plain(investmentBySlug[slug].tax.text);
    expect(fiche('livret-a')).toContain('22 950 €');
    expect(fiche('livret-a')).toContain('12 000 €');
    expect(plain(VERSEMENT_CAPS['livret-a'].detail ?? '')).toBe('22 950 € sur le Livret A et 12 000 € sur le LDDS');
    for (const slug of ['lep', 'pel', 'pea']) expect(fiche(slug), slug).toContain(plain(fmtEur(VERSEMENT_CAPS[slug].cap)));
  });

  it('les taux pré-remplis des livrets et du PEL sont ceux en vigueur, cités par leurs fiches', () => {
    expect(REGULATED_RATES['livret-a']).toBe(LIVRETS.find((l) => l.id === 'livretA')!.rate);
    expect(REGULATED_RATES.lep).toBe(LIVRETS.find((l) => l.id === 'lep')!.rate);
    expect(REGULATED_RATES.pel).toBe(0.02);
    for (const slug of ['livret-a', 'lep', 'pel']) {
      const pct = `${(REGULATED_RATES[slug] * 100).toFixed(2).replace('.', ',')} %`;
      expect(plain(investmentBySlug[slug].tax.text), slug).toContain(pct);
    }
  });
});

describe('mois où les versements dépassent un plafond (exemples fictifs)', () => {
  it('10 000 € puis 200 € par mois, plafond de 34 950 € : dépassé au 125e mois (35 000 €)', () => {
    expect(monthCapExceeded(10000, 200, 15, 34950)).toBe(125);
    expect(10000 + 200 * 124).toBeLessThanOrEqual(34950);
    expect(10000 + 200 * 125).toBeGreaterThan(34950);
  });
  it('pas de dépassement sur une durée trop courte, ni sans versement mensuel', () => {
    expect(monthCapExceeded(10000, 200, 10, 34950)).toBeNull();
    expect(monthCapExceeded(10000, 0, 30, 34950)).toBeNull();
  });
  it('atteindre le plafond pile ne le dépasse pas ; un capital initial trop élevé le dépasse dès le départ', () => {
    expect(monthCapExceeded(0, 1000, 1, 10000)).toBe(11);
    expect(monthCapExceeded(10000, 100, 1, 10000)).toBe(1);
    expect(monthCapExceeded(12000, 100, 5, 10000)).toBe(0);
  });
});

describe('durée légale du PEL dans le comparateur', () => {
  it('mêmes bornes que la frise de la fiche PEL et que le texte de la fiche', () => {
    const d = DURATION_LIMITS.pel;
    expect(d.depositYears).toBe(10);
    expect(d.contractYears).toBe(15);
    expect(PEL_PHASES.find((p) => p.label === 'Sans versement')).toMatchObject({ from: d.depositYears, to: d.contractYears });
    expect(PEL_LIVRET_AGE).toBe(d.contractYears);
    expect(plain(investmentBySlug.pel.tax.text)).toContain(`${d.depositYears} ans maximum`);
  });
  it('15 ans avec 200 € par mois : versements impossibles après 10 ans, taux du contrat encore garanti', () => {
    expect(durationExceeded(200, 15, DURATION_LIMITS.pel)).toEqual({ deposits: true, contract: false });
  });
  it('sans versement mensuel, seule la sortie du taux du contrat après 15 ans est signalée', () => {
    expect(durationExceeded(0, 20, DURATION_LIMITS.pel)).toEqual({ deposits: false, contract: true });
    expect(durationExceeded(0, 15, DURATION_LIMITS.pel)).toEqual({ deposits: false, contract: false });
    expect(durationExceeded(200, 10, DURATION_LIMITS.pel)).toEqual({ deposits: false, contract: false });
  });
});
