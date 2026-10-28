import { Link } from 'react-router-dom';
import { fmtEur, fmtEur2, inFine } from '../lib/finance';
import { Crumbs, Disclaimer, SimFaq, Kpi, NumberField, PageHead, SavedSims, usePersistentState } from '../components/ui';

type State = { principal: number; annualRate: number; years: number; insuranceRate: number; savingsReturn: number };

// Exemple fictif : toutes les valeurs sont des hypothèses à remplacer par les vôtres.
const DEFAULTS: State = { principal: 200000, annualRate: 0.03, years: 20, insuranceRate: 0.003, savingsReturn: 0.02 };

export default function SimInFine() {
  const [s, setS, up] = usePersistentState<State>('credit-in-fine', DEFAULTS);
  const r = inFine(s);

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Crédit in fine ou amortissable' }]} />
      <PageHead eyebrow="Simulateur" title="Crédit in fine ou amortissable : que coûte chaque formule ?">
        Dans un crédit in fine, on ne paie que les intérêts pendant la durée et on rembourse le capital d’un coup à la fin, avec une épargne constituée à côté.
        Comparez la sortie de trésorerie mensuelle et le coût net avec un crédit amortissable classique.
      </PageHead>
      <p className="notice" role="note">
        Calcul fondé uniquement sur les hypothèses que vous saisissez (taux fixe, assurance sur le capital initial, rendement net constant de l’épargne), sans chiffre
        réglementaire ni fiscalité. Pour un crédit classique, voir le <Link to="/simulateurs/credit">calculateur de crédit</Link>.
      </p>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Le crédit</legend>
            <NumberField label="Capital emprunté" unit="€" value={s.principal} onChange={up('principal')} min={0} max={5000000} step={1000} />
            <NumberField label="Taux nominal annuel" unit="%" percent value={s.annualRate} onChange={up('annualRate')} step={0.05} min={0} max={20} />
            <NumberField label="Durée" unit="ans" value={s.years} onChange={up('years')} min={1} max={50} step={1} />
            <NumberField label="Assurance emprunteur" unit="%" percent value={s.insuranceRate} onChange={up('insuranceRate')} step={0.05} min={0} max={2} />
          </fieldset>
          <fieldset>
            <legend>L’épargne qui reconstitue le capital</legend>
            <NumberField label="Rendement annuel net supposé" unit="%" percent value={s.savingsReturn} onChange={up('savingsReturn')} step={0.1} min={-50} max={100} />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
        </form>
        <section aria-label="Résultats">
          <div className="kpis">
            <Kpi label="Sortie mensuelle, amortissable" value={fmtEur2(r.amortizingMonthlyTotal)} sub="mensualité + assurance" />
            <Kpi label="Sortie mensuelle, in fine" value={fmtEur2(r.inFineMonthlyTotal)} sub={`dont ${fmtEur2(r.monthlySaving)} d’épargne`} />
            <Kpi label="Coût net, amortissable" value={fmtEur(r.amortizingCost)} sub="intérêts + assurance" />
            <Kpi label="Coût net, in fine" value={fmtEur(r.inFineNetCost)} sub={r.netCostGap >= 0 ? `${fmtEur(r.netCostGap)} de plus` : `${fmtEur(-r.netCostGap)} de moins`} />
          </div>
          <h2>Comparaison sur {r.months / 12} ans</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Poste</th><th className="r">Amortissable</th><th className="r">In fine</th></tr></thead>
              <tbody>
                <tr><td>Intérêts + assurance</td><td className="r">{fmtEur(r.amortizingCost)}</td><td className="r">{fmtEur(r.inFineCost)}</td></tr>
                <tr><td>Gains de l’épargne</td><td className="r">—</td><td className="r">− {fmtEur(r.savingsGain)}</td></tr>
                <tr><td>Coût net</td><td className="r">{fmtEur(r.amortizingCost)}</td><td className="r">{fmtEur(r.inFineNetCost)}</td></tr>
              </tbody>
            </table>
          </div>
          <p className="muted small">
            In fine : intérêts mensuels = capital × taux / 12 ; épargne mensuelle = capital × r ÷ ((1 + r)^mois − 1), avec r le taux mensuel équivalent du rendement net. Si l’épargne rapporte moins
            que le taux du crédit, l’in fine coûte plus cher ; sinon, il coûte moins, sans garantie de rendement. Les montants par défaut sont fictifs.
          </p>
          <SavedSims simKey="credit-in-fine" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
          <SimFaq slug="credit-in-fine-ou-amortissable" />
        </section>
      </div>
    </>
  );
}
