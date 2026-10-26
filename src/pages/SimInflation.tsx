import { Link } from 'react-router-dom';
import { fmtEur, fmtPct, purchasingPower } from '../lib/finance';
import { Crumbs, Disclaimer, Kpi, LineChart, NumberField, PageHead, SavedSims, usePersistentState } from '../components/ui';

type State = { amount: number; years: number; inflation: number; annualReturn: number };

const DEFAULTS: State = { amount: 10000, years: 20, inflation: 0.02, annualReturn: 0.03 };

const fmtYears = (y: number | null) => (y === null ? 'jamais' : `${y.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} ans`);

export default function SimInflation() {
  const [s, setS, up] = usePersistentState<State>('inflation', DEFAULTS);
  const r = purchasingPower(s);
  const n = r.idleSeries.length - 1;

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Inflation et pouvoir d’achat' }]} />
      <PageHead eyebrow="Simulateur" title="Inflation et pouvoir d’achat">
        Que vaut une somme dans le temps ? Comparez la somme laissée telle quelle et la même somme placée, en euros d’aujourd’hui.
      </PageHead>
      <p className="notice" role="note">
        L’inflation (hausse générale des prix) réduit ce qu’une somme permet d’acheter. Le taux d’inflation et le rendement saisis sont des hypothèses
        modifiables, pas des prévisions : les valeurs réellement constatées sont publiées par l’Insee. Voir la <Link to="/glossaire">définition des termes</Link>
        {' '}et le <Link to="/simulateurs/patrimoine">simulateur de patrimoine</Link>, qui intègre l’inflation à un plan d’épargne complet.
      </p>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Hypothèses</legend>
            <NumberField label="Somme" unit="€" value={s.amount} onChange={up('amount')} min={0} step={1000} />
            <NumberField label="Durée" unit="ans" value={s.years} onChange={up('years')} min={0} max={80} step={1} />
            <NumberField label="Inflation annuelle" unit="%" percent value={s.inflation} onChange={up('inflation')} min={-5} max={30} step={0.5} hint="Hypothèse moyenne sur la durée." />
            <NumberField label="Rendement annuel net de frais du placement" unit="%" percent value={s.annualReturn} onChange={up('annualReturn')} min={-20} max={30} step={0.5} hint="Hypothèse, jamais une garantie. Avant impôt." />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
        </form>
        <section aria-label="Résultats">
          <div className="kpis">
            <Kpi label="Somme inchangée après la durée" value={fmtEur(r.idleRealValue)} sub={`en euros d'aujourd'hui, soit ${fmtPct(r.idleLoss)} de pouvoir d'achat perdu`} tone={r.idleLoss > 0 ? 'neg' : undefined} />
            <Kpi label="Montant pour garder le même pouvoir d'achat" value={fmtEur(r.nominalToKeepPower)} sub={`dans ${n} an${n > 1 ? 's' : ''}, en euros courants`} />
            <Kpi label="Somme placée, en euros d'aujourd'hui" value={fmtEur(r.investedRealValue)} sub={`${fmtEur(r.investedValue)} en euros courants · rendement réel ${fmtPct(r.realReturn)}`} tone={r.realReturn < 0 ? 'neg' : undefined} />
          </div>
          <h2>Valeur de la somme dans le temps (euros d’aujourd’hui)</h2>
          <LineChart
            title="Pouvoir d'achat de la somme, inchangée ou placée"
            xLabels={r.idleSeries.map((_, i) => `An ${i}`)}
            format={fmtEur}
            series={[
              { name: 'Somme inchangée', color: 'var(--chart-2)', values: r.idleSeries },
              { name: `Somme placée à ${fmtPct(s.annualReturn)}`, color: 'var(--chart-1)', values: r.investedSeries },
            ]}
          />
          <h2>Repères de durée</h2>
          <div className="table-wrap">
            <table>
              <tbody>
                <tr><th scope="row">Durée pour perdre la moitié du pouvoir d’achat (somme inchangée)</th><td className="r">{fmtYears(r.yearsToHalve)}</td></tr>
                <tr><th scope="row">Durée pour doubler le capital placé (en euros courants)</th><td className="r">{fmtYears(r.yearsToDouble)}</td></tr>
              </tbody>
            </table>
          </div>
          <p className="muted small">
            Pouvoir d’achat à la date T = somme / (1 + inflation)^T. Le placement est supposé sans versement et le rendement avant impôt ; la fiscalité
            et les frais d’enveloppe peuvent réduire le rendement réel. Pour garder une réserve disponible, voir le
            {' '}<Link to="/simulateurs/epargne-de-precaution">simulateur d’épargne de précaution</Link> ; pour l’effet des frais, le <Link to="/simulateurs/frais">simulateur d’impact des frais</Link>.
          </p>
          <SavedSims simKey="inflation" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
        </section>
      </div>
    </>
  );
}
