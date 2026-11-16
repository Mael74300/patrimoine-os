import { describe, expect, it } from 'vitest';
import { IS_RATES } from '../lib/calc/business';
import { fmtEur, fmtPct } from '../lib/finance';
import { simFaq } from './simFaq';
import methodeSource from '../pages/Methodologie.tsx?raw';

const plain = (t: string) => t.replace(/[  ]/g, ' ');

describe('impôt sur les sociétés : mêmes taux partout', () => {
  it('FAQ du simulateur Entreprise et page Méthode citent les taux de IS_RATES', () => {
    const faq = plain(JSON.stringify(simFaq.entreprise));
    const methode = plain(methodeSource).replace(/\\u00a0/g, ' ');
    for (const t of [faq, methode]) {
      expect(t).toContain(plain(fmtPct(IS_RATES.reduced)));
      expect(t).toContain(plain(fmtEur(IS_RATES.reducedCap)));
      expect(t).toContain(plain(fmtPct(IS_RATES.normal)));
    }
    expect(faq).toContain('16 novembre 2026');
    expect(IS_RATES.verifiedOn).toBe('2026-11-16');
  });
});
