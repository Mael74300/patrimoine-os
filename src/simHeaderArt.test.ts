import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { HeaderArt, SIM_THEME_ART } from './components/HeaderArt';
import { simThemes, simThemeOfPath } from './lib/simThemeList';

describe('scènes des bandeaux de simulateur', () => {
  it('chaque thème de simulateur a sa scène', () => {
    for (const t of simThemes) expect(SIM_THEME_ART[t.id], t.id).toBeTruthy();
  });
  it('le thème se déduit de l’adresse du simulateur, avec ou sans barre finale', () => {
    expect(simThemeOfPath('/simulateurs/credit')).toBe('credit');
    expect(simThemeOfPath('/simulateurs/retraits-reguliers-duree-du-capital/')).toBe('retraite');
    expect(simThemeOfPath('/simulateurs/louer-ou-acheter')).toBe('immobilier');
    expect(simThemeOfPath('/simulateurs')).toBeUndefined();
    expect(simThemeOfPath('/guides/credit')).toBeUndefined();
    expect(simThemeOfPath('/simulateurs/adresse-inconnue')).toBeUndefined();
  });
  it('scènes décoratives : masquées des lecteurs d’écran, sans texte ni chiffre, couleurs du thème', () => {
    for (const name of new Set(Object.values(SIM_THEME_ART))) {
      const svg = renderToStaticMarkup(createElement(HeaderArt, { name }));
      expect(svg, name).toContain('aria-hidden="true"');
      expect(svg, name).not.toMatch(/<text/);
      expect(svg, name).toContain('var(--primary)');
    }
  });
  it('fichier des scènes léger (moins de 15 ko)', () => {
    expect(readFileSync(new URL('./components/HeaderArt.tsx', import.meta.url)).length).toBeLessThan(15000);
  });
});
