import { describe, expect, it } from 'vitest';
import { investments } from './data/investments';
import { annotateFiche } from './lib/ficheText';
import { isLink } from './lib/jargon';
import { linkRegExp, INLINE_LINKS } from './lib/inlineLinks';

/**
 * Rubrique « Fiscalité française » d'une fiche qui renvoie à une autre fiche (« voir la fiche PEA ») :
 * le visiteur arrivé par un moteur de recherche doit pouvoir y aller d'un clic, sans impasse.
 */
describe('Fiches : la fiscalité renvoie à des fiches cliquables', () => {
  it('chaque « fiche X » citée dans la fiscalité est un lien sur la page', () => {
    let cited = 0;
    for (const inv of investments) {
      const segs = annotateFiche(inv).tax.flat();
      const links = segs.filter(isLink).map((s) => s.to);
      for (const l of INLINE_LINKS.filter((x) => x.phrase.startsWith('fiche '))) {
        if (!linkRegExp(l.phrase).test(inv.tax.text)) continue;
        cited++;
        expect(links, `${inv.slug} : ${l.phrase}`).toContain(l.to);
      }
    }
    expect(cited).toBeGreaterThanOrEqual(10);
  });

  it('une fiscalité qui renvoie à une enveloppe nomme la fiche à lire', () => {
    for (const inv of investments) {
      if (/^(Celle de|Selon l’enveloppe|Fiscalité de l’enveloppe)/.test(inv.tax.text)) {
        expect(inv.tax.text, inv.slug).toMatch(/voir la fiche/);
      }
    }
  });
});
