import { describe, expect, it } from 'vitest';
import { placeBandLabel } from './ui';

describe('placeBandLabel (libellé de la zone grisée d’un graphique)', () => {
  it('dans la zone quand il y tient', () => {
    expect(placeBandLabel('L’achat l’emporte', 300, 600, 64)).toEqual({ text: 'L’achat l’emporte', x: 306, anchor: 'start' });
  });
  it('juste avant une zone étroite, avec une flèche vers elle', () => {
    const p = placeBandLabel('L’achat l’emporte', 250, 310, 48);
    expect(p).toEqual({ text: 'L’achat l’emporte →', x: 244, anchor: 'end' });
  });
  it('juste après une zone étroite collée au bord gauche, avec une flèche vers elle', () => {
    // Cas du simulateur Investir d’un coup ou progressivement à 375 px : zone « Étalement » de la première année.
    expect(placeBandLabel('Étalement', 48, 100, 48, 330)).toEqual({ text: '←\u00a0Étalement', x: 106, anchor: 'start' });
  });
  it('dans la zone si elle ne tient ni avant ni après', () => {
    expect(placeBandLabel('L’achat l’emporte', 60, 120, 48, 150)).toEqual({ text: 'L’achat l’emporte', x: 66, anchor: 'start' });
  });
});
