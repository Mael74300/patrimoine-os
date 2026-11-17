import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaAdditionFrais, SchemaFrais } from './components/Illustrations';
import { FRAIS_EXAMPLE, FRAIS_OFFRES, fraisOffresTotals, fraisRows } from './lib/illustrationData';
import { guideBySlug } from './data/guides';

describe('schéma « effet des frais »', () => {
  const guide = guideBySlug['comparer-les-frais'];
  const texte = guide.sections.map((s) => s.body.join(' ')).join(' ').replace(/\u00a0/g, ' ');
  it('recalcule les montants cités dans le guide', () => {
    const r = fraisRows();
    expect(r.map((x) => [x.fees, x.final])).toEqual([[0, 42900], [0.002, 40800], [0.015, 29400]]);
    expect(texte).toContain('environ 40 800 € avec 0,2 % de frais annuels');
    expect(texte).toContain('environ 29 400 € avec 1,5 %');
  });
  it('est accessible, léger et marqué « exemple fictif »', () => {
    const html = renderToStaticMarkup(createElement(SchemaFrais));
    expect(html).toContain('role="img"');
    expect(html).toContain('exemple fictif');
    expect(html.length).toBeLessThan(15000);
  });
});

describe('schéma « additionner les frais »', () => {
  it('additionne exactement vers les deux totaux de l’exemple sur 25 ans', () => {
    // Offre 1 = 1,5 % (frais élevés de l'exemple), offre 2 = 0,2 % (frais faibles).
    expect(fraisOffresTotals()).toEqual([FRAIS_EXAMPLE.levels[2], FRAIS_EXAMPLE.levels[1]]);
    FRAIS_OFFRES.forEach((o) => expect(o.parts).toHaveLength(2));
  });
  it('est accessible, léger, marqué « exemple fictif » et montre les taux', () => {
    const html = renderToStaticMarkup(createElement(SchemaAdditionFrais));
    expect(html).toContain('role="img"');
    expect(html).toContain('Exemple fictif');
    for (const t of ['0,7\u00a0%', '0,8\u00a0%', '1,5\u00a0%', '0,15\u00a0%', '0,05\u00a0%', '0,2\u00a0%']) expect(html).toContain(t);
    expect(html.length).toBeLessThan(15000);
  });
  it('est placé dans la rubrique « Additionner pour comparer », reprise par l’exemple', () => {
    const g = guideBySlug['comparer-les-frais'];
    expect(g.sections.some((s) => s.heading === 'Additionner pour comparer')).toBe(true);
    expect(g.sections.find((s) => s.heading.startsWith('L’effet'))?.body[0]).toContain('avec les deux offres ci-dessus');
    expect(g.cta?.to).toBe('/simulateurs/frais');
  });
});
