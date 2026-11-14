import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaQuinzaines } from './components/Illustrations';
import { guideBySlug } from './data/guides';

describe('schéma « Livret A : le jour de l’opération décide »', () => {
  const svg = renderToStaticMarkup(createElement(SchemaQuinzaines));
  const guide = guideBySlug['livret-a-calcul-interets-quinzaines'];
  const texte = guide.sections.map((s) => [s.heading, ...s.body].join(' ')).join(' ');

  it('est placé sous la première section ; le texte reprend les exemples de Service-Public.fr et le schéma la règle', () => {
    expect(guide.sections[0].heading).toBe('Des intérêts calculés par quinzaines');
    expect(texte).toContain('Dépôt le 10 mai (entre le 1er et le 15) : il rapporte dès le 16 mai');
    expect(texte).toContain('Dépôt le 20 mai (à partir du 16) : il rapporte dès le 1er juin');
    expect(texte).toContain('Retrait le 10 mai (jusqu’au 15) : la banque retient le solde du 30 avril');
    expect(texte).toContain('Retrait le 20 mai (à partir du 16) : la banque retient le solde du 15 mai');
    expect(svg).toContain('Un dépôt du 1er au 15 du mois rapporte à partir du 16 du même mois');
    expect(svg).toContain('un retrait à partir du 16, sur le solde arrêté au 15');
  });
  it('ne montre que les dates 1er, 15 et 16 et reste léger et accessible', () => {
    const chiffres = svg.replace(/<[^>]+>/g, ' ').match(/\d+/g) ?? [];
    expect(new Set(chiffres)).toEqual(new Set(['1', '15', '16']));
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
  });
});

describe('schéma des quinzaines : quatre frises lisibles sur mobile', () => {
  const svg = renderToStaticMarkup(createElement(SchemaQuinzaines));
  it('est dessiné en viewBox 340 (textes ~13,5 px à 375 px)', () => {
    expect(svg).toContain('viewBox="0 0 340 ');
  });
  it('chaque frise dit la règle de Service-Public.fr (F2365) et place la bande « rapporte » au bon endroit du calendrier', () => {
    const txt = svg.replace(/<[^>]+>/g, '').replace(/&#x27;|’/g, '’');
    expect(txt).toContain('Dépôt : rapporte dès le 16');
    expect(txt).toContain('Dépôt : rapporte dès le 1er du mois suivant');
    expect(txt).toContain('Retrait : ne rapporte plus dès le 1er');
    expect(txt).toContain('Retrait : ne rapporte plus dès le 16');
    // Bandes vertes (accent) : calendrier 1 | 64 (1er) | 164 (16) | 264 (mois suivant) | 339.
    const bandes = [...svg.matchAll(/<rect x="(\d+)" y="\d+" width="(\d+)" height="20" rx="6" fill="var\(--accent-soft\)"/g)].map((m) => [Number(m[1]), Number(m[1]) + Number(m[2])]);
    expect(bandes).toEqual([[164, 339], [264, 339], [1, 64], [1, 164]]);
  });
  it('les titres des frises tiennent dans la largeur du dessin', () => {
    const largeur = (gras: string, normal: string) => gras.length * 0.56 * 14.5 + normal.length * 0.52 * 13;
    expect(largeur('Dépôt', ' : rapporte dès le 1er du mois suivant')).toBeLessThan(340);
    expect(largeur('Retrait', ' : ne rapporte plus dès le 1er')).toBeLessThan(340);
  });
});

describe('fiche Livret A : règle des quinzaines cohérente avec le guide', () => {
  it('la fiche et le guide donnent les mêmes dates (16, 1er du mois suivant, 31 décembre)', async () => {
    const { investmentBySlug } = await import('./data/investments');
    const f = investmentBySlug['livret-a'].howItWorks;
    expect(f).toContain("jusqu'au 15 du mois rapporte à partir du 16");
    expect(f).toContain('à partir du 16 rapporte à partir du 1er du mois suivant');
    expect(f).toContain('31 décembre');
    const g = JSON.stringify(guideBySlug['livret-a-calcul-interets-quinzaines']);
    expect(g).toContain('(entre le 1er et le 15) : il rapporte dès le 16 mai');
    expect(g).toContain('(à partir du 16) : il rapporte dès le 1er juin');
    expect(g).toContain('31 décembre');
  });
});

describe('fiche Livret A : le schéma des quinzaines est affiché', () => {
  it('InvestmentPage place SchemaQuinzaines sur la fiche livret-a', async () => {
    const src = (await import('./pages/InvestmentPage.tsx?raw')).default;
    expect(src).toContain("inv.slug === 'livret-a' && <SchemaQuinzaines />");
  });
});
