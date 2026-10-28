import { Link } from 'react-router-dom';
import { rateConversion } from '../lib/finance';
import { Crumbs, Disclaimer, SimFaq, Kpi, NumberField, PageHead, SavedSims, SelectField, usePersistentState } from '../components/ui';

type State = { annualRate: number; periods: number };

// Exemple fictif : toutes les valeurs sont des hypothèses à remplacer par les vôtres.
const DEFAULTS: State = { annualRate: 5, periods: 12 };

const PERIODS = [
  { v: 12, label: 'Mensuelle (12 par an)' },
  { v: 4, label: 'Trimestrielle (4 par an)' },
  { v: 2, label: 'Semestrielle (2 par an)' },
];

const p4 = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
const fmtRate = (x: number) => (Number.isFinite(x) ? `${p4.format(x * 100)} %` : '—');

export default function SimTaux() {
  const [s, setS, up] = usePersistentState<State>('conversion-taux', DEFAULTS);
  const r = rateConversion({ annualRate: s.annualRate / 100, periods: s.periods });
  const label = s.periods === 12 ? 'mensuel' : s.periods === 4 ? 'trimestriel' : s.periods === 2 ? 'semestriel' : 'par période';

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Convertir un taux annuel en taux mensuel' }]} />
      <PageHead eyebrow="Simulateur" title="Convertir un taux annuel en taux mensuel : équivalent ou proportionnel ?">
        Indiquez un taux annuel : le simulateur calcule le taux mensuel (ou trimestriel, semestriel) équivalent, le taux proportionnel, et l’écart qui apparaît quand on divise simplement par douze.
      </PageHead>
      <p className="notice" role="note">
        Calcul mathématique fondé uniquement sur le taux que vous saisissez, sans chiffre réglementaire. Pour l’effet des intérêts composés dans le temps, voir
        les <Link to="/simulateurs/interets-simples-ou-composes">intérêts simples ou composés</Link>.
      </p>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Votre taux</legend>
            <NumberField label="Taux annuel effectif" unit="%" value={s.annualRate} onChange={up('annualRate')} min={-50} max={100} step={0.1} />
            <SelectField label="Période visée" value={s.periods} options={PERIODS} onChange={up('periods')} />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
        </form>
        <section aria-label="Résultats">
          <div className="kpis">
            <Kpi label={`Taux ${label} équivalent`} value={fmtRate(r.equivalentRate)} sub="capitalisé sur l’année, redonne exactement le taux annuel" />
            <Kpi label={`Taux ${label} proportionnel`} value={fmtRate(r.proportionalRate)} sub="taux annuel divisé par le nombre de périodes" />
            <Kpi label="Taux annuel nominal équivalent" value={fmtRate(r.nominalRate)} sub="taux équivalent × nombre de périodes" />
            <Kpi label="Taux annuel réel du taux proportionnel" value={fmtRate(r.effectiveFromProportional)} sub={`écart de ${fmtRate(r.gap)} avec le taux saisi`} />
          </div>
          <p className="muted small">
            Taux équivalent = (1 + taux annuel)^(1 / n) − 1 ; taux proportionnel = taux annuel / n ; taux annuel du taux proportionnel = (1 + taux / n)^n − 1.
            Les montants par défaut sont fictifs.
          </p>
          <SavedSims simKey="conversion-taux" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
          <SimFaq slug="convertir-un-taux-annuel-en-taux-mensuel" />
        </section>
      </div>
    </>
  );
}
