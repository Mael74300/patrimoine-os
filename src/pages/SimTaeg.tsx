import { Link } from 'react-router-dom';
import { fmtEur, fmtPct, taeg, taegByFees, taegByInsurance } from '../lib/finance';
import { Crumbs, Disclaimer, SimFaq, Kpi, NumberField, PageHead, SavedSims, usePersistentState } from '../components/ui';

type State = { principal: number; annualRate: number; years: number; insuranceRate: number; fees: number };

const DEFAULTS: State = { principal: 200000, annualRate: 0.036, years: 20, insuranceRate: 0.003, fees: 2500 };

export default function SimTaeg() {
  const [s, setS, up] = usePersistentState<State>('taeg', DEFAULTS);
  const r = taeg(s);
  const byFees = taegByFees(s, [0, 1000, 2500, 5000]);
  const byIns = taegByInsurance(s, [0, 0.001, 0.003, 0.005]);

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'TAEG d’un crédit' }]} />
      <PageHead eyebrow="Simulateur" title="Calcul du TAEG d’un crédit : taux, assurance et frais">
        Le taux nominal ne dit pas tout. Ce simulateur calcule le TAEG, le taux annuel qui intègre l’assurance et les frais payés au départ, pour comparer deux offres de prêt.
      </PageHead>
      <p className="notice" role="note">
        Le TAEG calculé ici est une estimation pédagogique à partir des éléments saisis (échéances constantes, frais payés à la signature, assurance sur le capital initial).
        Seul le TAEG figurant sur l’offre de prêt de la banque fait foi. Pour l’échéancier complet, voir le <Link to="/simulateurs/credit">calculateur de crédit</Link>
        {' '}; pour vérifier que la mensualité reste supportable, le <Link to="/simulateurs/endettement">taux d’endettement</Link>.
      </p>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>L’offre de prêt</legend>
            <NumberField label="Capital emprunté" unit="€" value={s.principal} onChange={up('principal')} min={0} step={5000} />
            <NumberField label="Taux nominal annuel" unit="%" percent value={s.annualRate} onChange={up('annualRate')} min={0} max={20} step={0.05} />
            <NumberField label="Durée" unit="ans" value={s.years} onChange={up('years')} min={0} max={50} step={1} />
            <NumberField label="Assurance emprunteur (taux annuel sur le capital initial)" unit="%" percent value={s.insuranceRate} onChange={up('insuranceRate')} min={0} max={10} step={0.05} />
            <NumberField label="Frais de dossier, garantie et autres frais payés au départ" unit="€" value={s.fees} onChange={up('fees')} min={0} step={100} />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
        </form>
        <section aria-label="Résultats">
          <div className="kpis">
            <Kpi label="TAEG estimé" value={fmtPct(r.taeg)} sub={`contre ${fmtPct(s.annualRate)} de taux nominal (écart ${fmtPct(r.gap)})`} />
            <Kpi label="Mensualité assurance comprise" value={fmtEur(r.monthlyTotal)} sub={`dont ${fmtEur(r.monthlyInsurance)} d’assurance, sur ${r.months} mois`} />
            <Kpi label="Coût total du crédit" value={fmtEur(r.totalCost)} sub={`intérêts ${fmtEur(r.totalInterest)} + assurance ${fmtEur(r.totalInsurance)} + frais ${fmtEur(Math.min(s.fees, s.principal))}`} />
          </div>
          <h2>Effet des frais payés au départ</h2>
          <div className="table-wrap" tabIndex={0}>
            <table>
              <thead><tr><th scope="col">Frais au départ</th><th scope="col" className="r">TAEG</th></tr></thead>
              <tbody>
                {byFees.map((d) => (
                  <tr key={d.fees}><th scope="row">{fmtEur(d.fees)}</th><td className="r">{fmtPct(d.taeg)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <h2>Effet de l’assurance</h2>
          <div className="table-wrap" tabIndex={0}>
            <table>
              <thead><tr><th scope="col">Assurance (taux annuel)</th><th scope="col" className="r">TAEG</th></tr></thead>
              <tbody>
                {byIns.map((d) => (
                  <tr key={d.insuranceRate}><th scope="row">{fmtPct(d.insuranceRate)}</th><td className="r">{fmtPct(d.taeg)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted small">
            Le TAEG est exprimé en taux annuel effectif : il se compare directement d’une offre à l’autre, à durée comparable. Les exemples ci-dessus sont fictifs.
            Pour juger de l’intérêt de rembourser un crédit plutôt que d’investir, voir <Link to="/simulateurs/rembourser-ou-investir">rembourser ou investir</Link>.
          </p>
          <SavedSims simKey="taeg" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
          <SimFaq slug="taeg" />
        </section>
      </div>
    </>
  );
}
