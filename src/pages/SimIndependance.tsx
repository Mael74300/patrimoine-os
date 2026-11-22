import { useMemo } from 'react';
import { drawdown, fireTarget, fmtAns, fmtEur, fmtPct, fmtYears, holdBars, yearsToTarget, type FireInput, type HoldBar } from '../lib/finance';
import { fireTakeaway } from '../lib/takeaways';
import { SchemaCapitalVise } from '../components/schemas/SchemaCapitalVise';
import { Crumbs, Disclaimer, SimFaq, Takeaway, Kpi, NumberField, PageHead, SavedSims, usePersistentState, JumpToResults, SimNotice } from '../components/ui';

const DEFAULTS: FireInput = {
  annualExpenses: 30000, currentWealth: 80000, recurringIncome: 0, annualSavings: 15000,
  nominalReturn: 0.05, inflation: 0.02, withdrawalRate: 0.035,
};
const RATES = [0.03, 0.035, 0.04, 0.045];
/** Écarts de rendement testés autour de l'hypothèse saisie, et horizon de la phase de retrait (le même que la colonne « Capital tient »). */
const SPREAD = [-0.02, 0, 0.02];
const HORIZON = 60;

/** Combien de temps tient le capital selon le rendement : une barre par hypothèse, sur la même échelle de 60 ans. */
function HoldFigure({ bars, current }: { bars: HoldBar[]; current: number }) {
  return (
    <figure className="fb hb">
      <ul className="fb-list">
        {bars.map((b) => {
          const mine = b.nominalReturn === current;
          const verdict = b.depletedAt === null ? `tient plus de ${HORIZON}\u00a0ans` : `épuisé en ${b.depletedAt}\u00a0ans`;
          return (
            <li className={`fb-row${mine ? ' hb-mine' : ''}`} key={b.nominalReturn}>
              <div className="fb-head">
                <span className="fb-name">Rendement {fmtPct(b.nominalReturn)}{mine && <span className="hb-tag">le vôtre</span>}</span>
                <span className="fb-value">{verdict}</span>
              </div>
              <div className="fb-track" role="img" aria-label={`Rendement ${fmtPct(b.nominalReturn)} : ${verdict}`}>
                <span className={b.depletedAt === null ? 'hb-long' : 'hb-short'} style={{ width: `${b.pct}%` }} />
              </div>
              {b.depletedAt === null && (
                <p className="fb-sub">Il reste {fmtEur(b.remainingReal)} au bout de {HORIZON}&nbsp;ans, en euros d’aujourd’hui.</p>
              )}
            </li>
          );
        })}
      </ul>
      <div className="hb-axis" aria-hidden="true">{[0, 20, 40, HORIZON].map((y) => <span key={y} style={{ left: `${(100 * y) / HORIZON}%` }}>{y ? `${y}\u00a0ans` : '0'}</span>)}</div>
      <figcaption className="fb-sub hb-caption">
        Rendement supposé constant : en réalité il varie, et de mauvaises années au début des retraits peuvent épuiser le capital plus vite. Montants par défaut fictifs.
      </figcaption>
    </figure>
  );
}

export default function SimIndependance() {
  const [s, setS, up] = usePersistentState<FireInput>('independance', DEFAULTS);
  const target = fireTarget(s.annualExpenses, s.recurringIncome, s.withdrawalRate);
  const yrs = useMemo(() => yearsToTarget(s), [s]);
  const rates = useMemo(() => Array.from(new Set([...RATES, s.withdrawalRate])).sort((a, b) => a - b), [s.withdrawalRate]);
  const startCapital = Number.isFinite(target) && target > 0 ? target : s.currentWealth;
  const gap = Math.max(0, s.annualExpenses - s.recurringIncome);
  // Phase de retrait de votre scénario : même calcul que la barre « le vôtre » et la ligne en gras du tableau.
  const lasts = useMemo(() => drawdown(startCapital, s, HORIZON).depletedAt, [s, startCapital]);
  const bars = useMemo(
    () => holdBars(startCapital, s, SPREAD.map((d) => s.nominalReturn + d), HORIZON),
    [s, startCapital],
  );

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Indépendance financière' }]} />
      <PageHead eyebrow="Simulateur" title="Simulateur d'indépendance financière">
        Estimez le capital qui couvrirait vos dépenses par des retraits réguliers, le temps pour l'atteindre et sa résistance à plusieurs hypothèses de rendement.
      </PageHead>
      <SimNotice>
        Aucun taux de retrait ne garantit une indépendance financière durable. Les rendements obtenus varient d'une année à l'autre, et une succession
        de mauvaises années au début des retraits peut épuiser un capital plus vite que prévu.
      </SimNotice>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Situation</legend>
            <div className="field-duo">
              <NumberField label="Dépenses annuelles" unit="€" value={s.annualExpenses} onChange={up('annualExpenses')} min={0} step={1000} />
              <NumberField label="Épargne annuelle" unit="€" value={s.annualSavings} onChange={up('annualSavings')} min={0} step={1000} />
            </div>
            <NumberField label="Patrimoine disponible" unit="€" value={s.currentWealth} onChange={up('currentWealth')} min={0} step={5000} hint="Placements mobilisables, hors résidence principale." />
            <NumberField label="Revenus récurrents" unit="€/an" value={s.recurringIncome} onChange={up('recurringIncome')} min={0} step={1000} hint="Loyers nets, pension, autres revenus hors travail." />
          </fieldset>
          <fieldset>
            <legend>Hypothèses</legend>
            <div className="field-duo">
              <NumberField label="Rendement annuel espéré" unit="%" percent value={s.nominalReturn} onChange={up('nominalReturn')} step={0.25} min={-5} max={15} hint="Avant inflation, jamais garanti." />
              <NumberField label="Inflation annuelle" unit="%" percent value={s.inflation} onChange={up('inflation')} step={0.25} min={-2} max={10} hint="Hausse moyenne des prix." />
            </div>
            <NumberField label="Taux de retrait" unit="%" percent value={s.withdrawalRate} onChange={up('withdrawalRate')} step={0.25} min={0.5} max={10} hint="Part du capital retirée la première année." />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
          <JumpToResults />
        </form>
        <section id="resultats" aria-label="Résultats" tabIndex={-1}>
          <div className="kpis">
            <Kpi label="Capital visé" value={Number.isFinite(target) ? fmtEur(target) : '—'} sub={`en retirant ${fmtPct(s.withdrawalRate)} la première année`} />
            <Kpi label="Délai estimé" value={fmtYears(yrs)} sub="épargne et dépenses suivant la hausse des prix" />
            {gap > 0 && (
              <Kpi label="Puis le capital dure" value={lasts === null ? `plus de ${HORIZON}\u00a0ans` : fmtAns(lasts)} sub={`en retirant, à ${fmtPct(s.nominalReturn)} de rendement par an`} />
            )}
          </div>
          <Takeaway>{fireTakeaway({ gap, withdrawalRate: s.withdrawalRate, target, currentWealth: s.currentWealth, annualSavings: s.annualSavings, years: yrs, nominalReturn: s.nominalReturn, lastsYears: lasts, horizon: HORIZON })}</Takeaway>

          <details className="fold">
            <summary>Comprendre le capital visé (schéma)</summary>
            <SchemaCapitalVise />
          </details>

          <h2>Selon le taux de retrait</h2>
          <p className="muted">Retirer moins demande un plus gros capital, qui dure plus longtemps.</p>
          <div className="table-wrap" tabIndex={0}>
            <table>
              <thead><tr><th>Retrait</th><th className="r">Capital</th><th className="r">Délai</th><th className="r">Puis il dure</th></tr></thead>
              <tbody>
                {rates.map((w) => {
                  const t = fireTarget(s.annualExpenses, s.recurringIncome, w);
                  const d = drawdown(t, s, HORIZON).depletedAt;
                  return (
                    <tr key={w} style={w === s.withdrawalRate ? { fontWeight: 600 } : undefined}>
                      <td>{fmtPct(w)}</td>
                      <td className="r">{Number.isFinite(t) ? fmtEur(t) : '—'}</td>
                      <td className="r">{fmtYears(yearsToTarget({ ...s, withdrawalRate: w }))}</td>
                      <td className="r">{d === null ? `plus de ${HORIZON}\u00a0ans` : `${d}\u00a0ans`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <h2>Combien de temps tient le capital ?</h2>
          {gap > 0 ? (<>
            <p className="muted small">
              Départ avec {fmtEur(startCapital)}, retrait de {fmtEur(gap)} la première année, augmenté ensuite de l’inflation ({fmtPct(s.inflation)} par an).
            </p>
            <HoldFigure bars={bars} current={s.nominalReturn} />
          </>) : (
            <p className="muted small">Vos revenus récurrents couvrent déjà vos dépenses : aucun retrait n’est nécessaire.</p>
          )}
          <SavedSims simKey="independance" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
        </section>
      </div>
      <Disclaimer />
      <SimFaq slug="independance-financiere" />
    </>
  );
}
