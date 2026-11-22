import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaEndettement } from './components/Illustrations';
import { endettementParts, leviersEndettement, LEVIERS_EXAMPLE } from './lib/illustrationData';
import { SchemaLeviers } from './components/schemas/guides';
import { capacityAtHcsf } from './lib/calc/debtRatio';
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
  it('leviers : chaque montant du texte est recalculé sur le foyer fictif (taux et assurance fictifs)', () => {
    const l = leviersEndettement();
    const floor = (v: number) => Math.floor(v / 1000) * 1000;
    const { rate, insuranceRate } = LEVIERS_EXAMPLE;
    expect(l.base).toBe(floor(capacityAtHcsf(3000, 200, rate, 20, insuranceRate)));
    expect(l.base).toBe(139000);
    expect(l.longer).toBe(160000);
    expect(l.noOldLoan).toBe(172000);
    expect(l.couple).toBe(225000);
    expect(l.coupleLimit).toBe(1575);
    expect(l.coupleNewPayment).toBe(1375);
    const section = guide.sections.find((s) => s.heading.startsWith('Que faire si'))!;
    expect(section.points).toBe(true);
    const t = section.body.join(' ').replace(/[\u00a0\u202f]/g, ' ');
    for (const m of ['850 €', 'taux fictif de 3,6 %', 'assurance de 0,3 %', 'sur 20 ans', '200 €', '1 050 €', '1 500 € de revenus en plus', '1 575 € par mois, dont 1 375 €']) {
      expect(t).toContain(m);
    }
    // Les sommes empruntables sont lues sur le schéma : le texte n'en recopie aucune (chantier 284).
    for (const m of ['139 000', '160 000', '172 000', '225 000']) expect(t).not.toContain(m);
    // Même ordre dans la liste et dans le schéma : durée allongée, petit crédit soldé, à deux.
    const ordre = ['Allonger la durée', 'Solder un petit crédit', 'Emprunter à deux'].map((h) => section.body.findIndex((b) => b.startsWith(h)));
    expect(ordre.every((v, i) => v > 0 && (i === 0 || v > ordre[i - 1]))).toBe(true);
    expect(l.base < l.longer && l.longer < l.noOldLoan && l.noOldLoan < l.couple).toBe(true);
    const html = renderToStaticMarkup(createElement(SchemaLeviers)).replace(/[\u00a0\u202f]/g, ' ');
    for (const m of ['139 000 €', '160 000 €', '172 000 €', '225 000 €', 'exemple fictif', '3,6 %', '0,3 %', 'role="img"']) expect(html).toContain(m);
    expect(html.length).toBeLessThan(15000);
  });
});
