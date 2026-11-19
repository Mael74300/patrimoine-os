import { describe, expect, it } from 'vitest';
import { taeg, taegBars, taegByFees, taegByInsurance, taegLevels } from './taeg';

const B = { principal: 200000, annualRate: 0.036, years: 20, insuranceRate: 0, fees: 0 };

describe('TAEG', () => {
  it('sans assurance ni frais : TAEG = taux nominal converti en taux effectif annuel, (1 + 0,036/12)^12 − 1', () => {
    const r = taeg(B);
    expect(r.taeg).toBeCloseTo(Math.pow(1 + 0.036 / 12, 12) - 1, 8);
    expect(r.months).toBe(240);
    expect(r.totalCost).toBeCloseTo(r.totalInterest, 4);
  });

  it('taux nul, sans frais : TAEG nul', () => {
    expect(taeg({ ...B, annualRate: 0 }).taeg).toBeCloseTo(0, 10);
  });

  it('les frais et l’assurance augmentent le TAEG', () => {
    const base = taeg(B).taeg;
    expect(taeg({ ...B, fees: 3000 }).taeg).toBeGreaterThan(base);
    expect(taeg({ ...B, insuranceRate: 0.003 }).taeg).toBeGreaterThan(base);
  });

  it('le TAEG actualise bien les flux : valeur actuelle des mensualités = capital reçu', () => {
    const r = taeg({ ...B, fees: 2500, insuranceRate: 0.0025 });
    const i = Math.pow(1 + r.taeg, 1 / 12) - 1;
    const pv = (r.monthlyTotal * (1 - Math.pow(1 + i, -r.months))) / i;
    expect(pv).toBeCloseTo(r.netReceived, 3);
  });

  it('forme de l’équation légale (annexe à l’article R314-3) : chaque mensualité actualisée à (1 + TAEG)^(−mois/12)', () => {
    const r = taeg({ ...B, fees: 2500, insuranceRate: 0.0025 });
    let pv = 0;
    for (let l = 1; l <= r.months; l++) pv += r.monthlyTotal * Math.pow(1 + r.taeg, -l / 12);
    expect(pv).toBeCloseTo(r.netReceived, 3);
  });

  it('coût total = intérêts + assurance + frais', () => {
    const r = taeg({ ...B, fees: 2500, insuranceRate: 0.0025 });
    expect(r.totalCost).toBeCloseTo(r.totalInterest + r.totalInsurance + 2500, 4);
    expect(r.totalInsurance).toBeCloseTo(((200000 * 0.0025) / 12) * 240, 6);
  });

  it('entrées nulles ou invalides : aucun NaN', () => {
    for (const input of [{ ...B, principal: 0 }, { ...B, years: 0 }, { ...B, principal: NaN }, { ...B, fees: 1e9 }]) {
      const r = taeg(input);
      expect(Number.isFinite(r.taeg)).toBe(true);
      expect(Number.isFinite(r.totalCost)).toBe(true);
    }
  });

  it('comparaisons : TAEG croissant avec les frais et avec l’assurance', () => {
    const f = taegByFees({ principal: 200000, annualRate: 0.036, years: 20, insuranceRate: 0 }, [0, 1000, 3000]);
    expect(f[0].taeg).toBeLessThan(f[1].taeg);
    expect(f[1].taeg).toBeLessThan(f[2].taeg);
    const a = taegByInsurance({ principal: 200000, annualRate: 0.036, years: 20, fees: 0 }, [0, 0.002, 0.004]);
    expect(a[0].taeg).toBeLessThan(a[2].taeg);
  });
});

describe('Barres du TAEG', () => {
  it('ajoute la valeur saisie aux niveaux, sans doublon, dans l’ordre', () => {
    expect(taegLevels([0, 1000, 2500, 5000], 2500)).toEqual([0, 1000, 2500, 5000]);
    expect(taegLevels([0, 1000, 2500, 5000], 1800)).toEqual([0, 1000, 1800, 2500, 5000]);
    expect(taegLevels([0, 0.001, 0.003, 0.005], 0.003)).toEqual([0, 0.001, 0.003, 0.005]);
    expect(taegLevels([0, 1000], Number.NaN)).toEqual([0, 1000]);
    expect(taegLevels([0, 1000], -5)).toEqual([0, 1000]);
  });

  it('barres sur une échelle commune : nominal puis écart, le plus grand TAEG remplit la piste', () => {
    const b = taegBars(0.036, [0.04, 0.05], 0.05);
    expect(b[0].nominal).toBeCloseTo(72, 6);
    expect(b[0].extra).toBeCloseTo(8, 6);
    expect(b[1].nominal + b[1].extra).toBeCloseTo(100, 6);
  });

  it('sans échelle ou avec un TAEG inférieur au nominal : aucune largeur négative', () => {
    expect(taegBars(0.036, [0.04], 0)).toEqual([{ nominal: 0, extra: 0 }]);
    const b = taegBars(0.036, [0.03], 0.05);
    expect(b[0].extra).toBe(0);
    expect(b[0].nominal).toBeCloseTo(60, 6);
  });

  it('valeurs par défaut du simulateur (fictives) : barres cohérentes avec les TAEG calculés', () => {
    const s = { principal: 200000, annualRate: 0.036, years: 20, insuranceRate: 0.003 };
    const fees = taegByFees(s, taegLevels([0, 1000, 2500, 5000], 2500)).map((d) => d.taeg);
    const max = Math.max(...fees);
    const bars = taegBars(0.036, fees, max);
    bars.forEach((b, i) => expect(b.nominal + b.extra).toBeCloseTo((100 * fees[i]) / max, 6));
    // Plus de frais, barre plus longue.
    for (let i = 1; i < bars.length; i++) expect(bars[i].extra).toBeGreaterThan(bars[i - 1].extra);
  });
});
