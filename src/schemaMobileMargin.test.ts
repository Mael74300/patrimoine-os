import { describe, expect, it } from 'vitest';
// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync } from 'node:fs';

/**
 * Sur mobile, le cadre des schémas occupe toute la largeur de l'écran. Avant le 2026-11-11, le dessin n'avait que
 * 4 px de marge et ses cadres touchaient les bords de l'écran sur 33 schémas (contrôle Playwright à 375 px).
 * La marge intérieure est portée à 10 px ; la légende garde 16 px depuis le bord, comme le texte de la page.
 */
const css: string = readFileSync('src/styles.css', 'utf8');
const ui: string = readFileSync('src/components/ui.tsx', 'utf8');

describe('respiration des schémas et graphiques sur mobile', () => {
  const mobile = css.slice(css.indexOf('@media (max-width: 480px) {\n  .illustration'));
  const regle = /\.illustration \{ padding: (\d+)px (\d+)px; margin-left: -(\d+)px;/.exec(mobile);
  const legende = /\.illustration figcaption \{ padding: 0 (\d+)px; \}/.exec(mobile);

  it('le dessin garde au moins 10 px de marge de chaque côté de l’écran', () => {
    expect(regle).not.toBeNull();
    expect(Number(regle![2])).toBeGreaterThanOrEqual(10);
  });

  it('la légende du schéma reste alignée sur le texte de la page (16 px)', () => {
    expect(Number(regle![2]) + Number(legende![1])).toBe(Number(regle![3]));
  });

  it('les petits textes des schémas larges restent lisibles (au moins 11 px à 375 px)', () => {
    const largeurDessin = 375 - 2 * Number(regle![2]);
    expect((13.2 * largeurDessin) / 420).toBeGreaterThanOrEqual(11);
  });

  it('la note placée sous un graphique en courbes ne colle pas à sa légende', () => {
    expect(ui).toContain('<figure className="line-chart">');
    expect(css).toMatch(/\.line-chart \{ margin: 0 0 1[2-6]px; \}/);
  });
});
