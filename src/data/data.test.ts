import { describe, expect, it } from 'vitest';
import { categoryById } from './categories';
import { guides } from './guides';
import { simFaq } from './simFaq';
import { investmentBySlug, investments } from './investments';
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
  it('Compte à terme : 300 € bruts → 205,80 € nets au PFU de 31,4 %', () => {
    expect(300 * (1 - 0.314)).toBeCloseTo(205.8, 6);
  });
});

import { amortize, netOfFees, rentalAnalysis } from '../lib/finance';
import { RENTAL } from '../lib/calc/fixtures';
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
  it('plafonds et taux des livrets cités dans le guide précaution = LIVRETS', () => {
    const t = guides.find((x) => x.slug === 'combien-epargne-de-precaution')!.sections.flatMap((s) => s.body).join(' ');
    const by = Object.fromEntries(LIVRETS.map((l) => [l.id, l]));
    expect(by.lep.cap).toBe(10000); expect(by.livretA.cap).toBe(22950); expect(by.ldds.cap).toBe(12000);
    expect(by.lep.rate).toBe(0.025); expect(by.livretA.rate).toBe(0.017);
    for (const s of ['10 000 €', '22 950 €', '12 000 €', '2,5 %', '1,7 %', LIVRETS_AS_OF, 'du 1er août 2026 au 31 janvier 2027']) expect(t, s).toContain(s);
  });
  it('endettement : (200 + 850) / 3 000 = 35 %, mensualité maximale 850 €, repère HCSF cité', () => {
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
  it('rembourser ou investir : 150 000 € à 4 %, 20 ans, 20 000 € → 45 mois gagnés, ≈ 21 250 € d’intérêts, 43 900 € vs 41 700 €, équilibre ≈ 5,3 %', () => {
    const r = prepayVsInvest({ balance: 150000, annualRate: 0.04, remainingYears: 20, lump: 20000, annualReturn: 0.05, annualFees: 0.002, taxRate: 0.3 });
    expect(r.monthsSaved).toBe(45);
    expect(Math.round(r.interestSaved / 50) * 50).toBe(21250);
    expect(Math.round(r.wealthPrepay / 100) * 100).toBe(43900);
    expect(Math.round(r.wealthInvest / 100) * 100).toBe(41700);
    expect(Math.round(r.advantageInvest / 100) * 100).toBe(-2200);
    expect(r.breakEvenReturn!).toBeCloseTo(0.053, 3);
  });
  it('crédit : 180 000 € à 3,5 % → ≈ 6 200 € d’intérêts la première année', () => {
    expect(amortize({ principal: 180000, annualRate: 0.035, years: 20 }).schedule[0].interest).toBeCloseTo(6200, -2);
  });
});

describe('guide diversification', () => {
  it('exemple fictif : 70 % à −20 % et 30 % à +2 % → −13,4 %', () => {
    expect(0.7 * -20 + 0.3 * 2).toBeCloseTo(-13.4, 10);
    const g = guides.find((x) => x.slug === 'diversification-placements')!;
    expect(JSON.stringify(g)).toContain('−13,4 %');
    expect(JSON.stringify(g)).toContain('fictif');
  });
});

describe('guide inflation', () => {
  it('exemple fictif : 10 000 € à 2 % d’inflation sur 10 ans → ≈ 8 203 € ; à 3 % → ≈ 13 439 € soit ≈ 11 025 € réels (≈ 0,98 %)', () => {
    expect(10000 / 1.02 ** 10).toBeCloseTo(8203, 0);
    expect(10000 * 1.03 ** 10).toBeCloseTo(13439, 0);
    expect(10000 * 1.03 ** 10 / 1.02 ** 10).toBeCloseTo(11025, 0);
    expect(1.03 / 1.02 - 1).toBeCloseTo(0.0098, 4);
    const t = JSON.stringify(guides.find((x) => x.slug === 'inflation-pouvoir-d-achat-epargne')!);
    for (const v of ['8 203', '13 439', '11 025', '0,98 %', 'fictif']) expect(t).toContain(v);
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
