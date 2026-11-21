/** Répartition du prélèvement forfaitaire unique (PFU) 2026 : 12,8 % d'impôt sur le revenu + 18,6 % de prélèvements sociaux = 31,4 % (Service-Public F21618, consulté le 2026-11-06). */
export const PFU_IR_PCT = 12.8;
export const PFU_PS_PCT = 18.6;
export const PFU_TOTAL_PCT = 31.4;
/** Prélèvements sociaux sur les revenus de placements de 2025 (Service-Public F2329, consulté le 2026-11-12) ; taux gardé en 2026 pour certains revenus, précisé à chaque usage. */
export const PS_2025_PCT = 17.2;

/** Pourcentage → taux décimal exact (18,6 → 0,186, et non 0,18600000000000003), pour que les choix rapides retrouvent une valeur enregistrée. */
export const rateOfPct = (pct: number) => Math.round(pct * 1000) / 100000;
/** Pourcentage → libellé court (« 31,4 % »), écrit comme les choix rapides des simulateurs. */
export const pctLabel = (pct: number) => `${pct.toLocaleString('fr-FR')}\u00a0%`;

/**
 * Taux décimaux utilisés par les simulateurs (valeurs par défaut et choix rapides) : un seul endroit à changer
 * quand une loi de finances ou de financement de la Sécurité sociale modifie ces taux (test `simTaux.test.ts`).
 */
export const PFU_TOTAL_RATE = rateOfPct(PFU_TOTAL_PCT);
export const PFU_PS_RATE = rateOfPct(PFU_PS_PCT);
export const PS_2025_RATE = rateOfPct(PS_2025_PCT);

export interface PfuSplit { ir: number; ps: number; total: number; net: number }

/** Calcul en centimes entiers pour éviter les erreurs d'arrondi flottant. */
export function pfuSplit(gain: number): PfuSplit {
  const cents = Math.round(gain * 100);
  const ir = Math.round((cents * 128) / 1000) / 100;
  const ps = Math.round((cents * 186) / 1000) / 100;
  const total = Math.round((ir + ps) * 100) / 100;
  return { ir, ps, total, net: Math.round((gain - total) * 100) / 100 };
}
