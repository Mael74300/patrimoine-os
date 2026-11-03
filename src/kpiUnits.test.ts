import { describe, expect, it } from 'vitest';
import { gluedUnits } from './components/ui';

describe('Kpi : le nombre reste collé à son unité', () => {
  it('durées et unités', () => {
    expect(gluedUnits('1 an et 6 mois')).toBe('1 an et 6 mois');
    expect(gluedUnits('12 ans')).toBe('12 ans');
    expect(gluedUnits('3 %')).toBe('3 %');
  });
  it('ne touche pas aux autres mots ni aux textes sans chiffre', () => {
    expect(gluedUnits('2 anciens')).toBe('2 anciens');
    expect(gluedUnits('déjà atteint')).toBe('déjà atteint');
  });
});
