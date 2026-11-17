import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Encyclopedia from './pages/Encyclopedia';
import { investments } from './data/investments';

const render = (url: string) => renderToString(createElement(MemoryRouter, { initialEntries: [url] }, createElement(Encyclopedia)));

describe('Encyclopédie : familles sur deux colonnes en écran large', () => {
  it('regroupe toutes les familles dans le conteneur à colonnes, sans perdre de fiche', () => {
    const html = render('/encyclopedie');
    expect((html.match(/class="inv-groups"/g) ?? []).length).toBe(1);
    expect((html.match(/class="inv-row"/g) ?? []).length).toBe(investments.length);
  });
  it('une seule famille affichée garde toute la largeur', () => {
    const html = render('/encyclopedie?cat=epargne');
    expect(html).not.toContain('inv-groups');
    expect(html).toContain('inv-row');
  });
});

describe('Encyclopédie : toutes les familles présentées de la même façon (chantier 165)', () => {
  it('aucune fiche repliée derrière « Voir les N fiches », même pour les familles nombreuses', () => {
    const html = render('/encyclopedie');
    expect(html).not.toMatch(/Voir les \d+ fiches/);
    expect(html).not.toContain('mob-fold');
    for (const i of investments) expect(html).toContain(`href="/encyclopedie/${i.slug}"`);
  });
  it('le compteur ne s’affiche qu’une fois la liste filtrée, et reste annoncé', () => {
    const plain = (h: string) => h.replace(/<!-- -->/g, '');
    expect(plain(render('/encyclopedie'))).toContain(`<p class="sr-only" aria-live="polite">${investments.length} résultats</p>`);
    expect(plain(render('/encyclopedie?q=livret'))).toMatch(/<p class="small muted" aria-live="polite">\d+ résultats?<\/p>/);
  });
});
