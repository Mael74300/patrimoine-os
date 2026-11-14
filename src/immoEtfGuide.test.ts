import { describe, expect, it } from 'vitest';
import { guideBySlug } from './data/guides';
import { RENDEMENT_EXAMPLE, rendementSteps } from './lib/illustrationData';

describe('guide « Comment comparer immobilier et ETF »', () => {
  const guide = guideBySlug['immobilier-ou-etf'];
  const texte = guide.sections.map((s) => s.body.join(' ')).join(' ').replace(/ /g, ' ');

  it('reprend l’exemple fictif testé du guide Rentabilité locative (6 % brut, environ 3,6 % net)', () => {
    const { price, monthlyRent } = RENDEMENT_EXAMPLE;
    expect(price).toBe(150000);
    expect(monthlyRent).toBe(750);
    expect(monthlyRent * 12).toBe(9000);
    expect(texte).toContain('Exemple fictif : un bien de 150 000 € loué 750 € par mois affiche 6 % de rendement brut (9 000 € de loyers par an).');
    const steps = rendementSteps();
    expect(steps[0].value).toBeCloseTo(0.06, 6);
    expect(Math.round(steps[3].value * 1000) / 10).toBe(3.6);
    expect(texte).toContain('environ 3,6 %, avant impôts');
  });

  it('méthode et limites en points courts, sans chiffre de baisse de marché non sourcé', () => {
    const methode = guide.sections.find((s) => s.heading.startsWith('La méthode'))!;
    const limites = guide.sections.find((s) => s.heading === 'Ce que les chiffres ne disent pas')!;
    for (const s of [methode, limites]) {
      expect(s.points).toBe(true);
      for (const p of s.body) {
        expect(p).toMatch(/^[^:]{3,30} : /);
        expect(p.length).toBeLessThan(200);
      }
    }
    expect(texte).not.toMatch(/30 %/);
  });
});
