import { createElement } from 'react';
// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaOr, SchemaPtz } from './components/Illustrations';

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

  // Diversification (principe et exemple) et intérêts composés : schémas redessinés en viewBox 340 le 2026-11-15,
  // contrôlés par schemaGuidesMobile.test.ts.

  it('or : la phrase du bas est coupée en deux lignes, dans le cadre', () => {
    const s = svg(SchemaOr);
    expect(s).toContain('viewBox="0 0 420 228"');
    expect(s).toContain('>Même taxe dans les deux cas :</text>');
    expect(s).toMatch(/>11,5 % du prix de vente de [\d\s ]+€<\/text>/);
  });

  // Assurance-vie : schéma redessiné en viewBox 340 le 2026-11-15, contrôlé par schemaAssuranceVieMobile.test.ts.

  it('PTZ : « Au plus » et « 25 ans » ne se chevauchent pas', () => {
    const s = svg(SchemaPtz);
    const y1 = Number(/y="(\d+)" class="ill-sub">Au plus</.exec(s)?.[1]);
    const y2 = Number(/y="(\d+)" class="ill-year">25 ans</.exec(s)?.[1]);
    expect(y2 - y1).toBeGreaterThanOrEqual(MOBILE_SUB + 4);
  });

  // Donation : schéma redessiné en viewBox 340 le 2026-11-15, contrôlé par schemaDonationCtoMobile.test.ts.
});
