import { describe, expect, it } from 'vitest';
import { splitDuration } from './ui';
import { fmtAns, fmtMonths } from '../lib/calc/format';

const join = (v: string) => splitDuration(v)?.map((p) => p.text).join('');

describe('splitDuration (durées des cartes de résultat)', () => {
  it('sépare les chiffres des mots pour les durées produites par fmtMonths et fmtAns', () => {
    expect(splitDuration(fmtMonths(221))).toEqual([
      { text: '18', unit: false },
      { text: ' ans et ', unit: true },
      { text: '5', unit: false },
      { text: ' mois', unit: true },
    ]);
    expect(splitDuration(fmtMonths(18))?.filter((p) => !p.unit).map((p) => p.text)).toEqual(['1', '6']);
    expect(splitDuration(fmtMonths(9))).toEqual([{ text: '9', unit: false }, { text: ' mois', unit: true }]);
    expect(splitDuration(fmtAns(6.8))?.[0]).toEqual({ text: '6,8', unit: false });
  });

  it('garde le texte lu à l’identique (seules les espaces deviennent insécables autour du nombre)', () => {
    for (const m of [1, 9, 12, 18, 38, 145, 221]) {
      expect(join(fmtMonths(m))?.replace(/ /g, ' ')).toBe(fmtMonths(m).replace(/ /g, ' '));
    }
  });

  it('laisse une coupure possible avant « et », jamais entre un nombre et son mot', () => {
    const unit = splitDuration(fmtMonths(221))![1].text;
    expect(unit).toBe(' ans et ');
    expect(unit.includes(' ')).toBe(true);
  });

  it('ignore ce qui n’est pas une durée simple', () => {
    for (const v of ['7 000 €', 'jamais', 'déjà atteint', 'non atteint en 50 ans', 'Au-delà de 30 ans', '1,7 %', 'aucun']) {
      expect(splitDuration(v)).toBeNull();
    }
  });
});
