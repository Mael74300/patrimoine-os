import { Link } from 'react-router-dom';
import { simpleVsCompound, fmtEur, fmtNum } from '../lib/finance';
import { Crumbs, Disclaimer, SimFaq, Kpi, NumberField, PageHead, SavedSims, usePersistentState } from '../components/ui';

type State = { initial: number; annualRate: number; years: number };

// Exemple fictif : toutes les valeurs sont des hypothèses à remplacer par les vôtres.
const DEFAULTS: State = { initial: 10000, annualRate: 5, years: 20 };

export default function SimSimpleComposes() {
  const [s, setS, up] = usePersistentState<State>('simple-compose', DEFAULTS);
  const r = simpleVsCompound({ initial: s.initial, annualRate: s.annualRate / 100, years: s.years });
  const step = Math.max(1, Math.ceil((r.rows.length - 1) / 10));
  const shown = r.rows.filter((row) => row.year % step === 0 || row.year === r.rows.length - 1);

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Intérêts simples ou composés' }]} />
      <PageHead eyebrow="Simulateur" title="Intérêts simples ou intérêts composés : quelle différence sur la durée ?">
        Comparez, pour un même capital sans nouveau versement et un même taux annuel supposé, ce que rapportent des intérêts simples (jamais réinvestis) et des intérêts composés (réinvestis chaque année).
      </PageHead>
      <p className="notice" role="note">
        Calcul fondé uniquement sur les hypothèses que vous saisissez, sans chiffre réglementaire ni prévision. Le taux est supposé constant, avant frais et impôts.
        Voir aussi le simulateur de <Link to="/simulateurs/patrimoine">patrimoine à long terme</Link> et la règle de <Link to="/simulateurs/doubler-son-capital-regle-de-72">doublement du capital</Link>.
      </p>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Votre placement</legend>
            <NumberField label="Capital de départ" unit="€" value={s.initial} onChange={up('initial')} min={0} step={500} />
            <NumberField label="Taux annuel supposé" unit="%" value={s.annualRate} onChange={up('annualRate')} min={-50} max={50} step={0.5} />
            <NumberField label="Durée" unit="ans" value={s.years} onChange={up('years')} min={0} max={100} step={1} />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
        </form>
        <section aria-label="Résultats">
          <div className="kpis">
            <Kpi label="Capital en intérêts simples" value={fmtEur(r.simpleFinal)} sub={`dont ${fmtEur(r.simpleInterest)} d’intérêts`} />
            <Kpi label="Capital en intérêts composés" value={fmtEur(r.compoundFinal)} sub={`dont ${fmtEur(r.compoundInterest)} d’intérêts`} />
            <Kpi label="Écart en faveur des composés" value={fmtEur(r.gap)} sub="intérêts composés − intérêts simples" />
            <Kpi label="Rapport composé / simple" value={`× ${fmtNum(r.ratio)}`} sub="sur le capital final" />
          </div>
          <div className="table-wrap" tabIndex={0} style={{ marginTop: 16 }}><table>
            <thead><tr><th>Année</th><th className="r">Intérêts simples</th><th className="r">Intérêts composés</th><th className="r">Écart</th></tr></thead>
            <tbody>
              {shown.map((row) => (
                <tr key={row.year}><td>{row.year}</td><td className="r">{fmtEur(row.simple)}</td><td className="r">{fmtEur(row.compound)}</td><td className="r">{fmtEur(row.gap)}</td></tr>
              ))}
            </tbody>
          </table></div>
          <p className="muted small">
            Intérêts simples : capital × (1 + taux × années). Intérêts composés : capital × (1 + taux)^années. Les deux coïncident la première année ; l’écart croît ensuite de plus en plus vite.
            Les exemples ci-dessus sont fictifs.
          </p>
          <SavedSims simKey="simple-compose" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
          <SimFaq slug="interets-simples-ou-composes" />
        </section>
      </div>
    </>
  );
}
