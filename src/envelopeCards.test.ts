import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { ENVELOPE_CARDS, EnvelopeCards, envelopeParagraph } from './components/EnvelopeCards';
import { guideBySlug } from './data/guides';
import { investmentBySlug } from './data/investments';

describe('guide « choisir son enveloppe » : cartes des enveloppes', () => {
  const g = guideBySlug['choisir-son-enveloppe'];
  const section = g.sections.find((s) => s.heading === 'Les grandes différences')!;

  it('chaque ligne de carte reprend mot pour mot le paragraphe du guide', () => {
    expect(section.body).toHaveLength(ENVELOPE_CARDS.length + 1);
    expect(section.body.at(-1)).toContain('épargne de précaution');
    for (const c of ENVELOPE_CARDS) {
      const p = section.body[c.paragraph];
      expect(p.startsWith(c.name + ' :')).toBe(true);
      const norm = (t: string) => t.replace(/[\u00a0\u202f]/g, ' ');
      expect(norm(p)).toBe(norm(envelopeParagraph(c)));
      expect(c.rows.map((r) => r.label)).toEqual(['Versements', 'Retraits', 'Impôts']);
    }
  });
  it('le mot « rachat » et le sigle PFU sont expliqués sur place', () => {
    const texte = section.body.join(' ');
    expect(texte).toContain('Retraits : possibles, en tout ou en partie (on parle de « rachat »)');
    expect(texte).toContain('prélèvement forfaitaire unique (PFU, ou « flat tax »)');
  });
  it('les cartes renvoient vers des fiches qui existent', () => {
    for (const c of ENVELOPE_CARDS) expect(investmentBySlug[c.to.split('/').pop()!]).toBeDefined();
  });
  it('le rendu contient chaque chiffre du texte', () => {
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(EnvelopeCards))).replace(/\u00a0/g, ' ');
    for (const k of ['150 000 €', '5 ans', '8 ans', '4 600 €', '9 200 €', '31,4 % en 2026', '12,8 %', '18,6 %', '70 ans']) expect(html).toContain(k);
  });
});
