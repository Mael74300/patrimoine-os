import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaFonciereCotee } from './components/Illustrations';
import { investmentBySlug } from './data/investments';

describe('schéma « Comment fonctionne une foncière cotée »', () => {
  const svg = renderToStaticMarkup(createElement(SchemaFonciereCotee));
  const fiche = investmentBySlug['foncieres-cotees'];

  it('reprend la définition de la fiche (immeubles, actions en Bourse)', () => {
    expect(fiche.definition).toContain('immeubles');
    expect(fiche.definition).toContain('Bourse');
    expect(svg).toContain('actions en Bourse');
    expect(svg).toContain('dividendes');
  });
  it('ne montre aucun chiffre, reste léger et accessible', () => {
    const texte = svg.replace(/<title[\s\S]*?<\/desc>/, '').replace(/<[^>]+>/g, ' ');
    expect(texte.match(/\d+/g)).toBeNull();
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
  });
});
