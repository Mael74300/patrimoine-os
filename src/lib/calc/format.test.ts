import { describe, expect, it } from 'vitest';
import { MINUS, fmtEur, fmtEur2, fmtNum, fmtPct, fmtPts } from './format';

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
