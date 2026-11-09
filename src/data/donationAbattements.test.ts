import { describe, it, expect } from 'vitest';
import { DONATION_ABATTEMENTS, fmtEuros } from './donationAbattements';
import { investmentBySlug } from './investments';

describe('abattements de donation', () => {
  it('le tableau reprend le montant « enfant » de la fiche (100 000 €) et le total parent → enfant', () => {
    const f = investmentBySlug['donation']!;
    const enfant = DONATION_ABATTEMENTS.find((a) => a.lien === 'Enfant')!.montant;
    expect(enfant).toBe(100_000);
    expect(f.howItWorks.replace(/[  ]/g, ' ')).toContain('100 000 €');
    expect(f.tax.text.replace(/[  ]/g, ' ')).toContain('131 865');
    expect(enfant + 31_865).toBe(131_865);
  });
  it('formate avec espaces insécables', () => {
    expect(fmtEuros(80_724)).toBe('80 724 €');
  });
  it('liste triée du plus grand au plus petit', () => {
    const m = DONATION_ABATTEMENTS.map((a) => a.montant);
    expect([...m].sort((a, b) => b - a)).toEqual(m);
  });
});
