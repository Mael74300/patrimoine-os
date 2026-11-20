import { createElement, type ComponentType } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Methodologie, { METHODE_RUBRIQUES } from './pages/Methodologie';
import { Confidentialite, MentionsLegales, MENTIONS_RUBRIQUES, confidentialiteRubriques } from './pages/Legal';
import { config } from './config';
import { sectionId } from './lib/toc';

const render = (C: ComponentType) => renderToString(createElement(MemoryRouter, null, createElement(C)));

/** Titres h2 de la page, dans l’ordre, avec leur identifiant. */
function h2s(html: string): { id: string; text: string }[] {
  return [...html.matchAll(/<h2 id="([^"]+)"[^>]*>([^<]+)<\/h2>/g)].map((m) => ({ id: m[1], text: m[2].replace(/&#x27;|&#39;/g, "'") }));
}

describe('Pages de texte : sommaire « Sur cette page »', () => {
  const pages: [string, ComponentType, string[]][] = [
    ['Méthode', Methodologie, METHODE_RUBRIQUES],
    ['Confidentialité', Confidentialite, confidentialiteRubriques(Boolean(config.analytics.goatcounter))],
    ['Mentions légales', MentionsLegales, MENTIONS_RUBRIQUES],
  ];
  for (const [name, Page, rubriques] of pages) {
    it(`${name} : le sommaire reprend toutes les rubriques, dans l’ordre, et chaque lien mène à son titre`, () => {
      const html = render(Page);
      expect(html).toContain('class="page-toc guide-toc"');
      const titres = h2s(html.slice(0, html.indexOf('class="page-toc')));
      expect(titres.map((t) => t.text)).toEqual(rubriques);
      for (const t of titres) {
        expect(t.id).toBe(sectionId(t.text));
        expect(html).toContain(`href="#${t.id}"`);
      }
      expect(new Set(titres.map((t) => t.id)).size).toBe(titres.length);
    });
  }
  it('la rubrique « Mesure d’audience » n’apparaît au sommaire que si la mesure est activée', () => {
    expect(confidentialiteRubriques(false)).not.toContain("Mesure d'audience");
    expect(confidentialiteRubriques(true)).toContain("Mesure d'audience");
  });
});
