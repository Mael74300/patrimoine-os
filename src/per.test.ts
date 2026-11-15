import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaPer } from './components/Illustrations';
import { investmentBySlug } from './data/investments';
import { checkedParts } from './lib/ficheText';
import { sentenceLead } from './lib/sentenceLead';

describe('schéma « PER »', () => {
  const svg = renderToStaticMarkup(createElement(SchemaPer));
  const fiche = investmentBySlug['per'];

  it('reprend les règles de la fiche (déduction, blocage, sortie imposée)', () => {
    expect(fiche.howItWorks).toContain('déduits du revenu imposable');
    expect(fiche.howItWorks).toContain('bloquée jusqu’à la retraite');
    expect(fiche.howItWorks).toContain('en capital, en rente');
    expect(svg).toContain('déductible du revenu imposable');
    expect(svg).toContain('épargne bloquée');
    expect(svg).toContain('rente viagère');
    expect(svg).toContain('La sortie est imposée');
  });
  it('ne contient aucun chiffre (principe qualitatif)', () => {
    const texte = svg.replace(/<[^>]+>/g, ' ').replace(/ill-per-[td]|1\.|2\.|3\./g, '');
    expect(texte).not.toMatch(/\d/);
  });
  it('reste léger et accessible', () => {
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
  });
  it('est dessiné en viewBox 340, lisible à 375 px', () => {
    expect(svg).toContain('viewBox="0 0 340 ');
  });
});

describe('fiche PER : carte Fiscalité en points courts', () => {
  const parts = checkedParts(investmentBySlug['per'].tax);
  it('chaque point commence par un repère en gras', () => {
    expect(parts.map((p) => sentenceLead(p)?.lead)).toEqual([
      'À l’entrée', 'Plafond de déduction', 'Plafond non utilisé', 'Après 70 ans', 'À la sortie en capital', 'Déblocage anticipé',
    ]);
  });
  it('aucun point ne dépasse 260 caractères', () => {
    for (const p of parts) expect(p.length, p).toBeLessThanOrEqual(260);
  });
});
