import { describe, expect, it } from 'vitest';
import { sentenceLead } from './sentenceLead';
import { splitSentences } from '../components/ui';
import { investments } from '../data/investments';

describe('sentenceLead', () => {
  it('isole une amorce courte avant « : »', () => {
    expect(sentenceLead('Après 8 ans : abattement annuel.')).toEqual({ lead: 'Après 8 ans', rest: ' : abattement annuel.' });
    expect(sentenceLead('Décès (contrats souscrits depuis le 13 octobre 1998) : sur les primes…')?.lead).toBe('Décès (contrats souscrits depuis le 13 octobre 1998)');
  });
  it('refuse les amorces longues, à virgule ou à parenthèse ouverte', () => {
    expect(sentenceLead('Taux de 1,70 % sans deux-points.')).toBeNull();
    expect(sentenceLead('Au-delà, chaque banque fixe ses tarifs : les comparer.')).toBeNull();
    expect(sentenceLead('En 2026 le micro-BIC (meublé de tourisme non classé : 15 000 €)')).toBeNull();
    expect(sentenceLead('x'.repeat(61) + ' : suite')).toBeNull();
  });
  it('ne perd ni ne change aucun caractère des rubriques Frais, Fiscalité et Capital', () => {
    for (const inv of investments) {
      for (const c of [inv.minCapital, inv.fees, inv.tax]) {
        for (const s of splitSentences(c.text)) {
          const p = sentenceLead(s);
          if (p) expect(p.lead + p.rest).toBe(s);
        }
      }
    }
  });
  it('aucune rubrique ne renvoie à un tableau « ci-dessus » (absent du comparateur)', () => {
    for (const inv of investments) {
      for (const c of [inv.minCapital, inv.fees, inv.tax]) expect(c.text).not.toMatch(/ci-dessus/);
    }
  });
});
