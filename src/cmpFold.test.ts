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
    expect(html).toContain('>Avantages et inconvénients</th>');
  });
  it('regroupe Risque, Liquidité et Effort dans une seule ligne, avec le niveau en mots comme sur les fiches', () => {
    expect(html).toContain('>Repères</th>');
    for (const label of ['Risque', 'Liquidité', 'Effort']) expect(html).not.toContain(`>${label}</th>`);
    expect(html).not.toMatch(/\d\/5</);
    // Livret A : risque 1 sur 5 → « très faible », liquidité 5 sur 5 → « très bonne ».
    const text = html.replace(/<!-- -->/g, '');
    expect(text).toContain('très faible<span class="sr-only"> (1 sur 5)</span>');
    expect(text).toContain('très bonne<span class="sr-only"> (5 sur 5)</span>');
  });
  it('ne replie sur mobile que des critères longs, et laisse ouverts les avantages et inconvénients', () => {
    expect(CMP_FOLDED_ON_MOBILE).toEqual(['Capital nécessaire', 'Frais', 'Fiscalité']);
    expect(CMP_FOLDED_ON_MOBILE).not.toContain('Avantages et inconvénients');
  });
  it('regroupe avantages et inconvénients dans une case, marqués comme sur les fiches, sans la ligne Famille', () => {
    expect(html).not.toContain('>Famille</th>');
    expect(html).not.toContain('>Inconvénients</th>');
    expect(html.split('class="cmp-list cmp-pros"').length - 1).toBe(3);
    expect(html.split('class="cmp-list cmp-cons"').length - 1).toBe(3);
    expect(html).toContain('<span class="sr-only">Inconvénients :</span>');
  });
  it('donne à chaque placement la même couleur dans le choix, le tableau, les réglages et le graphique', () => {
    const colors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)'];
    for (const c of colors) {
      // Choix du placement, en-tête du tableau, réglages et « Concrètement » : un point de la couleur de la courbe.
      expect(html.split(`class="pt-dot" style="background:${c}"`).length - 1).toBeGreaterThanOrEqual(4);
      // Cases du tableau (filet et point sur téléphone) : six critères par placement.
      expect(html.split(`style="--cmp-c:${c}"`).length - 1).toBe(6);
    }
  });
});
