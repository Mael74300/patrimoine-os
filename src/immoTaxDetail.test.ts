import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import SimImmobilier from './pages/SimImmobilier';

const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(SimImmobilier))).replace(/[  ]/g, ' ');

describe('simulateur Immobilier locatif : détail de l’impôt estimé', () => {
  it('le repli reprend l’impôt de l’année 1 (exemple par défaut : 8 250 € − 30 % = 5 775 € × 47,2 % ≈ 2 726 €)', () => {
    expect(html).toContain('D’où viennent les 2 726 € d’impôt ?');
    expect(html).toContain('class="calc-steps"');
    expect(html).toContain('8 250 €');
    expect(html).toContain('2 475 €');
    expect(html).toContain('5 775 €');
    expect(html).toContain('47,2 %');
    expect(html).toMatch(/Impôt estimé, année 1.*2 726 €/s);
  });
  it('l’ancienne note en formule n’est plus affichée', () => {
    expect(html).not.toContain('impôt = base imposable ×');
    expect(html).toContain('15 000 € par an');
  });
});
