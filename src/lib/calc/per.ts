/**
 * PER : bilan d'un versement déduit, de l'entrée à la sortie en capital.
 * Règles (Service-Public F34982, vérifiée le 12 octobre 2026, consultée le 2026-11-13) : le versement volontaire déduit
 * réduit le revenu imposable de l'année ; à la sortie en capital, la part correspondant à ces versements s'ajoute aux revenus
 * imposables de l'année de sortie (barème progressif, sans abattement de 10 %, sans prélèvements sociaux).
 * Approximation assumée : le montant reste entièrement dans la tranche marginale indiquée, à l'entrée comme à la sortie
 * (sinon l'économie et l'impôt dépendent de plusieurs tranches). Les gains du placement sont imposés à part.
 */
export interface PerBalance { saved: number; paidLater: number; net: number }

/** Montants arrondis à l'euro ; taux en pourcentage entier ou décimal (30 pour 30 %). */
export function perDeductionBalance(amount: number, entryRatePct: number, exitRatePct: number): PerBalance {
  const saved = Math.round((amount * entryRatePct) / 100);
  const paidLater = Math.round((amount * exitRatePct) / 100);
  return { saved, paidLater, net: saved - paidLater };
}
