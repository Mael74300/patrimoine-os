import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaCto, SchemaDonation } from './components/Illustrations';

/**
 * Fiches Donation et Compte-titres : schémas redessinés en viewBox 340 (chantier 112, étape 6, constat du 2026-11-15) :
 * à 375 px, ils affichaient leurs petits textes vers 11,2 px. Chaque ligne doit tenir dans le cadre qui la contient
 * (ou dans le dessin), avec 6 unités de marge. Largeur estimée d'un caractère : 0,52 em (texte normal), 0,56 em (gras),
 * comme pour les autres schémas redessinés.
 */
const TAILLES: Record<string, { px: number; em: number }> = {
  'ill-step': { px: 14.5, em: 0.56 },
  'ill-num': { px: 15, em: 0.56 },
  'ill-sub': { px: 13, em: 0.52 },
  'ill-on-dark ill-total': { px: 14, em: 0.56 },
};
const rendu = (c: () => unknown) => renderToStaticMarkup(createElement(c as never)).replace(/&#x27;/g, "'");

function textes(svg: string) {
  return [...svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)"( text-anchor="middle")? class="([\w -]+)">([^<]+)<\/text>/g)].map((m) => ({
    x: Number(m[1]),
    y: Number(m[2]),
    centre: Boolean(m[3]),
    classe: m[4],
    contenu: m[5],
  }));
}

describe('fiches Donation et Compte-titres : schémas lisibles à 375 px', () => {
  for (const [nom, composant] of Object.entries({ SchemaDonation, SchemaCto })) {
    const svg = rendu(composant);
    it(`${nom} : viewBox 340, léger et accessible`, () => {
      expect(svg).toMatch(/viewBox="0 0 340 \d+"/);
      expect(svg).toContain('role="img"');
      expect(svg).toContain('fictif');
      expect(svg.length).toBeLessThan(15000);
    });
  }

  it('Donation : chaque texte tient dans son cadre (ou dans le dessin)', () => {
    const svg = rendu(SchemaDonation);
    const cadres = [...svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g)].map((m) => m.slice(1).map(Number));
    const ts = textes(svg);
    expect(ts.length).toBe(17);
    for (const t of ts) {
      const taille = TAILLES[t.classe];
      expect(taille, t.classe).toBeDefined();
      expect(t.centre).toBe(true);
      const demi = (t.contenu.length * taille.em * taille.px) / 2;
      const cadre = cadres.find(([cx, cy, w, h]) => t.x > cx && t.x < cx + w && t.y > cy && t.y < cy + h);
      const [gauche, droite] = cadre ? [cadre[0], cadre[0] + cadre[2]] : [0, 340];
      expect(t.x - demi, t.contenu).toBeGreaterThanOrEqual(gauche + 6);
      expect(t.x + demi, t.contenu).toBeLessThanOrEqual(droite - 6);
    }
  });

  it('Donation : les deux parents côte à côte gardent un écart et restent dans le dessin', () => {
    const svg = rendu(SchemaDonation);
    expect(svg).toMatch(/<rect x="4" y="4" width="156"/);
    expect(svg).toMatch(/<rect x="180" y="4" width="156"/);
  });

  it('Compte-titres : chaque texte tient dans le dessin, les deux colonnes ne se chevauchent pas', () => {
    const svg = rendu(SchemaCto);
    const ts = textes(svg);
    expect(ts.length).toBe(9);
    const col2 = Math.max(...ts.filter((t) => !t.centre).map((t) => t.x));
    for (const t of ts) {
      const taille = TAILLES[t.classe];
      expect(taille, t.classe).toBeDefined();
      const l = t.contenu.length * taille.em * taille.px;
      const [g, d] = t.centre ? [t.x - l / 2, t.x + l / 2] : [t.x, t.x + l];
      expect(g, t.contenu).toBeGreaterThanOrEqual(6);
      expect(d, t.contenu).toBeLessThanOrEqual(334);
      // Colonne de gauche sous la barre : ne déborde pas sur la colonne de droite.
      if (!t.centre && t.x < col2 && t.y > 100) expect(d, t.contenu).toBeLessThanOrEqual(col2 - 8);
    }
  });
});
