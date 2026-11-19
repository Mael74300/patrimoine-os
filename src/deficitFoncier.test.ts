import { describe, expect, it } from 'vitest';
import { investmentBySlug } from './data/investments';
import { glossary } from './data/glossary';
import { search } from './lib/search';
import { annotateJargon, isTerm } from './lib/jargon';

// Règles vérifiées le 2026-11-19 sur Service-Public, fiche F1991 (vérifiée le 15 avril 2026 par la DILA).
const flat = (t: string) => t.replace(/ /g, ' ');

describe('déficit foncier', () => {
  const fiche = investmentBySlug['location-nue']!;
  const tax = flat(fiche.tax.text);
  it('la fiche Location nue donne le plafond, le report et la condition de location, datés', () => {
    expect(tax).toContain('Déficit foncier :');
    expect(tax).toContain('réduit vos autres revenus jusqu’à 10 700 € par an');
    expect(tax).toContain('la part du déficit hors intérêts d’emprunt');
    expect(tax).toContain('des 10 années suivantes');
    expect(tax).toContain('21 400 € pour certains travaux de rénovation énergétique payés jusqu’au 31 décembre 2027');
    expect(tax).toContain('garder le logement loué 3 ans après l’année de la déduction, sinon elle est reprise');
    expect(fiche.tax.asOf).toBe('19 novembre 2026');
    expect(fiche.review.taxValidAsOf).toBe('2026-11-19');
    expect(fiche.review.data.some((d) => flat(d).startsWith('Déficit foncier : 10 700 €') && d.includes('F1991'))).toBe(true);
  });
  it('le glossaire l’explique sans chiffre réglementaire et renvoie vers la fiche', () => {
    const t = glossary.find((g) => g.term === 'Déficit foncier')!;
    expect(t).toBeDefined();
    expect(/\d/.test(t.definition)).toBe(false);
    expect(t.links.some((l) => l.to === '/encyclopedie/location-nue')).toBe(true);
  });
  it('la recherche « déficit foncier » mène d’abord à la fiche Location nue', () => {
    expect(search('déficit foncier')[0].to).toBe('/encyclopedie/location-nue');
    expect(search('deficit foncier')[0].to).toBe('/encyclopedie/location-nue');
  });
  it('ailleurs qu’à la fiche, l’expression ouvre la définition en bulle', () => {
    const segs = annotateJargon(['Au régime réel, un déficit foncier peut apparaître.'], { path: '/guides/rentabilite-locative' }).flat();
    expect(segs.some((s) => isTerm(s) && s.term.term === 'Déficit foncier')).toBe(true);
  });
});
