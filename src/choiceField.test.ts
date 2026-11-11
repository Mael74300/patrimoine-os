import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ChoiceField } from './components/ui';
import creditSrc from './pages/SimCredit.tsx?raw';
import etalementSrc from './pages/SimEtalement.tsx?raw';
import interetsSrc from './pages/SimInteretsComposes.tsx?raw';
import { PROFILE_MONTHS } from './lib/calc/precaution';
import { PS_OPTIONS, REGIMES } from './pages/SimImmobilier';

const simSources = import.meta.glob('./pages/Sim*.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

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
    const credit = creditSrc.replace(/\u00a0/g, ' ');
    expect(credit).not.toContain('<SelectField');
    expect(etalementSrc).not.toContain('<SelectField');
    expect(interetsSrc).not.toContain('<SelectField');
    // Le plafond légal reste expliqué sous le choix (mêmes règles qu’avant).
    expect(credit).toContain('au plus 6 mois d\'intérêts sur la somme remboursée, dans la limite de 3 % du capital restant dû');
  });

  it('aucun simulateur n’utilise de menu déroulant (texte coupé sur mobile)', () => {
    expect(Object.keys(simSources).length).toBeGreaterThan(20);
    for (const [file, src] of Object.entries(simSources)) {
      expect(src, file).not.toContain('<select');
      expect(src, file).not.toContain('SelectField');
    }
  });

  it('les choix convertis gardent les mêmes valeurs et les mêmes repères', () => {
    expect(Object.values(PROFILE_MONTHS).map((p) => p.months)).toEqual([3, 6, 9]);
    expect(REGIMES.map((r) => r.v).sort()).toEqual(['aucune', 'micro-bic', 'micro-foncier', 'reel-bic', 'reel-foncier']);
    expect(REGIMES.find((r) => r.v === 'micro-foncier')?.allowance).toBe(0.3);
    expect(REGIMES.find((r) => r.v === 'micro-bic')?.allowance).toBe(0.5);
    expect(PS_OPTIONS.map((o) => o.v)).toEqual([0.172, 0.186]);
  });
});
