import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaObligation } from './components/Illustrations';
import { investmentBySlug } from './data/investments';

describe('schéma « Obligation : prêter, puis le prix selon les taux »', () => {
  const svg = renderToStaticMarkup(createElement(SchemaObligation));
  const fiche = investmentBySlug['obligations'];

  it('reprend la règle de la fiche (taux qui montent, prix qui baisse)', () => {
    expect(fiche.howItWorks).toContain('baisse quand les taux');
    expect(svg).toContain('Les taux montent');
    expect(svg).toContain('le prix de l’obligation baisse');
    expect(svg).toContain('le prix de l’obligation monte');
  });
  it('ne montre aucun chiffre, reste léger et accessible', () => {
    const texte = svg.replace(/<title[\s\S]*?<\/desc>/, '').replace(/<[^>]+>/g, ' ');
    expect(texte.match(/\d+/g)).toBeNull();
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
  });
});
