import { describe, expect, it } from 'vitest';
import { summarizeSeries } from './chartSummary';

const eur = (n: number) => `${n} €`;

describe('summarizeSeries', () => {
  it('décrit le début et la fin de la courbe', () => {
    expect(summarizeSeries([{ name: 'Solde', values: [0, 50, 100] }], ['An 0', 'An 1', 'An 2'], eur)).toEqual([
      'Solde : de 0 € (An 0) à 100 € (An 2).',
    ]);
  });
  it('signale un maximum intermédiaire', () => {
    expect(summarizeSeries([{ name: 'Capital', values: [10, 80, 30] }], ['a', 'b', 'c'], eur)).toEqual([
      'Capital : de 10 € (a) à 30 € (c), maximum 80 € (b).',
    ]);
  });
  it('ignore les valeurs manquantes et les courbes vides', () => {
    expect(
      summarizeSeries(
        [
          { name: 'A', values: [undefined, 5, 7] },
          { name: 'B', values: [undefined, undefined] },
        ],
        ['x', 'y', 'z'],
        eur,
      ),
    ).toEqual(['A : de 5 € (y) à 7 € (z).']);
  });
});
