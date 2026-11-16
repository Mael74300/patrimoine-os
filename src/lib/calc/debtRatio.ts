import { clamp, num, safeDiv } from './common';
import { borrowingCapacity } from './loan';

/**
 * Taux d'endettement (taux d'effort) et reste à vivre. Repère de la recommandation du Haut Conseil de stabilité financière (HCSF,
 * décision D-HCSF-2021-7, applicable depuis le 1er janvier 2022) : charges d'emprunt ≤ 35 % des revenus, assurance comprise,
 * durée ≤ 25 ans (27 ans avec différé pour un bien neuf ou des travaux). Les banques disposent d'une marge de dérogation.
 */
export const HCSF = {
  maxRatio: 0.35,
  maxYears: 25,
  maxYearsNew: 27,
  source: { label: 'Haut Conseil de stabilité financière — décision D-HCSF-2021-7', url: 'https://www.economie.gouv.fr/hcsf' },
  verifiedOn: '2026-10-27',
};

export type DebtRatioInput = {
  /** Revenus nets mensuels pris en compte (ensemble des emprunteurs). */
  income: number;
  /** Mensualités des crédits en cours. */
  existingPayments: number;
  /** Mensualité (assurance comprise) du nouveau crédit. */
  newPayment: number;
  /** Autres charges mensuelles courantes (loyer éventuel, énergie, assurances, transports, alimentation…). */
  livingCosts: number;
  /** Nombre de personnes du foyer, pour le reste à vivre par personne. */
  householdSize: number;
};

export type DebtRatioResult = {
  ratioBefore: number;
  ratioAfter: number;
  withinHcsf: boolean;
  /** Mensualité maximale du nouveau crédit pour rester à 35 %. */
  maxNewPayment: number;
  /** Revenu minimal pour que le ratio après projet respecte 35 %. */
  minIncome: number;
  /** Revenu net restant après crédits et charges courantes. */
  remainingAfter: number;
  remainingPerPerson: number;
};

export function debtRatio(input: DebtRatioInput): DebtRatioResult {
  const income = Math.max(0, num(input.income));
  const existing = Math.max(0, num(input.existingPayments));
  const added = Math.max(0, num(input.newPayment));
  const living = Math.max(0, num(input.livingCosts));
  const people = Math.max(1, Math.floor(clamp(input.householdSize, 1, 20, 1)));
  const ratioBefore = safeDiv(existing, income);
  const ratioAfter = safeDiv(existing + added, income);
  const remainingAfter = income - existing - added - living;
  return {
    ratioBefore,
    ratioAfter,
    withinHcsf: income > 0 && ratioAfter <= HCSF.maxRatio + 1e-9,
    maxNewPayment: Math.max(0, income * HCSF.maxRatio - existing),
    minIncome: (existing + added) / HCSF.maxRatio,
    remainingAfter,
    remainingPerPerson: remainingAfter / people,
  };
}

/**
 * Capital empruntable pour une mensualité maximale assurance comprise, l'assurance étant un taux annuel sur le capital emprunté :
 * mensualité = capital × (facteur de prêt + assurance mensuelle), d'où capital = mensualité ÷ (facteur + assurance).
 */
export function capacityForPayment(maxPaymentWithInsurance: number, annualRate: number, years: number, insuranceRate: number): number {
  const maxPay = Math.max(0, num(maxPaymentWithInsurance));
  const ins = clamp(insuranceRate, 0, 0.1, 0) / 12;
  const unit = borrowingCapacity(1, annualRate, years);
  return unit > 0 ? maxPay / (1 / unit + ins) : 0;
}

/** Capital empruntable à la mensualité maximale compatible avec 35 %, assurance (taux annuel sur capital initial) comprise. */
export function capacityAtHcsf(income: number, existingPayments: number, annualRate: number, years: number, insuranceRate: number): number {
  return capacityForPayment(num(income) * HCSF.maxRatio - Math.max(0, num(existingPayments)), annualRate, years, insuranceRate);
}

export type IncomePartKey = 'existing' | 'added' | 'living' | 'rest';
export type IncomePart = {
  key: IncomePartKey;
  label: string;
  value: number;
  /** Part des revenus, entre 0 et 1 (peut dépasser 1 en cas de déficit). */
  share: number;
  /** Largeur dans la barre, en % de l'échelle (revenus, ou dépenses si elles les dépassent). */
  width: number;
};

/**
 * Où partent les revenus du mois : crédits en cours, nouvelle mensualité, autres charges, reste à vivre (s'il est positif).
 * Les largeurs sont rapportées aux revenus, ou aux dépenses si elles dépassent les revenus ; `marker` place le repère de 35 %
 * dans la même échelle ; `margin` est l'écart entre ce repère et les crédits (négatif si les crédits le dépassent).
 */
export function incomeBreakdown(input: Pick<DebtRatioInput, 'income' | 'existingPayments' | 'newPayment' | 'livingCosts'>) {
  const income = Math.max(0, num(input.income));
  const existing = Math.max(0, num(input.existingPayments));
  const added = Math.max(0, num(input.newPayment));
  const living = Math.max(0, num(input.livingCosts));
  const spent = existing + added + living;
  const rest = income - spent;
  const scale = Math.max(income, spent);
  const raw: { key: IncomePartKey; label: string; value: number }[] = [
    { key: 'existing', label: 'Crédits déjà en cours', value: existing },
    { key: 'added', label: 'Nouvelle mensualité', value: added },
    { key: 'living', label: 'Autres charges', value: living },
  ];
  if (rest > 0) raw.push({ key: 'rest', label: 'Reste à vivre', value: rest });
  const parts: IncomePart[] = raw
    .filter((p) => p.value > 0)
    .map((p) => ({ ...p, share: safeDiv(p.value, income), width: safeDiv(p.value, scale) * 100 }));
  const limit = income * HCSF.maxRatio;
  const credits = existing + added;
  return {
    income,
    parts,
    scale,
    credits,
    limit,
    margin: limit - credits,
    shortfall: Math.max(0, -rest),
    marker: safeDiv(limit, scale) * 100,
  };
}
