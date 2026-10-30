import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CmpFold } from './pages/Compare';

describe('CmpFold', () => {
  it('reste ouvert dans le HTML pré-rendu (écran large, sans JavaScript) et garde tout le contenu', () => {
    const html = renderToString(createElement(CmpFold, { label: 'Voir les avantages', items: ['A', 'B'] }));
    expect(html).toContain('<details');
    expect(html).toMatch(/<details[^>]* open/);
    expect(html).toContain('<li>A</li>');
    expect(html).toContain('<li>B</li>');
  });
});
