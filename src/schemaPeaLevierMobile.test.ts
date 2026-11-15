import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaLevier, SchemaPea } from './components/schemas/communs';
import { leverageBars } from './lib/illustrationData';
import { fmtEur } from './lib/finance';

/**
 * Guide « Comment fonctionne le PEA » (et fiche PEA), guide « Investir à crédit » (et fiche Crédit immobilier) :
 * schémas redessinés en viewBox 340 (chantier 112, étape 7, constat du 2026-11-15) : à 375 px, leurs petits textes
 * s'affichaient vers 10 à 11 px. Chaque ligne doit tenir dans le cadre qui la contient (ou dans le dessin), avec 6 unités
 * de marge. Largeur estimée d'un caractère : 0,52 em (texte normal), 0,56 em (gras), comme pour les autres schémas redessinés.
 */
const TAILLES: Record<string, { px: number; em: number }> = {
  'ill-step': { px: 14.5, em: 0.56 },
  'ill-num': { px: 15, em: 0.56 },
  'ill-on-dark ill-num': { px: 15, em: 0.56 },
  'ill-sub': { px: 13, em: 0.52 },
  'ill-total': { px: 14, em: 0.56 },
  'ill-year': { px: 14, em: 0.56 },
};
const rendu = (c: () => unknown) => renderToStaticMarkup(createElement(c as never)).replace(/&#x27;/g, "'");

function textes(svg: string) {
  return [...svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)"( text-anchor="(middle|start)")? class="([\w -]+)">([^<]+)<\/text>/g)].map((m) => ({
    x: Number(m[1]),
    y: Number(m[2]),
    centre: m[4] === 'middle',
    classe: m[5],
    contenu: m[6],
  }));
}

function verifie(svg: string, attendus: number) {
  const cadres = [...svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g)].map((m) => m.slice(1).map(Number));
  const ts = textes(svg);
  expect(ts.length).toBe(attendus);
  for (const t of ts) {
    const taille = TAILLES[t.classe];
    expect(taille, t.classe).toBeDefined();
    const l = t.contenu.length * taille.em * taille.px;
    const [g, d] = t.centre ? [t.x - l / 2, t.x + l / 2] : [t.x, t.x + l];
    const cadre = cadres.find(([cx, cy, w, h]) => t.x > cx && t.x < cx + w && t.y > cy && t.y < cy + h);
    const [gauche, droite] = cadre ? [cadre[0], cadre[0] + cadre[2]] : [0, 340];
    expect(g, t.contenu).toBeGreaterThanOrEqual(gauche + 6);
    expect(d, t.contenu).toBeLessThanOrEqual(droite - 6);
  }
}

describe('schémas PEA et effet de levier lisibles à 375 px', () => {
  for (const [nom, composant] of Object.entries({ SchemaPea, SchemaLevier })) {
    it(`${nom} : viewBox 340, léger et accessible`, () => {
      const svg = rendu(composant);
      expect(svg).toMatch(/viewBox="0 0 340 \d+"/);
      expect(svg).toContain('role="img"');
      expect(svg.length).toBeLessThan(15000);
    });
  }

  it('PEA : chaque texte tient dans son cadre ou dans le dessin', () => {
    const svg = rendu(SchemaPea);
    verifie(svg, 17);
    expect(svg).toContain('Avant 5 ans');
    expect(svg).toContain('Après 5 ans');
    expect(svg).toContain('prélèvements');
  });

  it('effet de levier : les textes tiennent, les montants reprennent le calcul', () => {
    const svg = rendu(SchemaLevier);
    // Dans le dessin, les étiquettes du haut (« Reste », « Manque ») ne sont pas dans un cadre.
    const ts = textes(svg);
    for (const t of ts.filter((x) => x.classe === 'ill-total')) expect(t.x).toBeGreaterThan(0);
    verifie(svg.replace(/<rect x="[\d.]+" y="[\d.]+" width="[\d.]+" height="[\d.]+" rx="4" fill="none"[^>]*>/g, ''), 8);
    // Légende (groupe décalé de 6 unités, textes alignés à gauche à x = 22) : sur deux lignes, dans le dessin.
    for (const l of ['Intérêts du crédit (année 1)', 'Ce qu’il reste']) {
      expect(svg).toContain(`>${l}</text>`);
      expect(6 + 22 + l.length * 0.52 * 13).toBeLessThanOrEqual(334);
    }
    const { bars, interest } = leverageBars();
    for (const b of bars) expect(svg).toContain(fmtEur(b.interestPaid));
    expect(svg).toContain(fmtEur(interest));
  });
});
