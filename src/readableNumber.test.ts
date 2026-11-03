import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { NumberField } from './components/ui';
import { readableNumber } from './lib/readableNumber';

describe('readableNumber', () => {
  it('sépare les milliers à partir de 5 chiffres', () => {
    expect(readableNumber(250000, '€')).toBe('250 000 €');
    expect(readableNumber(12345)).toBe('12 345');
    expect(readableNumber(-1200000, '€')).toBe('-1 200 000 €');
  });
  it('ne dit rien quand le nombre se lit déjà bien', () => {
    expect(readableNumber(9999, '€')).toBe('');
    expect(readableNumber(3.5, '%')).toBe('');
    expect(readableNumber(NaN)).toBe('');
  });
  it('apparaît à côté du libellé dans un champ, sans être lu deux fois', () => {
    const html = renderToString(createElement(NumberField, { label: 'Prix du bien', value: 250000, onChange: () => {}, unit: '€' }));
    expect(html).toContain('class="field-echo"');
    expect(html).toContain('aria-hidden="true"');
    const small = renderToString(createElement(NumberField, { label: 'Durée', value: 20, onChange: () => {}, unit: 'ans' }));
    expect(small).not.toContain('field-echo');
  });
});
