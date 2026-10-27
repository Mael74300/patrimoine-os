import { Link } from 'react-router-dom';
import { fmtEur, fmtPct, monthlyByDuration, monthlyByRate, savingsGoal } from '../lib/finance';
import { LIVRETS, LIVRETS_AS_OF, LIVRETS_PERIOD } from '../data/livrets';
import { Crumbs, Disclaimer, Kpi, LineChart, NumberField, PageHead, SavedSims, usePersistentState } from '../components/ui';

type State = { target: number; current: number; years: number; annualRate: number };

const DEFAULTS: State = { target: 20000, current: 2000, years: 5, annualRate: 0.017 };
const LIVRET_A = LIVRETS.find((l) => l.id === 'livretA')!;

export default function SimObjectif() {
  const [s, setS, up] = usePersistentState<State>('objectif-epargne', DEFAULTS);
  const r = savingsGoal(s);
  const n = r.series.length - 1;
  const rates = [0, LIVRET_A.rate, 0.03, 0.05];
  const byRate = monthlyByRate(s, rates);
  const byYears = monthlyByDuration(s, [2, 3, 5, 10, 15]);

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Objectif d’épargne' }]} />
      <PageHead eyebrow="Simulateur" title="Objectif d’épargne : combien verser par mois">
        Apport, voyage, travaux, véhicule : indiquez le montant et l’échéance, le simulateur calcule le versement mensuel à prévoir.
      </PageHead>
      <p className="notice" role="note">
        Le taux saisi est une hypothèse, pas une garantie. Pour un projet à échéance courte, l’épargne reste disponible sur un livret ; sur plusieurs années,
        un placement plus risqué peut rapporter plus mais aussi moins. Gardez d’abord une <Link to="/simulateurs/epargne-de-precaution">épargne de précaution</Link>
        {' '}et vérifiez votre capacité d’épargne avec le <Link to="/simulateurs/budget">budget mensuel</Link>.
      </p>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Votre projet</legend>
            <NumberField label="Montant à atteindre" unit="€" value={s.target} onChange={up('target')} min={0} step={500} />
            <NumberField label="Épargne déjà mise de côté" unit="€" value={s.current} onChange={up('current')} min={0} step={500} />
            <NumberField label="Échéance" unit="ans" value={s.years} onChange={up('years')} min={0} max={60} step={1} />
            <NumberField label="Rendement annuel net" unit="%" percent value={s.annualRate} onChange={up('annualRate')} min={-5} max={20} step={0.1} hint={`Hypothèse. Livret A : ${fmtPct(LIVRET_A.rate)} ${LIVRETS_PERIOD}.`} />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
        </form>
        <section aria-label="Résultats">
          <div className="kpis">
            <Kpi label="Versement mensuel nécessaire" value={fmtEur(r.monthly)} sub={r.monthly === 0 ? 'objectif déjà couvert par l’épargne de départ' : `pendant ${r.months} mois, versements en fin de mois`} />
            <Kpi label="Total des versements" value={fmtEur(r.deposits)} sub={`en plus des ${fmtEur(s.current)} déjà épargnés`} />
            <Kpi label="Intérêts attendus" value={fmtEur(r.interest)} sub={`soit ${fmtPct(r.interestShare)} de l'objectif`} />
          </div>
          <h2>Progression vers l’objectif</h2>
          <LineChart
            title="Solde de l'épargne à la fin de chaque année"
            xLabels={r.series.map((_, i) => `An ${i}`)}
            format={fmtEur}
            series={[{ name: 'Solde', color: 'var(--chart-1)', values: r.series }]}
          />
          <p className="muted small">Échéance : {n} an{n > 1 ? 's' : ''}.</p>
          <h2>Effet de la durée</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th scope="col">Échéance</th><th scope="col" className="r">Versement mensuel</th></tr></thead>
              <tbody>
                {byYears.map((d) => (
                  <tr key={d.years}><th scope="row">{d.years} ans</th><td className="r">{fmtEur(d.monthly)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <h2>Effet du taux</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th scope="col">Rendement annuel</th><th scope="col" className="r">Versement mensuel</th></tr></thead>
              <tbody>
                {byRate.map((d) => (
                  <tr key={d.rate}><th scope="row">{fmtPct(d.rate)}{d.rate === LIVRET_A.rate ? ' (taux du Livret A)' : d.rate === 0 ? ' (sans rémunération)' : ''}</th><td className="r">{fmtEur(d.monthly)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted small">
            Taux du Livret A {LIVRETS_PERIOD}, vérifié au {LIVRETS_AS_OF} (<Link to="/encyclopedie/livret-a">fiche Livret A</Link>). Intérêts calculés au taux mensuel équivalent,
            avant impôt et prélèvements éventuels. Pour l’effet de l’inflation sur le montant visé, voir le <Link to="/simulateurs/inflation">simulateur d’inflation</Link>.
          </p>
          <SavedSims simKey="objectif-epargne" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
        </section>
      </div>
    </>
  );
}
