import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Compare from './pages/Compare';
import { investments, investmentBySlug } from './data/investments';
import { DONATION_ABATTEMENTS, fmtEuros } from './data/donationAbattements';
import { checkedParts } from './lib/ficheText';
import { CMP_VISIBLE_LINES, compareCell, donationLead, standaloneSentence } from './lib/compareCell';
import { PRINT_OPEN_SELECTOR } from './lib/print';

const FIELDS = ['minCapital', 'fees', 'tax'] as const;

describe('Comparateur : cases Frais et Fiscalité courtes', () => {
  it('montre trois lignes au plus et replie la suite, sans jamais replier une seule ligne', () => {
    for (const i of investments) {
      for (const f of FIELDS) {
        const { shown, more } = compareCell(i[f], i.slug, f);
        expect(shown.length).toBeLessThanOrEqual(CMP_VISIBLE_LINES + 1);
        if (more.length > 0) {
          expect(shown.length).toBe(CMP_VISIBLE_LINES);
          expect(more.length).toBeGreaterThanOrEqual(2);
        }
      }
    }
  });

  it('ne perd aucune phrase de la fiche, dans le même ordre', () => {
    for (const i of investments) {
      for (const f of FIELDS) {
        const { shown, more } = compareCell(i[f], i.slug, f);
        const all = [...shown, ...more];
        const expected = checkedParts(i[f], true).map(standaloneSentence);
        expect(all.slice(all.length - expected.length)).toEqual(expected);
      }
    }
  });

  it('ne renvoie jamais à un schéma absent du comparateur', () => {
    for (const i of investments) {
      for (const f of FIELDS) {
        const { shown, more } = compareCell(i[f], i.slug, f);
        for (const t of [...shown, ...more]) expect(t).not.toMatch(/schéma|ci-dessous|ci-dessus|plus bas/);
      }
    }
    const av = compareCell(investmentBySlug['assurance-vie'].tax, 'assurance-vie', 'tax');
    expect([...av.shown, ...av.more].some((t) => t.startsWith('Au décès : règles détaillées dans la fiche'))).toBe(true);
  });

  it('Donation : annonce l’abattement d’un parent à un enfant avant le « en plus » du handicap, depuis la donnée du tableau', () => {
    const enfant = DONATION_ABATTEMENTS.find((a) => a.lien === 'Enfant')!.montant;
    expect(donationLead()).toContain(fmtEuros(enfant));
    expect(donationLead()).toContain('15 ans');
    const { shown } = compareCell(investmentBySlug.donation.tax, 'donation', 'tax');
    expect(shown[0]).toBe(donationLead());
    expect(shown[1]).toMatch(/^Une personne en situation de handicap bénéficie en plus/);
  });

  it('assurance-vie : les trois lignes visibles sont les prélèvements sociaux et l’impôt avant et après 8 ans', () => {
    const { shown, more } = compareCell(investmentBySlug['assurance-vie'].tax, 'assurance-vie', 'tax');
    expect(shown.map((t) => t.replace(/[\u00a0\u202f]/g, ' ').split(' :')[0])).toEqual(['Prélèvements sociaux', 'Contrat de moins de 8 ans', 'Contrat de 8 ans ou plus']);
    expect(more.length).toBe(3);
  });

  it('le repli est dans le HTML pré-rendu (tout le texte reste lisible sans JavaScript) et s’ouvre à l’impression', () => {
    const html = renderToString(createElement(MemoryRouter, null, createElement(Compare))).replace(/<!-- -->/g, '');
    expect(html).toContain('<details class="cmp-more"><summary>3 autres points</summary>');
    expect(html).not.toContain('voir le schéma');
    expect(PRINT_OPEN_SELECTOR).toContain('details.cmp-more');
  });
});
