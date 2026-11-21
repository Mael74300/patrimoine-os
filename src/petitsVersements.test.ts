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
    // Le texte au-dessus du schéma donne les hypothèses et ce qu'il faut retenir, sans recopier les montants dessinés.
    const sec = guide.sections.find((s) => s.heading === 'Commencer petit, mais commencer')!.body.join(' ').replace(/\u00a0/g, ' ');
    for (const v of ['34 400 €', '18 000 €', '78 200 €', '45 000 €']) expect(sec).not.toContain(v);
    expect(sec).toContain('Exemple fictif, celui du schéma : 30 ans d’épargne à 4 % par an supposé, avec 50 € par mois fixes');
    expect(sec).toContain('100 € après 5 ans puis 150 € après 10 ans');
    expect(sec).toContain('À retenir :');
    // « près de la moitié du capital final vient des gains » et « fait plus que doubler ce capital » : recalculés.
    expect(sec).toContain('près de la moitié du capital final vient des gains');
    expect(r[0].gains / r[0].total).toBeGreaterThan(0.45);
    expect(r[0].gains / r[0].total).toBeLessThan(0.5);
    expect(sec).toContain('fait plus que doubler ce capital');
    expect(r[1].total / r[0].total).toBeGreaterThan(2);
    expect(r[1].total / r[0].total).toBeLessThan(2.5);
    // La FAQ, lue seule (et reprise dans les données structurées), garde le montant chiffré.
    expect(guide.faq![0].a.replace(/\u00a0/g, ' ')).toContain('environ 34 400 € pour 18 000 € versés');
  });
  it('ses paliers couvrent les 30 ans et redonnent les sommes versées', () => {
    for (const r of petitsVersementsRows()) {
      expect(r.phases.reduce((a, p) => a + p.years, 0)).toBe(30);
      expect(r.phases.reduce((a, p) => a + p.years * 12 * p.monthly, 0)).toBe(r.paid);
    }
    expect(petitsVersementsRows()[1].phases).toEqual([{ monthly: 50, years: 5 }, { monthly: 100, years: 5 }, { monthly: 150, years: 20 }]);
    const html = renderToStaticMarkup(createElement(SchemaPetitsVersements)).replace(/[\u00a0\u202f]/g, ' ');
    expect(html).toContain('5 ans à 50 €, 5 ans à 100 €, 20 ans à 150 €');
    expect(html).toContain('30 ans à 50 € par mois');
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
