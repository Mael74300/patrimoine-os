import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaEnveloppe } from './components/Illustrations';
import { guideBySlug } from './data/guides';

describe('schéma « placement et enveloppe »', () => {
  const svg = renderToStaticMarkup(createElement(SchemaEnveloppe));
  const guide = guideBySlug['types-investissements'];
  const texte = guide.sections.map((s) => [s.heading, ...s.body].join(' ')).join(' ');

  it('place le schéma sous un titre de section qui existe, et les enveloppes citées sont dans le texte du guide', () => {
    expect(guide.sections.some((s) => s.heading.startsWith('Placement et enveloppe'))).toBe(true);
    ['PEA', 'compte-titres', 'assurance-vie', 'PER'].forEach((e) => expect(texte).toContain(e));
    ['PEA', 'Compte-titres', 'Assurance-vie', 'PER'].forEach((e) => expect(svg).toContain(e));
  });
  it('ne contient aucun chiffre et reste léger et accessible', () => {
    expect(svg.replace(/<[^>]+>/g, ' ').match(/\d/)).toBeNull();
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
  });
});
