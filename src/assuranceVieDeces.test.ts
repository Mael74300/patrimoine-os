import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaAssuranceVieDeces } from './components/Illustrations';
import { investmentBySlug } from './data/investments';
import { splitSentences } from './lib/ficheText';
import { sentenceLead } from './lib/sentenceLead';

const norm = (t: string) => t.replace(/[\u00a0\u202f]/g, ' ');

describe('schéma de la fiche Assurance-vie : transmission au décès', () => {
  it('montre les chiffres de la règle au décès (impots.gouv.fr, consulté le 2026-11-08 et le 2026-11-14)', () => {
    const svg = norm(renderToStaticMarkup(createElement(SchemaAssuranceVieDeces)));
    for (const m of ['152 500 €', '20 %', '700 000 €', '31,25 %', '30 500 €', '70 ans', '13 octobre 1998']) expect(svg).toContain(m);
    // Le suivi de vérification de la fiche garde l'abattement au décès.
    expect(norm(investmentBySlug['assurance-vie'].review.data.join(' '))).toContain('152 500 €');
  });

  it('la carte Fiscalité renvoie au schéma au lieu de recopier ses chiffres (constat du 2026-11-13)', () => {
    const tax = norm(investmentBySlug['assurance-vie'].tax.text);
    expect(tax).toContain('« Décès de l’assuré »');
    expect(norm(renderToStaticMarkup(createElement(SchemaAssuranceVieDeces)))).toContain('Décès de l’assuré');
    for (const m of ['152 500', '700 000', '31,25', '30 500']) expect(tax).not.toContain(m);
  });
});

describe('fiche Assurance-vie : carte Fiscalité en points courts (Service-Public F22414, consulté le 2026-11-14)', () => {
  const av = investmentBySlug['assurance-vie'];
  const parts = splitSentences(av.tax.text).map(norm);

  it('cinq points courts, la plupart introduits par un repère', () => {
    expect(parts).toHaveLength(5);
    for (const p of parts) expect(p.length).toBeLessThan(220);
    expect(parts.filter((p) => sentenceLead(p)).map((p) => sentenceLead(p)!.lead)).toEqual([
      'Prélèvements sociaux', 'Contrat de 8 ans ou plus', 'Contrat de moins de 8 ans', 'Au décès',
    ]);
  });

  it('règles confirmées : abattement, 7,5 % puis 12,8 % au-delà de 150 000 €, versements depuis 2017, conjoint exonéré', () => {
    const t = norm(av.tax.text);
    for (const m of ['4 600 €', '9 200 €', '7,5 %', '12,8 %', '150 000 €', '27 septembre 2017', 'partenaire de Pacs']) expect(t).toContain(m);
    expect(av.tax.verified).toBe(true);
    expect(av.sources.some((s) => s.url.endsWith('/F22414'))).toBe(true);
  });

  it('exemple fictif recalculé : 10 000 € retirés dont 3 000 € de gains, sous l’abattement, 17,2 % de prélèvements sociaux', () => {
    const ex = norm(av.example);
    expect(ex).toContain('fictif');
    const verse = 7000, valeur = 10000, gains = valeur - verse;
    expect(gains).toBe(3000);
    expect(gains).toBeLessThan(4600);
    expect(Math.round(gains * 0.172)).toBe(516);
    for (const m of ['7 000 €', '10 000 €', '3 000 €', '4 600 €', '17,2 %', '516 €']) expect(ex).toContain(m);
  });
});
