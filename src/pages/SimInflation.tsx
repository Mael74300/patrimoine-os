import { Link } from 'react-router-dom';
import { fmtAns, fmtEur, fmtPct, purchasingPower } from '../lib/finance';
import { inflationTakeaway } from '../lib/takeaways';
import { Crumbs, Disclaimer, SimFaq, Takeaway, Kpi, LineChart, NumberField, PageHead, SavedSims, usePersistentState, JumpToResults, SimNotice } from '../components/ui';

type State = { amount: number; years: number; inflation: number; annualReturn: number };

const DEFAULTS: State = { amount: 10000, years: 20, inflation: 0.02, annualReturn: 0.03 };

const fmtYears = (y: number | null) => (y === null ? 'jamais' : fmtAns(y));

export default function SimInflation() {
  const [s, setS, up] = usePersistentState<State>('inflation', DEFAULTS);
  const r = purchasingPower(s);
  const n = r.idleSeries.length - 1;

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Inflation et pouvoir d’achat' }]} />
      <PageHead eyebrow="Simulateur" title="Inflation et pouvoir d’achat">
        Que vaut une somme dans le temps ? Comparez la somme laissée telle quelle et la même somme placée, en euros d’aujourd’hui.
      </PageHead>
      <SimNotice>
        L’inflation (hausse générale des prix) réduit ce qu’une somme permet d’acheter. Le taux d’inflation et le rendement saisis sont des hypothèses
        modifiables, pas des prévisions : les valeurs constatées sont publiées par l’Insee. Le <Link to="/simulateurs/patrimoine">simulateur de patrimoine</Link>
        {' '}intègre l’inflation à un plan d’épargne complet.
      </SimNotice>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Hypothèses</legend>
            <NumberField label="Somme" unit="€" value={s.amount} onChange={up('amount')} min={0} step={1000} />
            <NumberField label="Durée" unit="ans" value={s.years} onChange={up('years')} min={0} max={80} step={1} />
            <NumberField label="Inflation annuelle" unit="%" percent value={s.inflation} onChange={up('inflation')} min={-5} max={30} step={0.5} hint="Hypothèse moyenne sur la durée." />
            <NumberField label="Rendement annuel net de frais du placement" unit="%" percent value={s.annualReturn} onChange={up('annualReturn')} min={-20} max={30} step={0.5} hint="Hypothèse, jamais une garantie. Avant impôt." />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
          <JumpToResults />
        </form>
        <section id="resultats" aria-label="Résultats" tabIndex={-1}>
          <div className="kpis">
            <Kpi label="Somme inchangée après la durée" value={fmtEur(r.idleRealValue)} sub={`en euros d'aujourd'hui, soit ${fmtPct(r.idleLoss)} de pouvoir d'achat perdu`} tone={r.idleLoss > 0 ? 'neg' : undefined} />
            <Kpi label="Montant pour garder le même pouvoir d'achat" value={fmtEur(r.nominalToKeepPower)} sub={`dans ${fmtAns(n)}, en euros courants`} />
            <Kpi label="Somme placée, en euros d'aujourd'hui" value={fmtEur(r.investedRealValue)} sub={`${fmtEur(r.investedValue)} en euros courants · rendement réel ${fmtPct(r.realReturn)}`} tone={r.realReturn < 0 ? 'neg' : undefined} />
          </div>
          <Takeaway>{inflationTakeaway({ amount: s.amount, years: n, inflation: s.inflation, annualReturn: s.annualReturn, idleRealValue: r.idleRealValue, nominalToKeepPower: r.nominalToKeepPower, investedRealValue: r.investedRealValue })}</Takeaway>
          <h2>Valeur de la somme dans le temps (euros d’aujourd’hui)</h2>
          <LineChart
            title="Pouvoir d'achat de la somme, inchangée ou placée"
            xLabels={r.idleSeries.map((_, i) => `An ${i}`)}
            format={fmtEur}
            series={[
              { name: 'Somme inchangée', color: 'var(--danger)', values: r.idleSeries },
              { name: `Somme placée à ${fmtPct(s.annualReturn)}`, color: 'var(--chart-1)', values: r.investedSeries },
              { name: 'Pouvoir d’achat de départ', color: 'var(--ink-3)', dashed: true, values: r.idleSeries.map(() => Math.max(0, s.amount)) },
            ]}
          />
          <p className="muted small">Au-dessus des pointillés, la somme achète plus qu’aujourd’hui ; en dessous, moins.</p>
          <h2>Repères de durée</h2>
          <div className="table-wrap" tabIndex={0}>
            <table>
              <tbody>
                <tr><th scope="row">Durée pour perdre la moitié du pouvoir d’achat (somme inchangée)</th><td className="r">{fmtYears(r.yearsToHalve)}</td></tr>
                <tr><th scope="row">Durée pour doubler le capital placé (en euros courants)</th><td className="r">{fmtYears(r.yearsToDouble)}</td></tr>
              </tbody>
            </table>
          </div>
          <ul className="points">
            <li><strong>En euros d’aujourd’hui</strong> : ce que la somme permettra d’acheter, aux prix actuels. <strong>En euros courants</strong> : le montant inscrit sur le compte à ce moment-là.</li>
            <li>Calcul sans versement ajouté et avant impôt : les <Link to="/simulateurs/frais">frais</Link> et l’impôt réduisent le résultat. Argent à garder disponible : <Link to="/simulateurs/epargne-de-precaution">épargne de précaution</Link>.</li>
          </ul>
          <SavedSims simKey="inflation" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
          <SimFaq slug="inflation" />
        </section>
      </div>
    </>
  );
}
