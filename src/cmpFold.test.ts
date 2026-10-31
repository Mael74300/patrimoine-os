import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Compare, { CMP_FOLDED_ON_MOBILE } from './pages/Compare';

describe('Comparateur', () => {
  const html = renderToString(createElement(MemoryRouter, null, createElement(Compare)));
  it('garde tout le contenu ouvert dans le HTML pré-rendu (écran large, sans JavaScript)', () => {
    expect(html).not.toContain('cmp-closed');
    expect(html).not.toContain('cmp-toggle');
    for (const label of CMP_FOLDED_ON_MOBILE) expect(html).toContain(`>${label}</th>`);
    expect(html).toContain('Avantages');
  });
  it('ne replie sur mobile que des critères longs', () => {
    expect(CMP_FOLDED_ON_MOBILE).toEqual(['Capital nécessaire', 'Frais', 'Fiscalité', 'Avantages', 'Inconvénients']);
  });
});
