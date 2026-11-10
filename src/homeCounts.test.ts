import { describe, expect, it } from 'vitest';
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
});
