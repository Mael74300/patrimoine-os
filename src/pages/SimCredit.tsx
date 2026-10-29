import { useMemo } from 'react';
import { amortize, borrowingCapacity, fmtEur, fmtEur2, prepayment } from '../lib/finance';
import { creditTakeaway } from '../lib/takeaways';
import { Crumbs, Disclaimer, Fold, SimFaq, Takeaway, Kpi, LineChart, NumberField, PageHead, SavedSims, SelectField, usePersistentState } from '../components/ui';

type State = {
  principal: number; annualRate: number; years: number; insuranceRate: number;
  income: number; debtRatio: number;
  prepayYear: number; prepayAmount: number; prepayMode: 'duree' | 'mensualite'; withPenalty: boolean;
};
const DEFAULTS: State = {
  principal: 200000, annualRate: 0.036, years: 20, insuranceRate: 0.003, income: 4000, debtRatio: 0.35,
  prepayYear: 5, prepayAmount: 30000, prepayMode: 'duree', withPenalty: true,
};

const duration = (months: number) => {
  const y = Math.floor(months / 12);
  const m = months % 12;
  return `${y} an${y > 1 ? 's' : ''}${m ? ` ${m} mois` : ''}`;
};

export default function SimCredit() {
  const [s, setS, up] = usePersistentState<State>('credit', DEFAULTS);
  const res = useMemo(() => amortize(s), [s]);
  const pre = useMemo(
    () => prepayment({ ...s, atMonth: s.prepayYear * 12, amount: s.prepayAmount, mode: s.prepayMode, withPenalty: s.withPenalty }),
    [s],
  );
  const maxMonthly = s.income * s.debtRatio;
  const capacity = borrowingCapacity(Math.max(0, maxMonthly - res.monthlyInsurance), s.annualRate, s.years);
  const yearsAxis = Math.max(res.schedule.length, pre.schedule.length);

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Crédit' }]} />
      <PageHead eyebrow="Calculateur" title="Calculateur de crédit">
        Mensualité, coût des intérêts, tableau d'amortissement, capacité d'emprunt et simulation de remboursement anticipé.
      </PageHead>
      <div className="sim">
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Prêt</legend>
            <NumberField label="Montant emprunté" unit="€" value={s.principal} onChange={up('principal')} min={0} step={5000} />
            <NumberField label="Taux annuel nominal" unit="%" percent value={s.annualRate} onChange={up('annualRate')} step={0.05} min={0} max={20} hint="Taux mensuel appliqué : taux annuel / 12." />
            <NumberField label="Durée" unit="ans" value={s.years} onChange={up('years')} min={0} max={30} />
            <NumberField label="Assurance emprunteur" unit="%" percent value={s.insuranceRate} onChange={up('insuranceRate')} step={0.05} min={0} max={2} />
          </fieldset>
          <fieldset>
            <legend>Remboursement anticipé</legend>
            <NumberField label="À la fin de l'année" unit="an" value={s.prepayYear} onChange={up('prepayYear')} min={0} max={30} />
            <NumberField label="Montant remboursé" unit="€" value={s.prepayAmount} onChange={up('prepayAmount')} min={0} step={1000} />
            <SelectField label="Effet" value={s.prepayMode} onChange={up('prepayMode')}
              options={[{ v: 'duree', label: 'Réduire la durée (mensualité inchangée)' }, { v: 'mensualite', label: 'Réduire la mensualité (durée inchangée)' }]} />
            <SelectField label="Indemnités de remboursement anticipé" value={s.withPenalty ? 1 : 0} onChange={(v) => up('withPenalty')(v === 1)}
              options={[{ v: 1, label: 'Appliquer le plafond légal' }, { v: 0, label: 'Aucune (contrat sans indemnités)' }]}
              hint="Crédit immobilier : au plus 6 mois d'intérêts sur la somme remboursée, dans la limite de 3 % du capital restant dû." />
          </fieldset>
          <fieldset>
            <legend>Capacité d'emprunt</legend>
            <NumberField label="Revenus nets mensuels" unit="€" value={s.income} onChange={up('income')} min={0} step={100} />
            <NumberField label="Taux d'effort maximal" unit="%" percent value={s.debtRatio} onChange={up('debtRatio')} step={1} min={0} max={60} hint="Recommandation du HCSF : 35 % des revenus, assurance comprise." />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
        </form>
        <section aria-label="Résultats">
          <div className="kpis">
            <Kpi label="Mensualité hors assurance" value={fmtEur2(res.monthlyPayment)} sub={`${fmtEur2(res.monthlyPayment + res.monthlyInsurance)} avec assurance`} />
            <Kpi label="Coût des intérêts" value={fmtEur(res.totalInterest)} tone="neg" />
            <Kpi label="Coût total du crédit" value={fmtEur(res.totalCost)} sub="intérêts + assurance" />
            <Kpi label="Capacité d'emprunt indicative" value={fmtEur(capacity)} sub={`mensualité max. ${fmtEur(maxMonthly)} assurance comprise`} />
          </div>

          <Takeaway>{creditTakeaway({ principal: s.principal, years: s.years, monthlyTotal: res.monthlyPayment + res.monthlyInsurance, totalCost: res.totalCost })}</Takeaway>

          <h2>Remboursement anticipé</h2>
          <div className="kpis">
            <Kpi label="Somme remboursée" value={fmtEur(pre.prepaid)} sub={`sur ${fmtEur(pre.remainingBefore)} restant dû`} />
            <Kpi label="Intérêts économisés" value={fmtEur(pre.interestSaved)} tone="pos" />
            <Kpi label="Indemnités" value={fmtEur(pre.penalty)} tone={pre.penalty > 0 ? 'neg' : undefined} />
            <Kpi label="Gain net" value={fmtEur(pre.netSaving)} tone={pre.netSaving >= 0 ? 'pos' : 'neg'} sub="intérêts et assurance économisés − indemnités" />
            {s.prepayMode === 'duree'
              ? <Kpi label="Nouvelle durée totale" value={duration(pre.newTotalMonths)} sub={`${pre.monthsSaved} mois gagnés`} />
              : <Kpi label="Nouvelle mensualité" value={fmtEur2(pre.newMonthlyPayment)} sub="hors assurance" />}
          </div>
          <div className="panel">
            <LineChart
              title="Capital restant dû"
              xLabels={Array.from({ length: yearsAxis + 1 }, (_, y) => `An ${y}`)}
              format={fmtEur}
              series={[
                { name: 'Sans remboursement anticipé', color: 'var(--chart-1)', values: [s.principal, ...res.schedule.map((y) => y.remaining)] },
                { name: 'Avec remboursement anticipé', color: 'var(--chart-2)', values: [s.principal, ...pre.schedule.map((y) => y.remaining)], dashed: true },
              ]}
            />
          </div>
          <p className="small muted">
            Avant de rembourser par anticipation, comparez le taux du crédit au rendement net que l'épargne obtiendrait ailleurs, et gardez une épargne de précaution.
          </p>

          <Fold title="Tableau d'amortissement annuel">
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
          </Fold>
          <SavedSims simKey="credit" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
          <SimFaq slug="credit" />
        </section>
      </div>
    </>
  );
}
