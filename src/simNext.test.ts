import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { SIM_NEXT_VISIBLE, SimNext } from './components/ui';
import { nextForSimulator, readingForSimulator } from './lib/relatedSims';

const render = (slug: string) => renderToString(createElement(MemoryRouter, null, createElement(SimNext, { slug })));

describe('« Pour aller plus loin » en bas des simulateurs (chantier 149)', () => {
  it('même rubrique et même grille que les fiches et les guides', () => {
    const html = render('budget');
    expect(html).toContain('<h2 id="rub-pour-aller-plus-loin">Pour aller plus loin</h2>');
    expect(html).toContain('class="next-list"');
    expect(html).toContain('class="next-kind"');
  });
  it('les deux premières pistes sont visibles, la suite repliée nomme chaque page ; jamais de repli pour une seule page', () => {
    for (const slug of Object.keys(nextForSimulator)) {
      const links = readingForSimulator(slug);
      const html = render(slug);
      for (const l of links) expect(html, `${slug} ${l.to}`).toContain(`href="${l.to}"`);
      const rest = links.length <= SIM_NEXT_VISIBLE + 1 ? [] : links.slice(SIM_NEXT_VISIBLE);
      expect(html, slug).not.toContain('Une autre page liée');
      if (!rest.length) { expect(html, slug).not.toContain('next-more'); continue; }
      const fold = html.slice(html.indexOf('<details'));
      expect(fold, slug).toContain(`${rest.length} autres pages liées`);
      for (const l of rest) expect(fold, `${slug} ${l.to}`).toContain(`href="${l.to}"`);
      for (const l of links.slice(0, SIM_NEXT_VISIBLE)) expect(fold, `${slug} ${l.to}`).not.toContain(`href="${l.to}"`);
    }
  });
  it('une fiche citée affiche son résumé', () => {
    const html = render('budget');
    expect(html).toContain('Livrets réglementés, sans risque, disponibles à tout moment et non imposés.');
  });
});
