import { describe, expect, it } from 'vitest';
import { investmentBySlug } from './investments';
import { perDeductionBalance } from '../lib/calc/per';
import { PER_EXAMPLE } from '../lib/illustrationData';
import { PFU_TOTAL_PCT } from '../lib/calc/pfu';

/**
 * Fiche PER : l'exemple suit le versement déduit jusqu'à la sortie en capital. Règles : Service-Public F34982 (consultée le
 * 13 novembre 2026) ; tranches de 11 % et 30 % : barème 2026, Service-Public F1419 (consulté le 13 novembre 2026).
 */
const norm = (t: string) => t.replace(/[\u00a0\u202f]/g, ' ');
const fmt = (n: number) => norm(n.toLocaleString('fr-FR'));

describe('fiche PER : exemple de l’entrée à la sortie', () => {
  const f = investmentBySlug['per']!;
  const ex = norm(f.example);
  const { amount, entryRatePct, exitRatesPct, pfuPct } = PER_EXAMPLE;
  const [low, same] = exitRatesPct.map((r) => perDeductionBalance(amount, entryRatePct, r));

  it('montants recalculés : 900 € évités, 330 € ou 900 € payés à la sortie, 570 € ou 0 € de gain', () => {
    expect(low).toEqual({ saved: 900, paidLater: 330, net: 570 });
    expect(same.net).toBe(0);
  });
  it('la légende du schéma cite le versement, l’impôt évité et les tranches, et reste marqué fictif', () => {
    expect(ex).toMatch(/^Exemple fictif/);
    for (const v of [amount, low.saved]) expect(ex).toContain(`${fmt(v)} €`);
    expect(ex).toContain(`tranche à ${entryRatePct} %`);
    for (const r of exitRatesPct) expect(ex).toContain(`${r} %`);
    expect(ex).toContain(`${String(pfuPct).replace('.', ',')} %`);
  });
  it('même taux de PFU que la rubrique Fiscalité, barème cité en source', () => {
    expect(pfuPct).toBe(PFU_TOTAL_PCT);
    expect(norm(f.tax.text)).toContain(`${String(pfuPct).replace('.', ',')} %`);
    expect(f.sources.some((s) => s.url.includes('F1419'))).toBe(true);
    expect(f.sources.some((s) => s.url.includes('F34982'))).toBe(true);
  });
});
