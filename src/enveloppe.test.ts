import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SchemaEnveloppe } from './components/Illustrations';
import { GuidePage } from './pages/Guides';
import { guideBySlug } from './data/guides';

const renderGuide = (slug: string) => renderToStaticMarkup(
  createElement(MemoryRouter, { initialEntries: [`/guides/${slug}`] },
    createElement(Routes, null, createElement(Route, { path: '/guides/:slug', element: createElement(GuidePage) }))),
);

describe('schéma « placement et enveloppe »', () => {
  const svg = renderToStaticMarkup(createElement(SchemaEnveloppe));
  const g = guideBySlug['choisir-son-enveloppe'];
  const texte = g.sections.map((s) => [s.heading, ...s.body].join(' ')).join(' ');

  it('le guide « Choisir son enveloppe » a la section d’ouverture qui porte le schéma, et les enveloppes dessinées y sont citées', () => {
    expect(g.sections.some((s) => s.heading.startsWith('Placement et enveloppe'))).toBe(true);
    expect(g.sections[0].body.join(' ')).toContain('l’enveloppe détermine la fiscalité, la disponibilité et la transmission');
    ['PEA', 'compte-titres', 'assurance-vie', 'PER'].forEach((e) => expect(texte.toLowerCase()).toContain(e.toLowerCase()));
    ['PEA', 'Compte-titres', 'Assurance-vie', 'PER'].forEach((e) => expect(svg).toContain(e));
  });
  it('ne contient aucun chiffre et reste léger et accessible', () => {
    expect(svg.replace(/<[^>]+>/g, ' ').match(/\d/)).toBeNull();
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
  });
  it('n’est dessiné qu’une fois : dans « Choisir son enveloppe », pas dans « Types d’investissements » qui y renvoie (chantier 200)', () => {
    const marque = 'Le placement : un ETF';
    expect(renderGuide('choisir-son-enveloppe').split(marque).length - 1).toBe(1);
    const types = renderGuide('types-investissements');
    expect(types).not.toContain(marque);
    const section = guideBySlug['types-investissements'].sections.find((s) => s.heading.startsWith('Placement et enveloppe'));
    expect(section?.body.join(' ')).toContain('l’enveloppe détermine la fiscalité, la disponibilité et la transmission');
    expect(types).toContain('href="/guides/choisir-son-enveloppe"');
  });
});

describe('guide Types d’investissements : « Pour aller plus loin » (chantier 200)', () => {
  it('propose la suite du parcours : choisir son enveloppe, comparer, répartir ; « Autres guides » ne la répète pas', () => {
    const html = renderGuide('types-investissements');
    const suite = html.slice(html.indexOf('id="rub-pour-aller-plus-loin"'), html.indexOf('id="rub-sources"'));
    const liens = [...suite.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    expect(liens).toEqual(['/guides/choisir-son-enveloppe', '/comparateur', '/simulateurs/portefeuille']);
    expect(suite).not.toContain('autres pages liées');
    expect(html.split('href="/guides/choisir-son-enveloppe"').length - 1).toBe(2); // lien dans le texte et carte, pas dans « Autres guides »
  });
});
