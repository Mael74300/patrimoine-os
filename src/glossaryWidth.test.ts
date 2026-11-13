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

  it('sur mobile, chaque notion est une entrée à plat et les liens se suivent sur une ligne', () => {
    const block = css.slice(css.indexOf('/* Glossaire sur mobile (une seule règle'));
    const rule = block.slice(0, block.indexOf('\n}\n'));
    expect(rule).toContain('.gloss-item { background: none; box-shadow: none; border: 0;');
    expect(rule).toContain('.gloss-links-list { display: inline; }');
    // La flèche décorative n'entre pas dans le nom du lien ; « Voir aussi » reste dans la page pour les lecteurs d'écran.
    expect(rule).toMatch(/content: '→\\00a0' \/ '';/);
    expect(page).toContain('<span>Voir aussi</span>');
  });
});
