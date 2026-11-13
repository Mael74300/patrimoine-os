import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaEscalier, wrapLabel, ESCALIER_MAX_CHARS } from './components/Illustrations';
import { sectionId } from './pages/Guides';
import { guideBySlug } from './data/guides';

describe('schéma en escalier du guide « Par où commencer »', () => {
  it('reprend dans l’ordre les titres des sections, sans chiffre ajouté', () => {
    const steps = guideBySlug['par-ou-commencer'].sections.map((s) => s.heading);
    const svg = renderToStaticMarkup(createElement(SchemaEscalier, { steps, targets: steps.map(sectionId), title: 'Titre' }));
    const labels = [...svg.matchAll(/class="ill-step">([^<]*)</g)].map((m) => m[1]).join(' ');
    expect(labels).toBe(steps.join(' '));
    const numbers = [...svg.matchAll(/ill-num">(\d+)</g)].map((m) => m[1]);
    expect(numbers).toEqual(steps.map((_, i) => String(i + 1)));
    expect(svg.length).toBeLessThan(15000);
  });

  it('chaque case est un lien vers la rubrique correspondante, avec un nom accessible', () => {
    const sections = guideBySlug['par-ou-commencer'].sections;
    const steps = sections.map((s) => s.heading);
    const targets = steps.map(sectionId);
    const svg = renderToStaticMarkup(createElement(SchemaEscalier, { steps, targets, title: 'Titre' }));
    expect(svg).toContain('role="group"');
    targets.forEach((t, i) => {
      expect(svg).toContain(`href="#${t}"`);
      expect(svg).toContain(`aria-label="Étape ${i + 1} : ${steps[i].replace('’', '’')}"`);
    });
    expect((svg.match(/<a /g) ?? []).length).toBe(steps.length);
  });

  it('les libellés coupés tiennent dans leur case de 298 unités', () => {
    for (const s of guideBySlug['par-ou-commencer'].sections) {
      const lines = wrapLabel(s.heading, ESCALIER_MAX_CHARS);
      expect(lines.join(' ')).toBe(s.heading);
      // 14 unités de marge à gauche, 36 à droite (chevron), 0,52 em par caractère à 14,5 unités
      for (const l of lines) expect(l.length * 0.52 * 14.5).toBeLessThan(298 - 14 - 36);
    }
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
