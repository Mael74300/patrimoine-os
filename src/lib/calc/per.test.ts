import { describe, expect, it } from 'vitest';
import { perDeductionBalance } from './per';

describe('perDeductionBalance', () => {
  it('3 000 € déduits à 30 %, ressortis à 11 % : 900 € évités, 330 € payés, 570 € gagnés', () => {
    expect(perDeductionBalance(3000, 30, 11)).toEqual({ saved: 900, paidLater: 330, net: 570 });
  });
  it('même tranche à l’entrée et à la sortie : impôt seulement reporté', () => {
    expect(perDeductionBalance(3000, 30, 30)).toEqual({ saved: 900, paidLater: 900, net: 0 });
  });
  it('tranche plus haute à la sortie : bilan négatif', () => {
    expect(perDeductionBalance(1000, 11, 30).net).toBe(-190);
  });
  it('montant ou taux nuls', () => {
    expect(perDeductionBalance(0, 30, 11)).toEqual({ saved: 0, paidLater: 0, net: 0 });
    expect(perDeductionBalance(3000, 0, 0).net).toBe(0);
  });
});
