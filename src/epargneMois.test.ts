import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaEpargneMois } from './components/Illustrations';
import { SchemaHorizons, HORIZONS_EPARGNE } from './components/schemas/guides';
import { epargneMoisRows } from './lib/illustrationData';
import { guideBySlug } from './data/guides';

describe('schéma « combien épargner par mois »', () => {
  const guide = guideBySlug['combien-epargner-par-mois-objectif'];
  const texte = guide.sections.map((s) => s.body.join(' ')).join(' ').replace(/\u00a0/g, ' ');
  it('recalcule les versements cités dans le guide', () => {
    const r = epargneMoisRows().map((x) => [x.years, Math.round(x.plain), Math.round(x.withRate)]);
    expect(r).toEqual([[3, 556, 542], [5, 333, 320], [10, 167, 153]]);
    expect(texte).toContain('environ 542 € par mois sur 3 ans, 320 € sur 5 ans et 153 € sur 10 ans');
    expect(texte).toContain('≈ 333 € par mois');
  });
  it('est accessible, léger et marqué « exemple fictif »', () => {
    const html = renderToStaticMarkup(createElement(SchemaEpargneMois));
    expect(html).toContain('role="img"');
    expect(html).toContain('exemple fictif');
    expect(html.length).toBeLessThan(15000);
  });
});

describe('schéma « où placer selon l’échéance »', () => {
  const guide = guideBySlug['combien-epargner-par-mois-objectif'];
  const texte = guide.sections.map((s) => s.body.join(' ')).join(' ').replace(/\u00a0/g, ' ');
  it('reprend les horizons cités dans le guide et cite leurs sources', () => {
    expect(HORIZONS_EPARGNE.map((h) => h.when)).toEqual(['Moins de 3 ans', 'De 3 à 8 ans environ', 'Au-delà de 8 à 10 ans']);
    expect(texte).toContain('Pour un projet à moins de 3 ans');
    const urls = guide.sources.map((s) => s.url);
    expect(urls).toContain('https://www.lafinancepourtous.com/pratique/placements/les-questions-clefs-avant-d-investir/horizon-objectifs-temperament/');
    expect(urls.some((u) => u.startsWith('https://www.banque-france.fr/'))).toBe(true);
  });
  it('est accessible et léger', () => {
    const html = renderToStaticMarkup(createElement(SchemaHorizons));
    expect(html).toContain('role="img"');
    expect(html).toContain('<desc');
    expect(html).toContain('Banque de France place le long terme au-delà de 10 ans');
    expect(html.length).toBeLessThan(15000);
  });
});
