import { inflateSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
// @ts-expect-error module JavaScript du build, sans déclaration de types
import { normalizeText, ogFileName, ogLabel, renderOgImage, wrapLines } from './lib/ogimage.mjs';

describe('image Open Graph générée au build', () => {
  it('produit un PNG 1200 × 630 valide dont les pixels contiennent le texte', () => {
    const png = renderOgImage({ title: 'Livret A : taux et plafond', label: 'Fiche' }) as Buffer;
    expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
    const idatLen = png.readUInt32BE(33);
    expect(png.subarray(37, 41).toString()).toBe('IDAT');
    const raw = inflateSync(png.subarray(41, 41 + idatLen));
    expect(raw.length).toBe((1200 * 3 + 1) * 630);
    // Au moins un pixel blanc (texte du titre) et une teinte de fond.
    expect(raw.includes(Buffer.from([248, 250, 252]))).toBe(true);
    expect(png.length).toBeLessThan(200_000);
  });
  it('est déterministe et dépend du titre', () => {
    const a = renderOgImage({ title: 'PEA' }) as Buffer;
    expect(a.equals(renderOgImage({ title: 'PEA' }))).toBe(true);
    expect(a.equals(renderOgImage({ title: 'PER' }))).toBe(false);
  });
  it('normalise accents, apostrophes et caractères inconnus', () => {
    expect(normalizeText("Épargne d’urgence – œuvre ✓")).toBe("EPARGNE D'URGENCE - OEUVRE");
  });
  it('coupe en lignes sans dépasser et tronque proprement', () => {
    const l = wrapLines('UN DEUX TROIS QUATRE CINQ SIX SEPT HUIT NEUF DIX ONZE DOUZE', 20, 2) as string[];
    expect(l).toHaveLength(2);
    expect(l.every((x) => x.length <= 20)).toBe(true);
    expect(l[1].endsWith('...')).toBe(true);
    expect(wrapLines('COURT', 20, 4)).toEqual(['COURT']);
  });
  it('nomme les fichiers à partir du chemin', () => {
    expect(ogFileName('/guides/pea-fiscalite/')).toBe('guides-pea-fiscalite.png');
    expect(ogFileName('/')).toBeNull();
    expect(ogLabel('/simulateurs/budget/')).toBe('Simulateur');
  });
});
