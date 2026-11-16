import { describe, expect, it } from 'vitest';
// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync } from 'node:fs';

const home: string = readFileSync('src/pages/Home.tsx', 'utf8');
const css: string = readFileSync('src/styles.css', 'utf8');

describe('accueil : « Explorer le site » compact sur mobile', () => {
  it('affiche les six rubriques sur deux colonnes sous 760 px, une seule sous 340 px', () => {
    expect(css).toMatch(/@media \(max-width: 760px\) \{\s*\.tiles \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
    expect(css).toMatch(/@media \(max-width: 340px\) \{ \.tiles \{ grid-template-columns: 1fr; \}/);
  });

  it('garde des descriptions courtes, lisibles dans une demi-largeur d’écran', () => {
    const block = home.slice(home.indexOf('const tiles = ['), home.indexOf('] as const;'));
    const texts = [...block.matchAll(/text: '([^']*)'/g)].map((m) => m[1]);
    expect(texts).toHaveLength(6);
    for (const t of texts) expect(t.length).toBeLessThanOrEqual(52);
  });
});
