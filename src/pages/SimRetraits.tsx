import { Link } from 'react-router-dom';
import { withdrawal, fmtEur } from '../lib/finance';
import { withdrawalTakeaway } from '../lib/takeaways';
import { Crumbs, Disclaimer, SimFaq, Takeaway, Kpi, NumberField, PageHead, SavedSims, usePersistentState } from '../components/ui';

type State = { capital: number; monthly: number; ret: number; idx: number; years: number };

// Exemple fictif : toutes les valeurs sont des hypothèses à remplacer par les vôtres.
const DEFAULTS: State = { capital: 200000, monthly: 1000, ret: 0.03, idx: 0.02, years: 25 };

export default function SimRetraits() {
  const [s, setS, up] = usePersistentState<State>('retraits', DEFAULTS);
  const r = withdrawal({ capital: s.capital, monthly: s.monthly, annualReturn: s.ret, indexation: s.idx, years: s.years });
  const dur = r.monthsUntilEmpty;
  const durLabel = dur === null ? `Au-delà de ${s.years} ans` : `${Math.floor(dur / 12)} ans et ${dur % 12} mois`;

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Retraits réguliers et durée du capital' }]} />
      <PageHead eyebrow="Simulateur" title="Retraits réguliers : combien de temps le capital tient-il ?">
        Calcule la durée avant épuisement d’un capital dont vous retirez une somme chaque mois, le capital restant à l’horizon choisi et le retrait mensuel tenable.
      </PageHead>
      <p className="notice" role="note">
        Résultat entièrement fondé sur vos hypothèses (rendement et revalorisation supposés constants), sans chiffre réglementaire ni prévision, avant frais et impôts.
        Voir aussi l’<Link to="/simulateurs/independance-financiere">indépendance financière</Link> et les <Link to="/simulateurs/inflation">effets de l’inflation</Link>.
      </p>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Capital et retraits</legend>
            <NumberField label="Capital de départ" unit="€" value={s.capital} onChange={up('capital')} min={0} step={1000} />
            <NumberField label="Premier retrait mensuel" unit="€" value={s.monthly} onChange={up('monthly')} min={0} step={50} />
            <NumberField label="Horizon d’observation" unit="ans" value={s.years} onChange={up('years')} min={1} max={80} step={1} />
          </fieldset>
          <fieldset>
            <legend>Hypothèses</legend>
            <NumberField label="Rendement annuel du capital" unit="%" percent value={s.ret} onChange={up('ret')} min={-50} max={100} step={0.5} />
            <NumberField label="Revalorisation annuelle du retrait" unit="%" percent value={s.idx} onChange={up('idx')} min={-50} max={100} step={0.5} />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
        </form>
        <section aria-label="Résultats">
          <div className="kpis">
            <Kpi label="Durée du capital" value={durLabel} sub={dur === null ? 'le capital n’est pas épuisé à l’horizon' : 'avant épuisement'} />
            <Kpi label="Capital restant à l’horizon" value={fmtEur(r.remaining)} sub={`après ${s.years} ans`} />
            <Kpi label="Retrait mensuel tenable" value={fmtEur(r.sustainable)} sub="premier retrait maximal jusqu’à l’horizon" />
          </div>
          <Takeaway>{withdrawalTakeaway({ capital: s.capital, monthly: s.monthly, years: s.years, monthsUntilEmpty: r.monthsUntilEmpty, remaining: r.remaining, totalWithdrawn: r.totalWithdrawn, sustainable: r.sustainable })}</Takeaway>
          <p className="muted small">
            Le rendement est appliqué chaque mois, puis le retrait est prélevé en fin de mois ; le retrait est revalorisé chaque année du taux saisi.
            Total retiré sur la période : {fmtEur(r.totalWithdrawn)}. Les exemples ci-dessus sont fictifs.
          </p>
          <SavedSims simKey="retraits" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
          <SimFaq slug="retraits-reguliers-duree-du-capital" />
        </section>
      </div>
    </>
  );
}
