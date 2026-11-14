import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaCpf } from './components/Illustrations';
import { investmentBySlug } from './data/investments';

describe('schéma de la fiche Formation et compétences', () => {
  it('reprend le principe sourcé (Service-Public F10705), sans chiffre', () => {
    const svg = renderToStaticMarkup(createElement(SchemaCpf)).replace(/[\u00a0\u202f]/g, ' ');
    for (const m of ['Votre CPF vous suit', 'changez', 'perdez', 'Agefiph', 'région']) expect(svg).toContain(m);
    expect(svg).not.toMatch(/\d\s?(%|€)/);
  });
  it('est cohérent avec les rubriques de la fiche', () => {
    const cap = investmentBySlug['capital-humain']!.review.data.join(' ');
    for (const m of ['Agefiph', 'région']) expect(cap).toContain(m);
  });
});

describe('fiche Formation et compétences : chiffres du CPF', () => {
  const f = investmentBySlug['capital-humain']!;
  it('l’exemple de participation est juste : prix = part du CPF + 150 €', () => {
    const m = f.fees.text.replace(/[\u00a0\u202f]/g, ' ').match(/formation à ([\d ]+) €.*?(\d[\d ]*) € viennent du CPF et (\d+) € de votre poche/);
    expect(m).not.toBeNull();
    const n = (x: string) => Number(x.replace(/ /g, ''));
    expect(n(m![2]) + n(m![3])).toBe(n(m![1]));
    expect(n(m![3])).toBe(150);
  });
  it('le suivi de vérification reprend les mêmes montants', () => {
    const d = f.review.data.join(' ');
    for (const v of ['500 €', '5 000 €', '150 €']) expect(d.replace(/[\u00a0\u202f]/g, ' ')).toContain(v);
  });
});

describe('repère « Capital » des fiches', () => {
  it('tient en une ou deux lignes (110 caractères au plus) dans l’encadré En bref', async () => {
    const { investments } = await import('./data/investments');
    for (const i of investments) expect(i.minCapital.text.length, i.slug).toBeLessThanOrEqual(110);
  });
});
