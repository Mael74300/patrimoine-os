import { describe, expect, it } from 'vitest';
import { investments } from './investments';
import { glossary } from './glossary';

/**
 * Fiche Obligations : la « duration », jamais définie, a été remplacée par la sensibilité, l'indicateur que la notice
 * de tout fonds obligataire doit afficher (La finance pour tous, « Les risques obligataires », consulté le 11 novembre 2026) :
 * variation de valeur ≈ − sensibilité × variation des taux (en points).
 */
const variation = (sensibilite: number, hausseTauxPoints: number) => -sensibilite * hausseTauxPoints;
const ob = investments.find((i) => i.slug === 'obligations')!;
const term = glossary.find((t) => t.term.startsWith('Sensibilité'))!;

describe('fiche Obligations : sensibilité expliquée', () => {
  it('plus de « duration » sans définition', () => {
    expect(JSON.stringify(ob)).not.toMatch(/duration/i);
    expect(ob.howItWorks).toMatch(/sensibilité/);
  });
  it('exemple fictif recalculé : sensibilité 5, taux +1 point → environ −5 %', () => {
    expect(ob.example).toMatch(/^Exemple fictif/);
    expect(variation(5, 1)).toBe(-5);
    expect(ob.example.replace(/ /g, ' ')).toContain('sensibilité est de 5 perdrait environ 5 % de sa valeur si les taux montaient brutalement de 1 point');
  });
  it('glossaire : exemple de la source (sensibilité 7 → 7 %) et source citée sur la fiche', () => {
    expect(variation(7, 1)).toBe(-7);
    expect(term.definition.replace(/ /g, ' ')).toContain('Une sensibilité de 7 veut dire qu’une hausse brutale de 1 point des taux fait perdre environ 7 % de valeur');
    expect(ob.sources.some((s) => s.url.includes('les-risques-obligataires'))).toBe(true);
  });
});
