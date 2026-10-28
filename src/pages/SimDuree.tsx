import { Link } from 'react-router-dom';
import { timeToTarget, fmtEur, fmtPct } from '../lib/finance';
import { Crumbs, Disclaimer, SimFaq, Kpi, NumberField, PageHead, SavedSims, usePersistentState } from '../components/ui';

type State = { initial: number; monthly: number; annualRate: number; target: number };

// Exemple fictif : toutes les valeurs sont des hypothèses à remplacer par les vôtres.
const DEFAULTS: State = { initial: 2000, monthly: 300, annualRate: 4, target: 30000 };

function fmtDuration(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m} mois`;
  return m === 0 ? `${y} an${y > 1 ? 's' : ''}` : `${y} an${y > 1 ? 's' : ''} et ${m} mois`;
}

export default function SimDuree() {
  const [s, setS, up] = usePersistentState<State>('duree-objectif', DEFAULTS);
  const r = timeToTarget({ initial: s.initial, monthly: s.monthly, annualRate: s.annualRate / 100, target: s.target });
  const saved = r.reached && r.monthsWithoutReturn !== null ? r.monthsWithoutReturn - (r.months ?? 0) : null;

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Durée pour atteindre un capital' }]} />
      <PageHead eyebrow="Simulateur" title="En combien de temps atteindre un capital ? Durée selon votre épargne mensuelle">
        Indiquez votre capital de départ, votre versement mensuel, un rendement annuel supposé et le montant visé : le simulateur calcule le nombre de mois nécessaires et la part des intérêts.
      </PageHead>
      <p className="notice" role="note">
        Calcul fondé uniquement sur les hypothèses que vous saisissez, sans chiffre réglementaire ni prévision. Le rendement est supposé constant, avant frais, impôts et inflation.
        Pour l’inverse (le versement à prévoir pour une échéance donnée), voir l’<Link to="/simulateurs/objectif-epargne">objectif d’épargne</Link>.
      </p>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Votre épargne</legend>
            <NumberField label="Capital de départ" unit="€" value={s.initial} onChange={up('initial')} min={0} step={500} />
            <NumberField label="Versement mensuel" unit="€" value={s.monthly} onChange={up('monthly')} min={0} step={50} />
            <NumberField label="Rendement annuel supposé" unit="%" value={s.annualRate} onChange={up('annualRate')} min={-50} max={50} step={0.5} />
            <NumberField label="Capital visé" unit="€" value={s.target} onChange={up('target')} min={0} step={1000} />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
        </form>
        <section aria-label="Résultats">
          {r.reached ? (
            <div className="kpis">
              <Kpi label="Durée nécessaire" value={fmtDuration(r.months ?? 0)} sub={`soit ${(r.years ?? 0).toFixed(1).replace('.', ',')} an(s)`} />
              <Kpi label="Total versé" value={fmtEur(r.contributed)} sub="capital de départ compris" />
              <Kpi label="Intérêts" value={fmtEur(r.interest)} sub={`${fmtPct(r.interestShare)} du capital à l’arrivée`} />
              <Kpi label="Gain de temps grâce au rendement" value={saved === null ? '—' : fmtDuration(saved)} sub={r.monthsWithoutReturn === null ? '' : `contre ${fmtDuration(r.monthsWithoutReturn)} sans rendement`} />
            </div>
          ) : (
            <p className="notice" role="status">Avec ces hypothèses, le capital visé n’est pas atteint en 100 ans : augmentez le versement mensuel, le rendement supposé ou baissez l’objectif.</p>
          )}
          <p className="muted small">
            Chaque mois : capital = capital × (1 + rendement mensuel équivalent) + versement (en fin de mois), jusqu’à atteindre le capital visé (100 ans au plus).
            Les montants par défaut sont fictifs.
          </p>
          <SavedSims simKey="duree-objectif" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
          <SimFaq slug="duree-pour-atteindre-un-capital" />
        </section>
      </div>
    </>
  );
}
