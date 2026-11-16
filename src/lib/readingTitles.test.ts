import { describe, expect, it } from 'vitest';
import { guideBySlug } from '../data/guides';
import { investmentBySlug } from '../data/investments';
import { guideTitles, investmentNames, investmentSummaries } from './readingTitles';
import { nextForComparator, nextForSimulator, readingForSimulator, simsForGuide, simsForInvestment } from './relatedSims';
import { simBlurbs } from './simBlurbs';

const cited = (k: string) => Object.values(nextForSimulator).flat().filter((r) => r.startsWith(`${k}:`)).map((r) => r.slice(2));
const guideKeys = [...new Set([...Object.keys(simsForGuide), ...cited('g')])];
const ficheKeys = [...new Set([...Object.keys(simsForInvestment), ...cited('f')])];

describe('titres de « Pour aller plus loin »', () => {
  it('chaque guide lié a le même titre que dans les données', () => {
    for (const slug of guideKeys) expect(guideTitles[slug], slug).toBe(guideBySlug[slug]?.title);
  });
  it('chaque fiche liée a le même nom que dans les données', () => {
    for (const slug of ficheKeys) expect(investmentNames[slug], slug).toBe(investmentBySlug[slug]?.name);
  });
  it('aucune entrée inutile', () => {
    expect(Object.keys(guideTitles).sort()).toEqual(guideKeys.sort());
    expect(Object.keys(investmentNames).sort()).toEqual(ficheKeys.sort());
  });
  it('chaque fiche citée en bas d’un simulateur a son résumé, mot pour mot', () => {
    const cites = [...new Set([...Object.values(nextForSimulator).flat(), ...nextForComparator].filter((r) => r.startsWith('f:')).map((r) => r.slice(2)))];
    expect(Object.keys(investmentSummaries).sort()).toEqual(cites.sort());
    for (const slug of cites) expect(investmentSummaries[slug], slug).toBe(investmentBySlug[slug]?.summary);
  });
  it('en bas d’un simulateur, fiches et simulateurs ont leur phrase de résumé, les guides leur seul titre (comme sur les fiches)', () => {
    for (const s of Object.keys(nextForSimulator)) {
      for (const l of readingForSimulator(s)) {
        const id = l.to.split('/').pop()!;
        if (l.kind === 'Guide') { expect(l.blurb, l.to).toBeUndefined(); continue; }
        const want = l.kind === 'Fiche' ? investmentSummaries[id] : simBlurbs[id];
        expect(want, l.to).toBeTruthy();
        expect(l.blurb, l.to).toBe(want);
      }
    }
  });
});
