import { expect, test } from 'vitest';
import { FORMULAS, GROUPS } from './pages/Methodologie';

test('chaque formule de la page Méthode est classée dans un groupe, une seule fois', () => {
  const classees = GROUPS.flatMap(([, titres]) => titres);
  expect(new Set(classees).size).toBe(classees.length);
  expect(classees.slice().sort()).toEqual(FORMULAS.map(([t]) => t).sort());
});
