import { Link } from 'react-router-dom';
import { performance, fmtEur, fmtPct } from '../lib/finance';
import { performanceTakeaway } from '../lib/takeaways';
import { Crumbs, Disclaimer, SimFaq, Takeaway, Kpi, NumberField, PageHead, SavedSims, usePersistentState } from '../components/ui';

type State = { initial: number; monthly: number; years: number; finalValue: number };

// Exemple fictif : toutes les valeurs sont des hypothèses à remplacer par les vôtres.
const DEFAULTS: State = { initial: 5000, monthly: 200, years: 10, finalValue: 34000 };

export default function SimRendement() {
  const [s, setS, up] = usePersistentState<State>('rendement', DEFAULTS);
  const r = performance({ initial: s.initial, monthly: s.monthly, months: Math.round(s.years * 12), finalValue: s.finalValue });

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Rendement réel de mon placement' }]} />
      <PageHead eyebrow="Simulateur" title="Rendement réel de mon placement : quel taux annuel ai-je obtenu ?">
        À partir de ce que vous avez versé et de la valeur actuelle, calcule le rendement annuel équivalent (taux de rendement interne), en tenant compte de la date de chaque versement.
      </PageHead>
      <p className="notice" role="note">
        Calcul fondé uniquement sur les montants que vous saisissez, sans chiffre réglementaire ni prévision. Le résultat est un rendement passé, avant impôt sauf si la valeur saisie est déjà nette.
        Voir aussi les <Link to="/simulateurs/patrimoine">projections de patrimoine</Link> et l’<Link to="/simulateurs/inflation">inflation</Link>.
      </p>
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
        </form>
        <section aria-label="Résultats">
          <div className="kpis">
            <Kpi label="Rendement annuel équivalent" value={r.annualized === null ? '—' : fmtPct(r.annualized)} sub="taux de rendement interne" />
            <Kpi label="Total versé" value={fmtEur(r.invested)} sub="versement initial + versements mensuels" />
            <Kpi label="Gain ou perte" value={fmtEur(r.gain)} sub={r.cumulative === null ? '' : `${fmtPct(r.cumulative)} du total versé, non annualisé`} />
          </div>
          <Takeaway>{performanceTakeaway({ invested: r.invested, gain: r.gain, annualized: r.annualized })}</Takeaway>
          <p className="muted small">
            Le versement initial est placé au début, chaque versement mensuel en fin de mois. Le rendement cumulé (gain divisé par le total versé) ne tient pas compte du temps : le rendement annuel équivalent est le taux qui, appliqué à chaque versement pendant la durée qu’il est resté placé, redonne la valeur actuelle.
            Si rien n’a été versé ou si la durée est nulle, le rendement annuel n’est pas défini. Les exemples ci-dessus sont fictifs.
          </p>
          <SavedSims simKey="rendement" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
          <SimFaq slug="rendement-reel-de-mon-placement" />
        </section>
      </div>
    </>
  );
}
