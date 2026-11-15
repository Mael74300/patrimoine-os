import { describe, expect, it } from 'vitest';
import { investmentBySlug } from './investments';
import { LIVRETS } from './livrets';
import { REGULATED_RATES, VERSEMENT_CAPS } from './versementCaps';
import { fmtEur } from '../lib/finance';
import { monthCapExceeded } from '../lib/calc/compareSummary';

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

  it('les taux pré-remplis des livrets sont ceux des livrets réglementés en vigueur', () => {
    expect(REGULATED_RATES['livret-a']).toBe(LIVRETS.find((l) => l.id === 'livretA')!.rate);
    expect(REGULATED_RATES.lep).toBe(LIVRETS.find((l) => l.id === 'lep')!.rate);
    for (const slug of ['livret-a', 'lep']) {
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
