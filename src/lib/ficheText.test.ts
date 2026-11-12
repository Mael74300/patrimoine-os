import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { investments, investmentBySlug } from '../data/investments';
import { annotateFiche, checkedParts, ficheParagraphs, leadOfSegments, splitSentences } from './ficheText';
import { isTerm, type JargonSegment } from './jargon';
import { CheckedText } from '../components/ui';

const join = (segs: JargonSegment[]) => segs.map((s) => (typeof s === 'string' ? s : s.text)).join('');
const strip = (html: string) => html.replace(/<span[^>]*class="term-pop"[\s\S]*?<\/button><\/span>/g, '').replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');

describe('Texte des fiches découpé pour le jargon', () => {
  it('chaque rubrique garde son texte mot pour mot', () => {
    for (const inv of investments) {
      const j = annotateFiche(inv);
      const flat = Object.values(j).flat().map(join);
      expect(flat, inv.slug).toEqual(ficheParagraphs(inv));
      expect(checkedParts(inv.tax).join(' ').replace(/\s+/g, ' ')).toBe(splitSentences(inv.tax.text).length < 3 ? inv.tax.text.replace(/\s+/g, ' ') : splitSentences(inv.tax.text).join(' ').replace(/\s+/g, ' '));
    }
  });

  it('l’amorce en gras est coupée au même endroit qu’avant, sans couper un mot souligné', () => {
    const segs: JargonSegment[] = ['Après 8 ans : abattement, puis ', { text: 'PFU', to: '/x' }, ' sur le reste.'];
    const l = leadOfSegments(segs)!;
    expect(join(l.lead)).toBe('Après 8 ans');
    expect(join(l.rest)).toBe(' : abattement, puis PFU sur le reste.');
    expect(leadOfSegments(['Sans amorce, rien.'])).toBeNull();
  });

  it('la rubrique Fiscalité affiche le même texte, avec ou sans jargon expliqué', () => {
    for (const slug of ['cryptomonnaies', 'compte-titres', 'assurance-vie', 'pea']) {
      const inv = investmentBySlug[slug]!;
      const j = annotateFiche(inv);
      const render = (segs?: JargonSegment[][]) => strip(renderToStaticMarkup(createElement(MemoryRouter, null, createElement(CheckedText, { c: inv.tax, split: true, path: `/encyclopedie/${slug}`, segs }))));
      expect(render(j.tax), slug).toBe(render());
    }
  });

  it('fiche Cryptomonnaies : PFU expliqué dans la Fiscalité, FGDR dans les Inconvénients', () => {
    const j = annotateFiche(investmentBySlug['cryptomonnaies']!);
    expect(j.tax.flat().filter(isTerm).map((s) => s.text)).toContain('PFU');
    expect(j.cons.flat().filter(isTerm).map((s) => s.term.term)).toContain('FGDR (Fonds de garantie des dépôts et de résolution)');
  });
});
