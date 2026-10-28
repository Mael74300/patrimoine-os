import { Link } from 'react-router-dom';
import { presentValue, fmtEur } from '../lib/finance';
import { Crumbs, Disclaimer, SimFaq, Kpi, NumberField, PageHead, SavedSims, usePersistentState } from '../components/ui';

type State = { target: number; years: number; ratePct: number; monthly: number };

// Exemple fictif : toutes les valeurs sont des hypothèses à remplacer par les vôtres.
const DEFAULTS: State = { target: 30000, years: 10, ratePct: 4, monthly: 100 };

export default function SimCapitalAPlacer() {
  const [s, setS, up] = usePersistentState<State>('capital-a-placer', DEFAULTS);
  const r = presentValue({ target: s.target, years: s.years, annualRate: s.ratePct / 100, monthly: s.monthly });

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Capital à placer aujourd’hui' }]} />
      <PageHead eyebrow="Simulateur" title="Combien placer aujourd’hui pour atteindre un capital ?">
        Indiquez le capital visé, la durée, un rendement annuel supposé et, si besoin, un versement mensuel : le simulateur calcule la somme à placer dès maintenant.
      </PageHead>
      <p className="notice" role="note">
        Calcul fondé uniquement sur les hypothèses que vous saisissez, sans chiffre réglementaire ni prévision. Le rendement est supposé constant, avant frais, impôts et inflation, et n’est jamais garanti.
        Pour trouver le rendement exigé par un objectif, voir le <Link to="/simulateurs/rendement-necessaire-pour-atteindre-un-objectif">rendement nécessaire</Link>.
      </p>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Votre objectif</legend>
            <NumberField label="Capital visé" unit="€" value={s.target} onChange={up('target')} min={0} step={1000} />
            <NumberField label="Durée" unit="ans" value={s.years} onChange={up('years')} min={1} max={100} step={1} />
            <NumberField label="Rendement annuel supposé" unit="%" value={s.ratePct} onChange={up('ratePct')} min={-50} max={100} step={0.5} />
            <NumberField label="Versement mensuel prévu" unit="€" value={s.monthly} onChange={up('monthly')} min={0} step={50} />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
        </form>
        <section aria-label="Résultats">
          <div className="kpis">
            <Kpi label="Capital à placer aujourd’hui" value={fmtEur(r.initial)} sub={r.noInitialNeeded ? 'vos versements mensuels suffisent' : 'somme unique, placée dès maintenant'} />
            <Kpi label="Total versé" value={fmtEur(r.contributed)} sub="capital à placer et versements mensuels" />
            <Kpi label="Gain dans cette hypothèse" value={fmtEur(r.gain)} sub="objectif moins total versé" />
          </div>
          <p className="muted small">
            Avec r = (1 + R)^(1/12) − 1 et n le nombre de mois : capital à placer = (capital visé − versement × ((1 + r)^n − 1) / r) / (1 + r)^n, et jamais moins de 0 €.
            Les montants par défaut sont fictifs.
          </p>
          <SavedSims simKey="capital-a-placer" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
          <SimFaq slug="capital-a-placer-aujourd-hui" />
        </section>
      </div>
    </>
  );
}
