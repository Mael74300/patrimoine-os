import { Link } from 'react-router-dom';
import { lumpVsGradual, lumpVsGradualByPath, gapBarWidths, fmtEur, fmtPct, fmtMonths, type PricePath } from '../lib/finance';
import { lumpGradualTakeaway, lumpGradualPathsSummary } from '../lib/takeaways';
import { Crumbs, Disclaimer, SimFaq, Takeaway, Kpi, LineChart, NumberField, ChoiceField, PageHead, SavedSims, usePersistentState, JumpToResults, SimNotice, Fold } from '../components/ui';

type State = { amount: number; spread: number; years: number; ret: number; cash: number; path: PricePath; move: number };

// Exemple fictif : toutes les valeurs sont des hypothèses à remplacer par les vôtres.
const DEFAULTS: State = { amount: 12000, spread: 12, years: 5, ret: 0.05, cash: 0, path: 'steady', move: 0.2 };

const PATHS: { v: PricePath; label: string }[] = [
  { v: 'steady', label: 'Régulière' },
  { v: 'dip', label: 'Baisse d’abord' },
  { v: 'rise', label: 'Hausse d’abord' },
];

/** Graduation de l'axe : tous les 3 mois sur un horizon court, sinon chaque année ; toujours l'horizon en dernier. */
function axisLabel(t: number, months: number): string {
  if (t === months) return t % 12 === 0 ? `An ${t / 12}` : fmtMonths(t);
  if (months <= 24) return t % 3 === 0 ? (t === 0 ? '0' : fmtMonths(t)) : '';
  return t % 12 === 0 ? `An ${t / 12}` : '';
}

/** Ce que suppose chaque parcours, en mots simples, avec les valeurs saisies. */
function pathDetail(path: PricePath, s: State, spread: number): string {
  const ensuite = `puis ${fmtPct(s.ret)} par an`;
  if (path === 'steady') return `${fmtPct(s.ret)} par an, du premier au dernier mois`;
  return `${path === 'dip' ? 'baisse' : 'hausse'} de ${fmtPct(s.move)} pendant les ${spread}\u00a0mois d’étalement, ${ensuite}`;
}

/** Verdict court d'un écart : qui finit au-dessus, et de combien. */
function verdict(gap: number): string {
  if (Math.abs(gap) < 0.005) return 'Égalité';
  return gap > 0 ? `Étalement +${fmtEur(gap)}` : `D’un coup +${fmtEur(-gap)}`;
}

export default function SimEtalement() {
  const [s, setS, up] = usePersistentState<State>('etalement', DEFAULTS);
  const r = lumpVsGradual({ amount: s.amount, spreadMonths: s.spread, years: s.years, annualReturn: s.ret, cashRate: s.cash, path: s.path, move: s.move });
  const byPath = lumpVsGradualByPath({ amount: s.amount, spreadMonths: s.spread, years: s.years, annualReturn: s.ret, cashRate: s.cash, move: s.move });
  const bars = gapBarWidths(byPath.map((p) => p.advantageGradual));
  const nameOf = (p: PricePath) => PATHS.find((x) => x.v === p)!.label;

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Investir d’un coup ou progressivement' }]} />
      <PageHead eyebrow="Simulateur" title="Investir d’un coup ou progressivement">
        Compare un capital placé en une seule fois et le même capital placé en tranches égales sur plusieurs mois, selon le parcours de prix que vous supposez.
      </PageHead>
      <SimNotice>
        Résultat entièrement fondé sur vos hypothèses, sans aucun chiffre réglementaire et sans prévision : l’étalement ne gagne que si le prix baisse pendant la période,
        et perd si le prix monte. Avant frais et impôts. Voir aussi les <Link to="/simulateurs/patrimoine">projections de patrimoine</Link> et l’<Link to="/simulateurs/frais">impact des frais</Link>.
      </SimNotice>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Capital et durée</legend>
            <NumberField label="Capital à investir" unit="€" value={s.amount} onChange={up('amount')} min={0} step={500} />
            <NumberField label="Durée d’étalement" unit="mois" value={s.spread} onChange={up('spread')} min={1} max={120} step={1} />
            <NumberField label="Horizon d’évaluation" unit="ans" value={s.years} onChange={up('years')} min={0} max={50} step={1} />
          </fieldset>
          <fieldset>
            <legend>Hypothèses de marché</legend>
            <NumberField label="Rendement annuel du placement" unit="%" percent value={s.ret} onChange={up('ret')} min={-50} max={100} step={0.5} />
            <NumberField label="Rendement annuel de la part non investie" unit="%" percent value={s.cash} onChange={up('cash')} min={-50} max={100} step={0.5} />
            <ChoiceField label="Parcours de prix pendant l’étalement" value={s.path} options={PATHS} onChange={up('path')} compact />
            <NumberField label="Ampleur de la baisse ou de la hausse" unit="%" percent value={s.move} onChange={up('move')} min={0} max={90} step={5} />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
          <JumpToResults />
        </form>
        <section id="resultats" aria-label="Résultats" tabIndex={-1}>
          <div className="kpis">
            <Kpi label="En une seule fois" value={fmtEur(r.lump)} sub={`valeur après ${fmtMonths(r.months)}`} />
            <Kpi label="En tranches égales" value={fmtEur(r.gradual)} sub={`${r.spreadMonths}\u00a0mois d’étalement`} />
          </div>
          <Takeaway>{lumpGradualTakeaway({ amount: s.amount, spreadMonths: r.spreadMonths, months: r.months, lump: r.lump, gradual: r.gradual, advantageGradual: r.advantageGradual })}</Takeaway>
          {s.amount > 0 && (
            <>
              <h2>Qui finit au-dessus, selon ce que fait le prix</h2>
              <figure className="fb gp" aria-label="Écart entre l’étalement et l’investissement en une fois, pour chacun des trois parcours de prix">
                <div className="gp-axis" aria-hidden="true">
                  <span><i className="gp-lump" />D’un coup au-dessus</span>
                  <span>Étalement au-dessus<i className="gp-gradual" /></span>
                </div>
                <ul className="fb-list">
                  {byPath.map((p, i) => (
                    <li key={p.path} className={'fb-row gp-row' + (p.path === s.path ? ' gp-cur' : '')}>
                      <div className="fb-head">
                        <span className="fb-name">
                          {nameOf(p.path)}
                          {p.path === s.path && <span className="gp-tag">votre choix</span>}
                        </span>
                        <span className={'fb-value gp-v-' + bars[i].side}>{verdict(p.advantageGradual)}</span>
                      </div>
                      <p className="gp-detail">{pathDetail(p.path, s, r.spreadMonths)}</p>
                      <div className="gp-track" aria-hidden="true">
                        {bars[i].side !== 'none' && <span className={'gp-bar gp-' + bars[i].side} style={{ width: `${bars[i].pct / 2}%` }} />}
                      </div>
                      <p className="fb-sub">En une fois : {fmtEur(p.lump)} · en tranches : {fmtEur(p.gradual)}</p>
                    </li>
                  ))}
                </ul>
              </figure>
              <p className="gp-summary">{lumpGradualPathsSummary(byPath.map((p) => ({ name: nameOf(p.path), advantageGradual: p.advantageGradual })))}</p>
            </>
          )}
          {r.series.length > 1 && (
            <Fold title="Voir la valeur mois après mois (parcours choisi)">
              <LineChart
                showTitle
                title="Valeur des deux méthodes, mois après mois"
                xLabels={r.series.map((p) => (p.month === 0 ? 'Au départ' : `Après ${fmtMonths(p.month)}`))}
                axisLabels={r.series.map((p) => axisLabel(p.month, r.months))}
                band={r.spreadMonths > 1 ? { from: 0, to: r.spreadMonths, label: 'Étalement' } : undefined}
                format={fmtEur}
                series={[
                  { name: 'En une seule fois', color: 'var(--chart-1)', values: r.series.map((p) => p.lump) },
                  { name: 'En tranches égales', color: 'var(--chart-2)', values: r.series.map((p) => p.gradual) },
                ]}
              />
              <p className="muted small">La courbe « En une seule fois » suit le prix que vous supposez ; la zone grisée marque l’étalement.</p>
            </Fold>
          )}
          <p className="muted small">
            Une tranche est investie au début de chaque mois ; la part qui attend rapporte le rendement saisi pour elle.
            Valeurs de départ fictives : remplacez-les par les vôtres.
          </p>
          <SavedSims simKey="etalement" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
          <SimFaq slug="investir-d-un-coup-ou-progressivement" />
        </section>
      </div>
    </>
  );
}
