import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaRendement, SchemaCashflow } from './components/schemas/guides';
import { rendementSteps, cashflowParts, CASHFLOW_EXAMPLE, RENDEMENT_EXAMPLE } from './lib/illustrationData';
import { RENTAL } from './lib/calc/fixtures';
import { guideBySlug } from './data/guides';

describe('schéma « rendement locatif : du brut au net »', () => {
  const guide = guideBySlug['rentabilite-locative'];
  const texte = guide.sections.map((s) => [s.heading, ...s.body].join(' ')).join(' ').replace(/\u00a0/g, ' ');
  const steps = rendementSteps();
  it('recalcule les chiffres du guide (6 % brut, environ 3,6 % net)', () => {
    expect(steps[0].value).toBeCloseTo(0.06, 6);
    expect(texte).toContain('rapporte 9 000 € de loyers par an, soit 6 % de son prix');
    expect(texte).not.toMatch(/\d \/ \d/);
    expect(steps[3].value).toBeCloseTo(0.036, 3);
    expect(texte).toContain('environ 3,6 %');
    expect(steps.map((s) => s.value)).toEqual([...steps.map((s) => s.value)].sort((a, b) => b - a));
  });
  it('est placé sous une section existante, accessible et léger', () => {
    expect(guide.sections.some((s) => s.heading === 'Le rendement net de charges')).toBe(true);
    const svg = renderToStaticMarkup(createElement(SchemaRendement)).replace(/\u00a0/g, ' ');
    expect(svg).toContain('role="img"');
    expect(svg).toContain('6,0 %');
    expect(svg).toContain('3,6 %');
    expect(svg.length).toBeLessThan(15000);
  });
});

describe('schéma « cash-flow » du guide rentabilité locative', () => {
  const guide = guideBySlug['rentabilite-locative'];
  const section = guide.sections.find((s) => s.heading.startsWith('Le cash-flow'))!;
  const texte = section.body.join(' ').replace(/\u00a0/g, ' ');
  const c = cashflowParts();
  it('reprend le même bien et le même crédit que l’exemple testé du guide', () => {
    expect(CASHFLOW_EXAMPLE).toEqual({ ...RENTAL, marginalRate: 0, socialRate: 0, microAllowance: 0 });
    expect(CASHFLOW_EXAMPLE.price).toBe(RENDEMENT_EXAMPLE.price);
    expect(c.loanAmount).toBe(150000);
    expect(texte).toContain('150 000 € empruntés à 3,5 % sur 20 ans, assurance emprunteur comprise');
  });
  it('montants arrondis cohérents : sorties − entrées = effort ≈ 390 € du texte', () => {
    expect(c).toMatchObject({ rents: 688, charges: 172, loan: 907, out: 1079, effort: 391 });
    expect(Math.abs(c.effort + c.exactCashflow)).toBeLessThan(1);
    expect(texte).toContain('effort d’environ 390 € par mois avant impôt');
    expect(Math.abs(c.effort - 390)).toBeLessThan(5);
  });
  it('est accessible, marqué fictif et léger', () => {
    const html = renderToStaticMarkup(createElement(SchemaCashflow)).replace(/\u00a0/g, ' ').replace(/\u202f/g, ' ');
    expect(html).toContain('role="img"');
    expect(html).toContain('exemple fictif');
    for (const v of ['1 079 €', '688 €', '172 €', '907 €', '391 €']) expect(html).toContain(v);
    expect(html.length).toBeLessThan(15000);
  });
});
