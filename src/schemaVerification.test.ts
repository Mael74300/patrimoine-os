import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaVerification } from './components/Illustrations';
import maintenance from '../.github/workflows/maintenance.yml?raw';
import methodePage from './pages/Methodologie.tsx?raw';

describe('schéma « comment une information est contrôlée »', () => {
  const svg = renderToStaticMarkup(createElement(SchemaVerification));
  it('est qualitatif, accessible et léger', () => {
    expect(svg).not.toMatch(/\d\s?(%|€)/);
    expect(svg).toContain('role="img"');
    expect(svg).toContain('chaque semaine');
    expect(svg.length).toBeLessThan(15000);
  });
  it('décrit un processus réel : contrôle hebdomadaire et page Méthode', () => {
    expect(maintenance).toMatch(/cron: '[^']* \* \* 1'/);
    const page = methodePage;
    expect(page).toContain('<SchemaVerification />');
    expect(page).toContain('Une règle fiscale n\'est jamais modifiée');
  });
});
