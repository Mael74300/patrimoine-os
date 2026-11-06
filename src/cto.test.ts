import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaCto, CTO_EXAMPLE_GAIN } from './components/Illustrations';
import { PFU_IR_PCT, PFU_PS_PCT, PFU_TOTAL_PCT, pfuSplit } from './lib/calc/pfu';
import { investmentBySlug } from './data/investments';

describe('schéma « CTO : sur un gain, ce qui reste »', () => {
  const svg = renderToStaticMarkup(createElement(SchemaCto)).replace(/ | /g, ' ');
  it('les taux se somment et correspondent à ceux de la fiche', () => {
    expect(PFU_IR_PCT + PFU_PS_PCT).toBeCloseTo(PFU_TOTAL_PCT, 10);
    const tax = investmentBySlug['compte-titres'].tax.text.replace(/[\u00a0\u202f]/g, ' ');
    expect(tax).toContain('31,4 %');
    expect(tax).toContain('12,8 %');
    expect(tax).toContain('18,6 %');
  });
  it('recalcule l’exemple fictif de 1 000 €', () => {
    expect(CTO_EXAMPLE_GAIN).toBe(1000);
    expect(pfuSplit(1000)).toEqual({ ir: 128, ps: 186, total: 314, net: 686 });
    for (const v of ['128 €', '186 €', '314 €', '686 €', '1 000 €']) expect(svg).toContain(v);
    expect(svg).toContain('fictif');
  });
  it('reste léger et accessible', () => {
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
  });
});
