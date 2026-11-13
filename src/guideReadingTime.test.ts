import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { guides } from './data/guides';
import { GuidePage } from './pages/Guides';
import { countWords, readingMinutes, readingMinutesExact } from './lib/readingTime';

/** Texte affiché du guide, du titre aux questions fréquentes (sans le sommaire ni « Pour aller plus loin »). */
function guideText(slug: string): string {
  const html = renderToString(h(MemoryRouter, { initialEntries: [`/guides/${slug}`] }, h(Routes, null, h(Route, { path: '/guides/:slug', element: h(GuidePage) }))));
  const start = html.indexOf('class="prose"');
  const ends = [html.indexOf('class="guide-toc"'), html.indexOf('Pour aller plus loin')].filter((i) => i > start);
  const prose = html.slice(start, Math.min(...ends));
  return prose.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ');
}

describe('Durée de lecture des guides', () => {
  it('compte les mots et arrondit à la minute', () => {
    expect(countWords('Un ETF : 10 000 € — fin.')).toBe(5);
    expect(readingMinutes(90)).toBe(1);
    expect(readingMinutes(450)).toBe(2);
    expect(readingMinutes(520)).toBe(3);
  });

  it('chaque guide annonce une durée qui correspond à son texte réel', () => {
    for (const g of guides) {
      const words = countWords(guideText(g.slug));
      expect(words, g.slug).toBeGreaterThan(150);
      const exact = readingMinutesExact(words);
      // Tolérance d'arrondi seulement : jamais plus d'une minute d'écart avec le texte affiché.
      expect(g.readingMinutes, `${g.slug} : ${words} mots, ${exact.toFixed(2)} min`).toBeGreaterThanOrEqual(Math.max(1, Math.floor(exact)));
      expect(g.readingMinutes, `${g.slug} : ${words} mots, ${exact.toFixed(2)} min`).toBeLessThanOrEqual(Math.max(1, Math.ceil(exact)));
    }
  });
});
