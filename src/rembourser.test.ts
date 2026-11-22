import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaRembourser } from './components/Illustrations';
import { rembourserParts } from './lib/illustrationData';
import { guideBySlug } from './data/guides';
import { PFU_TOTAL_PCT } from './lib/calc/pfu';

describe('schéma « rembourser ou investir »', () => {
  const guide = guideBySlug['rembourser-credit-par-anticipation-ou-investir'];
  const texte = guide.sections.map((s) => [s.heading, ...s.body].join(' ')).join(' ').replace(/\u00a0/g, ' ');
  it('recalcule l’exemple fictif du guide (gains au PFU de 31,4 %, 43 850 € contre 41 250 €, 45 mois, ≈ 21 250 €, équilibre ≈ 5,4 %)', () => {
    const p = rembourserParts();
    expect(p.taxRate).toBeCloseTo(PFU_TOTAL_PCT / 100, 10);
    expect(p.wealthPrepay).toBe(43850);
    expect(p.wealthInvest).toBe(41250);
    expect(p.gap).toBe(2600);
    expect(p.gap).toBe(p.wealthPrepay - p.wealthInvest);
    expect(Math.round(p.breakEvenReturn! * 1000) / 10).toBe(5.4);
    expect(p.monthsSaved).toBe(45);
    expect(p.interestSaved).toBe(21250);
    expect(texte).toContain('crédit de 150 000 € à 4 % sur 20 ans restants, 20 000 € disponibles, placement à 5 % par an');
    expect(texte).toContain('45 mois');
    expect(texte).toContain('21 250 €');
    expect(texte).toContain(`gains imposés à ${PFU_TOTAL_PCT.toLocaleString('fr-FR')} % (prélèvement forfaitaire unique de 2026`);
    expect(texte).toContain('43 850 €');
    expect(texte).toContain('41 250 €');
    expect(texte).toContain('2 600 €');
    expect(texte).toContain('environ 5,4 % brut par an');
    const faq = guide.faq!.map((f) => f.a).join(' ').replace(/\u00a0/g, ' ');
    expect(faq).toContain('environ 5,4 % brut par an');
    expect(texte).not.toMatch(/imposés à 30 %/);
  });
  it('est accessible, léger et marqué « exemple fictif »', () => {
    const html = renderToStaticMarkup(createElement(SchemaRembourser)).replace(/[  ]/g, ' ');
    expect(html).toContain('role="img"');
    expect(html).toContain('exemple fictif');
    expect(html).toContain('43 850');
    expect(html).toContain('5,4 %');
    expect(html).toContain('41 250');
    // La frise montre le mécanisme : crédit raccourci de 45 mois, puis la mensualité placée (≈ 909 €).
    const p = rembourserParts();
    expect(p.monthsIfPrepaid + p.monthsSaved).toBe(p.remainingYears * 12);
    expect(p.monthlyPayment).toBe(909);
    expect(html).toContain('crédit fini 45 mois plus tôt');
    expect(html).toContain('≈ 909 € par mois');
    expect(html).toContain('durées à l’échelle');
    expect(html.length).toBeLessThan(15000);
  });
});
