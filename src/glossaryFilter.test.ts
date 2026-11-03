import { describe, expect, it } from 'vitest';
import { glossary } from './data/glossary';
import { filterGlossary } from './lib/glossaryFilter';

describe('filtre du glossaire', () => {
  it('sans saisie, rend toutes les notions', () => {
    expect(filterGlossary(glossary, '  ')).toHaveLength(glossary.length);
  });
  it('ignore accents et casse', () => {
    expect(filterGlossary(glossary, 'EPARGNE de precaution').map((t) => t.term)).toContain('Épargne de précaution');
  });
  it('trouve un mot de la définition et exige tous les mots', () => {
    expect(filterGlossary(glossary, 'inflation').length).toBeGreaterThan(0);
    expect(filterGlossary(glossary, 'inflation zzzzqq')).toHaveLength(0);
  });
});
