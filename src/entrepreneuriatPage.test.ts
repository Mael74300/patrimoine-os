import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Entrepreneuriat from './pages/Entrepreneuriat';

/**
 * Page Entrepreneuriat (menu principal) : cartes en mots de tous les jours
 * et action principale (le calculateur) en bouton visible, pas en lien perdu dans un encadré.
 */
describe('Page Entrepreneuriat : lisible par un débutant, action principale visible', () => {
  const html = renderToString(createElement(MemoryRouter, { initialEntries: ['/entrepreneuriat'] }, createElement(Entrepreneuriat)));
  const text = html.replace(/<[^>]+>/g, ' ');

  it('aucun mot d’initié laissé seul dans les trois cartes', () => {
    for (const mot of ['désabonnement', 'cédant', 'une cible', 'récurrent', 'auditer', 'Valoriser', 'un actif']) {
      expect(text).not.toContain(mot);
    }
  });

  it('le calculateur entrepreneurial est proposé par un bouton, une seule fois', () => {
    const boutons = html.match(/<a[^>]*class="btn"[^>]*href="\/simulateurs\/entreprise"|<a[^>]*href="\/simulateurs\/entreprise"[^>]*class="btn"/g) ?? [];
    expect(boutons.length).toBe(1);
    expect((html.match(/href="\/simulateurs\/entreprise"/g) ?? []).length).toBe(1);
    expect(text).toContain('pessimiste,');
  });
});
