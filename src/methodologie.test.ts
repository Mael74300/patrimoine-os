import { expect, test } from 'vitest';
import { FORMULAS, GROUPS } from './pages/Methodologie';

test('chaque formule de la page Méthode est classée dans un groupe, une seule fois', () => {
  const classees = GROUPS.flatMap(([, titres]) => titres);
  expect(new Set(classees).size).toBe(classees.length);
  expect(classees.slice().sort()).toEqual(FORMULAS.map(([t]) => t).sort());
});

test('la page Méthode ne cite plus de date globale de vérification mais la plus récente des fiches', async () => {
  const { dateEnClair, derniereVerification } = await import('./pages/Methodologie');
  const { investments } = await import('./data/investments');
  expect(dateEnClair('2026-11-04')).toBe('4 novembre 2026');
  expect(dateEnClair('2027-02-01')).toBe('1er février 2027');
  const max = derniereVerification();
  expect(investments.every((i) => i.review.verifiedOn <= max)).toBe(true);
  expect(investments.some((i) => i.review.verifiedOn === max)).toBe(true);
});
