import { Link } from 'react-router-dom';
import { fmtEur, fmtPct, goalByDuration, goalScale, goalSplit, monthlyByRate, savingsGoal, type GoalDurationRow } from '../lib/finance';
import { savingsGoalTakeaway } from '../lib/takeaways';
import { LIVRETS, LIVRETS_AS_OF, LIVRETS_PERIOD } from '../data/livrets';
import { Crumbs, Disclaimer, SimFaq, Takeaway, Kpi, LineChart, NumberField, PageHead, SavedSims, usePersistentState, JumpToResults, SimNotice, Fold } from '../components/ui';

type State = { target: number; current: number; years: number; annualRate: number };

const DEFAULTS: State = { target: 20000, current: 2000, years: 5, annualRate: 0.017 };
const LIVRET_A = LIVRETS.find((l) => l.id === 'livretA')!;
const DURATIONS = [2, 3, 5, 10, 15];

/** Une barre par échéance : épargne de départ, versements et intérêts, à la même échelle pour toutes. */
function GoalBar({ row, scale, mine }: { row: GoalDurationRow; scale: number; mine: boolean }) {
  const b = goalSplit(row, scale);
  const label = `${row.years}\u00a0an${row.years > 1 ? 's' : ''}`;
  const sub = row.monthly === 0
    ? `aucun versement : l’épargne de départ suffit${row.interest > 0 ? `, intérêts ${fmtEur(row.interest)}` : ''}`
    : row.interest >= 0
      ? `versements ${fmtEur(row.deposits)} · intérêts ${fmtEur(row.interest)}`
      : `versements ${fmtEur(row.deposits)} · pertes ${fmtEur(-row.interest)}`;
  return (
    <li className={'fb-row' + (mine ? ' gb-mine' : '')}>
      <div className="fb-head">
        <span className="fb-name">{label}{mine && <span className="gb-tag">votre échéance</span>}</span>
        <span className="fb-value">{row.monthly === 0 ? '0\u00a0€' : fmtEur(row.monthly)} <span className="gb-unit">par mois</span></span>
      </div>
      <div className="fb-track" aria-hidden="true">
        {b.current > 0 && <span className="gb-start" style={{ width: `${b.current}%` }} />}
        {b.deposits > 0 && <span className="gb-dep" style={{ width: `${b.deposits}%` }} />}
        {b.interest > 0 && <span className="gb-int" style={{ width: `${b.interest}%` }} />}
        {b.lost > 0 && <span className="fb-lost" style={{ width: `${b.lost}%` }} />}
      </div>
      <p className="fb-sub">{sub}</p>
    </li>
  );
}

export default function SimObjectif() {
  const [s, setS, up] = usePersistentState<State>('objectif-epargne', DEFAULTS);
  const r = savingsGoal(s);
  const n = r.series.length - 1;
  const rates = [0, LIVRET_A.rate, 0.03, 0.05];
  const byRate = monthlyByRate(s, rates);
  const durations = n >= 1 && !DURATIONS.includes(n) ? [...DURATIONS, n].sort((a, b) => a - b) : DURATIONS;
  const rows = goalByDuration(s, durations);
  const scale = goalScale(rows);
  const hasLoss = rows.some((row) => row.interest < 0);
  const contributed = r.series.map((_, i) => s.current + r.monthly * 12 * i);

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Objectif d’épargne' }]} />
      <PageHead eyebrow="Simulateur" title="Objectif d’épargne : combien verser par mois">
        Apport, voyage, travaux, véhicule : indiquez le montant et l’échéance, le simulateur calcule le versement mensuel à prévoir.
      </PageHead>
      <SimNotice>
        Le taux saisi est une hypothèse, pas une garantie. Pour un projet à échéance courte, l’épargne reste disponible sur un livret ; sur plusieurs années,
        un placement plus risqué peut rapporter plus mais aussi moins. Gardez d’abord une <Link to="/simulateurs/epargne-de-precaution">épargne de précaution</Link>
        {' '}et vérifiez votre capacité d’épargne avec le <Link to="/simulateurs/budget">budget mensuel</Link>.
      </SimNotice>
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
          <JumpToResults />
        </form>
        <section id="resultats" aria-label="Résultats" tabIndex={-1}>
          <div className="kpis">
            <Kpi label="Versement mensuel nécessaire" value={fmtEur(r.monthly)} sub={r.monthly === 0 ? 'objectif déjà couvert par l’épargne de départ' : `pendant ${r.months}\u00a0mois, versements en fin de mois`} />
            <Kpi label="Total des versements" value={fmtEur(r.deposits)} sub={`en plus des ${fmtEur(s.current)} déjà épargnés`} />
            <Kpi label="Intérêts attendus" value={fmtEur(r.interest)} sub={`soit ${fmtPct(r.interestShare)} de l'objectif`} />
          </div>
          <Takeaway>{savingsGoalTakeaway({ target: s.target, current: s.current, years: n, monthly: r.monthly, deposits: r.deposits, interest: r.interest })}</Takeaway>
          <h2>Ce que changent quelques années de plus</h2>
          <p className="fb-intro">
            {hasLoss
              ? <>Chaque barre montre ce que vous mettez de côté pour atteindre {fmtEur(s.target)}. Avec un rendement négatif, une partie est perdue (hachures).</>
              : <>Chaque barre mesure le montant visé ({fmtEur(s.target)}) et montre d’où il vient.</>}
          </p>
          <figure className="fb">
            <ul className="fb-legend" aria-hidden="true">
              <li><i className="gb-start" />Déjà épargné ({fmtEur(s.current)})</li>
              <li><i className="gb-dep" />Vos versements</li>
              {hasLoss ? <li><i className="fb-lost" />Pertes</li> : <li><i className="gb-int" />Intérêts</li>}
            </ul>
            <ul className="fb-list">
              {rows.map((row) => <GoalBar key={row.years} row={row} scale={scale} mine={row.years === n} />)}
            </ul>
          </figure>
          <Fold title="Voir le solde année par année">
            <LineChart
              title="Solde de l'épargne à la fin de chaque année"
              xLabels={r.series.map((_, i) => `An ${i}`)}
              format={fmtEur}
              series={[
                { name: 'Solde', color: 'var(--chart-1)', values: r.series },
                { name: 'Mis de côté (départ + versements)', color: 'var(--chart-3)', values: contributed },
              ]}
            />
            <p className="muted small">L’écart entre les deux courbes correspond aux intérêts gagnés (ou aux pertes si le rendement est négatif).</p>
          </Fold>
          <h2>Effet du taux</h2>
          <div className="table-wrap" tabIndex={0}>
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
          <SimFaq slug="objectif-epargne" />
        </section>
      </div>
    </>
  );
}
