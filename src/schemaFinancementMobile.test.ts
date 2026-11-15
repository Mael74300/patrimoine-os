import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaCapitalInvestissement, SchemaCrowdfunding, SchemaFonciereCotee } from './components/schemas/fiches';

/**
 * Fiches Financement participatif, Capital-investissement et Foncières cotées : schémas redessinés en viewBox 340
 * (chantier 112, étape 8, constat du 2026-11-15) : à 375 px, leurs petits textes s'affichaient à 11,2 px.
 * Chaque ligne doit tenir dans le cadre qui la contient (ou dans le dessin), avec 6 unités de marge.
 * Largeur estimée d'un caractère : 0,52 em (texte normal), 0,56 em (gras ou demi-gras), comme pour les autres schémas redessinés.
 */
const TAILLES: Record<string, { px: number; em: number }> = {
  'ill-step': { px: 14.5, em: 0.56 },
  'ill-in': { px: 12, em: 0.56 },
  'ill-sub': { px: 13, em: 0.52 },
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

const etendue = (t: ReturnType<typeof textes>[number]) => {
  const taille = TAILLES[t.classe];
  expect(taille, t.classe).toBeDefined();
  const l = t.contenu.length * taille.em * taille.px;
  return t.centre ? [t.x - l / 2, t.x + l / 2] : [t.x, t.x + l];
};

function verifie(svg: string, attendus: number) {
  const cadres = [...svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g)].map((m) => m.slice(1).map(Number));
  const ts = textes(svg);
  expect(ts.length).toBe(attendus);
  for (const t of ts) {
    const [g, d] = etendue(t);
    const cadre = cadres.find(([cx, cy, w, h]) => t.x > cx && t.x < cx + w && t.y > cy && t.y < cy + h);
    const [gauche, droite] = cadre ? [cadre[0], cadre[0] + cadre[2]] : [0, 340];
    expect(g, t.contenu).toBeGreaterThanOrEqual(gauche + 6);
    expect(d, t.contenu).toBeLessThanOrEqual(droite - 6);
  }
  return ts;
}

describe('schémas Financement participatif, Capital-investissement et Foncières cotées lisibles à 375 px', () => {
  for (const [nom, composant] of Object.entries({ SchemaCrowdfunding, SchemaCapitalInvestissement, SchemaFonciereCotee })) {
    it(`${nom} : viewBox 340, léger et accessible`, () => {
      const svg = rendu(composant);
      expect(svg).toMatch(/viewBox="0 0 340 \d+"/);
      expect(svg).toContain('role="img"');
      expect(svg.length).toBeLessThan(15000);
    });
  }

  it('financement participatif : textes dans leur colonne, mêmes libellés, sans chiffre', () => {
    const svg = rendu(SchemaCrowdfunding);
    const ts = verifie(svg, 24);
    // Colonne de gauche (x de 1 à 101) : nom et sous-titre de chaque façon de participer.
    for (const t of ts.filter((x) => x.x === 51)) {
      const [g, d] = etendue(t);
      expect(g, t.contenu).toBeGreaterThanOrEqual(7);
      expect(d, t.contenu).toBeLessThanOrEqual(95);
    }
    for (const l of ['Don', 'Prêt', 'Titres', 'ne rembourse pas (défaut)', 'à revendre']) expect(svg).toContain(`>${l}</text>`);
    const texte = svg.replace(/<title[\s\S]*?<\/desc>/, '').replace(/<[^>]+>/g, ' ');
    expect(texte.match(/\d+/g)).toBeNull();
  });

  it('capital-investissement : chaque texte tient dans son cadre', () => {
    verifie(rendu(SchemaCapitalInvestissement), 23);
  });

  it('foncière cotée : chaque texte tient dans son cadre ou à droite de la boucle', () => {
    const svg = rendu(SchemaFonciereCotee);
    const ts = verifie(svg, 17);
    // Textes de la boucle : à droite du trait vertical (x = 208).
    for (const t of ts.filter((x) => x.x === 216)) expect(etendue(t)[1], t.contenu).toBeLessThanOrEqual(334);
  });
});
