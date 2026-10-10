import { useMemo } from 'react';
import { amortize, borrowingCapacity, fmtEur, fmtEur2 } from '../lib/finance';
import { Crumbs, Disclaimer, Kpi, LineChart, NumberField, PageHead, SavedSims, usePersistentState } from '../components/ui';

const DEFAULTS = { principal: 200000, annualRate: 0.036, years: 20, insuranceRate: 0.003, income: 4000, debtRatio: 0.35 };

export default function SimCredit() {
  const [s, setS, up] = usePersistentState('credit', DEFAULTS);
  const res = useMemo(() => amortize(s), [s]);
  const maxMonthly = s.income * s.debtRatio;
  const capacity = borrowingCapacity(maxMonthly, s.annualRate, s.years);

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Crédit' }]} />
      <PageHead eyebrow="Calculateur" title="Calculateur de crédit">
        Mensualité, coût total, tableau d'amortissement annuel et capacité d'emprunt indicative.
      </PageHead>
      <div className="sim">
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Prêt</legend>
            <NumberField label="Montant emprunté" unit="€" value={s.principal} onChange={up('principal')} min={0} step={5000} />
            <NumberField label="Taux nominal annuel" unit="%" percent value={s.annualRate} onChange={up('annualRate')} step={0.05} min={0} max={20} />
            <NumberField label="Durée" unit="ans" value={s.years} onChange={up('years')} min={1} max={30} />
            <NumberField label="Assurance emprunteur" unit="%" percent value={s.insuranceRate} onChange={up('insuranceRate')} step={0.05} min={0} max={2} />
          </fieldset>
          <fieldset>
            <legend>Capacité d'emprunt</legend>
            <NumberField label="Revenus nets mensuels" unit="€" value={s.income} onChange={up('income')} min={0} step={100} />
            <NumberField label="Taux d'endettement maximal" unit="%" percent value={s.debtRatio} onChange={up('debtRatio')} step={1} min={0} max={60} hint="Le Haut Conseil de stabilité financière recommande aux banques un plafond de 35 %, assurance comprise." />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
        </form>
        <section aria-label="Résultats">
          <div className="kpis">
            <Kpi label="Mensualité hors assurance" value={fmtEur2(res.monthlyPayment)} />
            <Kpi label="Avec assurance" value={fmtEur2(res.monthlyPayment + res.monthlyInsurance)} />
            <Kpi label="Coût total du crédit" value={fmtEur(res.totalCost)} sub={`${fmtEur(res.totalInterest)} d'intérêts`} tone="neg" />
            <Kpi label="Capacité d'emprunt indicative" value={fmtEur(capacity)} sub={`mensualité max. ${fmtEur(maxMonthly)}, hors assurance`} />
          </div>
          <div className="panel">
            <LineChart
              title="Capital restant dû"
              xLabels={[0, ...res.schedule.map((y) => y.year)].map((y) => `An ${y}`)}
              format={fmtEur}
              series={[{ name: 'Capital restant dû', color: 'var(--chart-1)', values: [s.principal, ...res.schedule.map((y) => y.remaining)] }]}
            />
          </div>
          <h2>Tableau d'amortissement annuel</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Année</th><th className="r">Intérêts</th><th className="r">Capital remboursé</th><th className="r">Assurance</th><th className="r">Restant dû</th></tr></thead>
              <tbody>
                {res.schedule.map((y) => (
                  <tr key={y.year}>
                    <td>{y.year}</td>
                    <td className="r">{fmtEur(y.interest)}</td>
                    <td className="r">{fmtEur(y.principalPaid)}</td>
                    <td className="r">{fmtEur(y.insurance)}</td>
                    <td className="r">{fmtEur(y.remaining)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <SavedSims simKey="credit" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
        </section>
      </div>
    </>
  );
}
