import { describe, expect, it } from 'vitest';
import { splitSentences } from './ui';
import { investments } from '../data/investments';

describe('splitSentences', () => {
  it('ne perd aucun mot du texte d\'origine', () => {
    for (const inv of investments) {
      for (const c of [inv.fees, inv.tax]) {
        expect(splitSentences(c.text).join(' ').replace(/\s+/g, ' ')).toBe(c.text.replace(/\s+/g, ' ').trim());
      }
    }
  });
});
