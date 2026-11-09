import { describe, expect, it } from 'vitest';
import { guideBySlug } from '../data/guides';
import { investmentBySlug } from '../data/investments';
import { guideTitles, investmentNames } from './readingTitles';
import { simsForGuide, simsForInvestment } from './relatedSims';

describe('titres de « Pour aller plus loin »', () => {
  it('chaque guide lié a le même titre que dans les données', () => {
    for (const slug of Object.keys(simsForGuide)) expect(guideTitles[slug], slug).toBe(guideBySlug[slug]?.title);
  });
  it('chaque fiche liée a le même nom que dans les données', () => {
    for (const slug of Object.keys(simsForInvestment)) expect(investmentNames[slug], slug).toBe(investmentBySlug[slug]?.name);
  });
  it('aucune entrée inutile', () => {
    expect(Object.keys(guideTitles).sort()).toEqual(Object.keys(simsForGuide).sort());
    expect(Object.keys(investmentNames).sort()).toEqual(Object.keys(simsForInvestment).sort());
  });
});
