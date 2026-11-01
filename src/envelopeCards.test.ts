import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { ENVELOPE_CARDS, EnvelopeCards } from './components/EnvelopeCards';
import { guideBySlug } from './data/guides';
import { investmentBySlug } from './data/investments';

describe('guide « choisir son enveloppe » : cartes des enveloppes', () => {
  const g = guideBySlug['choisir-son-enveloppe'];
  const section = g.sections.find((s) => s.heading === 'Les grandes différences')!;

  it('chaque ligne de carte reprend mot pour mot le paragraphe du guide', () => {
    expect(ENVELOPE_CARDS).toHaveLength(section.body.length);
    for (const c of ENVELOPE_CARDS) {
      const p = section.body[c.paragraph];
      expect(p.startsWith(c.name + ' :')).toBe(true);
      for (const r of c.rows) expect(p).toContain(r.text);
    }
  });
  it('les cartes renvoient vers des fiches qui existent', () => {
    for (const c of ENVELOPE_CARDS) expect(investmentBySlug[c.to.split('/').pop()!]).toBeDefined();
  });
  it('le rendu contient chaque chiffre du texte', () => {
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(EnvelopeCards)));
    for (const k of ['150 000 €', '5 ans', '8 ans', '31,4 % en 2026']) expect(html).toContain(k);
  });
});
