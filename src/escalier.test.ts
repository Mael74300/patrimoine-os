import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaEscalier } from './components/Illustrations';
import { guideBySlug } from './data/guides';

describe('schéma en escalier du guide « Par où commencer »', () => {
  it('reprend dans l’ordre les titres des sections, sans chiffre ajouté', () => {
    const steps = guideBySlug['par-ou-commencer'].sections.map((s) => s.heading);
    const svg = renderToStaticMarkup(createElement(SchemaEscalier, { steps, title: 'Titre' }));
    let pos = 0;
    steps.forEach((s) => {
      const i = svg.indexOf(s.replace('’', '’'), pos);
      expect(i).toBeGreaterThan(pos);
      pos = i;
    });
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
  });
});

describe('liens « pour aller plus loin » du guide « Par où commencer »', () => {
  it('un lien par étape, vers une page existante du site', async () => {
    const { etapesSuite } = await import('./pages/Guides');
    const { simulators } = await import('./lib/search');
    expect(etapesSuite).toHaveLength(guideBySlug['par-ou-commencer'].sections.length);
    etapesSuite.forEach((e) => {
      const [, kind, slug] = e.to.split('/');
      if (kind === 'guides') expect(guideBySlug[slug]).toBeTruthy();
      else expect(simulators.some((s: { slug: string }) => s.slug === slug)).toBe(true);
    });
  });
});
