import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { GuidePage } from './pages/Guides';
import { guideBySlug, guides } from './data/guides';
import { simFaq } from './data/simFaq';

const plain = (s: string) => s.replace(/[  ]/g, ' ');
const eur = (x: number) => Math.round(x).toLocaleString('fr-FR').replace(/[  ]/g, ' ');

function renderGuide(slug: string) {
  return renderToStaticMarkup(
    createElement(MemoryRouter, { initialEntries: [`/guides/${slug}`] },
      createElement(Routes, null, createElement(Route, { path: '/guides/:slug', element: createElement(GuidePage) }))),
  );
}

describe('guide « Comprendre les intérêts composés »', () => {
  const g = guideBySlug['interets-composes'];
  const texte = plain(g.sections.map((s) => s.body.join(' ')).join(' '));
  const faq = plain((g.faq ?? []).map((f) => f.a).join(' '));

  it('exemples fictifs recalculés', () => {
    expect(eur(10000 * 1.05 ** 10)).toBe('16 289');
    expect(eur(10000 * 1.05 ** 20)).toBe('26 533');
    expect(texte).toContain('environ 16 289 € après 10 ans et 26 533 € après 20 ans');
    const sansFrais = 10000 * 1.05 ** 25;
    const avecFrais = 10000 * (1.05 * 0.99) ** 25; // convention du site : rendement net = (1 + r) × (1 − f) − 1
    expect(eur(sansFrais)).toBe('33 864');
    expect(eur(avecFrais)).toBe('26 340');
    expect(Math.round((1 - avecFrais / sansFrais) * 100)).toBe(22);
    expect(texte).toContain('environ 33 864 € sans frais, mais 26 340 € avec 1 % de frais par an, soit environ 22 % de moins');
    expect(eur(26533 / 1.02 ** 20)).toBe('17 856');
    expect(texte).toContain('vaudront environ 17 856 € d’aujourd’hui');
    expect(faq).toContain('≈ 16 289 €');
    expect(faq).toContain('≈ 17 856 €');
  });

  it('pas de formule dans le texte principal (elles sont dans les questions repliées)', () => {
    expect(texte).not.toMatch(/\^|\(1 \+/);
    expect(faq).toContain('C × (1 + r)^n');
  });
});

describe('pages de guide', () => {
  it('n’affichent que leurs propres questions, jamais celles d’un simulateur au même identifiant', () => {
    for (const g of guides) {
      const html = renderGuide(g.slug);
      for (const f of simFaq[g.slug] ?? []) {
        if (!(g.faq ?? []).some((q) => q.q === f.q)) expect(html).not.toContain(f.q);
      }
      expect(html).not.toContain('class="sim-next"');
      expect(html).not.toContain(`href="/guides/${g.slug}"`);
    }
  });
});
