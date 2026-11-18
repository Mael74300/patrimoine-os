import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { ENVELOPE_CARDS, EnvelopeCards, envelopeParagraph } from './components/EnvelopeCards';
import { guideBySlug } from './data/guides';
import { investmentBySlug } from './data/investments';
import { ENVELOPE_CLOCK, SchemaHorlogesEnveloppes } from './components/schemas/guides';

describe('guide « choisir son enveloppe » : cartes des enveloppes', () => {
  const g = guideBySlug['choisir-son-enveloppe'];
  const section = g.sections.find((s) => s.heading === 'Les grandes différences')!;

  it('chaque ligne de carte reprend mot pour mot le paragraphe du guide', () => {
    expect(section.body).toHaveLength(ENVELOPE_CARDS.length);
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

describe('guide « choisir son enveloppe » : comment les combiner (chantier 185)', () => {
  const g = guideBySlug['choisir-son-enveloppe'];
  const combiner = g.sections.find((s) => s.heading === 'Comment les combiner')!;
  const texte = combiner.body.join(' ');
  const cartes = ENVELOPE_CARDS.flatMap((c) => c.rows.map((r) => r.text)).join(' ');

  it('la rubrique tient la promesse du chapeau et garde l’épargne de précaution en premier', () => {
    expect(g.summary).toContain('comment les combiner');
    expect(combiner.body[1]).toContain('épargne de précaution');
    expect(texte).toContain('peuvent justifier d’autres choix');
  });
  it('les durées du schéma sont celles du texte et des cartes', () => {
    const [livrets, pea, av, per] = ENVELOPE_CLOCK;
    expect(livrets.rule).toContain('à tout moment');
    expect(pea.when).toBe('Après 5 ans');
    expect(texte).toContain('Les 5 ans du PEA comptent à partir du premier versement');
    expect(cartes).toContain('après 5 ans, pas d’impôt sur le revenu sur les gains');
    expect(av.when).toBe('Après 8 ans');
    expect(cartes).toContain('après 8 ans, abattement annuel');
    expect(per.when).toBe('À la retraite');
    expect(cartes).toContain('argent bloqué jusqu’à la retraite, sauf déblocage anticipé');
  });
  it('le schéma est accessible et ne montre aucun montant', () => {
    const svg = renderToStaticMarkup(createElement(SchemaHorlogesEnveloppes));
    expect(svg).toContain('role="img"');
    expect(svg).toContain('<desc');
    expect(svg).not.toMatch(/€|%/);
    for (const r of ENVELOPE_CLOCK) expect(svg).toContain(r.name);
    expect(svg).toContain('ni plafond ni délai');
  });
});
