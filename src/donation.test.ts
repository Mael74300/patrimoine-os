import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaDonation, DONATION_TOTAL_DEUX_PARENTS, DONATION_PAR_PARENT } from './components/Illustrations';
import { investmentBySlug } from './data/investments';

describe('schéma Donation', () => {
  it('reprend les montants de la fiche et de son exemple fictif', () => {
    const f = investmentBySlug['donation']!;
    expect(DONATION_PAR_PARENT).toBe(131_865);
    expect(DONATION_TOTAL_DEUX_PARENTS).toBe(263_730);
    const svg = renderToStaticMarkup(createElement(SchemaDonation)).replace(/[  ]/g, ' ');
    expect(svg).toContain('263 730');
    expect(svg).toContain('131 865');
    expect(f.tax.text.replace(/[  ]/g, ' ')).toContain('131 865');
  });
});
