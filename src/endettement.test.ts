import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaEndettement } from './components/Illustrations';
import { endettementParts } from './lib/illustrationData';
import { guideBySlug } from './data/guides';
import { HCSF } from './lib/calc/debtRatio';

describe('schéma « taux d’endettement »', () => {
  const guide = guideBySlug['taux-endettement-capacite-emprunt'];
  const texte = guide.sections.map((s) => [s.heading, ...s.body].join(' ')).join(' ').replace(/\u00a0/g, ' ');
  const p = endettementParts();
  it('recalcule l’exemple fictif du guide (200 + 850 sur 3 000 € = 35 %)', () => {
    expect(p.income).toBe(3000);
    expect(p.existing + p.added).toBe(1050);
    expect(p.rest).toBe(1950);
    expect(p.ratioAfter).toBeCloseTo(0.35, 9);
    expect(p.limit).toBe(1050);
    expect(p.maxNewPayment).toBe(850);
    expect(HCSF.maxRatio).toBe(0.35);
    expect(texte.replace(/\u00a0/g, ' ')).toContain('Les crédits prennent 1 050 € par mois, soit 35 % des revenus');
    expect(texte).not.toMatch(/\(200 \+ 850\)/);
    expect(texte.replace(/\u00a0/g, ' ')).toContain('200 € de crédit en cours et 850 € de nouvelle mensualité pour 3 000 €');
  });
  it('est accessible, léger et marqué « exemple fictif »', () => {
    expect(guide.sections.some((s) => s.heading.replace(/\u00a0/g, ' ') === 'Le repère de 35 %')).toBe(true);
    const html = renderToStaticMarkup(createElement(SchemaEndettement)).replace(/[\u00a0\u202f]/g, ' ');
    expect(html).toContain('role="img"');
    expect(html).toContain('exemple fictif');
    expect(html).toContain('1 050');
    expect(html).toContain('850');
    expect(html.length).toBeLessThan(15000);
  });
});
