import { netOfFees, num, safeDiv } from './common';

export type PortfolioLine = {
  id: string;
  label: string;
  amount: number;
  expectedReturn: number;
  fees: number;
  risk: number; // échelle 1 à 7 saisie par l'utilisateur
};

export type PortfolioSummary = {
  total: number;
  weights: { id: string; label: string; weight: number }[];
  grossReturn: number;
  weightedFees: number;
  netReturn: number;
  weightedRisk: number;
  annualFeesEuro: number;
};

export function summarizePortfolio(lines: PortfolioLine[]): PortfolioSummary {
  const clean = lines.map((l) => ({ ...l, amount: Math.max(0, num(l.amount)) }));
  const total = clean.reduce((s, l) => s + l.amount, 0);
  let gross = 0, fees = 0, risk = 0, net = 0;
  const weights = clean.map((l) => {
    const w = safeDiv(l.amount, total);
    gross += w * num(l.expectedReturn);
    fees += w * num(l.fees);
    risk += w * num(l.risk);
    net += w * netOfFees(l.expectedReturn, l.fees);
    return { id: l.id, label: l.label, weight: w };
  });
  return { total, weights: total ? weights : [], grossReturn: gross, weightedFees: fees, netReturn: net, weightedRisk: risk, annualFeesEuro: total * fees };
}

/** Montants à acheter (+) ou vendre (−) pour atteindre l'allocation cible. */
export function rebalance(lines: PortfolioLine[], targets: Record<string, number>): Record<string, number> {
  const total = lines.reduce((s, l) => s + Math.max(0, num(l.amount)), 0);
  const out: Record<string, number> = {};
  for (const l of lines) out[l.id] = total * num(targets[l.id]) - Math.max(0, num(l.amount));
  return out;
}
