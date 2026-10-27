import { Link } from 'react-router-dom';
import { advantageByHorizon, advantageByPriceGrowth, fmtEur, fmtPct, rentVsBuy } from '../lib/finance';
import { Crumbs, Disclaimer, SimFaq, Kpi, NumberField, PageHead, SavedSims, usePersistentState } from '../components/ui';

type State = {
  price: number; downPayment: number; acquisitionRate: number; loanRate: number; loanYears: number; ownerCostRate: number;
  priceGrowth: number; sellingRate: number; monthlyRent: number; rentGrowth: number; investReturn: number; horizonYears: number;
};

// Exemple fictif : toutes les valeurs sont des hypothèses à remplacer par les vôtres.
const DEFAULTS: State = {
  price: 250000, downPayment: 50000, acquisitionRate: 0.08, loanRate: 0.035, loanYears: 20, ownerCostRate: 0.015,
  priceGrowth: 0.02, sellingRate: 0.05, monthlyRent: 900, rentGrowth: 0.02, investReturn: 0.04, horizonYears: 15,
};

export default function SimLouerAcheter() {
  const [s, setS, up] = usePersistentState<State>('louer-acheter', DEFAULTS);
  const r = rentVsBuy(s);
  const byGrowth = advantageByPriceGrowth(s, [-0.01, 0, 0.02, 0.04]);
  const byHorizon = advantageByHorizon(s, [3, 5, 10, 15, 20]);
  const buyWins = r.advantage > 0;

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Louer ou acheter' }]} />
      <PageHead eyebrow="Simulateur" title="Louer ou acheter sa résidence principale : comparer les patrimoines">
        Compare, à l’horizon choisi, le patrimoine d’un propriétaire (bien revendu, dette remboursée) et celui d’un locataire qui place l’apport, les frais et l’écart de budget mensuel.
      </PageHead>
      <p className="notice" role="note">
        Résultat entièrement fondé sur vos hypothèses (prix, loyer, hausses, rendement, frais) : modifiez-les, l’issue peut s’inverser. Le plus souvent, ce sont la durée de détention
        et l’évolution du prix qui décident. Pour le détail du prêt, voir le <Link to="/simulateurs/credit">calculateur de crédit</Link> et le <Link to="/simulateurs/taeg">TAEG</Link>
        {' '}; pour la mensualité supportable, le <Link to="/simulateurs/endettement">taux d’endettement</Link>.
      </p>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Achat</legend>
            <NumberField label="Prix du bien" unit="€" value={s.price} onChange={up('price')} min={0} step={5000} />
            <NumberField label="Apport" unit="€" value={s.downPayment} onChange={up('downPayment')} min={0} step={5000} />
            <NumberField label="Frais d’acquisition (en % du prix)" unit="%" percent value={s.acquisitionRate} onChange={up('acquisitionRate')} min={0} max={30} step={0.5} />
            <NumberField label="Taux du prêt" unit="%" percent value={s.loanRate} onChange={up('loanRate')} min={0} max={20} step={0.05} />
            <NumberField label="Durée du prêt" unit="ans" value={s.loanYears} onChange={up('loanYears')} min={0} max={50} step={1} />
            <NumberField label="Taxe foncière, charges non récupérables, entretien (par an, en % de la valeur)" unit="%" percent value={s.ownerCostRate} onChange={up('ownerCostRate')} min={0} max={10} step={0.1} />
            <NumberField label="Hausse annuelle du prix du bien" unit="%" percent value={s.priceGrowth} onChange={up('priceGrowth')} min={-10} max={15} step={0.25} />
            <NumberField label="Frais de revente (en % du prix de vente)" unit="%" percent value={s.sellingRate} onChange={up('sellingRate')} min={0} max={30} step={0.5} />
          </fieldset>
          <fieldset>
            <legend>Location et horizon</legend>
            <NumberField label="Loyer mensuel charges comprises" unit="€" value={s.monthlyRent} onChange={up('monthlyRent')} min={0} step={50} />
            <NumberField label="Hausse annuelle du loyer" unit="%" percent value={s.rentGrowth} onChange={up('rentGrowth')} min={-10} max={15} step={0.25} />
            <NumberField label="Rendement annuel du placement (avant impôt)" unit="%" percent value={s.investReturn} onChange={up('investReturn')} min={-10} max={20} step={0.25} />
            <NumberField label="Horizon de comparaison" unit="ans" value={s.horizonYears} onChange={up('horizonYears')} min={0} max={50} step={1} />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
        </form>
        <section aria-label="Résultats">
          <div className="kpis">
            <Kpi label="Patrimoine du propriétaire" value={fmtEur(r.buyerWealth)} sub={`bien ${fmtEur(r.finalValue)} après frais de revente, dette restante ${fmtEur(r.remainingDebt)}`} />
            <Kpi label="Patrimoine du locataire" value={fmtEur(r.renterWealth)} sub="apport, frais et écarts mensuels placés" />
            <Kpi label={buyWins ? 'Avantage à l’achat' : 'Avantage à la location'} value={fmtEur(Math.abs(r.advantage))} sub={r.breakEvenMonth !== null ? `l’achat l’emporte durablement dès le mois ${r.breakEvenMonth}` : 'l’achat ne l’emporte pas à cet horizon'} />
          </div>
          <p className="muted small">Mensualité du prêt hors assurance : {fmtEur(r.monthlyPayment)} sur un capital emprunté de {fmtEur(r.loanAmount)}.</p>
          <h2>Si le prix du bien évolue autrement</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th scope="col">Hausse annuelle du prix</th><th scope="col" className="r">Acheter − louer</th></tr></thead>
              <tbody>
                {byGrowth.map((d) => (
                  <tr key={d.growth}><th scope="row">{fmtPct(d.growth)}</th><td className="r">{fmtEur(d.advantage)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <h2>Si l’on revend plus tôt ou plus tard</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th scope="col">Horizon</th><th scope="col" className="r">Acheter − louer</th></tr></thead>
              <tbody>
                {byHorizon.map((d) => (
                  <tr key={d.years}><th scope="row">{d.years} ans</th><td className="r">{fmtEur(d.advantage)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted small">
            Un écart positif signifie que le propriétaire est plus riche à l’horizon. Les exemples ci-dessus sont fictifs. Le modèle ignore les impôts, l’assurance du prêt,
            les travaux exceptionnels et la valeur d’usage (stabilité, liberté de déménager). Pour l’arbitrage rembourser ou investir, voir <Link to="/simulateurs/rembourser-ou-investir">rembourser ou investir</Link>.
          </p>
          <SavedSims simKey="louer-acheter" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
          <SimFaq slug="louer-ou-acheter" />
        </section>
      </div>
    </>
  );
}
