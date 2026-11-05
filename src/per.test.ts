import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaPer } from './components/Illustrations';
import { investmentBySlug } from './data/investments';

describe('schéma « PER »', () => {
  const svg = renderToStaticMarkup(createElement(SchemaPer));
  const fiche = investmentBySlug['per'];

  it('reprend les règles de la fiche (déduction, blocage, sortie imposée)', () => {
    expect(fiche.howItWorks).toContain('déduits du revenu imposable');
    expect(fiche.howItWorks).toContain('bloquée jusqu’à la retraite');
    expect(fiche.howItWorks).toContain('en capital, en rente');
    expect(svg).toContain('déductible du revenu imposable');
    expect(svg).toContain('épargne bloquée');
    expect(svg).toContain('rente viagère');
    expect(svg).toContain('La sortie est imposée');
  });
  it('ne contient aucun chiffre (principe qualitatif)', () => {
    const texte = svg.replace(/<[^>]+>/g, ' ').replace(/ill-per-[td]|1\.|2\.|3\./g, '');
    expect(texte).not.toMatch(/\d/);
  });
  it('reste léger et accessible', () => {
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
  });
});
