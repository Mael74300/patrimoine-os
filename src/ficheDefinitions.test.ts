import { describe, expect, it } from 'vitest';
import { investments } from './data/investments';
import { splitSentences } from './lib/ficheText';

// La définition est la première chose que lit un visiteur arrivé par un moteur de recherche :
// courte, en mots simples, sans jargon resté sans explication.
describe('Définitions des fiches', () => {
  it('tiennent en trois phrases et une soixantaine de mots au plus', () => {
    for (const inv of investments) {
      expect(splitSentences(inv.definition).length, inv.slug).toBeLessThanOrEqual(3);
      expect(inv.definition.split(/\s+/).length, inv.slug).toBeLessThanOrEqual(60);
    }
  });
  it('n’emploient plus les formules techniques remplacées', () => {
    const anciens = ['coût marginal', 'compte espèces', 'registres décentralisés', 'Prises de participation', 'adossés à l', 'Produit d’épargne de long terme'];
    for (const inv of investments) for (const a of anciens) expect(inv.definition, inv.slug).not.toContain(a);
  });
  it('commencent par une phrase complète qui dit ce qu’est le placement', () => {
    expect(investments.find((i) => i.slug === 'per')!.definition).toContain('préparer sa retraite');
    expect(investments.find((i) => i.slug === 'lep')!.definition).toContain('avis d’impôt');
  });
});
