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
  it('dans la zone si elle touche le bord gauche du tracé', () => {
    expect(placeBandLabel('L’achat l’emporte', 60, 120, 48).anchor).toBe('start');
  });
});
