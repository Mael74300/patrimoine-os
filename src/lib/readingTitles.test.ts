import { describe, expect, it } from 'vitest';
import { guideBySlug } from '../data/guides';
import { investmentBySlug } from '../data/investments';
import { guideTitles, investmentNames } from './readingTitles';
import { nextForSimulator, simsForGuide, simsForInvestment } from './relatedSims';

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
});
