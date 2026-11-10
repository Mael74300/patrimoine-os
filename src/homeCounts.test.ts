import { describe, expect, it } from 'vitest';
// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync } from 'node:fs';
import { investments } from './data/investments';
import { guides } from './data/guides';
import { glossary } from './data/glossary';
import { FICHES_COUNT, GUIDES_COUNT, GLOSSARY_COUNT } from './data/counts';

describe('nombres de l’accueil', () => {
  it('restent égaux aux totaux réels', () => {
    expect(FICHES_COUNT).toBe(investments.length);
    expect(GUIDES_COUNT).toBe(guides.length);
    expect(GLOSSARY_COUNT).toBe(glossary.length);
  });

  it('sont les mêmes dans le README', () => {
    const readme = readFileSync('README.md', 'utf8');
    expect(readme).toContain(`${FICHES_COUNT} fiches générées`);
    expect(readme).toContain(`${GUIDES_COUNT} guides, chacun`);
  });
});
