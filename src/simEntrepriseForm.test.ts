import { describe, expect, it } from 'vitest';

// Chantier 3 (alléger les pages de simulateur) : le formulaire du simulateur Entreprise montre d'abord quatre réglages,
// les autres restent dans « Réglages avancés », déjà remplis avec des valeurs d'exemple.
const src = import.meta.glob<string>('./pages/SimEntreprise.tsx', { query: '?raw', import: 'default', eager: true })['./pages/SimEntreprise.tsx']!;

describe('formulaire du simulateur Entreprise', () => {
  it('quatre réglages essentiels avant le bloc repliable', () => {
    const [before, after] = src.split('<details className="fold advanced">');
    expect(before).toContain("L'essentiel : 4 réglages");
    const essentials = [...before.matchAll(/<NumberField label="([^"]+)"/g)].map((m) => m[1]);
    expect(essentials).toEqual(["Chiffre d'affaires, année 1", 'Marge brute', 'Charges fixes annuelles', 'Rémunération nette du dirigeant']);
    expect(after).toContain('label="Croissance annuelle des ventes"');
    expect(after).toContain('label="Trésorerie de départ"');
  });
});
