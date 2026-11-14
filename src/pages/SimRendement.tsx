import { Link } from 'react-router-dom';
import { performance, performanceSegments, fmtAns, fmtEur, fmtPct } from '../lib/finance';
import { performanceTakeaway } from '../lib/takeaways';
import { Crumbs, Disclaimer, SimFaq, Takeaway, Kpi, NumberField, PageHead, SavedSims, usePersistentState, JumpToResults, SimNotice } from '../components/ui';

type State = { initial: number; monthly: number; years: number; finalValue: number };

// Exemple fictif : toutes les valeurs sont des hypothèses à remplacer par les vôtres.
const DEFAULTS: State = { initial: 5000, monthly: 200, years: 10, finalValue: 34000 };

export default function SimRendement() {
  const [s, setS, up] = usePersistentState<State>('rendement', DEFAULTS);
  const input = { initial: s.initial, monthly: s.monthly, months: Math.round(s.years * 12), finalValue: s.finalValue };
  const r = performance(input);
  const segs = performanceSegments(input);
  const segHint: Record<string, string> = {
    initial: ', placé dès le début',
    monthly: ` (${fmtEur(s.monthly)} par mois, ${fmtAns(Math.round(s.years * 12) / 12)})`,
    gain: ' rapportés par le placement',
    value: ' aujourd’hui',
    loss: ' par rapport au total versé',
  };

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Rendement réel de mon placement' }]} />
      <PageHead eyebrow="Simulateur" title="Rendement réel de mon placement : quel taux annuel ai-je obtenu ?">
        À partir de ce que vous avez versé et de la valeur actuelle, calcule le rendement annuel équivalent (taux de rendement interne), en tenant compte de la date de chaque versement.
      </PageHead>
      <SimNotice>
        Calcul fondé uniquement sur les montants que vous saisissez, sans chiffre réglementaire ni prévision. Le résultat est un rendement passé, avant impôt sauf si la valeur saisie est déjà nette.
        Voir aussi les <Link to="/simulateurs/patrimoine">projections de patrimoine</Link> et l’<Link to="/simulateurs/inflation">inflation</Link>.
      </SimNotice>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Ce que vous avez versé</legend>
            <NumberField label="Versement initial" unit="€" value={s.initial} onChange={up('initial')} min={0} step={500} />
            <NumberField label="Versement mensuel" unit="€" value={s.monthly} onChange={up('monthly')} min={0} step={50} />
            <NumberField label="Durée écoulée" unit="ans" value={s.years} onChange={up('years')} min={0} max={80} step={0.5} />
          </fieldset>
          <fieldset>
            <legend>Valeur actuelle</legend>
            <NumberField label="Valeur du placement aujourd’hui" unit="€" value={s.finalValue} onChange={up('finalValue')} min={0} step={500} />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
          <JumpToResults />
        </form>
        <section id="resultats" aria-label="Résultats" tabIndex={-1}>
          <div className="kpis">
            <Kpi label="Rendement annuel équivalent" value={r.annualized === null ? '—' : fmtPct(r.annualized)} sub="par an, en moyenne" />
            <Kpi label="Total versé" value={fmtEur(r.invested)} sub="initial et mensuels" />
            <Kpi label="Gain ou perte" value={fmtEur(r.gain)} sub={r.cumulative === null ? '' : `soit ${fmtPct(r.cumulative)} du total versé`} />
          </div>
          <Takeaway>{performanceTakeaway({ invested: r.invested, gain: r.gain, annualized: r.annualized })}</Takeaway>
          {segs.length > 0 && (
            <>
              <h2>D’où vient la valeur actuelle</h2>
              <figure className="bb">
                <div className="bb-bar" role="img" aria-label={segs.map((x) => `${x.label} ${fmtEur(x.amount)}`).join(', ')}>
                  {segs.map((x) => <span key={x.key} className={'bb-seg pf-' + x.key} style={{ width: `${x.width}%` }} />)}
                </div>
              </figure>
              <ul className="pf-legend" aria-label="Détail de la barre">
                {segs.map((x) => (
                  <li key={x.key}>
                    <i className={'bb-dot pf-' + x.key} aria-hidden="true" />
                    <span><strong>{x.label}</strong> : {fmtEur(x.amount)}{segHint[x.key]}</span>
                  </li>
                ))}
              </ul>
              {r.annualized !== null && r.cumulative !== null && (
                <p className="pf-why">
                  <strong>Pourquoi deux taux ?</strong> {fmtPct(r.cumulative)} compare le gain au total versé, sur toute la durée.
                  {' '}{fmtPct(r.annualized)} par an ramène ce résultat à une année, en tenant compte du temps passé placé par chaque versement : les premiers euros ont travaillé plus longtemps que les derniers.
                </p>
              )}
            </>
          )}
          {r.annualized === null && <p className="muted small">Indiquez un versement et une durée pour obtenir un rendement annuel.</p>}
          <p className="muted small">Calcul : versement initial placé au début, versements mensuels en fin de mois. L’exemple proposé au départ est fictif.</p>
          <SavedSims simKey="rendement" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <Disclaimer />
          <SimFaq slug="rendement-reel-de-mon-placement" />
        </section>
      </div>
    </>
  );
}
