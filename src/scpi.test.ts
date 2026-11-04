import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaScpi } from './components/Illustrations';
import { investmentBySlug } from './data/investments';

describe('schéma « Comment fonctionne une SCPI »', () => {
  const svg = renderToStaticMarkup(createElement(SchemaScpi));
  const fiche = investmentBySlug['scpi'];

  it('reprend le principe du texte de la fiche (loyers redistribués après frais)', () => {
    expect(fiche.howItWorks).toContain('loyers perçus sont redistribués aux associés après frais');
    expect(svg).toContain('les loyers,');
    expect(svg).toContain('moins les frais,');
  });
  it('ne montre aucun chiffre, reste léger et accessible', () => {
    const texte = svg.replace(/<title[\s\S]*?<\/desc>/, '').replace(/<[^>]+>/g, ' ');
    expect(texte.match(/\d+/g)).toBeNull();
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
  });
});
