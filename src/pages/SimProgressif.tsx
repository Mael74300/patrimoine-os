import { Link } from 'react-router-dom';
import { stepUp, fmtEur } from '../lib/finance';
import { Crumbs, Disclaimer, SimFaq, Kpi, NumberField, PageHead, SavedSims, usePersistentState } from '../components/ui';

type State = { monthly: number; annualIncrease: number; annualReturn: number; years: number };

// Exemple fictif : toutes les valeurs sont des hypothèses à remplacer par les vôtres.
const DEFAULTS: State = { monthly: 200, annualIncrease: 3, annualReturn: 5, years: 25 };

export default function SimProgressif() {
  const [s, setS, up] = usePersistentState<State>('progressif', DEFAULTS);
  const r = stepUp({ monthly: s.monthly, annualIncrease: s.annualIncrease / 100, annualReturn: s.annualReturn / 100, years: s.years });

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Augmenter son épargne chaque année' }]} />
      <PageHead eyebrow="Simulateur" title="Augmenter son épargne chaque année : quel effet sur le capital ?">
        Compare un versement mensuel constant et un versement qui augmente d’un pourcentage chaque année (par exemple avec le salaire), au même rendement supposé.
      </PageHead>
      <p className="notice" role="note">
        Calcul fondé uniquement sur les hypothèses que vous saisissez, sans chiffre réglementaire ni prévision. Le rendement est supposé constant, avant frais, impôts et inflation.
        Voir aussi la <Link to="/simulateurs/objectif-epargne">épargne pour un objectif</Link> et le <Link to="/simulateurs/cout-d-attendre-pour-epargner">coût d’attendre</Link>.
      </p>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Votre épargne</legend>
            <NumberField label="Versement mensuel la première année" unit="€" value={s.monthly} onChange={up('monthly')} min={0} step={25} />
            <NumberField label="Hausse annuelle du versement" unit="%" value={s.annualIncrease} onChange={up('annualIncrease')} min={-50} max={100} step={0.5} />
            <NumberField label="Durée" unit="ans" value={s.years} onChange={up('years')} min={0} max={80} step={1} />
          </fieldset>
          <fieldset>
            <legend>Hypothèse</legend>
            <NumberField label="Rendement annuel supposé" unit="%" value={s.annualReturn} onChange={up('annualReturn')} min={-50} max={50} step={0.5} />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
        </form>
        <section aria-label="Résultats">
          <div className="kpis">
            <Kpi label="Capital, versement constant" value={fmtEur(r.flatCapital)} sub={`pour ${fmtEur(r.flatInvested)} versés`} />
            <Kpi label="Capital, versement qui augmente" value={fmtEur(r.steppedCapital)} sub={`pour ${fmtEur(r.steppedInvested)} versés`} />
            <Kpi label="Capital en plus" value={fmtEur(r.extraCapital)} sub="par rapport au versement constant" />
            <Kpi label="Dernier versement mensuel" value={fmtEur(r.lastMonthly)} sub={`équivalent à ${fmtEur(r.equivalentFlatMonthly)} constants par mois`} />
          </div>
          <p className="muted small">
            Le versement est multiplié par (1 + hausse) au début de chaque année à partir de la deuxième ; les versements ont lieu en fin de mois. Le « versement constant équivalent » est la mensualité fixe qui donnerait le même capital final.
            Les exemples ci-dessus sont fictifs.
          </p>
          <SavedSims simKey="progressif" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
          <SimFaq slug="augmenter-son-epargne-chaque-annee" />
        </section>
      </div>
    </>
  );
}
