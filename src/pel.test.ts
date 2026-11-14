import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaPel, PEL_PHASES, PEL_LIVRET_AGE } from './components/Illustrations';
import { investments } from './data/investments';
import { PFU_PS_PCT } from './lib/calc/pfu';

describe('schéma de la fiche PEL', () => {
  it('phases contiguës de 0 à 15 ans (4, 6 puis 5 ans)', () => {
    expect(PEL_PHASES.map((p) => [p.from, p.to])).toEqual([[0, 4], [4, 10], [10, 15]]);
    expect(PEL_LIVRET_AGE).toBe(15);
  });
  it('cohérent avec les chiffres de la fiche (4 à 10 ans, 540 €, 2,00 %)', () => {
    const pel = investments.find((i) => i.slug === 'pel')!;
    const tax = pel.tax.text.replace(/[  ]/g, ' ');
    expect(tax).toContain('4 ans minimum, 10 ans maximum');
    expect(tax).toContain('2,00 %');
    const svg = renderToStaticMarkup(createElement(SchemaPel)).replace(/[  ]/g, ' ');
    expect(svg).toContain('540 €');
    expect(svg).toContain('2,00 %');
  });
  it('lisible à 375 px : viewBox 340, chaque étape de la légende sur deux lignes', () => {
    const svg = renderToStaticMarkup(createElement(SchemaPel)).replace(/[\u00a0\u202f]/g, ' ');
    expect(svg).toContain('viewBox="0 0 340 312"');
    for (const p of PEL_PHASES) {
      expect(svg).toContain(`>${p.label}</text>`);
      expect(svg).toContain(`>${p.detail.replace(/[\u00a0\u202f]/g, ' ')}</text>`);
    }
    // Largeur estimée (0,52 em) de la plus longue ligne : elle tient dans les 340 unités.
    const lignes = [...svg.matchAll(/class="ill-(?:sub|step)"[^>]*>([^<]+)<\/text>/g)].map((m) => m[1]);
    for (const l of lignes) expect(l.length * 0.52 * 14.5, l).toBeLessThan(340);
  });
  it('prélèvements sociaux : 17,2 % maintenus en 2026 pour le PEL, source F2329 citée (Service-Public, consulté le 2026-11-14)', () => {
    const pel = investments.find((i) => i.slug === 'pel')!;
    const tax = pel.tax.text.replace(/[\u00a0\u202f]/g, ' ');
    expect(tax).toContain(`17,2 % de prélèvements sociaux, taux maintenu en 2026 quand le cas général passe à ${PFU_PS_PCT.toLocaleString('fr-FR')} %`);
    expect(tax).toContain('Prime d\'État : aucune pour ces plans.');
    expect(pel.sources.some((s) => s.url.endsWith('/F2329'))).toBe(true);
  });
});
