import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MobileFold } from './components/ui';

describe('MobileFold', () => {
  it('reste ouvert dans le HTML pré-rendu et garde tout le contenu', () => {
    const html = renderToString(createElement(MobileFold, { label: 'Voir les familles' }, createElement('p', null, 'Contenu')));
    expect(html).toMatch(/<details[^>]* open/);
    expect(html).toContain('Voir les familles');
    expect(html).toContain('<p>Contenu</p>');
  });
});
