import { describe, expect, it } from 'vitest';
// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync } from 'node:fs';

const css: string = readFileSync('src/styles.css', 'utf8');

describe('échelle des schémas sur grand écran', () => {
  it('plafonne les schémas à viewBox 340 et 260 pour garder des textes de taille homogène', () => {
    expect(css).toMatch(/\.ill-svg\[viewBox\^="0 0 340 "\]\s*\{\s*max-width:\s*360px/);
    expect(css).toMatch(/\.ill-svg\[viewBox\^="0 0 260 "\]\s*\{\s*max-width:\s*276px/);
  });
  it('garde 440 px pour les schémas à viewBox 420 (échelle ~1,05)', () => {
    expect(css).toMatch(/\.ill-svg \{[^}]*max-width:\s*440px/);
  });
});
