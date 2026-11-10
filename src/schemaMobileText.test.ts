import { createElement } from 'react';
// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaAssuranceVie, SchemaDiversificationPrincipe, SchemaDonation, SchemaInterets, SchemaOr, SchemaPtz } from './components/Illustrations';

/**
 * Sur mobile (≤ 480 px), les petits textes des schémas larges (viewBox 420) sont agrandis de 12 à 13,2 unités
 * (.ill-in) et de 13 à 13,6 (.ill-sub). Six schémas ont été redessinés pour que ces textes tiennent :
 * contrôle Playwright des 94 pages à 375 px (aucun texte hors cadre, hors de sa boîte ni superposé).
 * Ces tests figent la géométrie retenue. Largeur moyenne d'un caractère estimée à 0,52 em (police système sans empattement).
 */
const MOBILE_IN = 13.2;
const MOBILE_SUB = 13.6;
const largeur = (texte: string, taille: number) => texte.length * 0.52 * taille;
const svg = (c: () => unknown) => renderToStaticMarkup(createElement(c as never));

describe('textes des schémas agrandis sur mobile', () => {
  it('la règle CSS mobile agrandit .ill-in et .ill-sub des schémas larges', () => {
    const css = readFileSync('src/styles.css', 'utf8');
    expect(css).toContain(`.ill-svg[viewBox^="0 0 420 "] .ill-in { font-size: ${MOBILE_IN}px; }`);
    expect(css).toContain(`.ill-svg[viewBox^="0 0 420 "] .ill-sub { font-size: ${MOBILE_SUB}px; }`);
  });

  it('diversification : « Fonds en euros » tient dans sa case', () => {
    const s = svg(SchemaDiversificationPrincipe);
    const cases = [...s.matchAll(/<rect x="(\d+)" y="\d+" width="(\d+)" height="38"/g)].map((m) => [Number(m[1]), Number(m[2])]);
    expect(cases).toHaveLength(4);
    for (const [x, w] of cases) {
      expect(w).toBeGreaterThanOrEqual(110);
      expect(x + w).toBeLessThanOrEqual(420);
    }
    expect(largeur('Fonds en euros', MOBILE_IN)).toBeLessThan(110 - 8);
  });

  it('intérêts composés : barres assez larges pour « + 16 533 € » et dans le cadre', () => {
    const s = svg(SchemaInterets);
    const barres = [...s.matchAll(/<rect x="([\d.]+)" y="[\d.]+" width="(\d+)"/g)].filter((m) => m[2] === '84');
    expect(barres.length).toBeGreaterThanOrEqual(8);
    for (const m of barres) expect(Number(m[1]) + 84).toBeLessThanOrEqual(420);
    expect(s).toMatch(/\+ 16[\s\u202f\u00a0]533/);
  });

  it('or : la phrase du bas est coupée en deux lignes, dans le cadre', () => {
    const s = svg(SchemaOr);
    expect(s).toContain('viewBox="0 0 420 228"');
    expect(s).toContain('>Même taxe dans les deux cas :</text>');
    expect(s).toMatch(/>11,5 % du prix de vente de [\d\s ]+€<\/text>/);
  });

  it('assurance-vie : la case du haut contient « sur un contrat d’assurance-vie »', () => {
    const s = svg(SchemaAssuranceVie);
    expect(s).toContain('<rect x="90" y="2" width="240"');
    expect(largeur('sur un contrat d\'assurance-vie', MOBILE_SUB)).toBeLessThan(240 - 8);
  });

  it('PTZ : « Au plus » et « 25 ans » ne se chevauchent pas', () => {
    const s = svg(SchemaPtz);
    const y1 = Number(/y="(\d+)" class="ill-sub">Au plus</.exec(s)?.[1]);
    const y2 = Number(/y="(\d+)" class="ill-sub">25 ans</.exec(s)?.[1]);
    expect(y2 - y1).toBeGreaterThanOrEqual(MOBILE_SUB + 4);
  });

  it('donation : les trois lignes de chaque parent sont espacées d’au moins une hauteur de texte', () => {
    const s = svg(SchemaDonation);
    const ys = [...s.matchAll(/<text x="102" y="(\d+)"/g)].map((m) => Number(m[1]));
    expect(ys).toHaveLength(8);
    for (let i = 1; i < 4; i++) expect(ys[i] - ys[i - 1]).toBeGreaterThanOrEqual(MOBILE_SUB + 4);
  });
});
