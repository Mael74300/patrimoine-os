import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaCompteATerme } from './components/Illustrations';

const svg = () => renderToStaticMarkup(createElement(SchemaCompteATerme)).replace(/[  ]/g, ' ');

describe('schéma de la fiche Compte à terme', () => {
  it('reprend le principe sourcé (La finance pour tous), sans chiffre', () => {
    const s = svg();
    for (const m of ['Taux fixe', 'Taux progressif', 'Taux révisable', 'pénalité sur les intérêts']) expect(s).toContain(m);
    expect(s).not.toMatch(/\d\s?(%|€)/);
  });

  it('viewBox 340 et une courbe de principe par formule, signalée sans échelle', () => {
    const s = svg();
    expect(s).toContain('viewBox="0 0 340 ');
    expect([...s.matchAll(/<g transform="translate\(258 /g)]).toHaveLength(3);
    expect(s).toContain('sans échelle');
  });

  it('les lignes de détail tiennent à gauche des courbes ou dessous, dans la carte', () => {
    // Largeur moyenne d'un caractère estimée à 0,52 em (police système sans empattement), comme schemaMobileText.test.ts.
    const largeur = (t: string, taille: number) => t.length * 0.52 * taille;
    for (const t of ['Somme versée en une fois', 'Taux lié à un indice de référence']) expect(14 + largeur(t, 13)).toBeLessThan(258 - 8);
    for (const t of ['Capital et intérêts rendus à l’échéance', 'Taux plus haut si l’argent reste longtemps']) expect(14 + largeur(t, 13)).toBeLessThan(340 - 10);
    expect(largeur('Taux, ou formule de calcul, connu au départ', 13)).toBeLessThan(340 - 20);
  });
});
