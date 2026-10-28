import { Link } from 'react-router-dom';
import { fmtEur, fmtEur2, loanDuration } from '../lib/finance';
import { Crumbs, Disclaimer, SimFaq, Kpi, NumberField, PageHead, SavedSims, usePersistentState } from '../components/ui';

type State = { principal: number; annualRate: number; insuranceRate: number };

// Exemple fictif : toutes les valeurs sont des hypothèses à remplacer par les vôtres.
const DEFAULTS: State = { principal: 200000, annualRate: 0.03, insuranceRate: 0.003 };
const DURATIONS = [10, 15, 20, 25, 30];

export default function SimDureeCredit() {
  const [s, setS, up] = usePersistentState<State>('duree-credit', DEFAULTS);
  const rows = loanDuration({ ...s, durations: DURATIONS });
  const shortest = rows[0];
  const longest = rows[rows.length - 1];

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Durée du crédit' }]} />
      <PageHead eyebrow="Simulateur" title="Durée du crédit : mensualité et coût total de 10 à 30 ans">
        Pour un même capital et un même taux, comparez la mensualité et le coût total (intérêts et assurance) selon la durée d’emprunt.
      </PageHead>
      <p className="notice" role="note">
        Calcul fondé uniquement sur les hypothèses que vous saisissez (taux fixe, assurance calculée sur le capital initial), sans chiffre réglementaire. Pour le détail
        d’un crédit, voir le <Link to="/simulateurs/credit">calculateur de crédit</Link>.
      </p>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Votre crédit</legend>
            <NumberField label="Capital emprunté" unit="€" value={s.principal} onChange={up('principal')} min={0} max={5000000} step={1000} />
            <NumberField label="Taux nominal annuel" unit="%" percent value={s.annualRate} onChange={up('annualRate')} step={0.05} min={0} max={20} />
            <NumberField label="Assurance emprunteur" unit="%" percent value={s.insuranceRate} onChange={up('insuranceRate')} step={0.05} min={0} max={2} />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
        </form>
        <section aria-label="Résultats">
          <div className="kpis">
            <Kpi label={`Mensualité sur ${shortest.years} ans`} value={fmtEur2(shortest.monthlyTotal)} sub="assurance comprise" />
            <Kpi label={`Mensualité sur ${longest.years} ans`} value={fmtEur2(longest.monthlyTotal)} sub="assurance comprise" />
            <Kpi label={`Coût total sur ${shortest.years} ans`} value={fmtEur(shortest.totalCost)} sub="intérêts + assurance" />
            <Kpi label={`Coût total sur ${longest.years} ans`} value={fmtEur(longest.totalCost)} sub={`${fmtEur(longest.totalCost - shortest.totalCost)} de plus`} />
          </div>
          <h2>Comparaison par durée</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Durée</th><th className="r">Mensualité (hors assurance)</th><th className="r">Mensualité (assurance comprise)</th><th className="r">Intérêts</th><th className="r">Coût total</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.years}>
                    <td>{r.years} ans</td>
                    <td className="r">{fmtEur2(r.monthlyPayment)}</td>
                    <td className="r">{fmtEur2(r.monthlyTotal)}</td>
                    <td className="r">{fmtEur(r.totalInterest)}</td>
                    <td className="r">{fmtEur(r.totalCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted small">
            Mensualité = capital × (taux / 12) ÷ (1 − (1 + taux / 12)^(−mois)) ; coût total = intérêts + assurance. Une durée plus longue réduit la mensualité mais augmente le coût total.
            Les montants par défaut sont fictifs.
          </p>
          <SavedSims simKey="duree-credit" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
          <SimFaq slug="duree-du-credit-mensualite-et-cout-total" />
        </section>
      </div>
    </>
  );
}
