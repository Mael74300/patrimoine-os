/** Répartition du prélèvement forfaitaire unique (PFU) 2026 : 12,8 % d'impôt sur le revenu + 18,6 % de prélèvements sociaux = 31,4 % (Service-Public F21618, consulté le 2026-11-06). */
export const PFU_IR_PCT = 12.8;
export const PFU_PS_PCT = 18.6;
export const PFU_TOTAL_PCT = 31.4;

export interface PfuSplit { ir: number; ps: number; total: number; net: number }

/** Calcul en centimes entiers pour éviter les erreurs d'arrondi flottant. */
export function pfuSplit(gain: number): PfuSplit {
  const cents = Math.round(gain * 100);
  const ir = Math.round((cents * 128) / 1000) / 100;
  const ps = Math.round((cents * 186) / 1000) / 100;
  const total = Math.round((ir + ps) * 100) / 100;
  return { ir, ps, total, net: Math.round((gain - total) * 100) / 100 };
}
