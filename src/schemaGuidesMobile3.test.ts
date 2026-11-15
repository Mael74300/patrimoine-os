import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaEnveloppe } from './components/schemas/guides';
import { SchemaSeparer } from './components/schemas/SchemaSeparer';
import { SchemaVerification } from './components/schemas/SchemaVerification';

/**
 * Guides Choisir son enveloppe et Types d’investissements, pages Entrepreneuriat et Méthode : schémas sans chiffre
 * redessinés en viewBox 340 (2026-11-15) pour que leurs textes s'affichent à 12 px et plus à 375 px (contre ~11,2 px
 * en viewBox 420). Ces tests figent la géométrie retenue. Largeur moyenne d'un caractère estimée à 0,52 em.
 */
const largeur = (texte: string, taille: number) => texte.length * 0.52 * taille;
const svg = (c: () => unknown) => renderToStaticMarkup(createElement(c as never));
const rects = (s: string) => [...s.matchAll(/<rect x="([\d.]+)" y="[\d.]+" width="([\d.]+)"/g)].map((m) => [Number(m[1]), Number(m[2])]);
const textes = (s: string, cls: string) => [...s.matchAll(new RegExp(`class="${cls}"[^>]*>([^<]+)</text>`, 'g'))].map((m) => m[1]);
const TAILLE: Record<string, number> = { 'ill-step': 14.5, 'ill-in': 12, 'ill-sub': 13 };

describe('schémas sans chiffre en viewBox 340', () => {
  for (const [nom, C] of [['enveloppe', SchemaEnveloppe], ['séparer entreprise et patrimoine', SchemaSeparer], ['contrôle des informations', SchemaVerification]] as const) {
    it(`${nom} : viewBox 340, cadres et textes dans le dessin, aucun chiffre, léger`, () => {
      const s = svg(C);
      expect(s).toContain('viewBox="0 0 340 ');
      expect(s).not.toContain('viewBox="0 0 420');
      const r = rects(s);
      expect(r.length).toBeGreaterThan(0);
      for (const [x, w] of r) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x + w).toBeLessThanOrEqual(340);
      }
      for (const cls of Object.keys(TAILLE)) for (const t of textes(s, cls)) expect(largeur(t, TAILLE[cls])).toBeLessThan(330);
      expect(s.replace(/<[^>]+>/g, ' ').match(/\d/)).toBeNull();
      expect(s.length).toBeLessThan(15000);
    });
  }

  it('enveloppe : les noms des enveloppes tiennent dans leurs cartes de 158', () => {
    const s = svg(SchemaEnveloppe);
    expect(rects(s).filter(([, w]) => w === 158)).toHaveLength(4);
    for (const t of ['PEA', 'Compte-titres', 'Assurance-vie', 'PER']) expect(largeur(t, 14.5)).toBeLessThan(158 - 16);
    expect(largeur('le même ETF', 12)).toBeLessThan(100 - 12);
  });

  it('contrôle : chaque ligne tient dans sa carte', () => {
    const s = svg(SchemaVerification);
    expect(largeur('chaque semaine', 13)).toBeLessThan(118 - 8);
    for (const t of ['officielle,', 'consultée', 'datée, avec', 'ses sources']) expect(largeur(t, 13)).toBeLessThan(100 - 8);
    expect(s).toContain('>et signalée « à vérifier »</text>');
  });

  it('séparer : « Assurance-vie » tient dans sa case de 104', () => {
    const s = svg(SchemaSeparer);
    expect(rects(s).filter(([, w]) => w === 104)).toHaveLength(3);
    expect(largeur('Assurance-vie', 12)).toBeLessThan(104 - 12);
  });
});
