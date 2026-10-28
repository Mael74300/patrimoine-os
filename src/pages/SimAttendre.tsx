import { Link } from 'react-router-dom';
import { delayCost, fmtEur } from '../lib/finance';
import { Crumbs, Disclaimer, SimFaq, Kpi, NumberField, PageHead, SavedSims, usePersistentState } from '../components/ui';

type State = { monthly: number; annualReturn: number; years: number; delayYears: number };

// Exemple fictif : toutes les valeurs sont des hypothèses à remplacer par les vôtres.
const DEFAULTS: State = { monthly: 200, annualReturn: 5, years: 25, delayYears: 5 };

export default function SimAttendre() {
  const [s, setS, up] = usePersistentState<State>('attendre', DEFAULTS);
  const r = delayCost({ monthly: s.monthly, annualReturn: s.annualReturn / 100, years: s.years, delayYears: s.delayYears });

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Coût d’attendre pour épargner' }]} />
      <PageHead eyebrow="Simulateur" title="Commencer à épargner plus tard : combien cela coûte-t-il ?">
        Compare le capital obtenu en épargnant tout de suite ou après un délai, avec le même versement mensuel et la même date d’arrivée, et le versement nécessaire pour rattraper le retard.
      </PageHead>
      <p className="notice" role="note">
        Calcul fondé uniquement sur les hypothèses que vous saisissez, sans chiffre réglementaire ni prévision. Le rendement est supposé constant, avant frais, impôts et inflation.
        Voir aussi les <Link to="/simulateurs/patrimoine">projections de patrimoine</Link> et l’<Link to="/simulateurs/objectif-epargne">objectif d’épargne</Link>.
      </p>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Votre épargne</legend>
            <NumberField label="Versement mensuel" unit="€" value={s.monthly} onChange={up('monthly')} min={0} step={50} />
            <NumberField label="Rendement annuel supposé" unit="%" value={s.annualReturn} onChange={up('annualReturn')} min={-50} max={50} step={0.5} />
          </fieldset>
          <fieldset>
            <legend>Calendrier</legend>
            <NumberField label="Horizon d’arrivée" unit="ans" value={s.years} onChange={up('years')} min={1} max={80} step={1} />
            <NumberField label="Délai avant de commencer" unit="ans" value={s.delayYears} onChange={up('delayYears')} min={0} max={80} step={0.5} />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
        </form>
        <section aria-label="Résultats">
          <div className="kpis">
            <Kpi label="Capital en commençant tout de suite" value={fmtEur(r.startNow)} sub={`${fmtEur(r.investedNow)} versés`} />
            <Kpi label="Capital en commençant après le délai" value={fmtEur(r.startLater)} sub={`${fmtEur(r.investedLater)} versés`} />
            <Kpi label="Coût de l’attente" value={fmtEur(r.cost)} sub="capital en moins à l’arrivée" />
            <Kpi label="Versement pour rattraper" value={r.catchUpMonthly === null ? '—' : fmtEur(r.catchUpMonthly)} sub="par mois après le délai, pour le même capital" />
          </div>
          <p className="muted small">
            Les versements ont lieu en fin de mois. Attendre fait perdre les versements des mois d’attente et les intérêts qu’ils auraient produits jusqu’à l’arrivée : plus le délai est long par rapport à l’horizon, plus l’écart est grand.
            Si le délai atteint l’horizon, aucun versement n’est possible et le rattrapage n’est pas défini. Les exemples ci-dessus sont fictifs.
          </p>
          <SavedSims simKey="attendre" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
          <SimFaq slug="cout-d-attendre-pour-epargner" />
        </section>
      </div>
    </>
  );
}
