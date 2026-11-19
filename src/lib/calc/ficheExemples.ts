import { loanPayment } from './loan';
import { projectGrowth } from './growth';

/**
 * Calculs des exemples fictifs des fiches Financement participatif et SCPI.
 * Purs, arrondis à l'euro ; recalculés par `ficheExemples.test.ts` et repris par les schémas des fiches.
 */

export interface CrowdfundingScenario { defaults: number; recovered: number; gain: number; gainPct: number }

/**
 * Prêts participatifs : `projects` prêts de `ticket` € chacun, remboursés en une fois au bout d'un an avec `ratePct` %
 * d'intérêts. Hypothèse simplificatrice : un projet en défaut total ne rend rien (ni capital ni intérêts).
 * Avant impôt et avant frais de plateforme.
 */
export function crowdfundingScenario(projects: number, ticket: number, ratePct: number, defaults: number): CrowdfundingScenario {
  const invested = projects * ticket;
  const recovered = Math.round((projects - defaults) * ticket * (1 + ratePct / 100));
  const gain = recovered - invested;
  return { defaults, recovered, gain, gainPct: Math.round((gain / invested) * 10000) / 100 };
}

export interface ScpiPayback { fees: number; yearly: number; years: number }

/**
 * SCPI : frais d'entrée prélevés sur le montant souscrit, compensés par la distribution annuelle (exprimée en % du montant
 * souscrit), à prix de part constant et avant impôt. `years` = nombre d'années pleines de distribution nécessaires.
 */
export function scpiFeesPayback(amount: number, entryFeePct: number, distributionPct: number): ScpiPayback {
  const fees = Math.round((amount * entryFeePct) / 100);
  const yearly = Math.round((amount * distributionPct) / 100);
  return { fees, yearly, years: Math.ceil(fees / yearly) };
}

/**
 * Or et objets précieux, option pour le régime des plus-values sur biens meubles : abattement de 5 % par année de
 * détention au-delà de la deuxième, exonération totale au bout de la vingt-deuxième année (BOFiP
 * BOI-RPPM-PVBMC-20-20, consulté le 2026-11-14). Renvoie la part de la plus-value effacée, de 0 à 1.
 */
export function abattementDetentionMeubles(fullYears: number): number {
  const years = Math.max(0, Math.floor(fullYears) - 2);
  return Math.min(1, Math.round(years * 5) / 100);
}

export interface MicroFoncier { rents: number; allowance: number; taxable: number; incomeTax: number; incomeTaxPctOfRents: number }

/**
 * Location nue au micro-foncier : un abattement forfaitaire de `allowancePct` % est retiré des loyers bruts annuels, le reste
 * s'ajoute aux autres revenus et est imposé ici entièrement dans la tranche à `marginalRatePct` %. Les prélèvements sociaux
 * s'ajoutent ; ils ne sont pas calculés ici. Service-Public F1991 (abattement de 30 %, loyers jusqu'à 15 000 €) et F1419
 * (tranche à 30 %), consultés le 2026-11-14. Arrondis à l'euro.
 */
export function microFoncierExample(monthlyRent: number, allowancePct: number, marginalRatePct: number): MicroFoncier {
  const rents = monthlyRent * 12;
  const allowance = Math.round((rents * allowancePct) / 100);
  const taxable = rents - allowance;
  const incomeTax = Math.round((taxable * marginalRatePct) / 100);
  return { rents, allowance, taxable, incomeTax, incomeTaxPctOfRents: Math.round((incomeTax / rents) * 1000) / 10 };
}

export interface RepriseDebt { monthly: number; yearly: number; sharePct: number; left: number; leftAfterDrop: number; droppedProfit: number }

/**
 * Racheter une entreprise : `loan` € empruntés sur `years` ans au taux fictif `ratePct` %, remboursés par mensualités
 * constantes (même formule que le simulateur de crédit, sans assurance). Compare le remboursement annuel au résultat annuel
 * `profit`, puis au résultat diminué de `dropPct` %. Calcul simplifié : ni impôt sur les bénéfices ni assurance. Arrondis à l'euro.
 */
export function repriseDebtShare(profit: number, loan: number, ratePct: number, years: number, dropPct: number): RepriseDebt {
  const monthly = Math.round(loanPayment(loan, ratePct / 100, years));
  const yearly = Math.round(loanPayment(loan, ratePct / 100, years) * 12);
  const droppedProfit = Math.round(profit * (1 - dropPct / 100));
  return { monthly, yearly, sharePct: Math.round((yearly / profit) * 100), left: profit - yearly, leftAfterDrop: droppedProfit - yearly, droppedProfit };
}

export interface BondCoupons { coupon: number; totalCoupons: number; received: number }

/**
 * Obligation détenue jusqu'à l'échéance : coupon annuel fixe de `ratePct` % du montant prêté, puis remboursement du montant
 * prêté. Avant impôt et frais, si l'émetteur rembourse. Arrondis à l'euro.
 */
export function bondCoupons(amount: number, ratePct: number, years: number): BondCoupons {
  const coupon = Math.round((amount * ratePct) / 100);
  const totalCoupons = coupon * years;
  return { coupon, totalCoupons, received: amount + totalCoupons };
}

/**
 * Sensibilité d'un fonds obligataire : variation approximative de sa valeur, en %, pour une variation brutale des taux
 * exprimée en points (La finance pour tous, « Les risques obligataires », consulté le 2026-11-17 : « une sensibilité de 7
 * veut dire que toute hausse brutale de 1 % des taux […] provoque une diminution de la valeur de 7 % »).
 * Approximation linéaire, valable pour de petites variations.
 */
export function sensitivityChangePct(sensitivity: number, rateRisePoints: number): number {
  return -sensitivity * rateRisePoints;
}

export interface FundFees { yearly: number; total: number }

/** Frais annuels exprimés en % des sommes souscrites (assiette fixe), cumulés sur la durée de blocage. Arrondis à l'euro. */
export function fundFeesOnSubscribed(amount: number, feePct: number, years: number): FundFees {
  const yearly = Math.round((amount * feePct) / 100);
  return { yearly, total: yearly * years };
}

export interface YearlySavings { saved: number; withGrowth: number }

/**
 * Épargne de `yearly` € placée à la fin de chaque année pendant `years` ans à `ratePct` % par an (intérêts composés).
 * `saved` : total versé ; `withGrowth` : valeur finale, arrondie à la centaine d'euros.
 */
export function yearlySavingsValue(yearly: number, ratePct: number, years: number): YearlySavings {
  const r = ratePct / 100;
  const fv = r === 0 ? yearly * years : yearly * ((Math.pow(1 + r, years) - 1) / r);
  return { saved: yearly * years, withGrowth: Math.round(fv / 100) * 100 };
}

export interface ListedPropertyYear { afterDrop: number; dividends: number }

/** Actions de foncières : valeur après une baisse de `dropPct` % du cours, et dividendes de `yieldPct` % du montant investi. */
export function listedPropertyYear(amount: number, dropPct: number, yieldPct: number): ListedPropertyYear {
  return { afterDrop: Math.round(amount * (1 - dropPct / 100)), dividends: Math.round((amount * yieldPct) / 100) };
}

export interface Concentration { lines: number; perLine: number; maxLossPct: number }

/**
 * Actions en direct : un capital `total` réparti à parts égales sur `lines` lignes. Une entreprise défaillante fait perdre
 * au plus sa ligne (`perLine`), soit `maxLossPct` % du total, arrondi au dixième.
 */
export function concentrationLoss(total: number, lines: number): Concentration {
  const perLine = Math.round(total / lines);
  return { lines, perLine, maxLossPct: Math.round(1000 / lines) / 10 };
}

export interface Recovery { afterDrop: number; recoveryPct: number; sameRiseValue: number }

/**
 * Après une baisse de `dropPct` %, la hausse nécessaire pour revenir au montant de départ (`recoveryPct`, arrondie à
 * l'unité) et la valeur obtenue si le cours remontait seulement du même pourcentage (`sameRiseValue`).
 */
export function recoveryAfterDrop(amount: number, dropPct: number): Recovery {
  const afterDrop = Math.round(amount * (1 - dropPct / 100));
  return {
    afterDrop,
    recoveryPct: Math.round((amount / afterDrop - 1) * 100),
    sameRiseValue: Math.round(afterDrop * (1 + dropPct / 100)),
  };
}

export interface TrainingPayoff { paybackMonths: number; saved: { years: number; contributed: number; value: number }[] }

/**
 * Formation et compétences : une formation payée `cost` € qui procure une hausse de salaire de `monthlyRaise` € nets par
 * mois. `paybackMonths` = mois de hausse nécessaires pour couvrir la dépense ; `saved` = valeur de la hausse épargnée chaque
 * mois à `ratePct` % par an pendant chacune des `horizons` (même moteur que le simulateur de patrimoine, taux mensuel
 * équivalent), arrondie à 500 €. Avant impôt.
 */
export function trainingPayoff(cost: number, monthlyRaise: number, ratePct: number, horizons: number[]): TrainingPayoff {
  return {
    paybackMonths: Math.ceil(cost / monthlyRaise),
    saved: horizons.map((years) => {
      const last = projectGrowth({ initial: 0, monthly: monthlyRaise, annualReturn: ratePct / 100, annualFees: 0, years, inflation: 0 }).at(-1)!;
      return { years, contributed: Math.round(last.contributed), value: Math.round(last.value / 500) * 500 };
    }),
  };
}

export interface SubscriptionChurn { revenue: number; lostFirstMonth: number; clientsLeft: number; revenueLeft: number }

/**
 * Activité numérique par abonnement : `clients` abonnés à `price` € par mois, dont `churnPct` % résilient chaque mois, sans
 * nouveau client. `lostFirstMonth` = départs du premier mois (autant de nouveaux clients à trouver pour rester au même
 * niveau au départ) ; `clientsLeft` et `revenueLeft` après `months` mois, arrondis à l'unité.
 */
export function subscriptionChurn(clients: number, price: number, churnPct: number, months: number): SubscriptionChurn {
  const clientsLeft = Math.round(clients * Math.pow(1 - churnPct / 100, months));
  return { revenue: clients * price, lostFirstMonth: Math.round((clients * churnPct) / 100), clientsLeft, revenueLeft: clientsLeft * price };
}

export interface FondsEurosGrowth { final: number; firstYearInterest: number; lastYearInterest: number; finalWithMoreFees: number; gap: number }

/**
 * Fonds en euros : `capital` € placés `years` ans à `netPct` % par an, net de frais ; les intérêts de chaque année
 * s'ajoutent au capital et produisent à leur tour des intérêts (Service-Public F15274, consulté le 2026-11-17).
 * `firstYearInterest` et `lastYearInterest` : intérêts de la première et de la dernière année, à l'euro. `finalWithMoreFees` :
 * même placement avec `extraFeesPts` point(s) de frais de plus par an, retirés du rendement net. Capitaux et écart arrondis à 10 €.
 */
export function fondsEurosGrowth(capital: number, netPct: number, years: number, extraFeesPts: number): FondsEurosGrowth {
  const r = netPct / 100;
  const final = capital * Math.pow(1 + r, years);
  const withFees = capital * Math.pow(1 + r - extraFeesPts / 100, years);
  const to10 = (v: number) => Math.round(v / 10) * 10;
  return {
    final: to10(final),
    firstYearInterest: Math.round(capital * r),
    lastYearInterest: Math.round(capital * Math.pow(1 + r, years - 1) * r),
    finalWithMoreFees: to10(withFees),
    gap: to10(final - withFees),
  };
}

/**
 * Fonds en euros : intérêts de chaque année pour `capital` € à `netPct` % net, intérêts laissés sur le contrat. Chaque
 * année se partage entre les intérêts sur le capital versé (toujours `capital` × taux) et ceux que rapportent les
 * intérêts déjà gagnés. Montants à l'euro (le total de l'année est arrondi séparément, comme dans le texte de la fiche).
 */
export function fondsEurosYearlyInterest(capital: number, netPct: number, years: number) {
  const r = netPct / 100;
  return Array.from({ length: years }, (_, i) => {
    const exact = capital * Math.pow(1 + r, i) * r;
    const onCapital = capital * r;
    return { year: i + 1, onCapital: Math.round(onCapital), onInterest: Math.round(exact - onCapital), total: Math.round(exact) };
  });
}

/**
 * Livret A : intérêts d'une année civile pour `amount` € déposés le `day` du mois `month` (1 à 12), à `ratePct` % supposé
 * constant toute l'année. Calcul par quinzaines entières : un dépôt fait jusqu'au 15 rapporte à partir du 16, un dépôt
 * fait à partir du 16 rapporte à partir du 1er du mois suivant (Service-Public F2365, consulté le 2026-11-17).
 * Renvoie le nombre de quinzaines rémunérées jusqu'au 31 décembre et les intérêts, arrondis au centime.
 */
export function livretQuinzaines(amount: number, ratePct: number, day: number, month: number): { quinzaines: number; interest: number } {
  const start = day <= 15 ? 2 * (month - 1) + 1 : 2 * month;
  const quinzaines = Math.max(0, 24 - start);
  return { quinzaines, interest: Math.round(((amount * ratePct) / 100) * (quinzaines / 24) * 100) / 100 };
}

/**
 * PEL ou Livret A, sur une année et à taux supposés constants : intérêts bruts du PEL, part retenue par le prélèvement
 * forfaitaire unique (`pfuPct`, 30 % pour les PEL ouverts depuis 2018 : Service-Public F16140, consulté le 2026-11-17),
 * intérêts nets, intérêts du Livret A (exonérés : F2365) et taux du Livret A sous lequel le PEL rapporte davantage net.
 */
export function pelVsLivretA(amount: number, pelPct: number, pfuPct: number, livretPct: number) {
  const gross = Math.round((amount * pelPct) / 100);
  const tax = Math.round((gross * pfuPct) / 100);
  return {
    gross,
    tax,
    net: gross - tax,
    livret: Math.round((amount * livretPct) / 100),
    breakEvenPct: Math.round(pelPct * (100 - pfuPct)) / 100,
  };
}

/** LEP ou Livret A, sur une année pleine à taux constants : intérêts de chacun (tous deux exonérés) et écart. */
export function lepVsLivretA(amount: number, lepPct: number, livretPct: number) {
  const lep = Math.round((amount * lepPct) / 100);
  const livret = Math.round((amount * livretPct) / 100);
  return { lep, livret, gap: lep - livret };
}

export interface EtfMilestone { year: number; contributed: number; value: number; gains: number }

/**
 * ETF : versement mensuel constant `monthly` €, rendement supposé `ratePct` % par an net de frais (même calcul que le
 * simulateur de patrimoine, `projectGrowth`), valeur tous les `step` ans jusqu'à `years`, arrondie à la centaine.
 * `lastStepShare` : part des gains finaux apparue pendant le dernier palier ; `afterDrop` : valeur finale après une
 * baisse de `dropPct` % juste avant la sortie (arrondie à la centaine). Avant impôt.
 */
export function etfMilestones(monthly: number, ratePct: number, years: number, step: number, dropPct: number) {
  const pts = projectGrowth({ initial: 0, monthly, annualReturn: ratePct / 100, annualFees: 0, years, inflation: 0 });
  const r100 = (n: number) => Math.round(n / 100) * 100;
  const milestones: EtfMilestone[] = pts
    .filter((p) => p.year > 0 && p.year % step === 0)
    .map((p) => ({ year: p.year, contributed: Math.round(p.contributed), value: r100(p.value), gains: r100(p.value) - Math.round(p.contributed) }));
  const last = pts[years];
  const before = pts[years - step];
  const lastStepShare = (last.gains - before.gains) / last.gains;
  return { milestones, lastStepShare, afterDrop: r100(last.value * (1 - dropPct / 100)) };
}

/**
 * Compte à terme ou Livret A, sur une année et à taux supposés constants : intérêts bruts du compte à terme, part retenue
 * par le prélèvement forfaitaire unique (`pfuPct`, 31,4 % sur les revenus de 2026 : Service-Public F2329, consulté le
 * 2026-11-18), intérêts nets (au centime), taux net, intérêts du Livret A (exonérés : F2365) et taux brut au-dessus duquel
 * le compte à terme rapporte davantage après impôt.
 */
export function termDepositVsLivretA(amount: number, grossPct: number, pfuPct: number, livretPct: number) {
  const gross = Math.round(amount * grossPct) / 100;
  const tax = Math.round(gross * pfuPct) / 100;
  const net = Math.round((gross - tax) * 100) / 100;
  return {
    gross,
    tax,
    net,
    netPct: Math.round((net / amount) * 10000) / 100,
    livret: Math.round((amount * livretPct) / 100),
    breakEvenPct: Math.round((livretPct / (1 - pfuPct / 100)) * 100) / 100,
  };
}

/**
 * Unités de compte : `amount` € placés `years` ans, rendement supposé `grossPct` % par an avant frais, frais cumulés de
 * `feePct` % prélevés chaque année sur la valeur atteinte. Valeurs finales arrondies à la centaine, avant impôt.
 */
export function ucFeesDrag(amount: number, grossPct: number, feePct: number, years: number) {
  const netFactor = (1 + grossPct / 100) * (1 - feePct / 100);
  const withoutFees = Math.round((amount * Math.pow(1 + grossPct / 100, years)) / 100) * 100;
  const withFees = Math.round((amount * Math.pow(netFactor, years)) / 100) * 100;
  return { netPct: Math.round((netFactor - 1) * 1000) / 10, withoutFees, withFees, cost: withoutFees - withFees };
}

/**
 * Forêt : crédit d'impôt de `ratePct` % sur les sommes versées pour des parts de groupement forestier, retenues dans la
 * limite de `capEur` € (6 250 € pour une personne seule, 12 500 € pour un couple soumis à imposition commune : BOFiP
 * BOI-IR-RICI-60-20-20, consulté le 2026-11-18). Renvoie la somme retenue, le crédit, ce qu'il représente de la somme
 * versée et le coût des parts une fois le crédit déduit (hors frais du groupement).
 */
export function forestCredit(amount: number, capEur: number, ratePct: number) {
  const retained = Math.min(amount, capEur);
  const credit = Math.round(retained * ratePct) / 100;
  return { retained, credit, effectivePct: Math.round((credit / amount) * 1000) / 10, netCost: Math.round((amount - credit) * 100) / 100 };
}

export interface AssuranceVieRetrait { gains: number; overAllowance: number; allowanceLeft: number; social: number; net: number }

/**
 * Assurance-vie, retrait total d'un contrat de plus de 8 ans : `paid` € versés, `value` € de valeur au retrait.
 * Seuls les gains (`value − paid`) sont imposables ; `overAllowance` : part des gains au-delà de l'abattement annuel
 * `allowance` (0 si les gains restent dessous), `allowanceLeft` : abattement non utilisé ; `social` : prélèvements
 * sociaux de `socialPct` % sur les gains, arrondis à l'euro ; `net` : retrait moins ces prélèvements.
 */
export function assuranceVieRetrait(paid: number, value: number, allowance: number, socialPct: number): AssuranceVieRetrait {
  const gains = Math.max(0, value - paid);
  const social = Math.round((gains * socialPct) / 100);
  return { gains, overAllowance: Math.max(0, gains - allowance), allowanceLeft: Math.max(0, allowance - gains), social, net: value - social };
}

export interface ArtSale { price: number; tax: number; net: number; vsCost: number }
export interface ArtResale { buyerFees: number; cost: number; sales: ArtSale[] }
/**
 * Objets d'art : prix adjugé plus frais d'acheteur aux enchères (de l'ordre de 20 %, La finance pour tous), puis
 * revente soumise à la taxe forfaitaire de 6 % + 0,5 % de CRDS du prix de cession, sans taxe jusqu'à 5 000 €
 * (BOFiP BOI-RPPM-PVBMC-20-10, consulté le 2026-11-18). Avant assurance, conservation et frais de revente.
 */
export function artResale(hammer: number, buyerFeesPct: number, taxPct: number, thresholdEur: number, prices: number[]): ArtResale {
  const buyerFees = Math.round(hammer * buyerFeesPct) / 100;
  const cost = hammer + buyerFees;
  const sales = prices.map((price) => {
    const tax = price <= thresholdEur ? 0 : Math.round(price * taxPct) / 100;
    const net = price - tax;
    return { price, tax, net, vsCost: net - cost };
  });
  return { buyerFees, cost, sales };
}
