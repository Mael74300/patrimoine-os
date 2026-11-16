import { describe, expect, it } from 'vitest';
// @ts-ignore : module Node lu seulement par les tests
import { readFileSync } from 'node:fs';
import { categories } from './data/categories';
import { investments } from './data/investments';
import { guideGroups, guides } from './data/guides';

const icons: string = readFileSync('src/components/Icons.tsx', 'utf8');
const familyIconSource = icons.slice(icons.indexOf('export function FamilyIcon'), icons.indexOf('export function SimThemeIcon'));

describe('Icônes du sur-titre des fiches et des guides', () => {
  it('chaque famille qui a une fiche a son propre dessin (pas l’étoile par défaut)', () => {
    const used = new Set(investments.map((i) => i.category));
    for (const id of used) {
      expect(categories.some((c) => c.id === id)).toBe(true);
      expect(familyIconSource.includes(`case '${id}':`), `icône manquante pour la famille ${id}`).toBe(true);
    }
  });

  it('chaque guide appartient à un parcours, dont le nom sert de sur-titre', () => {
    for (const g of guides) {
      expect(guideGroups.filter((grp) => grp.slugs.includes(g.slug)).length, g.slug).toBe(1);
    }
  });
});
