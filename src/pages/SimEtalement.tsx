import { Link } from 'react-router-dom';
import { lumpVsGradual, fmtEur, fmtPct, type PricePath } from '../lib/finance';
import { Crumbs, Disclaimer, SimFaq, Kpi, NumberField, SelectField, PageHead, SavedSims, usePersistentState } from '../components/ui';

type State = { amount: number; spread: number; years: number; ret: number; cash: number; path: PricePath; move: number };

// Exemple fictif : toutes les valeurs sont des hypothèses à remplacer par les vôtres.
const DEFAULTS: State = { amount: 12000, spread: 12, years: 5, ret: 0.05, cash: 0, path: 'steady', move: 0.2 };

const PATHS: { v: PricePath; label: string }[] = [
  { v: 'steady', label: 'Évolution régulière au rendement saisi' },
  { v: 'dip', label: 'Baisse pendant l’étalement, puis rendement saisi' },
  { v: 'rise', label: 'Hausse pendant l’étalement, puis rendement saisi' },
];

export default function SimEtalement() {
  const [s, setS, up] = usePersistentState<State>('etalement', DEFAULTS);
  const r = lumpVsGradual({ amount: s.amount, spreadMonths: s.spread, years: s.years, annualReturn: s.ret, cashRate: s.cash, path: s.path, move: s.move });
  const better = r.advantageGradual > 0.005 ? 'L’étalement' : r.advantageGradual < -0.005 ? 'L’investissement en une fois' : 'Aucune des deux méthodes';
  const gap = r.lump > 0 ? r.advantageGradual / r.lump : 0;

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Investir d’un coup ou progressivement' }]} />
      <PageHead eyebrow="Simulateur" title="Investir d’un coup ou progressivement">
        Compare un capital placé en une seule fois et le même capital placé en tranches égales sur plusieurs mois, selon le parcours de prix que vous supposez.
      </PageHead>
      <p className="notice" role="note">
        Résultat entièrement fondé sur vos hypothèses, sans aucun chiffre réglementaire et sans prévision : l’étalement ne gagne que si le prix baisse pendant la période,
        et perd si le prix monte. Avant frais et impôts. Voir aussi les <Link to="/simulateurs/patrimoine">projections de patrimoine</Link> et l’<Link to="/simulateurs/frais">impact des frais</Link>.
      </p>
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
            <SelectField label="Parcours de prix" value={s.path} options={PATHS} onChange={up('path')} />
            {s.path !== 'steady' && <NumberField label="Ampleur de la variation pendant l’étalement" unit="%" percent value={s.move} onChange={up('move')} min={0} max={90} step={5} />}
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
        </form>
        <section aria-label="Résultats">
          <div className="kpis">
            <Kpi label="En une seule fois" value={fmtEur(r.lump)} sub={`valeur après ${r.months} mois`} />
            <Kpi label="En tranches égales" value={fmtEur(r.gradual)} sub={`${r.spreadMonths} mois d’étalement`} />
            <Kpi label="Écart (étalement − une fois)" value={fmtEur(r.advantageGradual)} sub={`${better} finit au-dessus (${fmtPct(Math.abs(gap))})`} />
          </div>
          <p className="muted small">
            Chaque tranche est investie en début de mois ; la part non encore investie rapporte le rendement saisi. Les deux méthodes sont évaluées au même horizon.
            Avec un rendement régulier supérieur à celui de la part non investie, investir tout de suite finit au-dessus : l’étalement réduit surtout le regret d’un achat juste avant une baisse.
            Les exemples ci-dessus sont fictifs.
          </p>
          <SavedSims simKey="etalement" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
          <SimFaq slug="investir-d-un-coup-ou-progressivement" />
        </section>
      </div>
    </>
  );
}
