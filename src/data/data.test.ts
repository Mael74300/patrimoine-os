import { droitsDonationLigneDirecte, BAREME_LIGNE_DIRECTE } from '../lib/calc/donation';
import { DONATION_ABATTEMENTS } from './donationAbattements';
import { describe, expect, it } from 'vitest';
import { categoryById } from './categories';
import { guideGroups, guides, otherGuides } from './guides';
import { simFaq } from './simFaq';
import { investmentBySlug, investments } from './investments';
import { splitSentences } from '../components/ui';
import { loanPayment, projectGrowth } from '../lib/finance';

describe('intégrité des données éditoriales', () => {
  it('slugs uniques', () => {
    expect(new Set(investments.map((i) => i.slug)).size).toBe(investments.length);
  });

  it.each(investments.map((i) => [i.slug, i] as const))('%s : catégorie, alternatives et sources valides', (_, i) => {
    expect(categoryById[i.category]).toBeDefined();
    for (const a of i.alternatives) expect(investmentBySlug[a], `alternative ${a}`).toBeDefined();
    expect(i.sources.length).toBeGreaterThan(0);
    for (const s of i.sources) expect(s.url).toMatch(/^https:\/\//);
    expect(i.example.toLowerCase()).toContain('fictif');
  });

  it('chaque guide figure dans un seul groupe de la page Guides', () => {
    const all = guideGroups.flatMap((g) => g.slugs);
    expect([...all].sort()).toEqual(guides.map((g) => g.slug).sort());
  });
  it('« Autres guides » : trois guides différents, du même groupe d’abord', () => {
    const o = otherGuides('interets-composes');
    expect(o).toHaveLength(3);
    expect(o.map((g) => g.slug)).not.toContain('interets-composes');
    expect(o[0].slug).toBe('regle-de-72-doubler-son-capital');
  });
  it('les guides pointent vers des fiches existantes', () => {
    for (const g of guides) for (const r of g.related) expect(investmentBySlug[r], r).toBeDefined();
  });
});

describe('les exemples chiffrés des fiches sont exacts', () => {
  it('ETF : 200 €/mois, 20 ans, 6 % ≈ 92 000 €', () => {
    const v = projectGrowth({ initial: 0, monthly: 200, annualReturn: 0.06, annualFees: 0, years: 20, inflation: 0 }).at(-1)!.value;
    expect(Math.abs(v - 92000)).toBeLessThan(1500);
  });
  it('Capital humain : 200 €/mois, 20 ans, 5 % ≈ 82 000 €', () => {
    const v = projectGrowth({ initial: 0, monthly: 200, annualReturn: 0.05, annualFees: 0, years: 20, inflation: 0 }).at(-1)!.value;
    expect(Math.abs(v - 82000)).toBeLessThan(1500);
  });
  it('Fonds euros : 20 000 € à 2,5 % sur 5 ans ≈ 22 630 €', () => {
    expect(20000 * Math.pow(1.025, 5)).toBeCloseTo(22628, -1);
  });
  it('Crédit : 200 000 € à 3,6 % sur 20 ans → ≈ 80 850 € d’intérêts', () => {
    expect(loanPayment(200000, 0.036, 20) * 240 - 200000).toBeCloseTo(80850, -2);
  });
  it('Crédit immobilier : fiche renvoie à l’assurance emprunteur (Service-Public F1671)', () => {
    const f = investmentBySlug['credit-immobilier'];
    expect(f.sources.some((x) => x.url.endsWith('/F1671') && x.official)).toBe(true);
    const txt = f.howToInvest.join(' ').replace(/\u00a0/g, ' ');
    expect(txt).toContain('200 000 €');
    expect(txt).toContain('60 ans');
  });
  it('Crédit immobilier : schéma du levier sur la fiche, source La finance pour tous', () => {
    const f = investmentBySlug['credit-immobilier'];
    expect(f.sources.some((x) => x.url.includes('lafinancepourtous.com') && x.url.endsWith('/effet-de-levier/'))).toBe(true);
  });
  it('lmnp : l’exemple micro-BIC est recalculé (6 600 € de loyers, abattement de 50 %)', () => {
    const loyers = 600 * 11;
    const abattement = loyers * 0.5;
    const ex = investmentBySlug['lmnp'].example.replace(/\u00a0/g, ' ');
    expect(ex).toContain('6 600 €');
    expect(ex).toContain('abattement de 50 %');
    expect(loyers).toBe(6600);
    expect(abattement).toBe(3300);
    expect(ex).toContain('retire 3 300 €');
    expect(ex).toContain('seuls 3 300 €');
    // Suite de l’exemple : tranche à 30 % (barème Service-Public F1419, consulté le 2026-11-13).
    const impot = abattement * 0.3;
    expect(impot).toBeCloseTo(990, 6);
    expect(Math.round((impot / loyers) * 100)).toBe(15);
    expect(ex).toContain('tranche à 30 %');
    expect(ex).toContain('990 € d’impôt sur le revenu');
    expect(ex).toContain('15 % des loyers');
  });

  it('lmnp : jargon expliqué (BIC, amortissement), début d’activité sourcé, rubrique « Comment se lancer »', () => {
    const f = investmentBySlug['lmnp'];
    const norm = (t: string) => t.replace(/[\u00a0\u202f]/g, ' ');
    expect(f.definition).toContain('bénéfices industriels et commerciaux (BIC)');
    expect(f.howItWorks).toContain('étalé sur leur durée d');
    expect(f.howToTitle).toBe('Comment se lancer');
    expect(norm(f.howToInvest[0])).toContain('15 jours');
    expect(norm(f.review.data.join(' '))).toContain('15 jours');
    expect(f.sources.some((x) => x.url.includes('F32744'))).toBe(true);
    expect(f.sources.some((x) => x.url.includes('F1419'))).toBe(true);
    expect(f.sources.some((x) => x.url.includes('amortissement-comptable'))).toBe(true);
  });

  it('Objets d’art : 8 000 € revendus, taxe forfaitaire 6 % + 0,5 % de CRDS → 520 €', () => {
    expect(8000 * (0.06 + 0.005)).toBeCloseTo(520, 6);
    expect(investmentBySlug['objets-d-art-collection'].example.replace(/\u00a0/g, ' ')).toContain('520 €');
  });
  it('Groupement forestier : 10 000 € versés, base plafonnée à 6 250 €, crédit de 25 % → 1 562,50 €', () => {
    expect(Math.min(10000, 6250) * 0.25).toBeCloseTo(1562.5, 6);
    expect(12500 * 0.25).toBeCloseTo(3125, 6);
    expect(investmentBySlug['groupements-forestiers'].example.replace(/\u00a0/g, ' ')).toContain('1 562,50 €');
  });
  it('Compte à terme : 300 € bruts → 205,80 € nets au PFU de 31,4 %', () => {
    expect(300 * (1 - 0.314)).toBeCloseTo(205.8, 6);
  });
});

import { amortize, netOfFees, rentalAnalysis } from '../lib/finance';
import { RENTAL } from '../lib/calc/fixtures';
import { PFU_TOTAL_PCT } from '../lib/calc/pfu';
import { PROFILE_MONTHS, precautionTarget } from '../lib/calc/precaution';
import { savingsGoal, monthlyByDuration } from '../lib/calc/savingsGoal';
import { prepayVsInvest } from '../lib/calc/prepayVsInvest';
import { debtRatio, HCSF } from '../lib/calc/debtRatio';
import { LIVRETS, LIVRETS_AS_OF } from './livrets';
import { pagesMeta } from '../seo';
import { simulators } from '../lib/search';

describe('les exemples chiffrés des guides sont exacts', () => {
  const g = (monthly: number, r: number, y: number, changes = [] as { fromYear: number; monthly: number }[]) =>
    projectGrowth({ initial: 0, monthly, annualReturn: r, annualFees: 0, years: y, inflation: 0, savingsChanges: changes }).at(-1)!;
  it('frais : 10 000 € sur 25 ans à 6 % → ≈ 40 800 € (0,2 %) contre ≈ 29 400 € (1,5 %)', () => {
    expect(10000 * (1 + netOfFees(0.06, 0.002)) ** 25).toBeCloseTo(40800, -2);
    expect(10000 * (1 + netOfFees(0.06, 0.015)) ** 25).toBeCloseTo(29400, -2);
  });
  it('1 % de frais sur 25 ans réduit un capital d’environ 22 %', () => expect(1 - 0.99 ** 25).toBeCloseTo(0.22, 2));
  it('épargne limitée : ≈ 34 400 € puis ≈ 78 200 € avec paliers', () => {
    expect(g(50, 0.04, 30).value).toBeCloseTo(34400, -2);
    const p = g(50, 0.04, 30, [{ fromYear: 6, monthly: 100 }, { fromYear: 11, monthly: 150 }]);
    expect(p.value).toBeCloseTo(78200, -2);
    expect(p.contributed).toBe(45000);
  });
  it('rentabilité locative : brut 6 %, net ≈ 3,6 %, effort ≈ 390 €/mois', () => {
    const r = rentalAnalysis(RENTAL);
    expect(r.grossYield).toBeCloseTo(0.06, 10);
    expect(r.netYield).toBeCloseTo(0.036, 3);
    expect(Math.abs(r.monthlyCashflow + 390)).toBeLessThan(5);
  });
  it('précaution : 2 000 € × 3, 6 et 9 mois → 6 000 €, 12 000 €, 18 000 €', () => {
    for (const [m, t] of [[3, 6000], [6, 12000], [9, 18000]]) expect(precautionTarget({ monthlyExpenses: 2000, months: m, extraReserve: 0 })).toBe(t);
    expect(PROFILE_MONTHS.stable.months).toBe(3);
    expect(PROFILE_MONTHS.variable.months).toBe(6);
    expect(PROFILE_MONTHS.independant.months).toBe(9);
  });
  it('guide précaution : taux et plafonds des livrets = LIVRETS (tableau, aucun chiffre recopié dans le texte)', () => {
    const t = guides.find((x) => x.slug === 'combien-epargne-de-precaution')!.sections.find((s) => s.heading === 'Où placer cette réserve')!.body.join(' ').replace(/\u00a0/g, ' ');
    const by = Object.fromEntries(LIVRETS.map((l) => [l.id, l]));
    expect(by.lep.cap).toBe(10000); expect(by.livretA.cap).toBe(22950); expect(by.ldds.cap).toBe(12000);
    expect(by.lep.rate).toBe(0.025); expect(by.livretA.rate).toBe(0.017); expect(by.ldds.rate).toBe(0.017);
    for (const s of ['10 000 €', '22 950 €', '12 000 €', '2,5 %', '1,7 %']) expect(t, s).not.toContain(s);
    expect(LIVRETS_AS_OF).toBe('5 novembre 2026');
  });
  it('endettement : 200 + 850 € sur 3 000 € = 35 %, mensualité maximale 850 €, repère HCSF cité', () => {
    const r = debtRatio({ income: 3000, existingPayments: 200, newPayment: 850, livingCosts: 0, householdSize: 1 });
    expect(r.ratioAfter).toBeCloseTo(0.35, 10);
    expect(r.maxNewPayment).toBeCloseTo(850, 6);
    expect(HCSF.maxRatio).toBe(0.35); expect(HCSF.maxYears).toBe(25); expect(HCSF.maxYearsNew).toBe(27);
  });
  it('objectif d’épargne : 20 000 € en 5 ans → 333 € sans intérêts, 320 € à 1,7 % (≈ 820 € d’intérêts) ; 542 / 320 / 153 € sur 3 / 5 / 10 ans', () => {
    expect(savingsGoal({ target: 20000, current: 0, years: 5, annualRate: 0 }).monthly).toBeCloseTo(333.33, 2);
    const r = savingsGoal({ target: 20000, current: 0, years: 5, annualRate: 0.017 });
    expect(Math.round(r.monthly)).toBe(320);
    expect(Math.round(r.interest / 10) * 10).toBe(820);
    expect(r.interestShare).toBeCloseTo(0.04, 2);
    expect(monthlyByDuration({ target: 20000, current: 0, annualRate: 0.017 }, [3, 5, 10]).map((x) => Math.round(x.monthly))).toEqual([542, 320, 153]);
    expect(LIVRETS.find((l) => l.id === 'livretA')!.rate).toBe(0.017);
  });
  it('rembourser ou investir : 150 000 € à 4 %, 20 ans, 20 000 €, gains au PFU de 31,4 % → 45 mois gagnés, ≈ 21 250 € d’intérêts, 43 850 € vs 41 250 €, équilibre ≈ 5,4 %', () => {
    expect(PFU_TOTAL_PCT).toBe(31.4);
    const r = prepayVsInvest({ balance: 150000, annualRate: 0.04, remainingYears: 20, lump: 20000, annualReturn: 0.05, annualFees: 0.002, taxRate: PFU_TOTAL_PCT / 100 });
    expect(r.monthsSaved).toBe(45);
    expect(Math.round(r.interestSaved / 50) * 50).toBe(21250);
    expect(Math.round(r.wealthPrepay / 50) * 50).toBe(43850);
    expect(Math.round(r.wealthInvest / 50) * 50).toBe(41250);
    expect(Math.round(r.advantageInvest / 50) * 50).toBe(-2600);
    expect(Math.round(r.breakEvenReturn! * 1000) / 10).toBe(5.4);
  });
  it('crédit : 180 000 € à 3,5 % → ≈ 6 200 € d’intérêts la première année', () => {
    expect(amortize({ principal: 180000, annualRate: 0.035, years: 20 }).schedule[0].interest).toBeCloseTo(6200, -2);
  });
});

describe('guide diversification', () => {
  it('exemple fictif sur 10 000 € : 7 000 € à −20 % et 3 000 € à +2 % → −1 400 €, +60 €, −1 340 € soit −13,4 %', () => {
    expect(0.7 * -20 + 0.3 * 2).toBeCloseTo(-13.4, 10);
    expect(Math.round(7000 * -0.2)).toBe(-1400);
    expect(Math.round(3000 * 0.02)).toBe(60);
    expect(Math.round(10000 * -0.2)).toBe(-2000);
    expect(-1400 + 60).toBe(-1340);
    expect((-1340 / 10000) * 100).toBeCloseTo(-13.4, 10);
    const g = guides.find((x) => x.slug === 'diversification-placements')!;
    const t = JSON.stringify(g).replace(/\u00a0/g, ' ');
    for (const v of ['10 000 €', '7 000 €', '3 000 €', '2 000 €', '1 400 €', '60 €', '1 340 €', '13,4 %', 'fictif']) expect(t, v).toContain(v);
    // Plus de formule brute ni de « moyenne pondérée » : des euros à la place.
    expect(t).not.toMatch(/×|pondérée/);
    expect(g.cta?.to).toBe('/simulateurs/portefeuille');
  });
});

describe('guide inflation', () => {
  it('exemple fictif : 10 000 € à 2 % d’inflation sur 10 ans → ≈ 8 203 € ; à 3 % → ≈ 13 439 € soit ≈ 11 025 € réels (≈ 0,98 %)', () => {
    expect(10000 / 1.02 ** 10).toBeCloseTo(8203, 0);
    expect(10000 * 1.03 ** 10).toBeCloseTo(13439, 0);
    expect(10000 * 1.03 ** 10 / 1.02 ** 10).toBeCloseTo(11025, 0);
    expect(1.03 / 1.02 - 1).toBeCloseTo(0.0098, 4);
    const t = JSON.stringify(guides.find((x) => x.slug === 'inflation-pouvoir-d-achat-epargne')!).replace(/\u00a0/g, ' ');
    expect(Math.round(10000 * 1.03 ** 10 / 1.02 ** 10) - 10000).toBe(1025);
    expect(Math.round(10000 * 1.03 ** 10) - 10000).toBe(3439);
    expect(Math.round((0.03 - 0.02) * 100)).toBe(1);
    for (const v of ['8 203', '13 439', '11 025', '1 025', '3 439', 'environ 1 % par an', '0,98 %', 'fictif']) expect(t).toContain(v);
    // Plus de formule brute dans le guide : des mots à la place des puissances et des parenthèses.
    expect(t).not.toMatch(/\^|\(1 \+/);
  });
});

describe('référencement', () => {
  const pages = pagesMeta('https://exemple.test');
  it('chemins, titres et descriptions uniques et renseignés', () => {
    expect(new Set(pages.map((p) => p.path)).size).toBe(pages.length);
    expect(new Set(pages.map((p) => p.title)).size).toBe(pages.length);
    for (const p of pages) {
      expect(p.path).toMatch(/^\/([a-z0-9-]+\/)*$/);
      expect(p.description.length).toBeGreaterThan(30);
      expect(p.description.length).toBeLessThan(200);
    }
  });
});

describe('FAQ des guides', () => {
  it('chaque question-réponse affichée est reprise dans les données structurées FAQPage', () => {
    const avecFaq = guides.filter((g) => g.faq?.length);
    expect(avecFaq.length).toBeGreaterThan(0);
    for (const g of avecFaq) {
      const page = pagesMeta('https://exemple.test').find((p) => p.path === `/guides/${g.slug}/`)!;
      const faq = (page.jsonLd as { '@type': string; mainEntity: { name: string; acceptedAnswer: { text: string } }[] }[]).find((d) => d['@type'] === 'FAQPage')!;
      expect(faq, g.slug).toBeDefined();
      expect(faq.mainEntity.map((m) => m.name)).toEqual(g.faq!.map((f) => f.q));
      for (const f of g.faq!) { expect(f.q.endsWith('?')).toBe(true); expect(f.a.length).toBeGreaterThan(40); }
    }
  });
});

describe('FAQ des simulateurs', () => {
  it('chaque question-réponse affichée est reprise en FAQPage, sans chiffre réglementaire', () => {
    const slugs = Object.keys(simFaq);
    expect(slugs.length).toBeGreaterThan(0);
    for (const slug of slugs) {
      expect(simulators.some((s) => s.slug === slug), slug).toBe(true);
      const page = pagesMeta('https://exemple.test').find((p) => p.path === `/simulateurs/${slug}/`)!;
      const faq = (page.jsonLd as { '@type': string; mainEntity: { name: string; acceptedAnswer: { text: string } }[] }[]).find((d) => d['@type'] === 'FAQPage')!;
      expect(faq.mainEntity.map((m) => m.name)).toEqual(simFaq[slug].map((f) => f.q));
      for (const f of simFaq[slug]) { expect(f.q.endsWith('?')).toBe(true); expect(f.a.length).toBeGreaterThan(40); }
    }
  });
});

describe('guide règle de 72 : exemples fictifs recalculés', () => {
  it('durée exacte de doublement ≈ valeurs citées', () => {
    const exact = (r: number) => Math.log(2) / Math.log(1 + r);
    expect([0.02, 0.04, 0.06, 0.08, 0.12].map((r) => exact(r).toFixed(2))).toEqual(['35.00', '17.67', '11.90', '9.01', '6.12']);
  });
});

describe('guide Livret A quinzaines : exemple fictif et taux cohérents', () => {
  it('une quinzaine sur 1 000 € à 1,70 % ≈ 0,71 €, taux et plafond = LIVRETS', () => {
    const a = LIVRETS.find((l) => l.id === 'livretA')!;
    expect(((1000 * a.rate) / 24).toFixed(2)).toBe('0.71');
    expect(1000 * a.rate).toBeCloseTo(17, 10);
    const t = JSON.stringify(guides.find((x) => x.slug === 'livret-a-calcul-interets-quinzaines')!).replace(/\u00a0/g, ' ');
    expect(t).toContain('1,70 %');
    expect(t).toContain('22 950 €');
    expect(t).toContain('1 000 € rapportent 17 € sur une année entière');
    expect(t).toContain('une quinzaine rapporte donc environ 0,71 €');
    expect(t).not.toMatch(/×|÷/);
    expect(a.rate).toBe(0.017);
    expect(a.cap).toBe(22950);
  });
});

describe('fiche donation : cohérence des montants', () => {
  it('l’exemple fictif recalcule les droits avec le barème (200 000 € − 100 000 € d’abattement → 18 194 €)', () => {
    const f = investments.find((i) => i.slug === 'donation')!;
    const ex = f.example.replace(/\u00a0/g, ' ');
    const abattementEnfant = DONATION_ABATTEMENTS.find((a) => a.lien === 'Enfant')!.montant;
    expect(ex).toContain('fictif');
    expect(ex).toContain('200 000 €');
    expect(ex).toContain('100 000 €');
    expect(droitsDonationLigneDirecte(200_000 - abattementEnfant)).toBe(18_194);
    expect(ex).toContain('18 194 €');
    expect(ex).toContain('8 072 €');
    expect(BAREME_LIGNE_DIRECTE[0].jusqua).toBe(8_072);
    expect(f.review.data.join(' ').replace(/\u00a0/g, ' ')).toContain('18 194 €');
    expect(f.tax.text.replace(/\u00a0/g, ' ')).toContain('131 865');
    expect(f.tax.text).not.toContain('fiche Donation');
    expect(f.howToTitle).toBe('Comment s’y prendre');
  });
});

describe('fiche LMNP : chiffres identiques dans la fiche et le suivi de vérification', () => {
  it('les montants du suivi figurent dans le texte fiscal vérifié', () => {
    const f = investmentBySlug['lmnp']!;
    const txt = f.tax.text.replace(/ | /g, ' ');
    expect(f.tax.verified).toBe(true);
    for (const v of ['83 600 €', '50 %', '15 000 €', '30 %', '23 000 €', '15 février 2025']) {
      expect(txt).toContain(v);
      expect(f.review.data.join(' ').replace(/ | /g, ' ')).toContain(v);
    }
  });
});

describe('fiche PER : chiffres identiques dans la fiche et le suivi de vérification', () => {
  it('les montants du suivi figurent dans le texte fiscal vérifié', () => {
    const f = investmentBySlug['per']!;
    const norm = (t: string) => t.replace(/[\u00a0\u202f]/g, ' ');
    const txt = norm(f.tax.text);
    expect(f.tax.verified).toBe(true);
    for (const v of ['10 %', '37 680 €', '4 710 €', '70 ans', '31,4 %']) {
      expect(txt).toContain(v);
      expect(norm(f.review.data.join(' '))).toContain(v);
    }
  });
});

describe('fiche PER : frais de transfert', () => {
  it('les frais de transfert sont sourcés et identiques dans le suivi de vérification', () => {
    const f = investmentBySlug['per']!;
    const norm = (t: string) => t.replace(/[\u00a0\u202f]/g, ' ');
    expect(f.fees.verified).toBe(true);
    for (const v of ['5 ans', '1 %']) {
      expect(norm(f.fees.text)).toContain(v);
      expect(norm(f.review.data.join(' '))).toContain(v);
    }
  });
});

describe('fiche PEL', () => {
  it('reprend les chiffres de Service-Public (vérifiés le 2026-11-05) et son exemple fictif est exact', async () => {
    const { investmentBySlug } = await import('./investments');
    const f = investmentBySlug.pel;
    expect(f).toBeDefined();
    const plain = (t: string) => t.replace(/[\u00a0\u202f]/g, ' ');
    for (const s of ['2,00 %', '61 200 €', '4 ans minimum', '10 ans maximum']) expect(plain(f.tax.text), s).toContain(s);
    expect(plain(f.minCapital.text)).toContain('225 €');
    expect(plain(f.minCapital.text)).toContain('540 €');
    expect(plain(f.review.data.join(' '))).toContain('61 200 €');
    expect(10000 * 0.02).toBe(200);
    expect(f.example).toContain('fictif');
    expect(plain(f.example)).toContain('200 €');
    expect(f.sources.some((x) => x.url.includes('F16140'))).toBe(true);
  });
});

describe('fiche Assurance-vie : minimum du premier versement', () => {
  it('même formulation vérifiée que les fiches Fonds en euros et Unités de compte (Service-Public F15274)', async () => {
    const { investmentBySlug } = await import('./investments');
    const av = investmentBySlug['assurance-vie'];
    expect(av.minCapital.verified).toBe(true);
    expect(av.minCapital.text).toBe(investmentBySlug['fonds-euros'].minCapital.text);
    expect(av.sources.some((x) => x.url.includes('F15274'))).toBe(true);
  });
});

describe('fiche PEL : frais de transfert', () => {
  it('les frais de transfert sont sourcés et repris dans le suivi de vérification', () => {
    const f = investmentBySlug['pel']!;
    expect(f.fees.verified).toBe(true);
    expect(f.fees.text).toContain('frais de transfert');
    expect(f.review.data.join(' ')).toContain('frais de transfert');
  });
});

describe('fiche Formation et compétences : financement par le CPF', () => {
  it('le financement est sourcé sur Service-Public et repris dans le suivi', () => {
    const f = investmentBySlug['capital-humain']!;
    expect(f.minCapital.verified).toBe(true);
    expect(f.minCapital.text).toContain('Agefiph');
    expect(f.sources.some((x) => x.url.includes('F10705'))).toBe(true);
    expect(f.review.data.join(' ')).toContain('Agefiph');
  });
});

describe('fiche Compte-titres : frais et retraits', () => {
  it('les frais sont sourcés (AMF) et repris dans le suivi de vérification', () => {
    const f = investmentBySlug['compte-titres']!;
    expect(f.fees.verified).toBe(true);
    expect(f.fees.text).toContain('droits de garde');
    expect(f.sources.some((x) => x.url.includes('amf-france.org') && x.url.includes('compte-titres'))).toBe(true);
    expect(f.review.data.join(' ')).toContain('Aucune limite de retrait');
  });
});

describe('fiche Donation : intervention du notaire', () => {
  it('la rubrique Frais est sourcée (Service-Public F36656) et reprise dans le suivi', () => {
    const f = investmentBySlug['donation']!;
    expect(f.fees.verified).toBe(true);
    expect(f.fees.text).toContain('pas obligatoire');
    expect(f.sources.some((x) => x.url.includes('F36656'))).toBe(true);
    expect(f.review.data.join(' ')).toContain('F36656');
  });
});

describe('fiche PEA : frais présentés poste par poste', () => {
  it('garde les plafonds de La finance pour tous et se découpe en une ligne par poste', () => {
    const f = investmentBySlug['pea']!;
    const norm = (t: string) => t.replace(/[\u00a0\u202f]/g, ' ');
    const txt = norm(f.fees.text);
    for (const v of ['10 €', '0,40 %', '5 €', '25 €', '0,5 %', '1,20 %', '15 €', '50 €', '150 €']) {
      expect(txt).toContain(v);
    }
    const lignes = splitSentences(f.fees.text);
    expect(lignes.length).toBeGreaterThanOrEqual(5);
    for (const l of lignes) expect(l.length).toBeLessThan(230);
  });
});
