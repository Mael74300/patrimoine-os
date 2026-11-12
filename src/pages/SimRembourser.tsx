import { Link } from 'react-router-dom';
import { fmtEur, fmtMonths, fmtPct, prepayVsInvest, prepayVsInvestByReturn } from '../lib/finance';
import { prepayTakeaway } from '../lib/takeaways';
import { Crumbs, Disclaimer, SimFaq, Takeaway, Kpi, LineChart, MobileFold, NumberField, PageHead, SavedSims, usePersistentState, JumpToResults, SimNotice } from '../components/ui';

type State = { balance: number; annualRate: number; remainingYears: number; lump: number; annualReturn: number; annualFees: number; taxRate: number };

const DEFAULTS: State = { balance: 150000, annualRate: 0.035, remainingYears: 15, lump: 20000, annualReturn: 0.05, annualFees: 0.005, taxRate: 0.314 };

export default function SimRembourser() {
  const [s, setS, up] = usePersistentState<State>('rembourser', DEFAULTS);
  const r = prepayVsInvest(s);
  const investWins = r.advantageInvest > 0;
  const byReturn = prepayVsInvestByReturn(s);
  const be = r.breakEvenReturn;

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Rembourser ou investir' }]} />
      <PageHead eyebrow="Simulateur" title="Rembourser son crédit ou investir ?">
        Vous disposez d'une somme : la verser en remboursement anticipé ou la placer ? Comparez le patrimoine net obtenu à la fin de la durée restante du crédit.
      </PageHead>
      <SimNotice>
        <strong>Le rendement est une hypothèse, pas une promesse.</strong> Un placement peut perdre de la valeur ; rembourser un crédit, lui, fait économiser des intérêts à coup sûr.
        Le taux d'imposition de 31,4 % est celui du prélèvement forfaitaire unique de 2026 (<Link to="/encyclopedie/compte-titres">fiche Compte-titres</Link>) : changez-le si votre placement est dans une autre enveloppe.
      </SimNotice>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Crédit en cours</legend>
            <NumberField label="Capital restant dû" unit="€" value={s.balance} onChange={up('balance')} min={0} step={5000} />
            <NumberField label="Taux nominal annuel" unit="%" percent value={s.annualRate} onChange={up('annualRate')} min={0} max={20} step={0.1} hint="Hors assurance." />
            <NumberField label="Durée restante" unit="ans" value={s.remainingYears} onChange={up('remainingYears')} min={1} max={40} step={1} />
          </fieldset>
          <fieldset>
            <legend>Somme disponible et placement</legend>
            <NumberField label="Somme à affecter" unit="€" value={s.lump} onChange={up('lump')} min={0} step={1000} hint="Plafonnée au capital restant dû." />
            <NumberField label="Rendement brut annuel du placement" unit="%" percent value={s.annualReturn} onChange={up('annualReturn')} min={-20} max={30} step={0.5} hint="Hypothèse avant frais." />
            <NumberField label="Frais annuels du placement" unit="%" percent value={s.annualFees} onChange={up('annualFees')} min={0} max={10} step={0.1} />
            <NumberField label="Imposition des gains" unit="%" percent value={s.taxRate} onChange={up('taxRate')} min={0} max={60} step={0.5} hint="Taux unique appliqué aux gains à l'horizon." />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
          <JumpToResults />
        </form>
        <section id="resultats" aria-label="Résultats" tabIndex={-1}>
          <div className="kpis">
            <Kpi label="Option la plus favorable" value={r.lump === 0 ? 'Aucune' : investWins ? 'Investir' : 'Rembourser'} sub={`écart de ${fmtEur(Math.abs(r.advantageInvest))} à l'horizon`} tone={r.lump === 0 ? undefined : investWins ? 'pos' : undefined} />
            <Kpi label="Intérêts économisés en remboursant" value={fmtEur(r.interestSaved)} sub={`crédit raccourci de ${fmtMonths(r.monthsSaved)}`} />
            <Kpi label="Rendement brut d'équilibre" value={r.breakEvenReturn === null ? 'Hors plage' : fmtPct(r.breakEvenReturn)} sub="en dessous, rembourser l'emporte" />
          </div>
          <Takeaway>{prepayTakeaway({ lump: r.lump, advantageInvest: r.advantageInvest, interestSaved: r.interestSaved, breakEvenReturn: r.breakEvenReturn })}</Takeaway>
          {r.lump > 0 && r.monthlyPayment > 0 && (
            <>
              <h2>Et si le placement rapportait plus ou moins ?</h2>
              <LineChart
                title="Patrimoine net à la fin du crédit selon le rendement brut du placement"
                xLabels={byReturn.map((p) => `${Math.round(p.annualReturn * 100)}\u00a0%`)}
                format={fmtEur}
                series={[
                  { name: 'Rembourser', color: 'var(--chart-1)', values: byReturn.map((p) => p.wealthPrepay) },
                  { name: 'Investir', color: 'var(--chart-2)', values: byReturn.map((p) => p.wealthInvest) },
                ]}
                defaultIndex={Math.round(s.annualReturn * 100)}
                band={be !== null && be * 100 >= 2.5 ? { from: 0, to: be * 100, label: 'Rembourser l’emporte' } : undefined}
              />
              <p className="muted small">
                Chaque point refait le calcul avec un autre rendement, le reste inchangé.
                {be !== null ? ` Les courbes se croisent vers ${fmtPct(be)} : en dessous (zone grisée), rembourser l’emporte ; au-dessus, investir.` : ''}
              </p>
            </>
          )}
          <MobileFold label="Patrimoine net à la fin du crédit, option par option">
          <div className="table-wrap" tabIndex={0}>
            <table>
              <thead><tr><th>Option</th><th className="r">Patrimoine net</th><th className="r">Crédit soldé en</th></tr></thead>
              <tbody>
                <tr><td>Rembourser par anticipation (mensualité conservée, mensualités libérées investies)</td><td className="r">{fmtEur(r.wealthPrepay)}</td><td className="r">{fmtMonths(r.monthsIfPrepaid)}</td></tr>
                <tr><td>Investir la somme (crédit inchangé)</td><td className="r">{fmtEur(r.wealthInvest)}</td><td className="r">{fmtMonths(Math.round(s.remainingYears * 12))}</td></tr>
              </tbody>
            </table>
          </div>
          </MobileFold>
          <p className="muted small">
            Mensualité du crédit : {fmtEur(r.monthlyPayment)}. Le patrimoine net est le placement après impôt sur les gains, moins le capital restant dû éventuel.
            Ni l'assurance emprunteur ni les indemnités de remboursement anticipé (plafonnées par la loi) ne sont incluses : renseignez-vous auprès de votre banque.
          </p>
          <SavedSims simKey="rembourser" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
          <SimFaq slug="rembourser-ou-investir" />
        </section>
      </div>
    </>
  );
}
