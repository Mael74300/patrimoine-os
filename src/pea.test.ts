import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaPea } from './components/Illustrations';
import { guideBySlug } from './data/guides';

describe('schéma « PEA : avant et après 5 ans »', () => {
  const svg = renderToStaticMarkup(createElement(SchemaPea));
  const guide = guideBySlug['fonctionnement-pea'];
  const texte = guide.sections.map((s) => [s.heading, ...s.body].join(' ')).join(' ').replace(/\u00a0/g, ' ');

  it('est placé sous une section qui existe et reprend les règles du texte du guide', () => {
    expect(guide.sections.some((s) => s.heading === 'Retraits et fiscalité')).toBe(true);
    expect(texte).toContain('Avant 5 ans, un retrait entraîne en principe la clôture du plan');
    expect(texte).toContain('un retrait partiel est possible sans clôturer le plan');
    expect(texte).toContain('seul un retrait total clôture le plan');
    expect(texte).toContain('exonérés d’impôt sur le revenu');
    expect(texte).toContain('prélèvements sociaux');
  });
  it('ne montre aucun autre chiffre que « 5 ans » et reste léger et accessible', () => {
    const chiffres = svg.replace(/<[^>]+>/g, ' ').match(/\d+/g) ?? [];
    expect(new Set(chiffres)).toEqual(new Set(['5']));
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
  });
});

describe('fiche PEA : schéma présent et cohérent avec les données', () => {
  it('la fiche affiche le schéma et ses règles figurent dans la fiche', async () => {
    const { investmentBySlug } = await import('./data/investments');
    const tax = investmentBySlug['pea'].tax.text.replace(/\u00a0/g, ' ');
    expect(tax).toContain('Retrait avant 5 ans : clôture du plan');
    expect(tax).toContain('Après 5 ans : exonération d\'impôt sur le revenu, prélèvements sociaux dus');
    const svg = renderToStaticMarkup(createElement(SchemaPea)).replace(/\u00a0/g, ' ');
    expect(svg).toContain('Un retrait total clôture toujours le plan');
  });
});
