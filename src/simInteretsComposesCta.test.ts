import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import SimInteretsComposes from './pages/SimInteretsComposes';

/**
 * Simulateur Intérêts composés : la question la plus courante (« combien aurai-je ? ») n’a pas d’onglet ici ;
 * elle se calcule dans le simulateur de patrimoine. Le renvoi est un bouton visible au-dessus des onglets,
 * pas un lien caché dans l’encadré replié « À savoir avant de simuler ».
 */
describe('Intérêts composés : renvoi visible vers la projection d’épargne', () => {
  const html = renderToString(createElement(MemoryRouter, { initialEntries: ['/simulateurs/interets-composes'] }, createElement(SimInteretsComposes)));

  it('un bouton vers le simulateur de patrimoine, placé avant les onglets', () => {
    const bouton = html.search(/<a[^>]*class="btn small secondary"[^>]*href="\/simulateurs\/patrimoine"/);
    expect(bouton).toBeGreaterThan(-1);
    expect(bouton).toBeLessThan(html.indexOf('role="tablist"'));
  });

  it('un seul lien vers le simulateur de patrimoine en haut de page (pas de doublon dans l’encadré)', () => {
    const avantOnglets = html.slice(0, html.indexOf('role="tablist"'));
    expect((avantOnglets.match(/href="\/simulateurs\/patrimoine"/g) ?? []).length).toBe(1);
  });
});
