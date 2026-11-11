import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaPetitsVersements } from './components/Illustrations';
import { petitsVersementsRows } from './lib/illustrationData';
import { guideBySlug } from './data/guides';
import { splitLead } from './lib/jargon';

describe('schéma « petits versements »', () => {
  const guide = guideBySlug['epargne-limitee'];
  const texte = guide.sections.map((s) => s.body.join(' ')).join(' ').replace(/\u00a0/g, ' ');
  it('recalcule les montants cités dans le guide', () => {
    const r = petitsVersementsRows();
    expect(r.map((x) => [x.paid, x.total, x.gains])).toEqual([[18000, 34400, 16400], [45000, 78200, 33200]]);
    expect(texte).toContain('environ 34 400 € pour 18 000 € versés');
    expect(texte).toContain('environ 78 200 € pour 45 000 € versés');
  });
  it('est accessible, léger et marqué « exemple fictif »', () => {
    const html = renderToStaticMarkup(createElement(SchemaPetitsVersements));
    expect(html).toContain('role="img"');
    expect(html).toContain('exemple fictif');
    expect(html.length).toBeLessThan(15000);
  });
});

describe('guide Épargne limitée : priorités et pièges en listes', () => {
  const guide = guideBySlug['epargne-limitee'];
  const sec = (h: string) => guide.sections.find((s) => s.heading === h)!;
  it('présente les priorités et les pièges en points courts', () => {
    for (const h of ['Les priorités', 'Les pièges']) {
      expect(sec(h).points).toBe(true);
      for (const p of sec(h).body) expect(p.replace(/ /g, ' ')).toMatch(/^[^:]{3,45} : /);
    }
  });
  it('recalcule l’exemple fictif des frais fixes (2 € sur 50 € = 4 %)', () => {
    const t = sec('Les pièges').body[0].replace(/[  ]/g, ' ');
    const m = /(\d+) € de frais sur un versement de (\d+) €, c’est déjà (\d+) %/.exec(t)!;
    expect(t).toContain('Exemple fictif');
    expect((+m[1] / +m[2]) * 100).toBe(+m[3]);
  });
});

describe('splitLead', () => {
  it('isole l’amorce avant « : », notions du glossaire comprises', () => {
    const term = { text: 'LEP', term: {} as never, id: 'j1' };
    expect(splitLead(['Les frais fixes : sur un petit versement'])).toEqual({ lead: ['Les frais fixes'], rest: [' : sur un petit versement'] });
    expect(splitLead(['Le ', term, ', si vous y avez droit : c’est'])).toEqual({ lead: ['Le ', term, ', si vous y avez droit'], rest: [' : c’est'] });
    expect(splitLead(['Pas de deux-points ici'])).toBeNull();
  });
});
