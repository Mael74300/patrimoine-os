import { afterTax, clamp, deflate, monthlyRate, netOfFees, num, years as toYears } from './common';
import { capitalGainsTaxRealEstate, rentalAnalysis, rentalProjection, type RentalInput } from './rental';

/**
 * Comparaison ETF / immobilier sur une base identique :
 * - même capital de départ (l'apport immobilier est investi en ETF dans l'autre scénario) ;
 * - même effort d'épargne chaque année : l'effort net (après impôt) exigé par le bien est versé
 *   sur les ETF dans l'autre scénario ; si le bien dégage un excédent, il est placé à `cashRate`.
 * Le résultat est un patrimoine net estimé à l'horizon, après fiscalité de sortie simplifiée.
 */
export type CompareInput = {
  rental: RentalInput;
  etf: { annualReturn: number; annualFees: number; exitTaxRate: number };
  horizon: number;
  inflation: number;
  cashRate: number; // rémunération des excédents de trésorerie immobiliers
  saleCostRate: number; // frais de revente du bien (agence, diagnostics)
};

export type CompareYear = {
  year: number;
  effort: number; // effort d'épargne annuel identique dans les deux scénarios (≥ 0)
  etfValue: number;
  immoNetBeforeExit: number; // valeur du bien − capital restant dû + excédents placés
  debt: number;
};

export type CompareSide = {
  invested: number; // capital de départ + efforts cumulés
  grossValue: number;
  exitCosts: number; // impôt et frais de sortie estimés
  netWealth: number;
  netWealthReal: number;
  debtAtHorizon: number;
};

export type CompareResult = { years: CompareYear[]; etf: CompareSide; immo: CompareSide; startCapital: number };

export function compareEtfImmo(input: CompareInput): CompareResult {
  const H = toYears(input.horizon, 50);
  const rental = { ...input.rental, horizon: H };
  const proj = rentalProjection(rental);
  const snap = rentalAnalysis(rental);
  const startCapital = Math.min(Math.max(0, num(rental.downPayment)), snap.totalCost);
  const rmEtf = monthlyRate(netOfFees(input.etf.annualReturn, input.etf.annualFees));
  const rmCash = monthlyRate(clamp(input.cashRate, -0.05, 0.2, 0));

  let etf = startCapital;
  let cash = 0;
  let invested = startCapital;
  const rows: CompareYear[] = [{ year: 0, effort: 0, etfValue: etf, immoNetBeforeExit: num(rental.price) - snap.loanAmount, debt: snap.loanAmount }];

  for (const p of proj) {
    const effort = Math.max(0, -p.cashflowAfterTax);
    const surplus = Math.max(0, p.cashflowAfterTax);
    for (let m = 0; m < 12; m++) {
      etf = (etf + effort / 12) * (1 + rmEtf);
      cash = (cash + surplus / 12) * (1 + rmCash);
    }
    invested += effort;
    rows.push({ year: p.year, effort, etfValue: etf, immoNetBeforeExit: p.netEquity + cash, debt: p.remaining });
  }

  const last = proj[proj.length - 1];
  const value = last ? last.propertyValue : num(rental.price);
  const debt = last ? last.remaining : snap.loanAmount;
  const saleCosts = value * clamp(input.saleCostRate, 0, 0.2, 0);
  const depreciation = proj.reduce((s, p) => s + p.depreciationUsed, 0);
  const acquisition = num(rental.price) * (1 + clamp(rental.notaryRate, 0, 1)) + Math.max(0, num(rental.works));
  // Depuis 2025, les amortissements déduits en LMNP sont réintégrés dans la plus-value.
  const gain = value - saleCosts - acquisition + (rental.regime === 'reel-bic' ? depreciation : 0);
  const pvTax = H > 0 ? capitalGainsTaxRealEstate(gain, H).total : 0;
  const immoGross = value + cash;
  const immoNet = value - saleCosts - pvTax - debt + cash;

  const etfNet = afterTax(etf, invested, input.etf.exitTaxRate);

  return {
    years: rows,
    startCapital,
    etf: { invested, grossValue: etf, exitCosts: etf - etfNet, netWealth: etfNet, netWealthReal: deflate(etfNet, input.inflation, H), debtAtHorizon: 0 },
    immo: {
      invested,
      grossValue: immoGross,
      exitCosts: saleCosts + pvTax,
      netWealth: immoNet,
      netWealthReal: deflate(immoNet, input.inflation, H),
      debtAtHorizon: debt,
    },
  };
}
