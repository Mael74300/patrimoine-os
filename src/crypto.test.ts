import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaCrypto } from './components/Illustrations';
import { investmentBySlug } from './data/investments';

describe('schéma « Cryptomonnaies »', () => {
  const svg = renderToStaticMarkup(createElement(SchemaCrypto));
  const fiche = investmentBySlug['cryptomonnaies'];

  it('reste cohérent avec la fiche (PSCA, 1er juillet 2026, FGDR)', () => {
    const texte = fiche.howToInvest.join(' ') + fiche.cons.join(' ');
    expect(texte).toContain('PSCA');
    expect(texte).toContain('1er juillet 2026');
    expect(texte).toContain('FGDR');
    expect(svg).toContain('PSCA');
    expect(svg).toContain('1er juillet 2026');
    expect(svg).toContain('FGDR');
  });
  it('ne contient aucun chiffre hormis la date citée', () => {
    const texte = svg.replace(/<[^>]+>/g, ' ').replace(/ill-cr-[td]/g, '').replace(/1er juillet 2026/g, '');
    expect(texte).not.toMatch(/\d/);
  });
  it('cite la source AMF et reste léger', () => {
    expect(fiche.sources.some((s) => s.url.includes('investir-en-crypto-monnaies-quel-professionnel-choisir'))).toBe(true);
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
  });
});
