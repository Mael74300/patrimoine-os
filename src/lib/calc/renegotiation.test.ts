import { describe, expect, it } from 'vitest';
import { renegotiation, renegotiationBars, renegotiationTimeline } from './renegotiation';
import { loanPayment } from './loan';

// Exemples fictifs.
describe('Renégociation de crédit', () => {
  const base = { remaining: 150000, currentRate: 0.045, currentYearsLeft: 20, newRate: 0.035, newYears: 20, fees: 3000 };

  it('mensualités et intérêts recalculés à partir de la formule d’amortissement', () => {
    const r = renegotiation(base);
    expect(r.currentMonthly).toBeCloseTo(loanPayment(150000, 0.045, 20), 9);
    expect(r.newMonthly).toBeCloseTo(loanPayment(150000, 0.035, 20), 9);
    expect(r.currentRemainingInterest).toBeCloseTo(r.currentMonthly * 240 - 150000, 6);
    expect(r.newInterest).toBeCloseTo(r.newMonthly * 240 - 150000, 6);
    expect(r.monthlyGain).toBeCloseTo(r.currentMonthly - r.newMonthly, 9);
    expect(r.monthlyGain).toBeGreaterThan(0);
  });

  it('gain net = écart d’intérêts − frais ; point mort = frais / gain mensuel', () => {
    const r = renegotiation(base);
    expect(r.netGain).toBeCloseTo(r.currentRemainingInterest - r.newInterest - 3000, 6);
    expect(r.breakEvenMonths as number).toBeCloseTo(3000 / r.monthlyGain, 9);
    expect(r.longer).toBe(false);
  });

  it('même taux : aucun gain de mensualité, pas de point mort, le gain net vaut −frais', () => {
    const r = renegotiation({ ...base, newRate: 0.045 });
    expect(r.monthlyGain).toBeCloseTo(0, 9);
    expect(r.breakEvenMonths).toBeNull();
    expect(r.netGain).toBeCloseTo(-3000, 6);
  });

  it('allonger la durée baisse la mensualité mais peut augmenter le coût total', () => {
    const r = renegotiation({ ...base, newYears: 25, newRate: 0.045, fees: 0 });
    expect(r.longer).toBe(true);
    expect(r.monthlyGain).toBeGreaterThan(0);
    expect(r.netGain).toBeLessThan(0);
  });

  it('taux nul, capital nul ou durée nulle : jamais NaN', () => {
    const z = renegotiation({ ...base, currentRate: 0, newRate: 0 });
    expect(z.currentRemainingInterest).toBeCloseTo(0, 6);
    for (const v of Object.values(renegotiation({ ...base, remaining: 0, newYears: 0, currentYearsLeft: 0 }))) {
      if (typeof v === 'number') expect(Number.isNaN(v)).toBe(false);
    }
  });
});

// Exemples fictifs : barres « ce qu'il reste à payer » du simulateur.
describe('Barres de la renégociation', () => {
  const base = { remaining: 150000, currentRate: 0.045, currentYearsLeft: 20, newRate: 0.035, newYears: 20, fees: 3000 };

  it('opération avantageuse : la barre actuelle vaut 100 et l’écart correspond au gain net', () => {
    const r = renegotiation(base);
    const b = renegotiationBars(r, 3000);
    expect(b.current).toBeCloseTo(100, 9);
    expect(b.newInterest).toBeCloseTo((100 * r.newInterest) / r.currentRemainingInterest, 9);
    expect(b.fees).toBeCloseTo((100 * 3000) / r.currentRemainingInterest, 9);
    expect(b.saved).toBeCloseTo((100 * r.netGain) / r.currentRemainingInterest, 9);
    expect(b.newInterest + b.fees + b.saved).toBeCloseTo(100, 9);
  });

  it('opération perdante : la barre « renégocier » vaut 100 et rien n’est économisé', () => {
    const r = renegotiation({ ...base, newYears: 25, newRate: 0.045, fees: 0 });
    const b = renegotiationBars(r, 0);
    expect(b.newInterest).toBeCloseTo(100, 9);
    expect(b.current).toBeLessThan(100);
    expect(b.saved).toBe(0);
  });

  it('valeurs nulles ou invalides : barres vides, jamais NaN', () => {
    expect(renegotiationBars({ currentRemainingInterest: 0, newInterest: 0 }, 0)).toEqual({ current: 0, newInterest: 0, fees: 0, saved: 0 });
    const b = renegotiationBars({ currentRemainingInterest: NaN, newInterest: NaN }, NaN);
    expect(Object.values(b).every((v) => Number.isFinite(v))).toBe(true);
  });
});

// Exemples fictifs : frise « mois après mois » du simulateur.
describe('Frise de la renégociation', () => {
  const base = { remaining: 150000, currentRate: 0.045, currentYearsLeft: 20, newRate: 0.035, newYears: 20, fees: 3000 };
  const tl = (i: typeof base) => {
    const r = renegotiation(i);
    return { r, t: renegotiationTimeline({ ...i, monthlyGain: r.monthlyGain, breakEvenMonths: r.breakEvenMonths }) };
  };

  it('même durée : frais puis gain, et le gain de la frise est exactement le gain net', () => {
    const { r, t } = tl(base);
    expect(t).not.toBeNull();
    expect(t!.span).toBe(240);
    expect(t!.phases.map((p) => p.kind)).toEqual(['fees', 'gain']);
    expect(t!.breakEven).toBeCloseTo(3000 / r.monthlyGain, 9);
    expect(t!.phases.reduce((s, p) => s + p.pct, 0)).toBeCloseTo(100, 9);
    const gain = t!.phases[1];
    expect(r.monthlyGain * (gain.to - gain.from)).toBeCloseTo(r.netGain, 6);
    // Valeurs par défaut du simulateur : 79 € par mois, point mort vers 38 mois (3 ans et 2 mois).
    expect(Math.round(r.monthlyGain)).toBe(79);
    expect(Math.round(t!.breakEven)).toBe(38);
  });

  it('nouveau prêt plus long : une dernière période où la nouvelle mensualité reste due', () => {
    const { t } = tl({ ...base, newYears: 25, newRate: 0.04 });
    expect(t!.span).toBe(300);
    expect(t!.phases.map((p) => p.kind)).toEqual(['fees', 'gain', 'extra']);
    expect(t!.phases[2]).toMatchObject({ from: 240, to: 300 });
    expect(t!.phases[2].pct).toBeCloseTo(20, 9);
  });

  it('nouveau prêt plus court : une période où toute l’ancienne mensualité est économisée', () => {
    const { t } = tl({ ...base, newYears: 15, newRate: 0.01 });
    expect(t!.phases.map((p) => p.kind)).toEqual(['fees', 'gain', 'freed']);
    expect(t!.phases[2]).toMatchObject({ from: 180, to: 240 });
  });

  it('sans frais : pas de période de frais, point mort à zéro', () => {
    const { t } = tl({ ...base, fees: 0 });
    expect(t!.phases.map((p) => p.kind)).toEqual(['gain']);
    expect(t!.breakEvenPct).toBe(0);
  });

  it('pas de frise si la mensualité ne baisse pas, si une durée est nulle ou si les frais ne sont jamais couverts', () => {
    expect(tl({ ...base, newRate: 0.045 }).t).toBeNull();
    expect(tl({ ...base, newRate: 0.05 }).t).toBeNull();
    expect(tl({ ...base, fees: 1e7 }).t).toBeNull();
    expect(renegotiationTimeline({ currentYearsLeft: 0, newYears: 20, monthlyGain: 10, breakEvenMonths: 3 })).toBeNull();
    expect(renegotiationTimeline({ currentYearsLeft: 20, newYears: 20, monthlyGain: NaN, breakEvenMonths: NaN })).toBeNull();
  });
});
