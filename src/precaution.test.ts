import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaPrecaution } from './components/Illustrations';
import { precautionRows } from './lib/illustrationData';
import { guideBySlug } from './data/guides';

describe('schéma « 3, 6 ou 9 mois de dépenses »', () => {
  it('recalcule dépenses mensuelles × mois', () => {
    expect(precautionRows().map((r) => [r.months, r.amount])).toEqual([[3, 6000], [6, 12000], [9, 18000]]);
  });
  it('reste cohérent avec l’exemple du guide', () => {
    const texte = guideBySlug['combien-epargne-de-precaution'].sections[0].body.join(' ').replace(/[\u00a0\u202f]/g, ' ');
    for (const r of precautionRows()) expect(texte).toContain(`${r.amount.toLocaleString('fr-FR').replace(/[\u00a0\u202f]/g, ' ')} €`);
  });
  it('est accessible, léger et marqué « exemple fictif »', () => {
    const html = renderToStaticMarkup(createElement(SchemaPrecaution));
    expect(html).toContain('role="img"');
    expect(html).toContain('exemple fictif');
    expect(html.length).toBeLessThan(15000);
  });
});
