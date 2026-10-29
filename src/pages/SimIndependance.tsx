import { useMemo } from 'react';
import { drawdown, fireTarget, fmtEur, fmtPct, fmtYears, realRate, yearsToTarget, type FireInput } from '../lib/finance';
import { Crumbs, Disclaimer, SimFaq, Kpi, LineChart, NumberField, PageHead, SavedSims, usePersistentState } from '../components/ui';

const DEFAULTS: FireInput = {
  annualExpenses: 30000, currentWealth: 80000, recurringIncome: 0, annualSavings: 15000,
  nominalReturn: 0.05, inflation: 0.02, withdrawalRate: 0.035,
};
const RATES = [0.03, 0.035, 0.04, 0.045];
const COLORS = ['var(--chart-3)', 'var(--chart-1)', 'var(--chart-2)'];

export default function SimIndependance() {
  const [s, setS, up] = usePersistentState<FireInput>('independance', DEFAULTS);
  const target = fireTarget(s.annualExpenses, s.recurringIncome, s.withdrawalRate);
  const yrs = useMemo(() => yearsToTarget(s), [s]);
  const rates = useMemo(() => Array.from(new Set([...RATES, s.withdrawalRate])).sort((a, b) => a - b), [s.withdrawalRate]);
  const startCapital = Number.isFinite(target) && target > 0 ? target : s.currentWealth;
  const scenarios = useMemo(
    () => [-0.02, 0, 0.02].map((d) => drawdown(startCapital, { ...s, nominalReturn: s.nominalReturn + d }, 50)),
    [s, startCapital],
  );

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Indépendance financière' }]} />
      <PageHead eyebrow="Simulateur" title="Simulateur d'indépendance financière">
        Estimez le capital qui couvrirait vos dépenses par des retraits réguliers, le temps pour l'atteindre et sa résistance à plusieurs hypothèses de rendement.
      </PageHead>
      <p className="notice" role="note">
        Aucun taux de retrait ne garantit une indépendance financière durable. Les rendements réels varient d'une année à l'autre, et une succession
        de mauvaises années au début des retraits peut épuiser un capital plus vite que prévu.
      </p>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Situation</legend>
            <NumberField label="Dépenses annuelles" unit="€" value={s.annualExpenses} onChange={up('annualExpenses')} min={0} step={1000} />
            <NumberField label="Patrimoine disponible" unit="€" value={s.currentWealth} onChange={up('currentWealth')} min={0} step={5000} hint="Placements mobilisables, hors résidence principale." />
            <NumberField label="Revenus récurrents" unit="€/an" value={s.recurringIncome} onChange={up('recurringIncome')} min={0} step={1000} hint="Loyers nets, pension, autres revenus hors travail." />
            <NumberField label="Épargne annuelle" unit="€" value={s.annualSavings} onChange={up('annualSavings')} min={0} step={1000} />
          </fieldset>
          <fieldset>
            <legend>Hypothèses</legend>
            <NumberField label="Rendement hypothétique nominal" unit="%" percent value={s.nominalReturn} onChange={up('nominalReturn')} step={0.25} min={-5} max={15} />
            <NumberField label="Inflation hypothétique" unit="%" percent value={s.inflation} onChange={up('inflation')} step={0.25} min={-2} max={10} />
            <NumberField label="Taux de retrait" unit="%" percent value={s.withdrawalRate} onChange={up('withdrawalRate')} step={0.25} min={0.5} max={10} hint="Part du capital retirée la première année." />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
        </form>
        <section aria-label="Résultats">
          <div className="kpis">
            <Kpi label="Capital visé" value={Number.isFinite(target) ? fmtEur(target) : '—'} sub={`dépenses non couvertes / ${fmtPct(s.withdrawalRate)}`} />
            <Kpi label="Délai estimé" value={fmtYears(yrs)} sub="en euros constants" />
            <Kpi label="Rendement réel retenu" value={fmtPct(realRate(s.nominalReturn, s.inflation))} sub="(1 + rendement) / (1 + inflation) − 1" />
          </div>

          <h2>Selon le taux de retrait</h2>
          <div className="table-wrap" tabIndex={0}>
            <table>
              <thead><tr><th>Taux de retrait</th><th className="r">Capital visé</th><th className="r">Délai estimé</th><th className="r">Capital épuisé après (rendement central)</th></tr></thead>
              <tbody>
                {rates.map((w) => {
                  const t = fireTarget(s.annualExpenses, s.recurringIncome, w);
                  const d = drawdown(t, s, 60).depletedAt;
                  return (
                    <tr key={w} style={w === s.withdrawalRate ? { fontWeight: 600 } : undefined}>
                      <td>{fmtPct(w)}</td>
                      <td className="r">{Number.isFinite(t) ? fmtEur(t) : '—'}</td>
                      <td className="r">{fmtYears(yearsToTarget({ ...s, withdrawalRate: w }))}</td>
                      <td className="r">{d === null ? 'plus de 60 ans' : `${d} ans`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <h2>Phase de retrait : trois hypothèses de rendement</h2>
          <p className="muted small">
            Départ avec {fmtEur(startCapital)} ; retraits annuels revalorisés de l'inflation en début d'année ; rendement constant chaque année.
          </p>
          <div className="panel">
            <LineChart
              title="Capital restant pendant les retraits"
              xLabels={scenarios[0].series.map((p) => `An ${p.year}`)}
              format={fmtEur}
              series={scenarios.map((sc, i) => ({
                name: `Rendement ${fmtPct(s.nominalReturn + [-0.02, 0, 0.02][i])}${sc.depletedAt ? ` — épuisé en ${sc.depletedAt} ans` : ''}`,
                color: COLORS[i],
                values: sc.series.map((p) => p.capital),
              }))}
            />
          </div>
          <SavedSims simKey="independance" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
          <SimFaq slug="independance-financiere" />
        </section>
      </div>
    </>
  );
}
