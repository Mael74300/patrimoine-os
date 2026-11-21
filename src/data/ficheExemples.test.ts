import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { investmentBySlug } from './investments';
import { bondCoupons, fondsEurosGrowth, livretQuinzaines, concentrationLoss, crowdfundingScenario, lepVsLivretA, pelVsLivretA, recoveryAfterDrop, fundFeesOnSubscribed, listedPropertyYear, microFoncierExample, repriseDebtShare, scpiFeesPayback, subscriptionChurn, trainingPayoff, yearlySavingsValue, termDepositVsLivretA, ucFeesDrag, forestCredit, artResale } from '../lib/calc/ficheExemples';
import { amortize } from '../lib/calc/loan';
import { CROWDFUNDING_EXAMPLE, LEVERAGE_EXAMPLE, LOAN_EXAMPLE, LMNP_EXAMPLE, LOCATION_NUE_EXAMPLE, REPRISE_EXAMPLE, SCPI_EXAMPLE, leverageBars, leverageMonth } from '../lib/illustrationData';
import { SchemaCrowdfundingBilan, SchemaLevierBilan, SchemaLivretBilan, SchemaMicroBilan, SchemaPee, SchemaPeeBilan, PEE_EXAMPLE, SchemaRepriseBilan, SchemaScpiBilan, livretBilan } from '../components/schemas/fiches';
import { guideBySlug } from './guides';
import { LIVRETS } from './livrets';

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
    const svg = renderToStaticMarkup(createElement(SchemaMicroBilan, { kind: 'location-nue' }, 'légende'));
    const t = plain(svg);
    for (const v of [r.rents, monthlyRent, r.allowance, r.taxable, r.incomeTax]) expect(t).toContain(eur(v));
    expect(t).toContain(`Impôt dans la tranche à ${pctFr(marginalRatePct)}`);
    expect(t).toContain(`soit ${pctFr(r.incomeTaxPctOfRents)} des loyers`);
    expect(t).toContain(`plus ${pctFr(socialPct)} de prélèvements sociaux`);
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
  });
});

/**
 * Fiche Location meublée (LMNP) : micro-BIC, abattement de 50 % pour la location meublée de longue durée, recettes jusqu'à
 * 83 600 € en 2026 (Service-Public F32744), tranche à 30 % (F1419). Sources consultées le 2026-11-19.
 */
describe('fiche Location meublée : ce que le micro-BIC impose', () => {
  const { price, monthlyRent, months, allowancePct, marginalRatePct } = LMNP_EXAMPLE;
  const r = microFoncierExample(monthlyRent, allowancePct, marginalRatePct, months);
  const fiche = investmentBySlug['lmnp']!;
  const ex = norm(fiche.example);
  const pctFr = (n: number) => `${n.toLocaleString('fr-FR')} %`;

  it('montants recalculés : 6 600 € de loyers, 3 300 € retirés, 3 300 € imposés, 990 € d’impôt (15 %)', () => {
    expect(r).toEqual({ rents: 6600, allowance: 3300, taxable: 3300, incomeTax: 990, incomeTaxPctOfRents: 15 });
  });
  it('mêmes règles que la rubrique Fiscalité de la fiche, recettes sous le plafond du micro-BIC', () => {
    const tax = norm(fiche.tax.text);
    expect(tax).toContain(`jusqu’à 83 600 € de recettes par an avec un abattement de ${pctFr(allowancePct)}`);
    expect(r.rents).toBeLessThanOrEqual(83600);
    expect(fiche.sources.some((s) => s.url.endsWith('/F32744'))).toBe(true);
    expect(fiche.sources.some((s) => s.url.endsWith('/F1419'))).toBe(true);
  });
  it('le texte de la fiche et le schéma citent les mêmes montants', () => {
    expect(ex).toMatch(/^Exemple fictif/);
    for (const v of [price, monthlyRent, r.rents, r.taxable, r.incomeTax]) expect(ex).toContain(eur(v));
    expect(ex).toContain('un mois de vacance par an');
    expect(ex).toContain(`${pctFr(r.incomeTaxPctOfRents)} des loyers`);
    const svg = renderToStaticMarkup(createElement(SchemaMicroBilan, { kind: 'lmnp' }, 'légende'));
    const t = plain(svg);
    for (const v of [r.rents, monthlyRent, r.allowance, r.taxable, r.incomeTax]) expect(t).toContain(eur(v));
    expect(t).toContain(`${months} mois loués`);
    expect(t).toContain('micro-BIC');
    expect(t).toContain(`Impôt dans la tranche à ${pctFr(marginalRatePct)}`);
    expect(t).toContain(`soit ${pctFr(r.incomeTaxPctOfRents)} des loyers`);
    expect(t).toContain('plus les prélèvements sociaux');
    expect(t).not.toContain('17,2');
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
    for (const s of [`prêtez ${eur(1000)}`, 'pendant 5 ans', 'coupon de 3 % par an', 'avant impôt et frais', 'puis rend la somme prêtée']) expect(t).toContain(s);
    // 30 € par an et 150 € en tout sont écrits sur le schéma de l’exemple (SchemaObligationBilan), pas recopiés.
    for (const v of [r.coupon, r.totalCoupons, r.received]) expect(t).not.toContain(eur(v));
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
    for (const s of [eur(5000), 'baisse de 10 %', '4 % de dividendes', 'avant impôt', 'ne rattrapent pas la baisse']) expect(t).toContain(s);
    // Les montants calculés sont dessinés dans le schéma (SchemaFonciereBilan), pas recopiés dans la légende.
    expect(t).not.toContain(eur(r.afterDrop));
    expect(r.dividends).toBeLessThan(5000 - r.afterDrop);
  });
});

describe('fiche Investir à crédit : l’exemple chiffré en schéma, un mois moyen de la première année', () => {
  const ex = norm(investmentBySlug['credit-immobilier']!.example);
  const { principal, annualRate, years } = LOAN_EXAMPLE;
  const loan = amortize({ principal, annualRate, years });
  const { bars } = leverageBars();
  const month = leverageMonth();
  const svg = norm(renderToStaticMarkup(createElement(SchemaLevierBilan, null, 'légende')));
  const r = Math.round;

  it('montants recalculés : 1 044 € = 517 € d’intérêts + 527 € de capital ; 833 € + 211 € et 500 € + 544 €', () => {
    expect(r(month.payment)).toBe(1044);
    expect(r(month.interest)).toBe(517);
    expect(r(month.principal)).toBe(527);
    expect(r(month.interest) + r(month.principal)).toBe(r(month.payment));
    expect(month.rows.map((x) => r(x.rent))).toEqual([833, 500]);
    expect(month.rows.map((x) => r(x.pocket))).toEqual([211, 544]);
    for (const x of month.rows) expect(r(x.rent) + r(x.pocket)).toBe(r(month.payment));
    // Même calcul que le guide : effort annuel 2 527 € et 6 527 €, ramené au mois.
    expect(bars.map((b) => r((loan.monthlyPayment * 12 - b.income) / 12))).toEqual([211, 544]);
    expect(month.rows.map((x) => x.coversInterest)).toEqual([true, false]);
    expect(r((loan.monthlyPayment * years * 12 - principal) / 10) * 10).toBe(70540);
  });
  it('le schéma montre tous les montants du mois, à l’échelle, et dit si les loyers couvrent les intérêts', () => {
    for (const v of [1044, 517, 527, 833, 211, 500, 544]) expect(svg).toContain(eur(v));
    expect(svg).toContain('Les loyers paient les intérêts, et plus');
    expect(svg).toContain('Les loyers ne couvrent pas les intérêts');
    expect(svg).toMatch(/viewBox="0 0 340 \d+"/);
    expect(svg).toContain('role="img"');
    expect(svg).toContain('<figcaption>légende</figcaption>');
    expect(svg.length).toBeLessThan(15000);
  });
  it('le texte donne les hypothèses sans recopier les montants du schéma et reste marqué fictif', () => {
    expect(ex).toMatch(/^Exemple fictif/);
    for (const v of [LEVERAGE_EXAMPLE.price, LEVERAGE_EXAMPLE.down, principal, ...bars.map((b) => b.income), 70540]) expect(ex).toContain(eur(v));
    expect(ex).toContain(`${norm((annualRate * 100).toLocaleString('fr-FR'))} %`);
    for (const v of [1044, 517, 527, 833, 211, 544]) expect(ex).not.toContain(eur(v));
    expect(ex).toContain('avant impôt et hors assurance');
    expect(ex).toContain('n’est pas perdu');
  });
  it('les hypothèses affichées dans « Détail du suivi » citent le même taux que l’exemple', () => {
    const hyp = norm(investmentBySlug['credit-immobilier']!.review.assumptions.join(' '));
    expect(hyp).toContain(`Taux de ${norm((annualRate * 100).toLocaleString('fr-FR'))} % sur ${years} ans`);
    expect(hyp).toContain(eur(principal));
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

describe('fiche Actions en direct : peu de lignes, une chute pèse lourd', () => {
  const ex = norm(investmentBySlug['actions-individuelles']!.example);
  const quinze = concentrationLoss(15000, 15);
  const trois = concentrationLoss(15000, 3);

  it('montants recalculés : 6,7 % avec 15 lignes, 33,3 % avec 3, 4 € de taxe sur 1 000 €', () => {
    expect(quinze).toEqual({ lines: 15, perLine: 1000, maxLossPct: 6.7 });
    expect(trois).toEqual({ lines: 3, perLine: 5000, maxLossPct: 33.3 });
    expect((1000 * 0.4) / 100).toBe(4);
  });
  it('le texte de la fiche cite les mêmes montants, reste marqué fictif et reprend le taux de la rubrique Frais', () => {
    expect(ex).toMatch(/^Exemple fictif/);
    expect(ex).toContain(`15 lignes de ${eur(1000)}`);
    expect(ex).toContain(`au plus 6,7 % du total`);
    expect(ex).toContain(`3 lignes de ${eur(5000)}`);
    expect(ex).toContain(`mêmes ${eur(15000)} sur 3 lignes`);
    expect(ex).toContain(`jusqu’à ${eur(5000)}, soit 33,3 %`);
    expect(ex).toContain(`comptez ${eur(4)} de taxe`);
    expect(norm(investmentBySlug['actions-individuelles']!.fees.text)).toContain('taxe de 0,4 % du prix');
    expect(ex).toContain('de 0,4 %');
  });
});

describe('fiche Cryptomonnaies : remonter après une forte baisse', () => {
  const ex = norm(investmentBySlug['cryptomonnaies']!.example);
  const r = recoveryAfterDrop(1000, 70);

  it('montants recalculés : 300 €, 510 € après +70 %, +233 % pour revenir à 1 000 €', () => {
    expect(r).toEqual({ afterDrop: 300, recoveryPct: 233, sameRiseValue: 510 });
  });
  it('le texte de la fiche cite les mêmes montants, reste marqué fictif et cohérent avec « Fonctionnement »', () => {
    expect(ex).toMatch(/^Exemple fictif/);
    // Depuis le schéma de l'exemple (2026-11-21), 510 € et +233 % sont écrits sur le dessin, pas recopiés dans le texte.
    for (const v of [1000, r.afterDrop]) expect(ex).toContain(eur(v));
    expect(ex).toContain('la même hausse ne suffit pas');
    expect(r.recoveryPct).toBeGreaterThan(200);
    expect(ex).toContain('baisse de 70 %');
    expect(norm(investmentBySlug['cryptomonnaies']!.howItWorks)).toContain('supérieures à 70 %');
  });
});

describe('fiche Formation et compétences : ce qu’une hausse de salaire rapporte', () => {
  const ex = norm(investmentBySlug['capital-humain']!.example);
  const r = trainingPayoff(1000, 200, 5, [10, 20]);

  it('montants recalculés avec le moteur du simulateur : 5 mois, 31 000 € en 10 ans, 81 500 € en 20 ans', () => {
    expect(r).toEqual({ paybackMonths: 5, saved: [{ years: 10, contributed: 24000, value: 31000 }, { years: 20, contributed: 48000, value: 81500 }] });
  });
  it('le texte de la fiche cite les mêmes montants, reste marqué fictif et reprend l’hypothèse du suivi', () => {
    expect(ex).toMatch(/^Exemple fictif/);
    expect(ex).toContain(`formation à ${eur(1000)}`);
    expect(ex).toContain(`hausse de salaire de ${eur(200)} nets par mois`);
    expect(ex).toContain(`remboursée en ${r.paybackMonths} mois`);
    for (const s of r.saved) {
      expect(ex).toContain(`${eur(s.value)} en ${s.years} ans (${eur(s.contributed)} versés)`);
    }
    expect(ex).toContain('5 % par an');
    expect(norm(investmentBySlug['capital-humain']!.review.assumptions!.join(' '))).toContain('5 % par an');
  });
});

describe('fiche SaaS, e-commerce et produits numériques : un revenu récurrent qui s’use', () => {
  const ex = norm(investmentBySlug['activite-numerique']!.example);
  const r = subscriptionChurn(200, 15, 5, 12);

  it('montants recalculés : 3 000 € par mois, 10 départs le premier mois, 108 clients et 1 620 € après un an', () => {
    expect(r).toEqual({ revenue: 3000, lostFirstMonth: 10, clientsLeft: 108, revenueLeft: 1620 });
  });
  it('le texte de la fiche cite les mêmes montants et reste marqué fictif', () => {
    expect(ex).toMatch(/^Exemple fictif/);
    expect(ex).toContain(`200 abonnés à ${eur(15)} par mois rapportent ${eur(r.revenue)} par mois`);
    expect(ex).toContain('Si 5 % résilient chaque mois sans nouveaux venus');
    expect(ex).toContain(`environ ${r.clientsLeft} au bout d’un an : ${eur(r.revenueLeft)} par mois`);
    expect(ex).toContain(`demande donc ${r.lostFirstMonth} nouveaux clients chaque mois`);
  });
});

describe('fiche Fonds en euros : des intérêts qui rapportent, des frais qui comptent', () => {
  const ex = norm(investmentBySlug['fonds-euros']!.example);
  const r = fondsEurosGrowth(20000, 2.5, 5, 0.5);

  it('montants recalculés : 22 630 €, 500 € puis 552 € d’intérêts, 22 080 € avec 0,5 point de frais de plus', () => {
    expect(r).toEqual({ final: 22630, firstYearInterest: 500, lastYearInterest: 552, finalWithMoreFees: 22080, gap: 550 });
  });
  it('le texte de la fiche cite les mêmes montants et reste marqué fictif', () => {
    expect(ex).toMatch(/^Exemple fictif/);
    expect(ex).toContain(`${eur(20000)} à 2,5 % net de frais pendant 5 ans deviennent environ ${eur(r.final)}`);
    expect(ex).toContain(`La première année rapporte ${eur(r.firstYearInterest)} ; la cinquième, ${eur(r.lastYearInterest)}`);
    expect(ex).toContain(`0,5 point de frais de plus chaque année (2 % net)`);
    expect(ex).toContain(`environ ${eur(r.finalWithMoreFees)}, soit environ ${eur(r.gap)} de moins`);
  });
});

describe('fiche Livret A : la date de dépôt compte, par quinzaine', () => {
  const ex = norm(investmentBySlug['livret-a']!.example);
  const rate = LIVRETS.find((l) => l.id === 'livretA')!.rate * 100;
  const cents = (n: number) => `${norm(n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))} €`;

  it('quinzaines : un dépôt le 15 mars compte dès le 16 (19 quinzaines), le 16 mars à partir du 1er avril (18)', () => {
    expect(livretQuinzaines(10000, 1.7, 15, 3)).toEqual({ quinzaines: 19, interest: 134.58 });
    expect(livretQuinzaines(10000, 1.7, 16, 3)).toEqual({ quinzaines: 18, interest: 127.5 });
    expect(livretQuinzaines(10000, 1.7, 16, 12)).toEqual({ quinzaines: 0, interest: 0 });
  });
  it('le texte de la fiche reprend le taux en vigueur (LIVRETS) et les mêmes montants', () => {
    expect(ex).toMatch(/^Exemple fictif/);
    expect(ex).toContain(`si le taux restait à ${norm(rate.toLocaleString('fr-FR', { minimumFractionDigits: 2 }))} %`);
    expect(ex).toContain(`rapportent ${eur(Math.round(10000 * rate) / 100)} d'intérêts nets`);
    for (const [day, q] of [[15, 19], [16, 18]] as const) {
      const v = livretQuinzaines(10000, rate, day, 3);
      expect(v.quinzaines).toBe(q);
      expect(ex).toContain(`${q} quinzaines, soit ${cents(v.interest)}`);
    }
  });
});

/**
 * Fiches PEL et LEP : ce que rapporte une année, comparé au Livret A. PEL ouverts en 2026 : 2,00 %, intérêts soumis au
 * prélèvement forfaitaire unique de 30 % (Service-Public F16140) ; Livret A 1,7 %, exonéré (F2365) ; LEP 2,50 %, exonéré,
 * plafond de 10 000 € au-delà duquel aucun versement n'est possible (F2367). Sources consultées le 2026-11-17.
 */
describe('fiches PEL et LEP : une année comparée au Livret A', () => {
  const pct = (n: number) => `${norm(n.toLocaleString('fr-FR', { minimumFractionDigits: 2 }))} %`;
  const livretA = LIVRETS.find((l) => l.id === 'livretA')!;
  const lepLivret = LIVRETS.find((l) => l.id === 'lep')!;

  it('PEL : 200 € bruts, 60 € de prélèvement, 140 € nets, contre 170 € au Livret A ; seuil à 1,40 %', () => {
    expect(pelVsLivretA(10000, 2, 30, 1.7)).toEqual({ gross: 200, tax: 60, net: 140, livret: 170, breakEvenPct: 1.4 });
  });
  it('PEL : texte de la fiche aligné sur sa rubrique Fiscalité et sur le taux du Livret A', () => {
    const fiche = investmentBySlug['pel']!;
    const ex = norm(fiche.example);
    const tax = norm(fiche.tax.text);
    expect(tax).toContain('Taux de 2,00 % pour les PEL ouverts à partir du 1er janvier 2026');
    expect(tax).toContain('prélèvement forfaitaire unique de 30 %');
    const r = pelVsLivretA(10000, 2, 30, livretA.rate * 100);
    expect(ex).toMatch(/^Exemple fictif, celui du schéma/);
    expect(ex).toContain(`${eur(10000)} sur un PEL ouvert en 2026, à ${pct(2)}`);
    expect(ex).toContain('le PEL passe derrière le Livret A une fois le prélèvement forfaitaire unique de 30 % payé');
    expect(ex).toContain(`Livret A à ${pct(livretA.rate * 100)}`);
    expect(ex).toContain(`descend sous ${pct(r.breakEvenPct)}`);
    // Intérêts, impôt et reste sont écrits sur le schéma : le texte n’en recopie aucun.
    for (const v of [r.gross, r.tax, r.net, r.livret]) expect(ex).not.toContain(eur(v));
    expect(r.net).toBeLessThan(r.livret);
  });
  it('LEP : 250 € contre 170 €, soit 80 € de plus, au plafond de 10 000 €', () => {
    const fiche = investmentBySlug['lep']!;
    const ex = norm(fiche.example);
    expect(lepVsLivretA(10000, 2.5, 1.7)).toEqual({ lep: 250, livret: 170, gap: 80 });
    const r = lepVsLivretA(lepLivret.cap, lepLivret.rate * 100, livretA.rate * 100);
    expect(ex).toMatch(/^Exemple fictif, celui du schéma/);
    expect(ex).toContain(`${eur(lepLivret.cap)} (le plafond du livret)`);
    expect(ex).toContain('le LEP rapporte nettement plus que le Livret A, sans impôt lui non plus');
    // La condition de revenus est écrite sur le schéma (« le LEP est réservé aux foyers sous un plafond de revenus »).
    expect(plain(renderToStaticMarkup(createElement(SchemaLivretBilan, { kind: 'lep', children: 'x' })))).toContain('aux foyers sous un plafond de revenus');
    // 250 €, 170 € et 80 € de plus sont écrits sur le schéma : le texte n’en recopie aucun (ni les taux, repris de LIVRETS).
    for (const v of [r.lep, r.livret, r.gap]) expect(ex).not.toContain(eur(v));
    expect(r.lep / r.livret).toBeGreaterThan(1.4); // « nettement plus » : près de moitié plus
    expect(norm(fiche.tax.text)).toContain(`Taux : ${pct(lepLivret.rate * 100)}`);
  });
});

/**
 * Fiches Compte à terme, Unités de compte et Forêt : des exemples qui apprennent quelque chose. PFU de 31,4 % sur les
 * revenus de 2026 (Service-Public F2329), Livret A à 1,7 % exonéré (F2365) ; crédit d'impôt forestier de 25 %, sommes
 * retenues dans la limite de 6 250 € (personne seule) ou 12 500 € (couple soumis à imposition commune) : BOFiP
 * BOI-IR-RICI-60-20-20. Sources consultées le 2026-11-18.
 */
describe('fiches Compte à terme, Unités de compte et Forêt : exemples recalculés', () => {
  const pct = (n: number, d = 2) => `${norm(n.toLocaleString('fr-FR', { minimumFractionDigits: d }))} %`;
  const cents = (n: number) => `${norm(n.toLocaleString('fr-FR', { minimumFractionDigits: 2 }))} €`;
  const livretA = LIVRETS.find((l) => l.id === 'livretA')!;

  it('Compte à terme : 300 € bruts, 94,20 € retenus, 205,80 € nets, contre 170 € au Livret A ; seuil à 2,48 %', () => {
    const r = termDepositVsLivretA(10000, 3, 31.4, livretA.rate * 100);
    expect(r).toEqual({ gross: 300, tax: 94.2, net: 205.8, netPct: 2.06, livret: 170, breakEvenPct: 2.48 });
    const fiche = investmentBySlug['compte-a-terme']!;
    const ex = norm(fiche.example);
    expect(norm(fiche.tax.text)).toContain('prélèvement forfaitaire unique de 31,4 %');
    expect(ex).toMatch(/^Exemple fictif, celui du schéma/);
    expect(ex).toContain(`${eur(10000)} placés un an à 3 % brut`);
    expect(ex).toContain(`prélèvement forfaitaire unique de 31,4 % ramène ces 3 % à ${pct(r.netPct)} net`);
    expect(ex).toContain(`Livret A à ${pct(livretA.rate * 100)}`);
    expect(ex).toContain(`dépasse ${pct(r.breakEvenPct)}`);
    // Constat du 2026-11-20 (chantier 253) : 300 €, 94,20 €, 205,80 € et 170 € sont sur le schéma, plus dans le texte.
    for (const v of [eur(r.gross), cents(r.tax), cents(r.net), eur(r.livret)]) expect(ex).not.toContain(v);
  });

  it('Unités de compte : 6 % moins 1,5 % de frais par an, environ 4,4 % ; 23 700 € au lieu de 32 100 € en 20 ans', () => {
    const r = ucFeesDrag(10000, 6, 1.5, 20);
    expect(r).toEqual({ netPct: 4.4, withoutFees: 32100, withFees: 23700, cost: 8400 });
    expect(r.cost / r.withoutFees).toBeGreaterThan(0.25);
    const ex = norm(investmentBySlug['unites-de-compte']!.example);
    expect(ex).toMatch(/^Exemple fictif/);
    expect(ex).toContain(`${eur(10000)} placés 20 ans, avec une hypothèse de 6 % par an avant frais`);
    expect(ex).toContain(`1,5 % de frais cumulés`);
    expect(ex).toContain(`environ ${pct(r.netPct, 1)}`);
    expect(ex).toContain(`environ ${eur(r.withFees)} au lieu de ${eur(r.withoutFees)}, soit ${eur(r.cost)} de moins, plus du quart`);
  });

  it('Forêt : 1 562,50 € de crédit pour 10 000 € versés seul (15,6 %), 2 500 € pour un couple', () => {
    const seul = forestCredit(10000, 6250, 25);
    const couple = forestCredit(10000, 12500, 25);
    expect(seul).toEqual({ retained: 6250, credit: 1562.5, effectivePct: 15.6, netCost: 8437.5 });
    expect(couple.credit).toBe(2500);
    const fiche = investmentBySlug['groupements-forestiers']!;
    const tax = norm(fiche.tax.text);
    for (const m of ['Crédit d’impôt de 25 %', 'plafonnées à 6 250 € pour une personne seule et 12 500 € pour un couple']) expect(tax).toContain(m);
    const ex = norm(fiche.example);
    expect(ex).toMatch(/^Exemple fictif, celui du schéma/);
    expect(ex).toContain(`plafonnée à ${eur(seul.retained)}`);
    expect(ex).toContain(`un crédit que de ${pct(seul.effectivePct, 1)} de ce qu’elle verse, pas 25 %`);
    expect(ex).toContain(`(plafond de ${eur(12500)}) l’obtient sur la totalité`);
    expect(ex).toContain(`${eur(10000)} de parts`);
    expect(couple.effectivePct).toBe(25);
    expect(ex).not.toContain(cents(seul.credit));
    expect(ex).not.toContain(cents(seul.netCost));
  });

  it('PEE : 500 € versés + 500 € d’abondement = 1 000 € placés, dans les plafonds de 2026 (Service-Public F2142 et F2140, consultées le 2026-11-18)', () => {
    const PLAFOND_ABONDEMENT = 3844.8;
    const PLAFOND_INTERESSEMENT = 36045;
    const { verse, abondementPct, prime } = PEE_EXAMPLE;
    expect(abondementPct).toBe(100); // abondement de 100 %, choisi pour l’exemple
    const abondement = (verse * abondementPct) / 100;
    expect(abondement).toBeLessThanOrEqual(3 * verse);
    expect(abondement).toBeLessThanOrEqual(PLAFOND_ABONDEMENT);
    const fiche = investmentBySlug['pee']!;
    const ex = norm(fiche.example);
    expect(ex).toMatch(/^Exemple fictif/);
    expect(ex).toContain(`vous versez ${eur(verse)} et le règlement prévoit un abondement de 100 % : l’entreprise ajoute ${eur(abondement)}`);
    expect(ex).toContain(`${eur(verse + abondement)} sont placés pour ${eur(verse)} sortis de votre poche`);
    const tax = norm(fiche.tax.text);
    expect(tax).toContain(`${eur(PLAFOND_INTERESSEMENT)} par an en 2026`);
    expect(tax).toContain('3 844,80 €');
    expect(norm(fiche.minCapital.text)).toContain('160 €');
    const svg = plain(renderToStaticMarkup(createElement(SchemaPee)));
    expect(svg).toContain('jusqu’à 3 fois');
    expect(svg).toContain('bloqué au moins 5 ans');
    // Schéma de l'exemple chiffré : mêmes montants que le texte, barre à l'échelle (500 € sur 1 000 €).
    const bilan = plain(renderToStaticMarkup(createElement(SchemaPeeBilan, null, 'x')));
    expect(bilan).toContain(`Vos ${eur(verse)} versés, abondés à 100 %`);
    expect(bilan).toContain(`+ ${eur(abondement)}`);
    expect(bilan).toContain(`${eur(verse + abondement)} placés sur le PEE`);
    expect(bilan).toContain(`Une prime d’intéressement de ${eur(prime)}`);
    expect(bilan).toContain('CSG et CRDS prélevées sur l’abondement');
    expect(bilan).toContain('bloquée 5 ans');
    expect(bilan).toContain('Exemple fictif');
  });
});

describe('fiche Objets d’art : la taxe porte sur le prix, pas sur le gain', () => {
  const r = artResale(5000, 20, 6.5, 5000, [8000, 6000, 5000]);
  const fiche = investmentBySlug['objets-d-art-collection']!;
  const ex = norm(fiche.example);

  it('montants recalculés : 6 000 € déboursés, 520 € et 390 € de taxe, rien à 5 000 €', () => {
    expect(r.cost).toBe(6000);
    expect(r.sales.map((x) => x.tax)).toEqual([520, 390, 0]);
    expect(r.sales.map((x) => x.net)).toEqual([7480, 5610, 5000]);
    expect(r.sales[0]!.vsCost).toBe(1480);
    expect(r.sales[1]!.vsCost).toBe(-390);
  });
  it('le texte cite les mêmes montants, reste fictif et reprend les taux de la rubrique Fiscalité et Frais', () => {
    expect(ex).toMatch(/^Exemple fictif/);
    for (const v of [5000, r.cost, 8000, 520, 7480, 1480, 6000, 390]) expect(ex).toContain(eur(v));
    expect(ex).toContain('6,5 %');
    expect(ex).toContain('22 ans');
    expect(norm(fiche.tax.text)).toContain('6,5 %');
    expect(norm(fiche.tax.text)).toContain('5 000 €');
    expect(norm(fiche.tax.text)).toContain('exonéré après 22 ans');
    expect(norm(fiche.fees.text)).toContain('de l’ordre de 20 %');
    expect(ex).toContain('de l’ordre de 20 %');
  });
});

/**
 * Schéma commun « ce que rapportent 10 000 € en un an » (fiches Compte à terme, PEL et LEP) : mêmes montants que le
 * texte de chaque fiche, taux des livrets pris dans `LIVRETS`, barres proportionnelles, fichier léger.
 */
describe('fiches Compte à terme, PEL et LEP : schéma face au Livret A', () => {
  const kinds = ['compte-a-terme', 'pel', 'lep'] as const;
  const render = (kind: (typeof kinds)[number]) => renderToStaticMarkup(createElement(SchemaLivretBilan, { kind, children: 'légende' }));

  it('le texte de chaque fiche légende le schéma sans recopier ses montants (constat du 2026-11-21)', () => {
    for (const kind of kinds) {
      const ex = norm(investmentBySlug[kind]!.example);
      expect(ex).toMatch(/^Exemple fictif, celui du schéma : 10 000 €/);
      expect(ex).toContain('À retenir :');
      const { rows } = livretBilan(kind);
      expect(rows.every((r) => r.net > 0)).toBe(true);
      for (const r of rows) {
        const show = (n: number) => norm(Number.isInteger(n) ? n.toLocaleString('fr-FR') : n.toLocaleString('fr-FR', { minimumFractionDigits: 2 }));
        for (const n of [r.net, r.tax, r.gross].filter((n) => n > 0)) expect(ex, `${kind} : ${n}`).not.toContain(`${show(n)} €`);
      }
    }
  });
  it('compte à terme : 205,80 € + 94,20 € contre 170 €, seuil à 2,48 %', () => {
    const t = plain(render('compte-a-terme'));
    for (const v of ['205,80 €', '94,20 €', '300 € bruts', '170 €', 'Impôt : 31,4 %', '35,80 € de plus', '2,48 %', 'Livret A à 1,70 %']) expect(t).toContain(v);
    expect(norm(investmentBySlug['compte-a-terme']!.example)).toContain('dépasse 2,48 %');
  });
  it('PEL : 140 € + 60 € contre 170 €, seuil à 1,40 %, bilan non présenté comme un gain', () => {
    const svg = render('pel');
    const t = plain(svg);
    for (const v of ['140 €', '60 €', '200 € bruts', '170 €', 'Impôt : 30 %', '30 € de moins', '1,40 %']) expect(t).toContain(v);
    expect(livretBilan('pel').ahead).toBe(false);
    expect(norm(investmentBySlug['pel']!.example)).toContain('descend sous 1,40 %');
  });
  it('LEP : 250 € contre 170 €, 80 € de plus, sans légende d’impôt', () => {
    const t = plain(render('lep'));
    for (const v of ['LEP à 2,50 %', '250 €', '170 €', '80 € de plus']) expect(t).toContain(v);
    expect(t).not.toContain('Impôt :');
  });
  it('barres proportionnelles aux montants, schéma accessible et léger', () => {
    for (const kind of kinds) {
      const svg = render(kind);
      const widths = [...svg.matchAll(/<rect x="1" y="\d+" width="([\d.]+)"/g)].map((m) => Number(m[1]));
      const { rows } = livretBilan(kind);
      expect(widths.length).toBe(rows.length);
      expect(widths[0]! / widths[1]!).toBeCloseTo(rows[0]!.net / rows[1]!.net, 5);
      expect(svg).toContain('role="img"');
      expect(svg).toContain('<desc');
      expect(svg.length).toBeLessThan(15000);
    }
  });
});
