import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ADVERSE, adverseScenario, amortize, fmtEur, fmtPct, rentalAnalysis, rentalProjection, type RentalInput, type TaxRegime } from '../lib/finance';
import { Crumbs, Disclaimer, SimFaq, Kpi, LineChart, NumberField, PageHead, SavedSims, SelectField, usePersistentState } from '../components/ui';

export const RENTAL_DEFAULTS: RentalInput = {
  price: 150000, notaryRate: 0.08, works: 10000, furniture: 0,
  monthlyRent: 750, vacancyMonths: 1, propertyTax: 900, coOwnership: 600, insurancePno: 150,
  managementRate: 0, maintenanceRate: 0.05,
  downPayment: 22000, loanRate: 0.035, loanYears: 20, loanInsuranceRate: 0.003,
  regime: 'micro-foncier', marginalRate: 0.3, socialRate: 0.172, microAllowance: 0.3, annualDepreciation: 4000,
  appreciation: 0.01, indexation: 0.015, horizon: 20,
};

export const REGIMES: { v: TaxRegime; label: string; allowance?: number }[] = [
  { v: 'aucune', label: 'Ne pas estimer l’impôt' },
  { v: 'micro-foncier', label: 'Location nue — micro-foncier (abattement 30 %)', allowance: 0.3 },
  { v: 'reel-foncier', label: 'Location nue — régime réel' },
  { v: 'micro-bic', label: 'Location meublée — micro-BIC (abattement à vérifier)', allowance: 0.5 },
  { v: 'reel-bic', label: 'Location meublée — LMNP au réel' },
];

export const TMI_OPTIONS = [0, 0.11, 0.3, 0.41, 0.45].map((v) => ({ v, label: `${Math.round(v * 100)} %` }));
export const PS_OPTIONS = [
  { v: 0.172, label: '17,2 % (revenus fonciers)' },
  { v: 0.186, label: '18,6 % (taux relevé 2026, à vérifier pour le meublé)' },
];

export default function SimImmobilier() {
  const [s, setS, up] = usePersistentState<RentalInput>('immobilier', RENTAL_DEFAULTS);
  const r = useMemo(() => rentalAnalysis(s), [s]);
  const loan = useMemo(() => amortize({ principal: r.loanAmount, annualRate: s.loanRate, years: s.loanYears, insuranceRate: s.loanInsuranceRate }), [r.loanAmount, s]);
  const proj = useMemo(() => rentalProjection(s), [s]);
  const bad = useMemo(() => adverseScenario(s), [s]);
  const badSnap = useMemo(() => rentalAnalysis(bad), [bad]);
  const badProj = useMemo(() => rentalProjection(bad), [bad]);
  const y1 = proj[0];
  const end = proj[proj.length - 1];
  const badEnd = badProj[badProj.length - 1];
  const isMicro = s.regime === 'micro-foncier' || s.regime === 'micro-bic';

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Immobilier locatif' }]} />
      <PageHead eyebrow="Calculateur" title="Calculateur immobilier locatif">
        Mensualité, coût du crédit, rendements, flux de trésorerie, capital restant dû et patrimoine net estimé, avec un scénario défavorable.
        Les calculs avant impôt sont séparés des estimations après impôt.
      </PageHead>
      <div className="sim">
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Acquisition</legend>
            <NumberField label="Prix du bien" unit="€" value={s.price} onChange={up('price')} min={0} step={5000} />
            <NumberField label="Frais d'acquisition" unit="%" percent value={s.notaryRate} onChange={up('notaryRate')} step={0.5} min={0} max={20} hint="Ordre de grandeur dans l'ancien : 7 à 8 % (à vérifier)." />
            <NumberField label="Travaux" unit="€" value={s.works} onChange={up('works')} min={0} step={1000} />
            <NumberField label="Mobilier" unit="€" value={s.furniture} onChange={up('furniture')} min={0} step={500} />
            <NumberField label="Apport" unit="€" value={s.downPayment} onChange={up('downPayment')} min={0} step={1000} />
          </fieldset>
          <fieldset>
            <legend>Crédit</legend>
            <NumberField label="Taux d'intérêt nominal" unit="%" percent value={s.loanRate} onChange={up('loanRate')} step={0.05} min={0} max={15} />
            <NumberField label="Durée du crédit" unit="ans" value={s.loanYears} onChange={up('loanYears')} min={0} max={30} />
            <NumberField label="Assurance emprunteur" unit="%" percent value={s.loanInsuranceRate} onChange={up('loanInsuranceRate')} step={0.05} min={0} max={2} hint="Taux annuel sur le capital emprunté." />
          </fieldset>
          <fieldset>
            <legend>Location et charges</legend>
            <NumberField label="Loyer mensuel hors charges" unit="€" value={s.monthlyRent} onChange={up('monthlyRent')} min={0} step={25} />
            <NumberField label="Vacance locative" unit="mois/an" value={s.vacancyMonths} onChange={up('vacancyMonths')} min={0} max={12} step={0.5} />
            <NumberField label="Charges non récupérables" unit="€/an" value={s.coOwnership} onChange={up('coOwnership')} min={0} step={50} />
            <NumberField label="Assurance propriétaire non occupant" unit="€/an" value={s.insurancePno} onChange={up('insurancePno')} min={0} step={10} />
            <NumberField label="Taxe foncière" unit="€/an" value={s.propertyTax} onChange={up('propertyTax')} min={0} step={50} />
            <NumberField label="Entretien" unit="% loyers" percent value={s.maintenanceRate} onChange={up('maintenanceRate')} step={0.5} min={0} max={20} />
            <NumberField label="Frais de gestion" unit="% loyers" percent value={s.managementRate} onChange={up('managementRate')} step={0.5} min={0} max={15} />
          </fieldset>
          <fieldset>
            <legend>Fiscalité (estimation)</legend>
            <SelectField label="Régime" value={s.regime} options={REGIMES} onChange={(v) => setS((x) => ({ ...x, regime: v, microAllowance: REGIMES.find((g) => g.v === v)?.allowance ?? x.microAllowance }))} />
            <SelectField label="Tranche marginale d'imposition" value={s.marginalRate} options={TMI_OPTIONS} onChange={up('marginalRate')} />
            <SelectField label="Prélèvements sociaux" value={s.socialRate} options={PS_OPTIONS} onChange={up('socialRate')} />
            {isMicro && <NumberField label="Abattement forfaitaire" unit="%" percent value={s.microAllowance} onChange={up('microAllowance')} step={1} min={0} max={100} />}
            {s.regime === 'reel-bic' && (
              <NumberField label="Amortissement annuel estimé" unit="€" value={s.annualDepreciation} onChange={up('annualDepreciation')} min={0} step={250}
                hint="À établir avec un expert-comptable (bâti, mobilier, travaux)." />
            )}
          </fieldset>
          <fieldset>
            <legend>Projection</legend>
            <NumberField label="Évolution annuelle du prix du bien" unit="%" percent value={s.appreciation} onChange={up('appreciation')} step={0.25} min={-10} max={10} hint="Hypothèse, non une prévision." />
            <NumberField label="Indexation des loyers et charges" unit="%" percent value={s.indexation} onChange={up('indexation')} step={0.25} min={-5} max={10} />
            <NumberField label="Horizon" unit="ans" value={s.horizon} onChange={up('horizon')} min={1} max={40} />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(RENTAL_DEFAULTS)}>Réinitialiser</button>
        </form>

        <section aria-label="Résultats">
          <div className="section-label">Calculs avant impôt · première année</div>
          <div className="kpis">
            <Kpi label="Mensualité" value={fmtEur(r.monthlyLoan)} sub="assurance comprise" />
            <Kpi label="Coût total du crédit" value={fmtEur(loan.totalCost)} sub={`${fmtEur(loan.totalInterest)} d'intérêts`} />
            <Kpi label="Rendement brut" value={fmtPct(r.grossYield)} sub="loyers annuels / prix" />
            <Kpi label="Rendement net de charges" value={fmtPct(r.netYield)} sub="sur le coût total, avant crédit" />
            <Kpi label="Flux de trésorerie mensuel" value={fmtEur(r.monthlyCashflow)} tone={r.monthlyCashflow >= 0 ? 'pos' : 'neg'} sub="avant impôt" />
          </div>

          <div className="section-label">Estimations après impôt et patrimoine</div>
          <div className="kpis">
            <Kpi label="Impôt estimé, année 1" value={fmtEur(y1?.tax ?? 0)} sub={REGIMES.find((g) => g.v === s.regime)?.label} />
            <Kpi label="Flux mensuel après impôt, année 1" value={fmtEur((y1?.cashflowAfterTax ?? 0) / 12)} tone={(y1?.cashflowAfterTax ?? 0) >= 0 ? 'pos' : 'neg'} />
            <Kpi label={`Capital restant dû à ${s.horizon} ans`} value={fmtEur(end?.remaining ?? 0)} />
            <Kpi label={`Patrimoine net immobilier estimé à ${s.horizon} ans`} value={fmtEur(end?.netEquity ?? 0)} sub="valeur estimée − capital restant dû" />
          </div>
          {s.regime === 'micro-foncier' && r.annualRentCollected > 15000 && (
            <p className="notice small">Avec plus de 15 000 € de revenus fonciers bruts par an, le micro-foncier n'est pas applicable : choisissez le régime réel.</p>
          )}

          <div className="panel">
            <LineChart
              title="Patrimoine net immobilier et capital restant dû"
              xLabels={[0, ...proj.map((p) => p.year)].map((y) => `An ${y}`)}
              format={fmtEur}
              series={[
                { name: 'Patrimoine net (central)', color: 'var(--chart-1)', values: [s.price - r.loanAmount, ...proj.map((p) => p.netEquity)] },
                { name: 'Patrimoine net (défavorable)', color: 'var(--chart-3)', values: [bad.price - badSnap.loanAmount, ...badProj.map((p) => p.netEquity)], dashed: true },
                { name: 'Capital restant dû', color: 'var(--chart-4)', values: [r.loanAmount, ...proj.map((p) => p.remaining)] },
                { name: 'Trésorerie cumulée après impôt', color: 'var(--chart-2)', values: [0, ...proj.map((p) => p.cumulativeCashflowAfterTax)] },
              ]}
            />
          </div>

          <h2>Scénario défavorable</h2>
          <p className="muted">
            Appliqué à votre saisie : {ADVERSE.extraVacancyMonths} mois de vacance en plus par an, loyer réduit de {Math.round((1 - ADVERSE.rentFactor) * 100)} %,
            taxe foncière et charges majorées de {Math.round((ADVERSE.chargesFactor - 1) * 100)} %, évolution du prix du bien diminuée de {Math.abs(ADVERSE.appreciationDelta * 100)} points par an.
          </p>
          <div className="table-wrap">
            <table>
              <thead><tr><th /><th className="r">Central</th><th className="r">Défavorable</th></tr></thead>
              <tbody>
                <tr><td>Rendement net de charges</td><td className="r">{fmtPct(r.netYield)}</td><td className="r">{fmtPct(badSnap.netYield)}</td></tr>
                <tr><td>Flux mensuel avant impôt</td><td className="r">{fmtEur(r.monthlyCashflow)}</td><td className="r">{fmtEur(badSnap.monthlyCashflow)}</td></tr>
                <tr><td>Flux mensuel après impôt (estimation, année 1)</td><td className="r">{fmtEur((y1?.cashflowAfterTax ?? 0) / 12)}</td><td className="r">{fmtEur((badProj[0]?.cashflowAfterTax ?? 0) / 12)}</td></tr>
                <tr><td>Effort cumulé après impôt sur {s.horizon} ans</td><td className="r">{fmtEur(end?.cumulativeCashflowAfterTax ?? 0)}</td><td className="r">{fmtEur(badEnd?.cumulativeCashflowAfterTax ?? 0)}</td></tr>
                <tr><td>Patrimoine net immobilier estimé à {s.horizon} ans</td><td className="r">{fmtEur(end?.netEquity ?? 0)}</td><td className="r">{fmtEur(badEnd?.netEquity ?? 0)}</td></tr>
              </tbody>
            </table>
          </div>

          <h2>Détail annuel</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Année</th><th className="r">Loyers</th><th className="r">Charges</th><th className="r">Intérêts + ass.</th><th className="r">Capital remb.</th>
                  <th className="r">Flux avant impôt</th><th className="r">Impôt estimé</th><th className="r">Flux après impôt</th><th className="r">Restant dû</th><th className="r">Patrimoine net</th>
                </tr>
              </thead>
              <tbody>
                {proj.map((p) => (
                  <tr key={p.year}>
                    <td>{p.year}</td>
                    <td className="r">{fmtEur(p.rents)}</td>
                    <td className="r">{fmtEur(p.charges)}</td>
                    <td className="r">{fmtEur(p.interest + p.insurance)}</td>
                    <td className="r">{fmtEur(p.principalPaid)}</td>
                    <td className={'r ' + (p.cashflowBeforeTax < 0 ? 'neg' : 'pos')}>{fmtEur(p.cashflowBeforeTax)}</td>
                    <td className="r">{fmtEur(p.tax)}</td>
                    <td className={'r ' + (p.cashflowAfterTax < 0 ? 'neg' : 'pos')}>{fmtEur(p.cashflowAfterTax)}</td>
                    <td className="r">{fmtEur(p.remaining)}</td>
                    <td className="r">{fmtEur(p.netEquity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="notice info small" style={{ marginTop: 16 }}>
            Estimation fiscale simplifiée : impôt = base imposable × (tranche marginale + prélèvements sociaux). Au réel, un déficit est reporté sur les
            revenus locatifs suivants ; son imputation sur le revenu global n'est pas modélisée. Le patrimoine net ne déduit ni frais de revente ni impôt
            sur la plus-value : le <Link to="/simulateurs/etf-immobilier">comparateur ETF / immobilier</Link> les intègre. Voir aussi les fiches{' '}
            <Link to="/encyclopedie/location-nue">location nue</Link> et <Link to="/encyclopedie/lmnp">LMNP</Link>.
          </p>
          <SavedSims simKey="immobilier" current={s} onLoad={(d) => setS({ ...RENTAL_DEFAULTS, ...d })} />
          <SimFaq slug="immobilier" />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
        </section>
      </div>
    </>
  );
}
