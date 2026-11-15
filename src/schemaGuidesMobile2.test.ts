import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaImmoEtf, SchemaInflation, SchemaMensualite } from './components/schemas/guides';
import { inflationBars, loanSlices } from './lib/illustrationData';

/**
 * Guides Investir à crédit, Comment comparer immobilier et ETF et Inflation : schémas redessinés en viewBox 340
 * (2026-11-15) pour que leurs textes s'affichent à 12 px et plus à 375 px (contre ~11,2 px en viewBox 420).
 * Ces tests figent la géométrie retenue. Largeur moyenne d'un caractère estimée à 0,52 em (police système sans empattement).
 */
const largeur = (texte: string, taille: number) => texte.length * 0.52 * taille;
const svg = (c: () => unknown) => renderToStaticMarkup(createElement(c as never));
const rects = (s: string) => [...s.matchAll(/<rect( x="([\d.]+)")?( y="[\d.]+")? width="([\d.]+)"/g)].map((m) => [Number(m[2] ?? 0), Number(m[4])]);
const textes = (s: string, cls: string) => [...s.matchAll(new RegExp(`class="${cls}"[^>]*>([^<]+)</text>`, 'g'))].map((m) => m[1]);

describe('schémas des guides en viewBox 340 (suite)', () => {
  it('mensualité : trois barres dans le cadre, chiffres de l’exemple inchangés, légende sur deux lignes', () => {
    const s = svg(SchemaMensualite);
    expect(s).toContain('viewBox="0 0 340 ');
    expect(s).not.toContain('viewBox="0 0 420');
    for (const [x, w] of rects(s)) expect(x + w).toBeLessThanOrEqual(340);
    const { monthly, slices } = loanSlices();
    expect(Math.round(monthly * 12)).toBe(12527);
    expect(slices.map((t) => Math.round(t.interest))).toEqual([6199, 3860, 234]);
    expect(s).toMatch(/12[\s  ]527/);
    expect(largeur('12 527 €', 14)).toBeLessThan(76);
    expect(10 + 22 + largeur('Intérêts (le prix du crédit)', 13)).toBeLessThan(340);
    expect(s.length).toBeLessThan(15000);
  });

  it('inflation : quatre barres et leurs étiquettes dans le cadre, mêmes résultats', () => {
    const s = svg(SchemaInflation);
    expect(s).toContain('viewBox="0 0 340 ');
    for (const [x, w] of rects(s)) expect(x + w).toBeLessThanOrEqual(340);
    const [idle, placed] = inflationBars();
    expect([idle.shown, idle.real, placed.shown, placed.real].map(Math.round)).toEqual([10000, 8203, 13439, 11025]);
    // étiquettes de bas de barre centrées sur 86 et 254
    expect(largeur('Laissée telle quelle', 14) / 2).toBeLessThan(86);
    expect(254 + largeur('Placée à 3 % par an', 14) / 2).toBeLessThan(340);
    expect(10 + 22 + largeur('Valeur en euros d’aujourd’hui', 13)).toBeLessThan(340);
  });

  it('immobilier ou ETF : deux colonnes de 164, chaque ligne tient dans sa carte, sans chiffre', () => {
    const s = svg(SchemaImmoEtf);
    expect(s).toContain('viewBox="0 0 340 ');
    for (const [x, w] of rects(s)) expect(x + w).toBeLessThanOrEqual(340);
    const lignes = textes(s, 'ill-in');
    expect(lignes).toHaveLength(8);
    for (const l of lignes) expect(largeur(l, 12)).toBeLessThan(164 - 16);
    for (const l of textes(s, 'ill-step')) expect(largeur(l, 14.5)).toBeLessThan(300);
    for (const l of textes(s, 'ill-sub')) expect(largeur(l, 13)).toBeLessThan(330);
    expect(s).not.toMatch(/\d\s?(%|€)/);
  });
});
