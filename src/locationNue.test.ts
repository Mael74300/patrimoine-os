import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaLocationNue } from './components/Illustrations';
import { investmentBySlug } from './data/investments';

describe('schéma « Location nue »', () => {
  const norm = (t: string) => t.replace(/[\u00a0\u202f]/g, ' ');
  const svg = norm(renderToStaticMarkup(createElement(SchemaLocationNue)));
  const texte = svg.replace(/<[^>]+>/g, ' ');
  const fiche = investmentBySlug['location-nue'];

  it('reprend les chiffres de la fiche (15 000 €, abattement de 30 %)', () => {
    expect(norm(fiche.tax.text)).toContain('15 000 €');
    expect(norm(fiche.tax.text)).toContain('abattement de 30 %');
    expect(svg).toContain('15 000 €');
    expect(svg).toContain('abattement de 30 %');
    expect(svg).toContain('3 ans');
  });
  it('ne contient aucun autre chiffre', () => {
    const sans = texte.replace(/15 000|30 pour cent|30 %|3 ans|ill-ln-[td]/g, '');
    expect(sans).not.toMatch(/\d/);
  });
  it('cite la source Service-Public F1991 sur la fiche', () => {
    expect(fiche.sources.some((s) => s.url.endsWith('/F1991'))).toBe(true);
  });
  it('reste léger et accessible', () => {
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
  });
});
