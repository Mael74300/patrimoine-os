import { useMemo } from 'react';
import { amortize, fmtEur, fmtPct, rentalAnalysis } from '../lib/finance';
import { Crumbs, Disclaimer, Kpi, LineChart, NumberField, PageHead, SavedSims, usePersistentState } from '../components/ui';

const DEFAULTS = {
  price: 150000, notaryRate: 0.08, works: 10000, furniture: 0,
  monthlyRent: 750, vacancyMonths: 1, propertyTax: 900, coOwnership: 600, insurancePno: 150,
  managementRate: 0, maintenanceRate: 0.05,
  downPayment: 22000, loanRate: 0.035, loanYears: 20, loanInsuranceRate: 0.003,
};

export default function SimImmobilier() {
  const [s, setS, up] = usePersistentState('immobilier', DEFAULTS);
  const r = useMemo(() => rentalAnalysis(s), [s]);
  const loan = useMemo(() => amortize({ principal: r.loanAmount, annualRate: s.loanRate, years: s.loanYears, insuranceRate: s.loanInsuranceRate }), [r.loanAmount, s]);
  const cumulative = useMemo(() => {
    const out = [0];
    let acc = 0;
    for (let y = 1; y <= s.loanYears; y++) {
      acc += r.monthlyCashflow * 12;
      out.push(acc);
    }
    return out;
  }, [r.monthlyCashflow, s.loanYears]);
  const remaining = [r.loanAmount, ...loan.schedule.map((y) => y.remaining)];

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Immobilier locatif' }]} />
      <PageHead eyebrow="Calculateur" title="Calculateur immobilier locatif">
        Rendement brut, rendement net de charges et cash-flow mensuel avant impôt, crédit compris.
      </PageHead>
      <div className="sim">
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Acquisition</legend>
            <NumberField label="Prix du bien" unit="€" value={s.price} onChange={up('price')} min={0} step={5000} />
            <NumberField label="Frais d'acquisition" unit="%" percent value={s.notaryRate} onChange={up('notaryRate')} step={0.5} min={0} max={20} hint="Environ 7 à 8 % dans l'ancien (ordre de grandeur, à vérifier)." />
            <NumberField label="Travaux" unit="€" value={s.works} onChange={up('works')} min={0} step={1000} />
            <NumberField label="Mobilier" unit="€" value={s.furniture} onChange={up('furniture')} min={0} step={500} />
          </fieldset>
          <fieldset>
            <legend>Location</legend>
            <NumberField label="Loyer mensuel hors charges" unit="€" value={s.monthlyRent} onChange={up('monthlyRent')} min={0} step={25} />
            <NumberField label="Vacance locative" unit="mois/an" value={s.vacancyMonths} onChange={up('vacancyMonths')} min={0} max={12} step={0.5} />
            <NumberField label="Taxe foncière" unit="€/an" value={s.propertyTax} onChange={up('propertyTax')} min={0} step={50} />
            <NumberField label="Charges non récupérables" unit="€/an" value={s.coOwnership} onChange={up('coOwnership')} min={0} step={50} />
            <NumberField label="Assurance propriétaire" unit="€/an" value={s.insurancePno} onChange={up('insurancePno')} min={0} step={10} />
            <NumberField label="Gestion locative" unit="%" percent value={s.managementRate} onChange={up('managementRate')} step={0.5} min={0} max={15} />
            <NumberField label="Provision entretien" unit="%" percent value={s.maintenanceRate} onChange={up('maintenanceRate')} step={0.5} min={0} max={20} />
          </fieldset>
          <fieldset>
            <legend>Financement</legend>
            <NumberField label="Apport" unit="€" value={s.downPayment} onChange={up('downPayment')} min={0} step={1000} />
            <NumberField label="Taux du crédit" unit="%" percent value={s.loanRate} onChange={up('loanRate')} step={0.05} min={0} max={15} />
            <NumberField label="Durée" unit="ans" value={s.loanYears} onChange={up('loanYears')} min={1} max={30} />
            <NumberField label="Assurance emprunteur" unit="%" percent value={s.loanInsuranceRate} onChange={up('loanInsuranceRate')} step={0.05} min={0} max={2} hint="Taux annuel sur le capital emprunté." />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
        </form>

        <section aria-label="Résultats">
          <div className="kpis">
            <Kpi label="Rendement brut" value={fmtPct(r.grossYield)} sub="loyers annuels / prix" />
            <Kpi label="Rendement net de charges" value={fmtPct(r.netYield)} sub="avant impôt et crédit, sur coût total" />
            <Kpi label="Cash-flow mensuel" value={fmtEur(r.monthlyCashflow)} tone={r.monthlyCashflow >= 0 ? 'pos' : 'neg'} sub="avant impôt" />
            <Kpi label="Mensualité" value={fmtEur(r.monthlyLoan)} sub="assurance comprise" />
          </div>
          <div className="panel">
            <LineChart
              title="Capital restant dû et cash-flow cumulé"
              xLabels={remaining.map((_, i) => `An ${i}`)}
              format={fmtEur}
              series={[
                { name: 'Capital restant dû', color: 'var(--chart-1)', values: remaining },
                { name: 'Cash-flow cumulé', color: r.monthlyCashflow >= 0 ? 'var(--chart-2)' : 'var(--chart-3)', values: cumulative },
              ]}
            />
          </div>
          <h2>Détail</h2>
          <div className="table-wrap">
            <table>
              <tbody>
                <tr><td>Coût total de l'opération</td><td className="r">{fmtEur(r.totalCost)}</td></tr>
                <tr><td>Montant emprunté</td><td className="r">{fmtEur(r.loanAmount)}</td></tr>
                <tr><td>Loyers encaissés par an (après vacance)</td><td className="r">{fmtEur(r.annualRentCollected)}</td></tr>
                <tr><td>Charges annuelles</td><td className="r">{fmtEur(r.annualCharges)}</td></tr>
                <tr><td>Coût total des intérêts</td><td className="r">{fmtEur(loan.totalInterest)}</td></tr>
                <tr><td>Coût total de l'assurance emprunteur</td><td className="r">{fmtEur(loan.totalInsurance)}</td></tr>
              </tbody>
            </table>
          </div>
          <p className="notice info small" style={{ marginTop: 16 }}>
            La fiscalité des loyers n'est pas calculée ici : elle dépend du régime (micro-foncier, réel, LMNP) et de votre taux marginal.
            Consultez les fiches <a href="#/encyclopedie/location-nue">Location nue</a> et <a href="#/encyclopedie/lmnp">LMNP</a>.
          </p>
          <SavedSims simKey="immobilier" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
        </section>
      </div>
    </>
  );
}
