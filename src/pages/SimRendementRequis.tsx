import { Link } from 'react-router-dom';
import { requiredReturn, fmtEur, fmtPct } from '../lib/finance';
import { Crumbs, Disclaimer, SimFaq, Kpi, NumberField, PageHead, SavedSims, usePersistentState } from '../components/ui';

type State = { initial: number; monthly: number; years: number; target: number };

// Exemple fictif : toutes les valeurs sont des hypothèses à remplacer par les vôtres.
const DEFAULTS: State = { initial: 5000, monthly: 200, years: 15, target: 60000 };

export default function SimRendementRequis() {
  const [s, setS, up] = usePersistentState<State>('rendement-requis', DEFAULTS);
  const r = requiredReturn(s);

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Rendement nécessaire pour atteindre un objectif' }]} />
      <PageHead eyebrow="Simulateur" title="Quel rendement faut-il pour atteindre son objectif d’épargne ?">
        Indiquez votre capital de départ, votre versement mensuel, la durée et le capital visé : le simulateur calcule le rendement annuel nécessaire pour y parvenir.
      </PageHead>
      <p className="notice" role="note">
        Calcul fondé uniquement sur les hypothèses que vous saisissez, sans chiffre réglementaire ni prévision. Le rendement affiché est celui qu’exige votre objectif, avant frais, impôts et inflation, et n’est jamais garanti.
        Pour calculer la durée à rendement donné, voir la <Link to="/simulateurs/duree-pour-atteindre-un-capital">durée pour atteindre un capital</Link>.
      </p>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Votre objectif</legend>
            <NumberField label="Capital de départ" unit="€" value={s.initial} onChange={up('initial')} min={0} step={500} />
            <NumberField label="Versement mensuel" unit="€" value={s.monthly} onChange={up('monthly')} min={0} step={50} />
            <NumberField label="Durée" unit="ans" value={s.years} onChange={up('years')} min={1} max={100} step={1} />
            <NumberField label="Capital visé" unit="€" value={s.target} onChange={up('target')} min={0} step={1000} />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
        </form>
        <section aria-label="Résultats">
          {r.annualRate === null ? (
            <p className="notice" role="status">Même à 100 % par an, ces hypothèses n’atteignent pas le capital visé : augmentez le versement, allongez la durée ou baissez l’objectif.</p>
          ) : (
            <div className="kpis">
              <Kpi label="Rendement annuel nécessaire" value={fmtPct(r.annualRate)} sub={r.alreadyReached ? 'les versements suffisent sans rendement' : 'constant, avant frais, impôts et inflation'} />
              <Kpi label="Total versé" value={fmtEur(r.contributed)} sub="capital de départ compris" />
              <Kpi label="Part à obtenir par le rendement" value={fmtEur(Math.max(0, s.target - r.withoutReturn))} sub="écart entre l’objectif et les versements seuls" />
            </div>
          )}
          <p className="muted small">
            On cherche le rendement annuel R tel que, chaque mois : capital = capital × (1 + r) + versement (fin de mois), avec r = (1 + R)^(1/12) − 1, jusqu’à égaler le capital visé.
            Les montants par défaut sont fictifs.
          </p>
          <SavedSims simKey="rendement-requis" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
          <SimFaq slug="rendement-necessaire-pour-atteindre-un-objectif" />
        </section>
      </div>
    </>
  );
}
