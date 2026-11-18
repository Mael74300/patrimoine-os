// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Chantier 3 (alléger les pages de simulateur) : les champs courts à curseur passent deux par deux (.field-duo),
// le curseur occupe la troisième ligne de la sous-grille et l'aide la quatrième, pour que les colonnes restent alignées.
const pages = import.meta.glob<string>('./pages/Sim*.tsx', { query: '?raw', import: 'default', eager: true });
const css: string = readFileSync('src/styles.css', 'utf8');

function duos(file: string): string[][] {
  const src = pages[`./pages/${file}.tsx`]!;
  return [...src.matchAll(/<div className="field-duo">([\s\S]*?)<\/div>/g)].map((m) => [...m[1].matchAll(/<NumberField label="([^"]+)"/g)].map((x) => x[1]));
}

describe('curseurs deux par deux', () => {
  it('sous-grille à quatre lignes : libellé, champ, curseur, aide', () => {
    expect(css).toMatch(/:is\(\.field-trio, \.field-duo\) \.field \{[^}]*grid-row: span 4/);
    expect(css).toMatch(/:is\(\.field-trio, \.field-duo\) \.slider \{ grid-row: 3; \}/);
    expect(css).toMatch(/:is\(\.field-trio, \.field-duo\) \.hint \{ grid-row: 4;/);
  });
  it('paires des simulateurs Louer ou acheter, Immobilier, Crédit, Précaution et Retraits', () => {
    expect(duos('SimLouerAcheter')).toEqual([['Prix du bien', 'Apport'], ['Taux du prêt', 'Durée du prêt'], ['Loyer mensuel charges comprises', 'Horizon de comparaison']]);
    expect(duos('SimImmobilier')).toEqual([['Prix du bien', 'Apport'], ['Taux du crédit (hors assurance)', 'Durée du crédit']]);
    expect(duos('SimCredit')).toEqual([['Taux annuel nominal', 'Durée']]);
    expect(duos('SimPrecaution')).toEqual([['Versement mensuel', 'Délai souhaité']]);
    expect(duos('SimRetraits')).toEqual([['Capital de départ', 'Premier retrait mensuel']]);
  });
});
