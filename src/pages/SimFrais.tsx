import { Link } from 'react-router-dom';
import { feeImpact, fmtEur, fmtPct } from '../lib/finance';
import { Crumbs, Disclaimer, SimFaq, Kpi, LineChart, NumberField, PageHead, SavedSims, usePersistentState } from '../components/ui';

type State = { initial: number; monthly: number; annualReturn: number; years: number; inflation: number; feesA: number; feesB: number; feesC: number };

const DEFAULTS: State = { initial: 10000, monthly: 300, annualReturn: 0.06, years: 25, inflation: 0.02, feesA: 0.002, feesB: 0.01, feesC: 0.02 };
const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)'];

export default function SimFrais() {
  const [s, setS, up] = usePersistentState<State>('frais', DEFAULTS);
  const levels = [s.feesA, s.feesB, s.feesC];
  const res = feeImpact(s, levels);
  const base = feeImpact(s, [0])[0];
  const worst = res[2];

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Impact des frais' }]} />
      <PageHead eyebrow="Simulateur" title="Impact des frais sur votre capital">
        Même rendement brut, mêmes versements, trois niveaux de frais annuels : mesurez ce que les frais coûtent réellement sur la durée.
      </PageHead>
      <p className="notice" role="note">
        Les frais sont ici prélevés chaque année en proportion du capital (frais de gestion, frais courants d'un fonds, frais d'enveloppe cumulés).
        Les niveaux proposés sont des hypothèses modifiables, pas des tarifs constatés ; comparez-les aux frais réels du document d'information de votre placement.
        Voir le guide <Link to="/guides/comparer-les-frais">sur les frais</Link> et la <Link to="/glossaire">définition des termes</Link>.
      </p>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Hypothèses</legend>
            <NumberField label="Capital initial" unit="€" value={s.initial} onChange={up('initial')} min={0} step={1000} />
            <NumberField label="Versement mensuel" unit="€" value={s.monthly} onChange={up('monthly')} min={0} step={50} />
            <NumberField label="Rendement brut annuel" unit="%" percent value={s.annualReturn} onChange={up('annualReturn')} min={-20} max={30} step={0.5} hint="Avant frais. Hypothèse, jamais une garantie." />
            <NumberField label="Durée" unit="ans" value={s.years} onChange={up('years')} min={1} max={60} step={1} />
            <NumberField label="Inflation annuelle" unit="%" percent value={s.inflation} onChange={up('inflation')} min={0} max={20} step={0.5} />
          </fieldset>
          <fieldset>
            <legend>Trois niveaux de frais annuels</legend>
            <NumberField label="Frais A" unit="%" percent value={s.feesA} onChange={up('feesA')} min={0} max={10} step={0.1} />
            <NumberField label="Frais B" unit="%" percent value={s.feesB} onChange={up('feesB')} min={0} max={10} step={0.1} />
            <NumberField label="Frais C" unit="%" percent value={s.feesC} onChange={up('feesC')} min={0} max={10} step={0.1} />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
        </form>
        <section aria-label="Résultats">
          <div className="kpis">
            <Kpi label="Capital sans aucun frais" value={fmtEur(base.finalValue)} sub={`après ${s.years} ans (référence)`} />
            <Kpi label={`Coût des frais à ${fmtPct(worst.fees)}`} value={fmtEur(worst.cost)} sub={`${fmtPct(worst.shareOfGains)} des gains absorbés`} tone={worst.cost > 0 ? 'neg' : undefined} />
            <Kpi label={`Capital avec ${fmtPct(res[0].fees)} de frais`} value={fmtEur(res[0].finalValue)} sub={`soit ${fmtEur(res[0].realValue)} d'aujourd'hui`} />
          </div>
          <h2>Évolution du capital selon les frais</h2>
          <LineChart
            title="Capital selon le niveau de frais annuels"
            xLabels={base.series.map((_, i) => `An ${i}`)}
            format={fmtEur}
            series={res.map((r, i) => ({ name: `Frais ${fmtPct(r.fees)}`, color: COLORS[i], values: r.series }))}
          />
          <h2>Comparaison</h2>
          <div className="table-wrap" tabIndex={0}>
            <table>
              <thead><tr><th>Frais annuels</th><th className="r">Capital final</th><th className="r">En euros d'aujourd'hui</th><th className="r">Coût des frais</th><th className="r">Part des gains absorbée</th></tr></thead>
              <tbody>
                {res.map((r, i) => (
                  <tr key={i}>
                    <td>{fmtPct(r.fees)}</td><td className="r">{fmtEur(r.finalValue)}</td><td className="r">{fmtEur(r.realValue)}</td>
                    <td className="r">{fmtEur(r.cost)}</td><td className="r">{fmtPct(r.shareOfGains)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted small">
            Le coût des frais est la différence avec le capital obtenu sans frais, à versements et rendement brut identiques. Il ne tient compte
            ni de la fiscalité ni des écarts de performance entre produits. Pour aller plus loin : <Link to="/simulateurs/patrimoine">simulateur de patrimoine</Link>, <Link to="/simulateurs/portefeuille">calculateur de portefeuille</Link>.
          </p>
          <SavedSims simKey="frais" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
          <SimFaq slug="frais" />
        </section>
      </div>
    </>
  );
}
