import { describe, expect, it } from 'vitest';
// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync } from 'node:fs';

const css: string = readFileSync('src/styles.css', 'utf8');
const page: string = readFileSync('src/pages/Glossaire.tsx', 'utf8');

describe('glossaire : largeur des colonnes', () => {
  it('la page lève le plafond de lecture sur grand écran', () => {
    expect(page).toContain('prose gloss-page');
    expect(css).toMatch(/\.prose\.gloss-page \{ max-width: none; \}/);
  });
});
