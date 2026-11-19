import { prepayVsInvest } from './calc/prepayVsInvest';
import type { NetWorthItem } from './calc/networth';
import { PFU_TOTAL_PCT } from './calc/pfu';
import { amortize } from './calc/loan';
import { capacityAtHcsf, debtRatio, HCSF } from './calc/debtRatio';
import { simpleVsCompound } from './calc/simpleVsCompound';
import { savingsGoal } from './calc/savingsGoal';
import { feeImpact } from './calc/fees';
import { projectGrowth } from './calc/growth';
import { fireTarget } from './calc/fire';
import { rentalAnalysis, type RentalInput } from './calc/rental';

/** Exemple fictif du schéma « Intérêts simples ou composés » : toutes les valeurs sont calculées, jamais saisies à la main. */
export const SNOWBALL_EXAMPLE = { initial: 10000, annualRate: 0.05, years: [10, 20] as const };

export type SnowballBar = { kind: 'simple' | 'compound'; capital: number; interest: number; total: number };
export type SnowballGroup = { year: number; simple: SnowballBar; compound: SnowballBar };

export function snowballGroups(): SnowballGroup[] {
  const { initial, annualRate, years } = SNOWBALL_EXAMPLE;
  const r = simpleVsCompound({ initial, annualRate, years: Math.max(...years) });
  return years.map((year) => {
    const row = r.rows[year];
    return {
      year,
      simple: { kind: 'simple', capital: initial, interest: row.simple - initial, total: row.simple },
      compound: { kind: 'compound', capital: initial, interest: row.compound - initial, total: row.compound },
    };
  });
}

/** Exemple fictif du guide « investir à crédit » : 180 000 € à 3,5 % sur 20 ans, hors assurance. */
export const LOAN_EXAMPLE = { principal: 180000, annualRate: 0.035, years: 20, shownYears: [1, 10, 20] as const };

export type LoanSlice = { year: number; interest: number; principal: number; total: number };

/** Répartition des remboursements d'une année entre intérêts et capital, calculée par le simulateur de crédit. */
export function loanSlices(): { monthly: number; slices: LoanSlice[] } {
  const { principal, annualRate, years, shownYears } = LOAN_EXAMPLE;
  const r = amortize({ principal, annualRate, years });
  return {
    monthly: r.monthlyPayment,
    slices: shownYears.map((year) => {
      const row = r.schedule[year - 1];
      return { year, interest: row.interest, principal: row.principalPaid, total: row.interest + row.principalPaid };
    }),
  };
}

/** Exemple fictif du guide « Inflation » : 10 000 € pendant 10 ans, inflation constante de 2 %, placement à 3 %. */
export const INFLATION_EXAMPLE = { initial: 10000, inflation: 0.02, rate: 0.03, years: 10 };

export type InflationBar = { label: string; shown: number; real: number };

/** Montant affiché et pouvoir d'achat (en euros d'aujourd'hui) au bout de la période, calculés avec les formules du guide. */
export function inflationBars(): InflationBar[] {
  const { initial, inflation, rate, years } = INFLATION_EXAMPLE;
  const deflator = Math.pow(1 + inflation, years);
  const placed = initial * Math.pow(1 + rate, years);
  return [
    { label: 'Laissée telle quelle', shown: initial, real: initial / deflator },
    { label: 'Placée à 3 % par an', shown: placed, real: placed / deflator },
  ];
}

/** Exemple fictif du guide « Diversifier » : une année où les actions perdent 20 % et un placement prudent gagne 2 %. */
export const DIVERSIFICATION_EXAMPLE = { capital: 10000, stocksReturn: -0.2, safeReturn: 0.02, stocksShares: [1, 0.7] };

/** Pour chaque répartition : parts, rendement de l'année, et en euros sur le capital de l'exemple (perte des actions, gain du placement prudent, total). */
export type DiversificationRow = { stocks: number; safe: number; result: number; stocksEur: number; safeEur: number; totalEur: number };

/** Rendement de l'année pour chaque répartition : moyenne des rendements pondérée par la part de chaque placement. */
export function diversificationRows(): DiversificationRow[] {
  const { capital, stocksReturn, safeReturn, stocksShares } = DIVERSIFICATION_EXAMPLE;
  return stocksShares.map((s) => {
    const stocksEur = capital * s * stocksReturn;
    const safeEur = capital * (1 - s) * safeReturn;
    return { stocks: s, safe: 1 - s, result: s * stocksReturn + (1 - s) * safeReturn, stocksEur, safeEur, totalEur: stocksEur + safeEur };
  });
}

/** Exemple fictif du guide « investir à crédit » : bien de 200 000 €, 20 000 € d'apport, 180 000 € empruntés à 3,5 % sur 20 ans, loyers nets de charges de 5 % ou 3 % du prix. */
export const LEVERAGE_EXAMPLE = { price: 200000, down: 20000, netYields: [0.05, 0.03] as const };

export type LeverageBar = { yieldPct: number; income: number; interestPaid: number; left: number; shortfall: number };

/** Première année : ce que rapporte le bien (net de charges), ce qui part en intérêts, ce qu'il reste (ou ce qui manque) avant impôt. */
export function leverageBars(): { interest: number; down: number; bars: LeverageBar[] } {
  const { price, down, netYields } = LEVERAGE_EXAMPLE;
  const interest = loanSlices().slices[0].interest;
  return {
    interest,
    down,
    bars: netYields.map((y) => {
      const income = price * y;
      return { yieldPct: y * 100, income, interestPaid: Math.min(income, interest), left: Math.max(0, income - interest), shortfall: Math.max(0, interest - income) };
    }),
  };
}

/** Exemple fictif du guide « Rentabilité locative » : bien à 150 000 €, loyer 750 €/mois, frais d'acquisition 8 %, travaux 10 000 €, un mois de vacance, 2 060 € de charges par an. */
export const RENDEMENT_EXAMPLE = { price: 150000, monthlyRent: 750, acquisitionFeesRate: 0.08, works: 10000, vacancyMonths: 1, yearlyCharges: 2060 };

export type RendementStep = { label: string; detail: string; value: number };

/** Les quatre étapes de la chute du rendement, du « brut des annonces » au « net de charges », calculées avec les formules du guide. */
export function rendementSteps(): RendementStep[] {
  const { price, monthlyRent, acquisitionFeesRate, works, vacancyMonths, yearlyCharges } = RENDEMENT_EXAMPLE;
  const cost = price * (1 + acquisitionFeesRate) + works;
  const rents = monthlyRent * (12 - vacancyMonths);
  return [
    { label: 'Brut, celui des annonces', detail: 'loyers d’une année comparés au prix d’achat', value: (monthlyRent * 12) / price },
    { label: 'Avec frais d’achat et travaux', detail: 'même loyer, mais un coût total plus élevé', value: (monthlyRent * 12) / cost },
    { label: 'Avec un mois sans locataire', detail: 'seuls 11 loyers sur 12 sont encaissés', value: rents / cost },
    { label: 'Net, après charges et taxe foncière', detail: 'après taxe foncière, assurance, entretien…', value: (rents - yearlyCharges) / cost },
  ];
}

/** Le même bien fictif, financé à crédit, pour le schéma « cash-flow » du guide : 22 000 € d'apport couvrent frais et travaux, 150 000 € empruntés à 3,5 % sur 20 ans, assurance emprunteur 0,3 % par an ; charges annuelles 900 € de taxe foncière, 600 € de copropriété, 150 € d'assurance, 5 % des loyers d'entretien (≈ 2 060 €). */
export const CASHFLOW_EXAMPLE: RentalInput = {
  price: RENDEMENT_EXAMPLE.price, notaryRate: RENDEMENT_EXAMPLE.acquisitionFeesRate, works: RENDEMENT_EXAMPLE.works, furniture: 0,
  monthlyRent: RENDEMENT_EXAMPLE.monthlyRent, vacancyMonths: RENDEMENT_EXAMPLE.vacancyMonths,
  propertyTax: 900, coOwnership: 600, insurancePno: 150, managementRate: 0, maintenanceRate: 0.05,
  downPayment: 22000, loanRate: 0.035, loanYears: 20, loanInsuranceRate: 0.003,
  regime: 'aucune', marginalRate: 0, socialRate: 0, microAllowance: 0, annualDepreciation: 0,
  appreciation: 0, indexation: 0, horizon: 20,
};

/** Un mois moyen de la première année, avant impôt, calculé par le simulateur immobilier ; montants arrondis à l'euro, effort = sorties − entrées (arrondies). */
export function cashflowParts() {
  const r = rentalAnalysis(CASHFLOW_EXAMPLE);
  const rents = Math.round(r.annualRentCollected / 12);
  const charges = Math.round(r.annualCharges / 12);
  const loan = Math.round(r.monthlyLoan);
  return { loanAmount: r.loanAmount, rents, charges, loan, out: charges + loan, effort: charges + loan - rents, exactCashflow: r.monthlyCashflow };
}

/** Exemple fictif du guide « Taux d'endettement » : 3 000 € de revenus nets par mois, 200 € de crédit en cours, 850 € de nouvelle mensualité. */
export const ENDETTEMENT_EXAMPLE = { income: 3000, existingPayments: 200, newPayment: 850 };

/** Découpage des revenus de l'exemple, calculé avec le simulateur d'endettement (aucune valeur saisie à la main). */
export function endettementParts() {
  const { income, existingPayments, newPayment } = ENDETTEMENT_EXAMPLE;
  const r = debtRatio({ income, existingPayments, newPayment, livingCosts: 0, householdSize: 1 });
  return {
    income,
    existing: existingPayments,
    added: newPayment,
    rest: income - existingPayments - newPayment,
    ratioAfter: r.ratioAfter,
    limit: income * HCSF.maxRatio,
    maxNewPayment: r.maxNewPayment,
  };
}

/**
 * Leviers du guide « Taux d'endettement » sur le même foyer fictif : capital empruntable au repère de 35 %,
 * assurance comprise, avec un taux et une assurance fictifs (ceux proposés par défaut dans le simulateur).
 * Montants arrondis au millier d'euros inférieur, calculés par capacityAtHcsf (jamais saisis à la main).
 */
export const LEVIERS_EXAMPLE = { rate: 0.036, insuranceRate: 0.003, years: 20, longerYears: 25, secondIncome: 1500 };

export function leviersEndettement() {
  const { income, existingPayments } = ENDETTEMENT_EXAMPLE;
  const { rate, insuranceRate, years, longerYears, secondIncome } = LEVIERS_EXAMPLE;
  const cap = (inc: number, existing: number, y: number) => Math.floor(capacityAtHcsf(inc, existing, rate, y, insuranceRate) / 1000) * 1000;
  const coupleLimit = Math.round((income + secondIncome) * HCSF.maxRatio);
  return {
    base: cap(income, existingPayments, years),
    longer: cap(income, existingPayments, longerYears),
    noOldLoan: cap(income, 0, years),
    couple: cap(income + secondIncome, existingPayments, years),
    coupleLimit,
    coupleNewPayment: coupleLimit - existingPayments,
  };
}

/** Exemple fictif du guide « Patrimoine net » (même chiffres que sa définition). */
export const PATRIMOINE_EXAMPLE = { home: 250000, savings: 15000, debt: 180000 };

export function patrimoineParts() {
  const { home, savings, debt } = PATRIMOINE_EXAMPLE;
  const assets = home + savings;
  return { home, savings, debt, assets, net: assets - debt };
}

/** Valeurs de départ du calculateur du guide : le même exemple fictif que le schéma (épargne de 15 000 € répartie sur deux lignes). */
export const NW_DEFAULT: { items: NetWorthItem[] } = {
  items: [
    { id: 'a1', label: 'Comptes et livrets', amount: 10000, kind: 'actif' },
    { id: 'a2', label: 'Placements (PEA, assurance-vie…)', amount: PATRIMOINE_EXAMPLE.savings - 10000, kind: 'actif' },
    { id: 'a3', label: 'Logement (valeur estimée)', amount: PATRIMOINE_EXAMPLE.home, kind: 'actif' },
    { id: 'd1', label: 'Crédit immobilier', amount: PATRIMOINE_EXAMPLE.debt, kind: 'dette' },
  ],
};

/** Exemple fictif du guide « Rembourser son crédit par anticipation ou investir ? » (mêmes chiffres que le texte). Gains imposés au PFU 2026 (31,4 %, valeur partagée avec le simulateur et la fiche Compte-titres). */
export const REMBOURSER_EXAMPLE = { balance: 150000, annualRate: 0.04, remainingYears: 20, lump: 20000, annualReturn: 0.05, annualFees: 0.002, taxRate: PFU_TOTAL_PCT / 100 };

/** Résultat de l'exemple, calculé avec le simulateur « rembourser ou investir » ; montants arrondis à 50 € (le guide dit « environ »), l'écart arrondi de la même façon tombe juste sur la différence des deux montants affichés. */
export function rembourserParts() {
  const r = prepayVsInvest(REMBOURSER_EXAMPLE);
  const round50 = (v: number) => Math.round(v / 50) * 50;
  return {
    ...REMBOURSER_EXAMPLE,
    wealthPrepay: round50(r.wealthPrepay),
    wealthInvest: round50(r.wealthInvest),
    gap: round50(r.wealthPrepay - r.wealthInvest),
    monthsSaved: r.monthsSaved,
    interestSaved: round50(r.interestSaved),
    breakEvenReturn: r.breakEvenReturn,
  };
}

/** Schéma « règle de 72 » : durées pour doubler à plusieurs taux (exemple fictif, calcul mathématique pur, taux choisis comme dans le guide). */
export const REGLE72_RATES = [0.02, 0.04, 0.06, 0.08, 0.12] as const;

export function regle72Rows() {
  return REGLE72_RATES.map((rate) => {
    const exact = Math.log(2) / Math.log(1 + rate);
    return { rate, exact, rule: 72 / (rate * 100) };
  });
}

/** Schéma « combien épargner par mois » : versement mensuel pour 20 000 € à trois durées, sans intérêts et à 1,7 % (exemple fictif, calcul du simulateur). */
export const EPARGNE_MOIS_EXAMPLE = { target: 20000, rate: 0.017, years: [3, 5, 10] as const };

export function epargneMoisRows() {
  const { target, rate, years } = EPARGNE_MOIS_EXAMPLE;
  return years.map((y) => ({
    years: y,
    plain: savingsGoal({ target, current: 0, years: y, annualRate: 0 }).monthly,
    withRate: savingsGoal({ target, current: 0, years: y, annualRate: rate }).monthly,
  }));
}

/** Schéma « effet des frais » : 10 000 € placés 25 ans à 6 % brut supposé, trois niveaux de frais annuels (exemple fictif, mêmes chiffres que le guide). */
export const FRAIS_EXAMPLE = { initial: 10000, annualReturn: 0.06, years: 25, levels: [0, 0.002, 0.015] as const };

/** Schéma « additionner les frais » (guide « Comparer les frais ») : deux offres fictives dont les frais annuels s'additionnent
 * pour donner les deux totaux de l'exemple sur 25 ans (0,2 % et 1,5 %). Taux choisis pour l'illustration, pas des taux de marché. */
export const FRAIS_OFFRES = [
  { name: 'Offre 1 : assurance-vie, un fonds', parts: [{ label: 'Contrat', rate: 0.007 }, { label: 'Fonds', rate: 0.008 }] },
  { name: 'Offre 2 : PEA, un ETF', parts: [{ label: 'ETF', rate: 0.0015 }, { label: 'Courtage', rate: 0.0005 }] },
] as const;

/** Total annuel de chaque offre, arrondi au centième de point pour éviter les restes de virgule flottante. */
export function fraisOffresTotals() {
  return FRAIS_OFFRES.map((o) => Math.round(o.parts.reduce((t, p) => t + p.rate, 0) * 10000) / 10000);
}

/** Montants arrondis à 100 € (le guide dit « environ »). */
export function fraisRows() {
  const { initial, annualReturn, years, levels } = FRAIS_EXAMPLE;
  const r100 = (v: number) => Math.round(v / 100) * 100;
  const res = feeImpact({ initial, monthly: 0, annualReturn, years, inflation: 0 }, [...levels]);
  return res.map((x) => ({ fees: x.fees, final: r100(x.finalValue), cost: r100(x.cost) }));
}

/** Schéma « l’écart dû aux frais se creuse » (guide « Comprendre les intérêts composés ») : 10 000 € placés en une fois à 5 % par an,
 * sans frais ou avec 1 % de frais par an, vus après 5, 15 et 25 ans (exemple fictif, mêmes chiffres que le texte du guide). */
export const FRAIS_CUMUL_EXAMPLE = { initial: 10000, annualReturn: 0.05, fees: 0.01, years: [5, 15, 25] as const };

/** Montants arrondis à l’euro ; l’écart est calculé sur les montants arrondis, pour que l’addition affichée tombe juste. */
export function fraisCumulRows() {
  const { initial, annualReturn, fees, years } = FRAIS_CUMUL_EXAMPLE;
  return years.map((y) => {
    const [sans, avec] = feeImpact({ initial, monthly: 0, annualReturn, years: y, inflation: 0 }, [0, fees]);
    const gross = Math.round(sans.finalValue);
    const net = Math.round(avec.finalValue);
    return { years: y, gross, net, cost: gross - net };
  });
}

/** Schéma « petits versements » : 50 € par mois pendant 30 ans à 4 % par an supposé, avec ou sans hausse des versements (exemple fictif, mêmes chiffres que le guide « épargne limitée »). */
export const PETITS_VERSEMENTS_EXAMPLE = {
  years: 30,
  annualReturn: 0.04,
  monthly: 50,
  raises: [{ fromYear: 6, monthly: 100 }, { fromYear: 11, monthly: 150 }],
};

/** Versé et capital final (arrondi à 100 €, le guide dit « environ ») dans les deux scénarios. */
export function petitsVersementsRows() {
  const { years, annualReturn, monthly, raises } = PETITS_VERSEMENTS_EXAMPLE;
  const base = { initial: 0, annualReturn, annualFees: 0, inflation: 0, years, monthly };
  const r100 = (v: number) => Math.round(v / 100) * 100;
  const end = (savingsChanges?: { fromYear: number; monthly: number }[]) => {
    const p = projectGrowth({ ...base, savingsChanges });
    const last = p[p.length - 1];
    const paid = Math.round(last.contributed);
    const total = r100(last.value);
    return { paid, total, gains: total - paid };
  };
  return [
    { label: 'Le même versement', phases: petitsVersementsPhases([]), ...end() },
    { label: 'Un versement qui augmente', phases: petitsVersementsPhases(raises), ...end(raises) },
  ];
}

/** Paliers de versement mensuel (montant et nombre d'années) sur la durée de l'exemple, déduits des hausses. */
export function petitsVersementsPhases(raises: readonly { fromYear: number; monthly: number }[]) {
  const { years, monthly } = PETITS_VERSEMENTS_EXAMPLE;
  const starts = [{ fromYear: 1, monthly }, ...raises];
  return starts.map((s, i) => ({ monthly: s.monthly, years: (starts[i + 1]?.fromYear ?? years + 1) - s.fromYear }));
}

/** Schéma « capital visé » : 30 000 € de dépenses par an sans autre revenu, à trois taux de retrait supposés (exemple fictif, calcul du simulateur). */
export const CAPITAL_VISE_EXAMPLE = { expenses: 30000, rates: [0.03, 0.04, 0.05] as const };

export function capitalViseRows() {
  const { expenses, rates } = CAPITAL_VISE_EXAMPLE;
  return rates.map((rate) => ({ rate, capital: fireTarget(expenses, 0, rate) }));
}

/** Schéma « combien de mois de dépenses » : 2 000 € de dépenses mensuelles et les trois repères pédagogiques du guide (3, 6, 9 mois). Exemple fictif. */
export const PRECAUTION_EXAMPLE = { monthly: 2000, months: [3, 6, 9] as const, labels: ['Revenus stables', 'Revenus variables', 'Indépendant ou dirigeant'] as const };

export function precautionRows() {
  const { monthly, months, labels } = PRECAUTION_EXAMPLE;
  return months.map((m, i) => ({ months: m, label: labels[i], amount: monthly * m }));
}

/**
 * Exemple fictif de la fiche PER : 3 000 € versés et déduits dans la tranche à 30 %, puis retirés en capital à la retraite
 * dans la tranche à 11 % ou toujours à 30 %. Tranches du barème 2026 (Service-Public F1419, consulté le 2026-11-13).
 */
export const PER_EXAMPLE = { amount: 3000, entryRatePct: 30, exitRatesPct: [11, 30] as const, pfuPct: PFU_TOTAL_PCT };

/** Fiche Financement participatif : exemple fictif, 20 prêts de 100 € à 9 % sur un an, avec 0, 1 ou 2 défauts totaux. */
export const CROWDFUNDING_EXAMPLE = { projects: 20, ticket: 100, ratePct: 9, defaults: [0, 1, 2] as const };

/**
 * Fiche SCPI : exemple fictif, 10 000 € souscrits avec 10 % de frais d'entrée (dans la fourchette de 6 % à 12 % du montant
 * souscrit, La finance pour tous, mise à jour le 2 janvier 2024, consultée le 2026-11-13) et 5 % de distribution par an.
 */
export const SCPI_EXAMPLE = { amount: 10000, entryFeePct: 10, distributionPct: 5 };

/**
 * Fiche Obligations : exemple fictif, 1 000 € prêtés pendant 5 ans avec un coupon de 3 % par an (coupon versé chaque
 * année, capital rendu à l'échéance : La finance pour tous, « Qu'est-ce qu'une obligation ? », consulté le 2026-11-17),
 * puis un fonds de sensibilité 5 face à une hausse brutale des taux de 1 point (« Les risques obligataires », même date).
 */
export const OBLIGATION_EXAMPLE = { amount: 1000, ratePct: 3, years: 5, sensitivity: 5, rateRisePoints: 1 };

/**
 * Fiche Location nue : exemple fictif, le bien de 150 000 € loué 750 € par mois toute l'année (même cas que le guide
 * Rentabilité locative), au micro-foncier (abattement de 30 %, loyers jusqu'à 15 000 € par an : Service-Public F1991,
 * consulté le 2026-11-14), revenus imposés dans la tranche à 30 % (Service-Public F1419, consulté le 2026-11-14).
 */
export const LOCATION_NUE_EXAMPLE = { price: 150000, monthlyRent: 750, allowancePct: 30, ceiling: 15000, marginalRatePct: 30, socialPct: 17.2 };

/**
 * Fiche Racheter une entreprise : exemple fictif, une entreprise qui dégage 100 000 € de résultat par an, achetée 500 000 €
 * dont 400 000 € empruntés sur 7 ans à un taux fictif de 4 %, puis le même remboursement si le résultat baisse de 30 %.
 * Aucun chiffre réglementaire : tout est fictif, recalculé par `repriseDebtShare` (ficheExemples.test.ts).
 */
/**
 * Fiche Donation : exemple fictif, un appartement estimé à 200 000 € donné par un parent à son enfant (abattement de
 * 100 000 €, puis barème en ligne directe : Service-Public F14203, vérifiée le 13 mai 2026, consultée le 2026-11-16).
 * Droits recalculés tranche par tranche par `detailDroitsLigneDirecte` (donation.test.ts, data.test.ts).
 */
export const DONATION_EXAMPLE = { value: 200000 };

export const REPRISE_EXAMPLE = { profit: 100000, price: 500000, loan: 400000, years: 7, ratePct: 4, dropPct: 30 };

/**
 * Fiche ETF actions diversifiés : exemple fictif, 200 € par mois pendant 20 ans à 6 % par an nets de frais (hypothèse,
 * aucun chiffre réglementaire), valeur tous les 5 ans, puis une baisse de 30 % juste avant la sortie (dans la fourchette
 * « −30 % à −50 % lors de crises passées » de la rubrique Inconvénients de la fiche). Recalculé par `etfMilestones`.
 */
export const ETF_EXAMPLE = { monthly: 200, ratePct: 6, years: 20, step: 5, dropPct: 30 };

/**
 * Fiche Assurance-vie : exemple fictif de la fiche, 7 000 € versés il y a plus de 8 ans valant 10 000 €, retirés en
 * totalité. Abattement annuel de 4 600 € (personne seule) et prélèvements sociaux de 17,2 % : mêmes valeurs que la
 * rubrique Fiscalité de la fiche (vérifiée le 14 novembre 2026). Recalculé par `assuranceVieRetrait`.
 */
export const ASSURANCE_VIE_EXAMPLE = { paid: 7000, value: 10000, allowance: 4600, socialPct: 17.2 };
