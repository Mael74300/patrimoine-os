import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaCpf, SchemaObjetsArt, SchemaOr, SchemaUniteDeCompte } from './components/Illustrations';

/**
 * Fiches Or, Unités de compte, Objets d’art et Formation (CPF) : derniers schémas de fiche redessinés en viewBox 340
 * (chantier 112, étape 12, constat du 2026-11-16) : à 375 px, ils affichaient leurs petits textes vers 11,2 px.
 * Chaque ligne doit tenir dans le cadre qui la contient (ou dans le dessin), avec 6 unités de marge.
 * Largeur estimée d'un caractère : 0,52 em (texte normal), 0,56 em (gras), comme pour les autres schémas redessinés.
 */
const TAILLES: Record<string, { px: number; em: number }> = {
  'ill-step': { px: 14.5, em: 0.56 },
  'ill-in': { px: 12, em: 0.56 },
  'ill-sub': { px: 13, em: 0.52 },
  'ill-on-dark ill-total': { px: 14, em: 0.56 },
};
const rendu = (c: () => unknown) =>
  renderToStaticMarkup(createElement(c as never)).replace(/<!-- -->/g, '').replace(/&#x27;/g, "'").replace(/[  ]/g, ' ');

function textes(svg: string) {
  return [...svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)"(?: text-anchor="(middle|end)")? class="([\w -]+)">([^<]+)<\/text>/g)].map((m) => ({
    x: Number(m[1]),
    y: Number(m[2]),
    ancre: m[3] ?? 'start',
    classe: m[4],
    contenu: m[5],
  }));
}

const SCHEMAS = { SchemaOr, SchemaUniteDeCompte, SchemaObjetsArt, SchemaCpf };

describe('fiches Or, Unités de compte, Objets d’art et CPF : schémas lisibles à 375 px', () => {
  for (const [nom, composant] of Object.entries(SCHEMAS)) {
    const svg = rendu(composant);
    it(`${nom} : viewBox 340, léger et accessible`, () => {
      expect(svg).toMatch(/viewBox="0 0 340 \d+"/);
      expect(svg).toContain('role="img"');
      expect(svg).toMatch(/fictif|Schéma de principe/);
      expect(svg.length).toBeLessThan(15000);
    });
    it(`${nom} : chaque texte tient dans son cadre (ou dans le dessin)`, () => {
      const hauteur = Number(/viewBox="0 0 340 (\d+)"/.exec(svg)![1]);
      const cadres = [...svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g)].map((m) => m.slice(1).map(Number));
      const ts = textes(svg);
      expect(ts.length).toBeGreaterThan(5);
      for (const t of ts) {
        const taille = TAILLES[t.classe];
        expect(taille, t.classe).toBeDefined();
        const largeur = t.contenu.length * taille.em * taille.px;
        const [debut, fin] = t.ancre === 'middle' ? [t.x - largeur / 2, t.x + largeur / 2] : t.ancre === 'end' ? [t.x - largeur, t.x] : [t.x, t.x + largeur];
        const cadre = cadres.find(([cx, cy, w, h]) => t.x >= cx && t.x <= cx + w && t.y > cy && t.y < cy + h);
        const [gauche, droite] = cadre ? [cadre[0], cadre[0] + cadre[2]] : [0, 340];
        const marge = cadre ? 6 : 2;
        expect(debut, t.contenu).toBeGreaterThanOrEqual(gauche + marge - (t.ancre === 'start' && cadre ? 6 : 0));
        expect(fin, t.contenu).toBeLessThanOrEqual(droite - marge);
        expect(t.y, t.contenu).toBeLessThanOrEqual(hauteur - 4);
      }
    });
  }

  it('Or : sur une même ligne, le texte de gauche et celui de droite ne se touchent pas', () => {
    for (const composant of [SchemaOr]) {
      const ts = textes(rendu(composant));
      for (const droite of ts.filter((t) => t.ancre === 'end')) {
        const gauche = ts.find((t) => t.ancre === 'start' && t.y === droite.y)!;
        const fin = gauche.x + gauche.contenu.length * TAILLES[gauche.classe].em * TAILLES[gauche.classe].px;
        const debut = droite.x - droite.contenu.length * TAILLES[droite.classe].em * TAILLES[droite.classe].px;
        expect(debut - fin, `${gauche.contenu} / ${droite.contenu}`).toBeGreaterThanOrEqual(6);
      }
    }
  });

  it('Or : mêmes montants (taxe de 230 € sur 2 000 €, 1 770 € pour le vendeur) et barres proportionnelles', () => {
    const svg = rendu(SchemaOr);
    for (const m of ['Cas A : pièce payée 1 900 €', 'gain de 100 €', 'Cas B : pièce payée 1 000 €', 'gain de 1 000 €', '1 770 € pour vous', 'Taxe : 230 €', '11,5 % du prix de vente de 2 000 €']) expect(svg).toContain(m);
    const largeurs = [...svg.matchAll(/<rect x="6" y="\d+" width="([\d.]+)" height="38" fill="var\(--warn\)"/g)].map((m) => Number(m[1]));
    expect(largeurs).toHaveLength(2);
    for (const l of largeurs) expect(l / 328).toBeCloseTo(230 / 2000, 5);
  });
});
