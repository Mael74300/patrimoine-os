import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SimNotice } from './components/ui';

describe('SimNotice', () => {
  it('reste ouvert dans le HTML pré-rendu et garde tout le texte', () => {
    const html = renderToString(createElement(SimNotice, null, 'Résultat fondé sur vos hypothèses.'));
    expect(html).toMatch(/<details[^>]* open/);
    expect(html).toContain('role="note"');
    expect(html).toContain('À savoir avant de simuler');
    expect(html).toContain('Résultat fondé sur vos hypothèses.');
  });
});
