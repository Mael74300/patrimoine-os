import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaActions } from './components/Illustrations';
import { investmentBySlug } from './data/investments';

describe('schéma « Actions en direct »', () => {
  const svg = renderToStaticMarkup(createElement(SchemaActions));
  const texte = svg.replace(/<[^>]+>/g, ' ').replace(/[\u00a0\u202f]/g, ' ');
  const lignes = 15, mise = 1000;
  const part = ((mise / (lignes * mise)) * 100).toFixed(1).replace('.', ',');

  it('reprend l’exemple fictif de la fiche (15 lignes de 1 000 €, 6,7 %)', () => {
    const ex = investmentBySlug['actions-individuelles'].example.replace(/[\u00a0\u202f]/g, ' ');
    expect(ex).toContain('15 lignes de 1 000 €');
    expect(ex).toContain(`${part} %`);
    expect(part).toBe('6,7');
    expect(texte).toContain('15 000 €');
    expect(texte).toContain(`${part} %`);
    expect(svg.replace(/[\u00a0\u202f]/g, ' ').match(/>1 000 €</g)?.length).toBe(lignes - 1);
    expect(svg.match(/>0 €</g)?.length).toBe(1);
  });
  it('est marqué fictif, léger et accessible', () => {
    expect(texte).toContain('fictif');
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
  });
});
