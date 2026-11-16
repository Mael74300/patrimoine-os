import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { guideBySlug } from './data/guides';
import { investments } from './data/investments';
import { guidesForInvestment, simsForInvestment, simulateTarget } from './lib/relatedSims';
import InvestmentPage from './pages/InvestmentPage';

const render = (slug: string) => renderToString(createElement(MemoryRouter, { initialEntries: [`/encyclopedie/${slug}`] },
  createElement(Routes, null, createElement(Route, { path: '/encyclopedie/:slug', element: createElement(InvestmentPage) }))));

describe('Fiches : suites logiques', () => {
  it('« Simuler » ouvre le simulateur principal du placement, le catalogue seulement s’il n’y en a pas', () => {
    for (const inv of investments) {
      const t = simulateTarget(inv.slug);
      const main = simsForInvestment[inv.slug]?.[0];
      expect(t.to, inv.slug).toBe(main ? `/simulateurs/${main}` : '/simulateurs');
    }
    expect(simulateTarget('credit-immobilier').to).toBe('/simulateurs/credit');
    expect(simulateTarget('livret-a').to).toBe('/simulateurs/epargne-de-precaution');
    // Seule la fiche Donation n’a pas de simulateur adapté.
    expect(investments.filter((i) => simulateTarget(i.slug).to === '/simulateurs').map((i) => i.slug)).toEqual(['donation']);
  });
  it('trois simulateurs, deux guides et quatre cartes au plus par fiche, existants et sans doublon', () => {
    for (const [slug, list] of Object.entries(simsForInvestment)) {
      expect(list.length, slug).toBeLessThanOrEqual(3);
      expect(list.length + (guidesForInvestment[slug]?.length ?? 0), slug).toBeLessThanOrEqual(4);
    }
    for (const [slug, list] of Object.entries(guidesForInvestment)) {
      expect(investments.some((i) => i.slug === slug), slug).toBe(true);
      expect(list.length).toBeLessThanOrEqual(2);
      expect(new Set(list).size).toBe(list.length);
      for (const g of list) expect(guideBySlug[g], g).toBeDefined();
    }
  });
  it('la fiche montre « Pour aller plus loin » (simulateurs, guides, placements) avant les sources', () => {
    const html = render('credit-immobilier');
    const at = (s: string) => html.indexOf(s);
    // Bouton « Simuler » : repères mobiles, « En bref » et sommaire qui suit la lecture (grand écran).
    expect(html.match(/href="\/simulateurs\/credit"[^>]*>Simuler</g)?.length).toBe(3);
    expect(html).not.toContain('href="/simulateurs">Simuler<');
    expect(at('>Pour aller plus loin</h2>')).toBeGreaterThan(at('>Exemple chiffré</h2>'));
    expect(at('>Pour aller plus loin</h2>')).toBeLessThan(at('>Sources et vérification</h2>'));
    // Une seule grille étiquetée : simulateur principal, guide qui explique, puis placements comparables.
    expect(at('>Simulateur</span>')).toBeGreaterThan(at('>Pour aller plus loin</h2>'));
    expect(html.search(/>Guide<\/span><a [^>]*href="\/guides\/investir-a-credit"/)).toBeGreaterThan(at('>Simulateur</span>'));
    expect(at('>Placement comparable</span>')).toBeGreaterThan(at('>Guide</span>'));
    expect(html).not.toContain('Placements comparables</h3>');
  });
  it('quatre cartes visibles au plus, la suite repliée, aucune suite perdue (chantier 144)', () => {
    for (const inv of investments) {
      const html = render(inv.slug);
      const bloc = html.slice(html.indexOf('>Pour aller plus loin</h2>'), html.indexOf('>Sources et vérification</h2>'));
      const avant = bloc.split('<details')[0];
      expect((avant.match(/<li>/g) ?? []).length, inv.slug).toBeLessThanOrEqual(4);
      expect((avant.match(/<li>/g) ?? []).length, inv.slug).toBeGreaterThan(0);
      const cibles = [
        ...(simsForInvestment[inv.slug] ?? []).map((s) => `/simulateurs/${s}`),
        ...(guidesForInvestment[inv.slug] ?? []).map((g) => `/guides/${g}`),
        ...inv.alternatives.filter((a) => investments.some((i) => i.slug === a)).map((a) => `/encyclopedie/${a}`),
      ];
      for (const c of cibles) expect(bloc, `${inv.slug} → ${c}`).toContain(`href="${c}"`);
    }
  });
});

describe('Fiches : cadre « En bref » sans redite', () => {
  it('la mention des échelles indicatives n’est plus répétée sous les boutons : « Comment lire ces repères ? » la donne', () => {
    const html = render('assurance-vie');
    expect(html).not.toContain('Échelles de 1 à 5 attribuées par la rédaction');
    expect(html).toContain('Notes de 1 à 5 attribuées par Patrimoine OS');
  });
});
