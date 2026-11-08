import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaPtz } from './components/Illustrations';
import { guides } from './data/guides';

describe('schéma « PTZ : remboursement »', () => {
  const svg = renderToStaticMarkup(createElement(SchemaPtz));
  const g = guides.find((x) => x.slug === 'pret-a-taux-zero-ptz');
  const texte = JSON.stringify(g?.sections.find((s) => s.heading === 'Comment il se rembourse'));
  it('ne cite que les durées du guide (2 ans minimum, 25 ans au plus), sans montant', () => {
    expect(svg).toContain('25 ans');
    expect(svg).toContain('2 ans au minimum');
    expect(texte).toContain('25 ans');
    expect(texte).toContain('au moins 2 ans');
    expect(svg).not.toMatch(/\d\s?(%|€)/);
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
  });
});
