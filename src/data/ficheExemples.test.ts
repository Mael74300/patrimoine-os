import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { investmentBySlug } from './investments';
import { bondCoupons, crowdfundingScenario, fundFeesOnSubscribed, listedPropertyYear, microFoncierExample, repriseDebtShare, scpiFeesPayback, yearlySavingsValue } from '../lib/calc/ficheExemples';
import { amortize } from '../lib/calc/loan';
import { CROWDFUNDING_EXAMPLE, LEVERAGE_EXAMPLE, LOAN_EXAMPLE, LOCATION_NUE_EXAMPLE, REPRISE_EXAMPLE, SCPI_EXAMPLE, leverageBars } from '../lib/illustrationData';
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

/**
 * Exemples fictifs complétés jusqu'au résultat (fiches Obligations, Capital-investissement, Créer son entreprise et
 * Foncières cotées, 2026-11-16) : chaque montant du texte est recalculé ici. Aucun chiffre réglementaire n'est ajouté ;
 * le taux de frais fictif du capital-investissement reste dans la fourchette sourcée de la rubrique Frais de la fiche.
 */
describe('fiches : exemples chiffrés menés jusqu’au résultat', () => {
  const ex = (slug: string) => norm(investmentBySlug[slug]!.example);

  it('Obligations : 1 000 € à 3 % pendant 5 ans → 30 € par an, 150 € en tout, puis 1 000 € remboursés', () => {
    const r = bondCoupons(1000, 3, 5);
    expect(r).toEqual({ coupon: 30, totalCoupons: 150, received: 1150 });
    const t = ex('obligations');
    expect(t).toMatch(/^Exemple fictif/);
    for (const s of [`prêtez ${eur(1000)}`, 'pendant 5 ans', 'coupon de 3 % par an', `${eur(r.coupon)} chaque année`, `${eur(r.totalCoupons)} en tout`, `vos ${eur(1000)} à l’échéance`, 'avant impôt et frais']) expect(t).toContain(s);
  });

  it('Capital-investissement : 3 % par an de 5 000 € souscrits pendant 8 ans → 150 € par an, 1 200 € en tout', () => {
    const r = fundFeesOnSubscribed(5000, 3, 8);
    expect(r).toEqual({ yearly: 150, total: 1200 });
    const t = ex('private-equity');
    expect(t).toMatch(/^Exemple fictif/);
    for (const s of [`${eur(5000)} souscrits`, 'bloqués 8 ans', 'frais de 3 % par an des sommes souscrites', `${eur(r.yearly)} par an`, `${eur(r.total)} sur 8 ans`, 'Rien n’est garanti']) expect(t).toContain(s);
    // 3 % se situe entre les médianes sourcées de la rubrique Frais (FCPR 2,4 % à 2,5 %, FIP 3,5 %).
    const fees = norm(investmentBySlug['private-equity']!.fees.text);
    expect(fees).toContain('plus de 3,5 % par an des sommes souscrites');
    expect(fees).toContain('plus de 2,4 % à 2,5 %');
  });

  it('Créer son entreprise : 10 000 € par an pendant 10 ans → 100 000 € versés, environ 120 100 € à 4 %', () => {
    const r = yearlySavingsValue(10000, 4, 10);
    expect(r).toEqual({ saved: 100000, withGrowth: 120100 });
    const t = ex('creation-entreprise');
    expect(t).toMatch(/^Exemple fictif/);
    for (const s of [`${eur(30000)} de bénéfice par an`, `${eur(10000)} épargnés chaque année`, `${eur(r.saved)} mis de côté`, '4 % par an', `environ ${eur(r.withGrowth)}`, 'sans garantie']) expect(t).toContain(s);
  });

  it('Foncières cotées : 5 000 €, baisse de 10 % → 4 500 € ; 4 % de dividendes → 200 €', () => {
    const r = listedPropertyYear(5000, 10, 4);
    expect(r).toEqual({ afterDrop: 4500, dividends: 200 });
    const t = ex('foncieres-cotees');
    expect(t).toMatch(/^Exemple fictif/);
    for (const s of [eur(5000), 'baisse de 10 %', `plus que ${eur(r.afterDrop)}`, '4 % de dividendes', `vous touchez ${eur(r.dividends)}`, 'avant impôt']) expect(t).toContain(s);
  });
});

describe('fiche Investir à crédit : l’exemple chiffré reprend le schéma du levier', () => {
  const ex = norm(investmentBySlug['credit-immobilier']!.example);
  const { principal, annualRate, years } = LOAN_EXAMPLE;
  const loan = amortize({ principal, annualRate, years });
  const { interest, down, bars } = leverageBars();
  const first = loan.schedule[0]!;

  it('montants recalculés : 6 199 € d’intérêts, 3 801 € restants, 199 € manquants, 6 328 € de capital', () => {
    expect(Math.round(interest)).toBe(6199);
    expect(bars.map((b) => Math.round(b.left))).toEqual([3801, 0]);
    expect(bars.map((b) => Math.round(b.shortfall))).toEqual([0, 199]);
    expect(Math.round(first.principalPaid)).toBe(6328);
    expect(Math.round(loan.monthlyPayment)).toBe(1044);
    expect(Math.round((loan.monthlyPayment * years * 12 - principal) / 10) * 10).toBe(70540);
  });
  it('le texte de la fiche cite les mêmes montants que le schéma et reste marqué fictif', () => {
    expect(ex).toMatch(/^Exemple fictif, celui du schéma/);
    for (const v of [LEVERAGE_EXAMPLE.price, down, principal, 1044, 6199, ...bars.map((b) => b.income), 3801, 199, 6328, 70540]) expect(ex).toContain(eur(v));
    expect(ex).toContain(`${norm((annualRate * 100).toLocaleString('fr-FR'))} %`);
    expect(ex).toContain('avant impôt');
    expect(ex).not.toContain('6 200');
  });
});

describe('guide Investir à crédit : l’exemple reprend les schémas et chiffre l’effort de trésorerie', () => {
  const g = guideBySlug['investir-a-credit']!;
  const sec = g.sections.find((s) => s.heading === 'Un exemple fictif')!;
  const text = norm(sec.body.join(' '));
  const { principal, annualRate, years } = LOAN_EXAMPLE;
  const loan = amortize({ principal, annualRate, years });
  const yearly = loan.monthlyPayment * 12;
  const { interest, down, bars } = leverageBars();
  const first = loan.schedule[0]!;
  // Effort de l'emprunteur la première année : annuités du crédit (hors assurance) moins loyers nets de charges, avant impôt.
  const effort = bars.map((b) => yearly - b.income);

  it('montants recalculés : 12 527 € par an, effort de 2 527 € (211 € par mois) à 5 % et 6 527 € (544 € par mois) à 3 %', () => {
    expect(Math.round(yearly)).toBe(12527);
    expect(effort.map(Math.round)).toEqual([2527, 6527]);
    expect(effort.map((e) => Math.round(e / 12))).toEqual([211, 544]);
    // À 5 %, l'effort est exactement le capital remboursé moins ce qui reste après les intérêts.
    expect(Math.round(first.principalPaid - bars[0]!.left)).toBe(2527);
  });
  it('le texte cite les montants des deux schémas, sans arrondi qui les contredise', () => {
    for (const v of [LEVERAGE_EXAMPLE.price, down, principal, 1044, 12527, Math.round(interest), Math.round(first.principalPaid), 3801, 199, 2527, 211, 6527, 544]) expect(text).toContain(eur(v));
    expect(text).toContain(`${Math.round((bars[0]!.left / down) * 100)} % de l’apport`);
    expect(text).toContain('avant impôt et hors assurance');
    expect(text).not.toMatch(/6 200|3 800|environ 200 €/);
  });
  it('reste un exemple fictif, mis à jour', () => {
    expect(sec.heading).toBe('Un exemple fictif');
    expect(g.updatedOn).toBe('2026-11-16');
  });
});
