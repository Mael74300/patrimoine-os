import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaAssuranceVieDeces } from './components/Illustrations';
import { investmentBySlug } from './data/investments';

describe('schéma de la fiche Assurance-vie : transmission au décès', () => {
  it('reprend les mêmes chiffres que le texte de la fiche (impots.gouv.fr, consulté le 2026-11-08)', () => {
    const norm = (t: string) => t.replace(/[  ]/g, ' ');
    const svg = norm(renderToStaticMarkup(createElement(SchemaAssuranceVieDeces)));
    const tax = norm(investmentBySlug['assurance-vie'].tax.text);
    for (const m of ['152 500 €', '20 %', '700 000 €', '31,25 %', '30 500 €', '70 ans', '13 octobre 1998']) {
      expect(svg).toContain(m);
      expect(tax).toContain(m);
    }
  });
});
