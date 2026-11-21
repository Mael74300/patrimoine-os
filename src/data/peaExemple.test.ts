import { describe, expect, it } from 'vitest';
import { investmentBySlug } from './investments';
import { pfuSplit, PFU_PS_PCT } from '../lib/calc/pfu';

/**
 * Fiche PEA : l'exemple fictif compare enfin les deux montants. Taux vérifiés sur Service-Public F2329
 * (consulté le 11 novembre 2026) : revenus de placements 2026, cas général, prélèvements sociaux 18,6 % ;
 * PFU 31,4 % en compte-titres.
 */
const norm = (t: string) => t.replace(/[  ]/g, ' ');
const fmt = (n: number) => norm(n.toLocaleString('fr-FR'));

describe('fiche PEA : exemple chiffré complet', () => {
  const f = investmentBySlug['pea']!;
  const gain = 20000;
  const cto = pfuSplit(gain).total;
  const pea = (gain * PFU_PS_PCT) / 100;

  it('montants recalculés : 6 280 € en compte-titres, 3 720 € en PEA, 2 560 € d’écart', () => {
    expect(cto).toBe(6280);
    expect(pea).toBe(3720);
    expect(cto - pea).toBe(2560);
  });
  it('le texte légende le schéma et reste marqué fictif', () => {
    const ex = norm(f.example);
    expect(ex).toMatch(/^Exemple fictif/);
    expect(ex).toContain(`${fmt(gain)} €`);
    // Les montants sont sur le schéma (schemaPeaForetBilan.test.ts) ; la règle des 5 ans est dans la rubrique Fiscalité.
    expect(ex).toContain('À retenir :');
    expect(norm(f.tax.text)).toContain('Retrait avant 5 ans : clôture du plan (sauf exceptions) et imposition des gains au PFU');
  });
  it('même taux que la rubrique Fiscalité, source citée', () => {
    expect(norm(f.tax.text)).toContain('18,6 %');
    expect(f.sources.some((s) => s.url.includes('F2329'))).toBe(true);
  });
});
