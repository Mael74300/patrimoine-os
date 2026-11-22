import { describe, expect, it } from 'vitest';
import { categories } from './data/categories';
import { investments } from './data/investments';

/**
 * Encyclopédie (constat du 2026-11-22) : les noms de familles s’affichent en tête de chaque fiche et dans l’encyclopédie.
 * Le débutant ne doit pas buter sur un mot anglais ou technique (« SaaS », « structuration », « actifs tangibles »),
 * et le PER et le PEE se lisent juste après le PEA et l’assurance-vie, pour être comparés ensemble.
 */
describe('familles de l’encyclopédie en mots courants', () => {
  const jargon = /\bSaaS\b|structuration|capital humain|\bactifs?\b|tangibles?|liquides|volatils?|non cot|crowdfunding|levier bancaire/i;

  it('aucun nom ni description de famille utilisée par une fiche ne garde ce jargon', () => {
    const used = categories.filter((c) => investments.some((i) => i.category === c.id));
    for (const c of used) expect(`${c.name} ${c.short}`, c.id).not.toMatch(jargon);
  });

  it('aucun nom de fiche ne commence par un sigle anglais non expliqué', () => {
    for (const i of investments) expect(i.name, i.slug).not.toMatch(/\bSaaS\b/);
  });

  it('la fiche Activités en ligne se trouve encore en cherchant « SaaS » ou « e-commerce »', () => {
    const fiche = investments.find((i) => i.slug === 'activite-numerique')!;
    expect(fiche.tags).toEqual(expect.arrayContaining(['SaaS', 'e-commerce']));
  });

  it('ordres distincts et consécutifs ; retraite et épargne salariale juste après les autres enveloppes', () => {
    const orders = categories.map((c) => c.order);
    expect(orders).toEqual(categories.map((_, n) => n + 1));
    const byId = Object.fromEntries(categories.map((c) => [c.id, c.order]));
    expect(byId.retraite).toBe(byId.enveloppes + 1);
  });
});
