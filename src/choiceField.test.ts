import { createElement } from 'react';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ChoiceField } from './components/ui';

describe('ChoiceField : choix en boutons au lieu d’un menu déroulant', () => {
  const html = renderToStaticMarkup(createElement(ChoiceField<string>, {
    label: 'Effet',
    value: 'b',
    options: [{ v: 'a', label: 'Réduire la durée', detail: 'même mensualité' }, { v: 'b', label: 'Réduire la mensualité' }],
    onChange: () => {},
    hint: 'Aide',
  }));

  it('groupe de boutons radio natifs nommé par sa légende, une seule option cochée', () => {
    expect(html).toMatch(/^<fieldset[^>]*aria-describedby="[^"]+-hint"/);
    expect(html).toContain('<legend>Effet</legend>');
    expect(html.match(/type="radio"/g)).toHaveLength(2);
    expect(html.match(/checked=""/g)).toHaveLength(1);
    const checkedInput = html.match(/<input[^>]*checked=""[^>]*>/)?.[0] ?? '';
    expect(checkedInput).toContain('value="b"');
    const names = [...html.matchAll(/name="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(names).size).toBe(1);
  });

  it('chaque option porte son texte en entier (rien n’est coupé)', () => {
    expect(html).toContain('Réduire la durée');
    expect(html).toContain('même mensualité');
    expect(html).toContain('Réduire la mensualité');
  });

  it('les choix courts des simulateurs n’utilisent plus de menu déroulant', () => {
    const credit = readFileSync('src/pages/SimCredit.tsx', 'utf8').replace(/\u00a0/g, ' ');
    expect(credit).not.toContain('<SelectField');
    expect(readFileSync('src/pages/SimEtalement.tsx', 'utf8')).not.toContain('<SelectField');
    expect(readFileSync('src/pages/SimInteretsComposes.tsx', 'utf8')).not.toContain('<SelectField');
    // Le plafond légal reste expliqué sous le choix (mêmes règles qu’avant).
    expect(credit).toContain('au plus 6 mois d\'intérêts sur la somme remboursée, dans la limite de 3 % du capital restant dû');
  });
});
