import { describe, expect, it } from 'vitest';
import { search, searchSuggestions } from './lib/search';
import { guides } from './data/guides';
import { investments } from './data/investments';
import { simulators } from './lib/search';

describe('recherche', () => {
  it('trouve un mot au pluriel', () => {
    expect(search('livrets').length).toBeGreaterThan(0);
    expect(search('simulateurs de crédits').length).toBeGreaterThan(0);
  });
  it('un mot commence un mot du texte : « bourse » ne trouve plus « rembourser »', () => {
    const titles = search('bourse').map((h) => h.title.toLowerCase());
    expect(titles.length).toBeGreaterThan(0);
    expect(titles.some((t) => t.includes('rembourser'))).toBe(false);
  });
  it('les mots courants absents du site renvoient vers la bonne page', () => {
    expect(search('bitcoin')[0].to).toBe('/encyclopedie/cryptomonnaies');
    expect(search('héritage').some((h) => h.to === '/encyclopedie/donation')).toBe(true);
    expect(search('pierre papier').some((h) => h.to === '/encyclopedie/scpi')).toBe(true);
    expect(search('défiscaliser').some((h) => h.to === '/encyclopedie/per')).toBe(true);
  });
  it('les sigles courants trouvent la bonne fiche', () => {
    expect(search('cpf').some((h) => h.to === '/encyclopedie/capital-humain')).toBe(true);
    expect(search('crowdfunding').length).toBeGreaterThan(0);
    expect(search('tmi').length).toBeGreaterThan(0);
  });
  it('le glossaire est cherchable, avec une ancre existante', () => {
    const hits = search('volatilité');
    const g = hits.find((h) => h.kind === 'Glossaire');
    expect(g?.to).toBe('/glossaire#volatilite');
    expect(search('livret a')[0].kind).toBe('Fiche');
  });
  it('les suggestions pointent vers des pages existantes', () => {
    const ok = new Set([
      ...guides.map((g) => `/guides/${g.slug}`),
      ...investments.map((i) => `/encyclopedie/${i.slug}`),
      ...simulators.map((s) => `/simulateurs/${s.slug}`),
    ]);
    for (const s of searchSuggestions) expect(ok.has(s.to), s.to).toBe(true);
  });
});
