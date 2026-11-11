import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { investments } from './data/investments';
import { guideBySlug } from './data/guides';
import { riskMap, ENVELOPES, NOT_PLACEMENTS, HIGH_EFFORT } from './lib/riskMap';
import { RiskMap } from './components/RiskMap';

describe('classement risque × horizon du guide Types d’investissements', () => {
  const { cells, envelopes } = riskMap(investments);
  const placed = cells.flatMap((c) => c.items);

  it('place chaque placement une seule fois, et les enveloppes à part', () => {
    const expected = investments.filter((i) => ![...ENVELOPES, ...NOT_PLACEMENTS].includes(i.slug as never));
    expect(placed.length).toBe(expected.length);
    expect(new Set(placed.map((i) => i.slug)).size).toBe(placed.length);
    expect(envelopes.map((e) => e.slug)).toEqual([...ENVELOPES]);
  });

  it('respecte les repères des fiches (pas de valeur inventée)', () => {
    const livret = cells.find((c) => c.items.some((i) => i.slug === 'livret-a'))!;
    expect([livret.risk, livret.horizon]).toEqual(['faible', 'court']);
    const etf = cells.find((c) => c.items.some((i) => i.slug === 'etf-monde'))!;
    expect([etf.risk, etf.horizon]).toEqual(['eleve', 'long']);
  });

  it('le composant montre toutes les fiches, signale l’effort élevé et reste un tableau accessible', () => {
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(RiskMap)));
    expect(html).toContain('<table');
    expect(html).toContain('scope="row"');
    [...placed, ...envelopes].forEach((i) => expect(html).toContain(`/encyclopedie/${i.slug}"`));
    const high = placed.filter((i) => i.effort >= HIGH_EFFORT).length;
    const table = html.slice(html.indexOf("<table"), html.indexOf("</table>"));
    expect(table.match(/class="rm-effort"/g)?.length).toBe(high);
  });

  it('le guide annonce un classement et le place sous la bonne section', () => {
    const g = guideBySlug['types-investissements'];
    expect(g.sections.some((s) => s.heading === 'Le classement')).toBe(true);
    expect(g.widget).toBeUndefined();
  });
});
