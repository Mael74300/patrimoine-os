import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaQuinzaines } from './components/Illustrations';
import { guideBySlug } from './data/guides';

describe('schéma « Livret A : le jour de l’opération décide »', () => {
  const svg = renderToStaticMarkup(createElement(SchemaQuinzaines));
  const guide = guideBySlug['livret-a-calcul-interets-quinzaines'];
  const texte = guide.sections.map((s) => [s.heading, ...s.body].join(' ')).join(' ');

  it('est placé sous une section qui existe et reprend les règles du texte du guide', () => {
    expect(guide.sections.some((s) => s.heading === 'Et un retrait ?')).toBe(true);
    expect(texte).toContain('entre le 1er et le 15 du mois est pris en compte à partir du 16 du même mois');
    expect(texte).toContain('à partir du 16 est pris en compte à partir du 1er du mois suivant');
    expect(texte).toContain('jusqu’au 15 du mois est calculé sur le solde arrêté au dernier jour du mois précédent');
    expect(texte).toContain('à partir du 16 est calculé sur le solde arrêté au 15 du mois');
  });
  it('ne montre que les dates 1er, 15 et 16 et reste léger et accessible', () => {
    const chiffres = svg.replace(/<[^>]+>/g, ' ').match(/\d+/g) ?? [];
    expect(new Set(chiffres)).toEqual(new Set(['1', '15', '16']));
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
  });
});
