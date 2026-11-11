import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { fmtDate } from './dates';
import { investments } from '../data/investments';
import { glossary } from '../data/glossary';
import { guides } from '../data/guides';
import { CheckedText } from '../components/ui';

const ISO = /\b\d{4}-\d{2}-\d{2}\b/;
const plain = (s: string) => s.replace(/ /g, ' ');

describe('dates en toutes lettres', () => {
  it('convertit le format ISO en français, « 1er » pour le premier du mois', () => {
    expect(plain(fmtDate('2026-11-08'))).toBe('8 novembre 2026');
    expect(plain(fmtDate('2026-08-01'))).toBe('1er août 2026');
    expect(plain(fmtDate('2027-02-01'))).toBe('1er février 2027');
    expect(plain(fmtDate('2026-12-31'))).toBe('31 décembre 2026');
  });

  it('laisse intacte une date déjà écrite en lettres', () => {
    expect(fmtDate('10 octobre 2026')).toBe('10 octobre 2026');
  });

  it('les badges « vérifié au » des fiches affichent toujours une date en lettres', () => {
    for (const inv of investments) {
      for (const c of [inv.minCapital, inv.fees, inv.tax]) {
        if (!c?.verified || !c.asOf) continue;
        const html = renderToStaticMarkup(createElement(CheckedText, { c }));
        expect(html, `${inv.slug} : ${c.asOf}`).not.toMatch(ISO);
        expect(plain(html)).toMatch(/vérifié(<!-- -->)? au \d{1,2}(er)? [a-zéû]+ 20\d\d/);
      }
    }
  });

  it('aucun texte affiché des fiches, guides et glossaire ne contient de date au format machine', () => {
    const texts: string[] = [];
    for (const inv of investments) {
      const { review, ...rest } = inv;
      texts.push(JSON.stringify(rest).replace(/"asOf":"[^"]*"/g, ''));
      texts.push(...review.data, ...review.assumptions);
    }
    for (const g of glossary) texts.push(g.definition);
    for (const g of guides) texts.push(JSON.stringify(g).replace(/"(updatedOn|verifiedOn|nextReview|publishedOn|asOf)":"[^"]*"/g, ''));
    for (const t of texts) expect(t).not.toMatch(ISO);
  });
});
