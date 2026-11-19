import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SimNotice } from './components/ui';

describe('SimNotice', () => {
  it('reste ouvert dans le HTML pré-rendu et garde tout le texte', () => {
    const html = renderToString(createElement(SimNotice, null, 'Résultat fondé sur vos hypothèses.'));
    expect(html).toMatch(/<details[^>]* open/);
    // role="note" sur le paragraphe : l'élément <details> n'accepte pas ce rôle (axe : aria-allowed-role).
    expect(html).toMatch(/<p role="note">/);
    expect(html).not.toMatch(/<details[^>]*role=/);
    expect(html).toContain('À savoir avant de simuler');
    expect(html).toContain('Résultat fondé sur vos hypothèses.');
  });
});
