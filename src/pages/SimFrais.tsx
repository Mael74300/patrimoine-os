import { Link } from 'react-router-dom';
import { feeImpact, feeSplit, fmtEur, fmtPct, type FeeLevelResult } from '../lib/finance';
import { feesTakeaway } from '../lib/takeaways';
import { Crumbs, Disclaimer, SimFaq, Takeaway, Kpi, LineChart, NumberField, PageHead, SavedSims, usePersistentState, JumpToResults, SimNotice, Fold } from '../components/ui';

type State = { initial: number; monthly: number; annualReturn: number; years: number; inflation: number; feesA: number; feesB: number; feesC: number };

const DEFAULTS: State = { initial: 10000, monthly: 300, annualReturn: 0.06, years: 25, inflation: 0.02, feesA: 0.002, feesB: 0.01, feesC: 0.02 };
const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)'];

/** Une barre par niveau de frais : vos versements, les gains que vous gardez, la part prise par les frais (même échelle pour toutes). */
function FeeBar({ label, r, scale, reference }: { label: string; r: FeeLevelResult; scale: number; reference?: boolean }) {
  const b = feeSplit(r, scale);
  return (
    <li className={'fb-row' + (reference ? ' fb-ref' : '')}>
      <div className="fb-head">
        <span className="fb-name">{label}</span>
        <span className="fb-value">{fmtEur(r.finalValue)}</span>
      </div>
      <div className="fb-track" aria-hidden="true">
        <span className="fb-paid" style={{ width: `${b.paid}%` }} />
        <span className="fb-kept" style={{ width: `${b.kept}%` }} />
        <span className="fb-lost" style={{ width: `${b.lost}%` }} />
      </div>
      <p className="fb-sub">
        {reference
          ? `soit ${fmtEur(r.realValue)} d'aujourd'hui`
          : <>soit {fmtEur(r.realValue)} d'aujourd'hui · <strong>frais : {fmtEur(r.cost)}</strong>, {fmtPct(r.shareOfGains)} des gains absorbés</>}
      </p>
    </li>
  );
}

export default function SimFrais() {
  const [s, setS, up] = usePersistentState<State>('frais', DEFAULTS);
  const levels = [s.feesA, s.feesB, s.feesC];
  const res = feeImpact(s, levels);
  const base = feeImpact(s, [0])[0];
  const worst = res[2];
  const byFees = [...res].sort((a, b) => a.fees - b.fees);
  const lowest = byFees[0];
  const highest = byFees[byFees.length - 1];
  const scale = Math.max(base.finalValue, base.contributed);

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Impact des frais' }]} />
      <PageHead eyebrow="Simulateur" title="Impact des frais sur votre capital">
        Même rendement brut, mêmes versements, trois niveaux de frais annuels : mesurez ce que les frais coûtent réellement sur la durée.
      </PageHead>
      <SimNotice>
        Les frais sont ici prélevés chaque année en proportion du capital (frais de gestion, frais courants d'un fonds, frais d'enveloppe cumulés).
        Les niveaux proposés sont des hypothèses modifiables, pas des tarifs constatés ; comparez-les aux frais réels du document d'information de votre placement.
        Voir le guide <Link to="/guides/comparer-les-frais">sur les frais</Link> et la <Link to="/glossaire">définition des termes</Link>.
      </SimNotice>
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
          <JumpToResults />
        </form>
        <section id="resultats" aria-label="Résultats" tabIndex={-1}>
          <div className="kpis">
            <Kpi label="Capital sans aucun frais" value={fmtEur(base.finalValue)} sub={`après ${s.years}\u00a0ans (référence)`} />
            <Kpi label={`Coût des frais à ${fmtPct(worst.fees)}`} value={fmtEur(worst.cost)} sub={`${fmtPct(worst.shareOfGains)} des gains absorbés`} tone={worst.cost > 0 ? 'neg' : undefined} />
            <Kpi label={`Capital avec ${fmtPct(res[0].fees)} de frais`} value={fmtEur(res[0].finalValue)} sub={`soit ${fmtEur(res[0].realValue)} d'aujourd'hui`} />
          </div>
          <Takeaway>{feesTakeaway({ years: s.years, lowest: lowest, highest: highest, noFees: base.finalValue })}</Takeaway>
          <h2>Ce que les frais prennent sur vos gains</h2>
          <p className="fb-intro">
            Capital au bout de {`${s.years}\u00a0ans`}. Chaque barre a la même longueur totale : le capital que vous auriez sans frais.
          </p>
          <figure className="fb">
            <ul className="fb-legend" aria-hidden="true">
              <li><i className="fb-paid" />Vos versements ({fmtEur(base.contributed)})</li>
              <li><i className="fb-kept" />Gains que vous gardez</li>
              <li><i className="fb-lost" />Pris par les frais</li>
            </ul>
            <ul className="fb-list">
              <FeeBar label="Sans aucun frais (référence)" r={base} scale={scale} reference />
              {res.map((r, i) => <FeeBar key={i} label={`Frais de ${fmtPct(r.fees)} par an`} r={r} scale={scale} />)}
            </ul>
          </figure>
          <Fold title="Voir l'évolution année par année">
            <LineChart
              title="Capital selon le niveau de frais annuels"
              xLabels={base.series.map((_, i) => `An ${i}`)}
              format={fmtEur}
              series={res.map((r, i) => ({ name: `Frais ${fmtPct(r.fees)}`, color: COLORS[i], values: r.series }))}
            />
          </Fold>
          <p className="muted small">
            Le coût des frais est la différence avec le capital obtenu sans frais, à versements et rendement brut identiques. Il ne tient compte
            ni de la fiscalité ni des écarts de performance entre produits.
          </p>
          <SavedSims simKey="frais" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <Disclaimer />
          <SimFaq slug="frais" />
        </section>
      </div>
    </>
  );
}
