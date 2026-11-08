import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaDiversificationPrincipe } from './components/Illustrations';
import { guides } from './data/guides';

describe('schéma « diversification : principe »', () => {
  const svg = renderToStaticMarkup(createElement(SchemaDiversificationPrincipe));
  it('reprend les placements cités par le guide, sans chiffre', () => {
    ['Livret', 'Actions', 'Immobilier', 'Fonds en euros'].forEach((t) => expect(svg).toContain(t));
    expect(svg).not.toMatch(/\d\s?(%|€)/);
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
  });
  it('est rattaché à la section « Le principe » du guide', () => {
    const g = guides.find((x) => x.slug === 'diversification-placements');
    expect(g?.sections.some((s) => s.heading === 'Le principe')).toBe(true);
  });
});
