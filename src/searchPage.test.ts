import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import SearchPage from './pages/SearchPage';

const render = (url: string) => renderToString(createElement(MemoryRouter, { initialEntries: [url] }, createElement(SearchPage)));

describe('Page de recherche', () => {
  it('sans résultat, propose des points de départ et n’affiche pas de liste vide', () => {
    const html = render('/recherche');
    expect(html).toContain('search-ideas');
    expect(html).not.toContain('inv-list');
  });
  it('avec des résultats, affiche la liste', () => {
    const html = render('/recherche?q=PEA');
    expect(html).toContain('inv-list');
  });
  it('affiche les dix premiers résultats et un bouton pour les autres', () => {
    const html = render('/recherche?q=impots');
    expect((html.match(/class="inv-row"/g) ?? []).length).toBe(10);
    expect(html).toMatch(/Voir les \d+ autres résultats/);
  });
  it('signale quand aucune page ne contient tous les mots', () => {
    expect(render('/recherche?q=combien%20de%20temps%20durera%20mon%20capital')).toContain('voici les plus proches');
  });
});
