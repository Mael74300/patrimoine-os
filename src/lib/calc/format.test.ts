import { describe, expect, it } from 'vitest';
import { MINUS, fmtAns, fmtEur, fmtEur2, fmtMonths, fmtNum, fmtPct, fmtPts, fmtYears } from './format';

describe('Formatage : signe moins typographique', () => {
  it('écrit les nombres négatifs avec « − » (U+2212), jamais avec le trait d’union', () => {
    expect(fmtEur(-392)).toBe(`${MINUS}392 €`);
    expect(fmtEur(-42959)).toBe(`${MINUS}42 959 €`);
    expect(fmtEur2(-1.5)).toBe(`${MINUS}1,50 €`);
    expect(fmtPct(-0.01)).toBe(`${MINUS}1 %`);
    expect(fmtNum(-2.5)).toBe(`${MINUS}2,5`);
    for (const s of [fmtEur(-392), fmtEur2(-3), fmtPct(-0.2), fmtNum(-7)]) expect(s).not.toContain('-');
  });
  it('laisse les nombres positifs et nuls inchangés', () => {
    expect(fmtEur(392)).toBe('392 €');
    expect(fmtEur(-0.4)).toBe('0 €');
    expect(fmtPct(0.035)).toBe('3,5 %');
    expect(fmtEur(NaN)).toBe('—');
  });
});

describe('Formatage : écarts de taux en points', () => {
  it('écrit la différence de deux taux en points de pourcentage', () => {
    // 3,71 % − 3 % = 0,71 point
    expect(fmtPts(0.0371 - 0.03)).toBe('0,71 point');
    expect(fmtPts(0.05 - 0.03)).toBe('2 points');
    expect(fmtPts(0.03 - 0.05)).toBe(`${MINUS}2 points`);
    expect(fmtPts(0.000116, 4)).toBe('0,0116 point');
    expect(fmtPts(Infinity)).toBe('—');
  });
});

describe('Formatage : durées dites en années et mois', () => {
  const N = '\u00a0';
  it('traduit un nombre de mois en années et mois, avec espaces insécables', () => {
    expect(fmtMonths(145)).toBe(`12${N}ans et 1${N}mois`);
    expect(fmtMonths(18)).toBe(`1${N}an et 6${N}mois`);
    expect(fmtMonths(24)).toBe(`2${N}ans`);
    expect(fmtMonths(12)).toBe(`1${N}an`);
    expect(fmtMonths(8)).toBe(`8${N}mois`);
    expect(fmtMonths(0)).toBe(`0${N}mois`);
  });
  it('arrondit au mois commencé (un point mort de 26,7 mois demande 27 mois)', () => {
    expect(fmtMonths(26.7)).toBe(`2${N}ans et 3${N}mois`);
    expect(fmtMonths(27)).toBe(`2${N}ans et 3${N}mois`);
    expect(fmtMonths(Infinity)).toBe('—');
  });
  it('écrit les années au singulier sous 2 et garde le nombre avec « ans »', () => {
    expect(fmtAns(1)).toBe(`1${N}an`);
    expect(fmtAns(1.5)).toBe(`1,5${N}an`);
    expect(fmtAns(18)).toBe(`18${N}ans`);
    expect(fmtYears(null)).toBe(`non atteint en 100${N}ans`);
    expect(fmtYears(0)).toBe('déjà atteint');
  });
});
