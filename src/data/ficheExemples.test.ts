import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { investmentBySlug } from './investments';
import { crowdfundingScenario, microFoncierExample, repriseDebtShare, scpiFeesPayback } from '../lib/calc/ficheExemples';
import { amortize } from '../lib/calc/loan';
import { CROWDFUNDING_EXAMPLE, LOCATION_NUE_EXAMPLE, REPRISE_EXAMPLE, SCPI_EXAMPLE } from '../lib/illustrationData';
import { SchemaCrowdfundingBilan, SchemaLocationNueBilan, SchemaRepriseBilan, SchemaScpiBilan } from '../components/schemas/fiches';
import { guideBySlug } from './guides';

/**
 * Exemples fictifs des fiches Financement participatif et SCPI : montants recalculés, cohérents entre le texte de la fiche
 * et son schéma. Frais d'entrée des SCPI : 6 % à 12 % du montant souscrit (La finance pour tous, mise à jour le
 * 2 janvier 2024, consultée le 2026-11-13).
 */
const norm = (t: string) => t.replace(/[  ]/g, ' ');
const eur = (n: number) => `${norm(n.toLocaleString('fr-FR'))} €`;
const plain = (svg: string) => norm(svg.replace(/<[^>]+>/g, ' ').replace(/&#x27;|&#39;/g, '’'));

describe('fiche Financement participatif : ce qu’un défaut coûte', () => {
  const { projects, ticket, ratePct, defaults } = CROWDFUNDING_EXAMPLE;
  const rows = defaults.map((d) => crowdfundingScenario(projects, ticket, ratePct, d));
  const ex = norm(investmentBySlug['crowdfunding']!.example);

  it('montants recalculés : 180 € gagnés sans défaut, 71 € avec un défaut, 38 € perdus avec deux', () => {
    expect(rows.map((r) => r.recovered)).toEqual([2180, 2071, 1962]);
    expect(rows.map((r) => r.gain)).toEqual([180, 71, -38]);
    expect(rows[0]!.gainPct).toBe(ratePct);
  });
  it('le texte de la fiche cite les mêmes montants et reste marqué fictif', () => {
    expect(ex).toMatch(/^Exemple fictif/);
    for (const v of [projects * ticket, ticket, rows[0]!.gain, rows[1]!.gain, -rows[2]!.gain]) expect(ex).toContain(eur(v));
    expect(ex).toContain(`${projects} prêts`);
    expect(ex).toContain(`${ratePct} %`);
    expect(ex).toContain('Avant impôt et frais de plateforme');
  });
  it('le schéma montre les mêmes bilans, un carré par prêt', () => {
    const svg = renderToStaticMarkup(createElement(SchemaCrowdfundingBilan, null, 'légende'));
    const t = plain(svg);
    expect(t).toContain(`Bilan : ${eur(180)} gagnés`);
    expect(t).toContain(`Bilan : ${eur(71)} gagnés`);
    expect(t).toContain(`Bilan : ${eur(38)} perdus`);
    expect(svg.match(/<rect /g)!.length).toBe(projects * defaults.length + 2);
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
  });
});

describe('fiche SCPI : frais d’entrée compensés par les loyers', () => {
  const { amount, entryFeePct, distributionPct } = SCPI_EXAMPLE;
  const r = scpiFeesPayback(amount, entryFeePct, distributionPct);
  const fiche = investmentBySlug['scpi']!;
  const ex = norm(fiche.example);

  it('montants recalculés : 1 000 € de frais, 500 € par an, 2 ans', () => {
    expect(r).toEqual({ fees: 1000, yearly: 500, years: 2 });
  });
  it('taux de frais pris dans la fourchette sourcée de la rubrique Frais (6 % à 12 %)', () => {
    expect(norm(fiche.fees.text)).toContain('entre 6 % et 12 % du montant souscrit');
    expect(entryFeePct).toBeGreaterThanOrEqual(6);
    expect(entryFeePct).toBeLessThanOrEqual(12);
  });
  it('le texte de la fiche et le schéma citent les mêmes montants', () => {
    expect(ex).toMatch(/^Exemple fictif/);
    for (const v of [amount, r.fees, r.yearly]) expect(ex).toContain(eur(v));
    expect(ex).toContain(`${entryFeePct} %`);
    expect(ex).toContain(`${distributionPct} %`);
    expect(ex).toContain(`${r.years} ans`);
    const svg = renderToStaticMarkup(createElement(SchemaScpiBilan, null, 'légende'));
    const t = plain(svg);
    expect(t).toContain(eur(r.fees));
    expect(t).toContain(`année 2 : ${eur(r.yearly)}`);
    expect(t).toContain(`Après ${r.years} ans, frais compensés`);
    expect(svg.length).toBeLessThan(15000);
  });
});

/**
 * Fiche Location nue : micro-foncier (abattement de 30 %, loyers jusqu'à 15 000 € par an, choix du réel pour 3 ans :
 * Service-Public F1991), tranche à 30 % (F1419), prélèvements sociaux de 17,2 % sur les revenus fonciers (F1991, F2329).
 * Sources consultées le 2026-11-14.
 */
describe('fiche Location nue : ce que le micro-foncier impose', () => {
  const { price, monthlyRent, allowancePct, ceiling, marginalRatePct, socialPct } = LOCATION_NUE_EXAMPLE;
  const r = microFoncierExample(monthlyRent, allowancePct, marginalRatePct);
  const fiche = investmentBySlug['location-nue']!;
  const ex = norm(fiche.example);
  const pctFr = (n: number) => `${n.toLocaleString('fr-FR')} %`;

  it('montants recalculés : 9 000 € de loyers, 2 700 € retirés, 6 300 € imposés, 1 890 € d’impôt (21 %)', () => {
    expect(r).toEqual({ rents: 9000, allowance: 2700, taxable: 6300, incomeTax: 1890, incomeTaxPctOfRents: 21 });
    expect(r.rents).toBeLessThanOrEqual(ceiling);
  });
  it('mêmes règles que la rubrique Fiscalité de la fiche', () => {
    const tax = norm(fiche.tax.text);
    expect(tax).toContain(`ne dépassent pas ${eur(ceiling)} par an (abattement de ${pctFr(allowancePct)})`);
    expect(tax).toContain(`Prélèvements sociaux de ${pctFr(socialPct)}`);
  });
  it('même bien que le guide Rentabilité locative, qui renvoie vers la fiche', () => {
    const guide = guideBySlug['rentabilite-locative']!;
    const txt = norm(JSON.stringify(guide));
    expect(txt).toContain(`un bien de ${eur(price)} loué ${eur(monthlyRent)} par mois`);
    expect(txt).toContain('La fiche Location nue fait le calcul sur ce même bien.');
    expect(txt).not.toContain('quatre indicateurs');
  });
  it('le texte de la fiche et le schéma citent les mêmes montants', () => {
    expect(ex).toMatch(/^Exemple fictif/);
    for (const v of [price, monthlyRent, ceiling]) expect(ex).toContain(eur(v));
    expect(ex).toContain(`retire d’office ${pctFr(allowancePct)}`);
    expect(ex).toContain(`dépassent ${pctFr(allowancePct)} des loyers`);
    expect(ex).toContain('pour 3 ans');
    expect(fiche.sources.some((s) => s.url.endsWith('/F1991'))).toBe(true);
    expect(fiche.sources.some((s) => s.url.endsWith('/F1419'))).toBe(true);
    const svg = renderToStaticMarkup(createElement(SchemaLocationNueBilan, null, 'légende'));
    const t = plain(svg);
    for (const v of [r.rents, monthlyRent, r.allowance, r.taxable, r.incomeTax]) expect(t).toContain(eur(v));
    expect(t).toContain(`Impôt dans la tranche à ${pctFr(marginalRatePct)}`);
    expect(t).toContain(`soit ${pctFr(r.incomeTaxPctOfRents)} des loyers`);
    expect(t).toContain(`plus ${pctFr(socialPct)} de prélèvements sociaux`);
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
  });
});

describe('fiche Racheter une entreprise : ce que le prêt prend sur le résultat', () => {
  const { profit, price, loan, years, ratePct, dropPct } = REPRISE_EXAMPLE;
  const r = repriseDebtShare(profit, loan, ratePct, years, dropPct);
  const ex = norm(investmentBySlug['reprise-entreprise']!.example);

  it('montants recalculés : 5 468 € par mois, 65 610 € par an, 66 % du résultat, 34 390 € puis 4 390 € restants', () => {
    expect(r).toEqual({ monthly: 5468, yearly: 65610, sharePct: 66, left: 34390, leftAfterDrop: 4390, droppedProfit: 70000 });
    expect(Math.round(amortize({ principal: loan, annualRate: ratePct / 100, years }).monthlyPayment)).toBe(r.monthly);
  });
  it('le texte de la fiche cite les mêmes montants, le taux est dit fictif', () => {
    expect(ex).toMatch(/^Exemple fictif/);
    for (const v of [profit, price, loan, r.monthly, r.yearly, r.left, r.leftAfterDrop]) expect(ex).toContain(eur(v));
    expect(ex).toContain(`taux fictif de ${ratePct} %`);
    expect(ex).toContain(`${r.sharePct} % du résultat`);
    expect(ex).toContain(`baisse de ${dropPct} %`);
    expect(ex).toContain(`${years} ans`);
    expect(ex).toContain('sans impôt sur les bénéfices ni assurance du prêt');
  });
  it('le schéma montre les mêmes montants, barres proportionnelles', () => {
    const svg = renderToStaticMarkup(createElement(SchemaRepriseBilan, null, 'légende'));
    const t = plain(svg);
    for (const v of [profit, r.yearly, r.left, r.leftAfterDrop, r.droppedProfit, r.monthly]) expect(t).toContain(eur(v));
    expect(t).toContain(`Le prêt prend ${r.sharePct} % du résultat`);
    expect(t).toContain('taux fictif');
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
  });
});
