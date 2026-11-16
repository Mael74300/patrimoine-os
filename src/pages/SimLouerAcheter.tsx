import { Link } from 'react-router-dom';
import { advantageBars, advantageByHorizon, advantageByPriceGrowth, breakEvenBand, fmtEur, fmtPct, rentVsBuy, scenarioValues } from '../lib/finance';
import { rentVsBuyTakeaway } from '../lib/takeaways';
import { Crumbs, Disclaimer, SimFaq, Takeaway, Kpi, LineChart, NumberField, PageHead, SavedSims, usePersistentState, JumpToResults, SimNotice } from '../components/ui';

type State = {
  price: number; downPayment: number; acquisitionRate: number; loanRate: number; loanYears: number; ownerCostRate: number;
  priceGrowth: number; sellingRate: number; monthlyRent: number; rentGrowth: number; investReturn: number; horizonYears: number;
};

// Exemple fictif : toutes les valeurs sont des hypothèses à remplacer par les vôtres.
const DEFAULTS: State = {
  price: 250000, downPayment: 50000, acquisitionRate: 0.08, loanRate: 0.035, loanYears: 20, ownerCostRate: 0.015,
  priceGrowth: 0.02, sellingRate: 0.05, monthlyRent: 900, rentGrowth: 0.02, investReturn: 0.04, horizonYears: 15,
};

type Scenario = { key: string; name: string; advantage: number; current: boolean };

function growthName(g: number): string {
  if (Math.abs(g) < 1e-9) return 'stable';
  return `${g > 0 ? '+' : ''}${fmtPct(g)}\u00a0/\u00a0an`;
}

/** Barres divergentes, une ligne par scénario : à gauche, louer laisse plus riche ; à droite, acheter. */
function ScenarioBars({ title, rows }: { title: string; rows: Scenario[] }) {
  const bars = advantageBars(rows.map((r) => r.advantage));
  return (
    <div className="dv-group">
      <h3>{title}</h3>
      <div className="dv-row dv-axis" aria-hidden="true"><span /><span className="dv-track"><span>← louer</span><span>acheter →</span></span><span /></div>
      <ul className="fb-list">
        {rows.map((r, i) => {
          const b = bars[i];
          return (
            <li key={r.key} className={'dv-row' + (r.current ? ' dv-cur' : '')}>
              <span className="dv-name">{r.name}{r.current && <span className="sr-only"> (vos réglages)</span>}</span>
              <span className="dv-track" aria-hidden="true">
                <span className="dv-half">{b.side === 'rent' && <span className="dv-bar dv-rent" style={{ width: `${b.pct}%` }} />}</span>
                <span className="dv-half">{b.side === 'buy' && <span className="dv-bar dv-buy" style={{ width: `${b.pct}%` }} />}</span>
              </span>
              <span className={'dv-value dv-' + b.side}>
                {b.side === 'tie' ? 'Égalité' : <>{b.side === 'buy' ? 'Acheter' : 'Louer'} <span className="dv-amount">+{fmtEur(Math.abs(r.advantage))}</span></>}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function SimLouerAcheter() {
  const [s, setS, up] = usePersistentState<State>('louer-acheter', DEFAULTS);
  const r = rentVsBuy(s);
  const byGrowth = advantageByPriceGrowth(s, scenarioValues([-0.01, 0, 0.02, 0.04], s.priceGrowth, -0.1, 0.15));
  const byHorizon = advantageByHorizon(s, scenarioValues([3, 5, 10, 15, 20], Math.floor(s.horizonYears), 1, 50));
  const buyWins = r.advantage > 0;
  const band = breakEvenBand(r.breakEvenMonth, r.series.length);

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Louer ou acheter' }]} />
      <PageHead eyebrow="Simulateur" title="Louer ou acheter sa résidence principale : comparer les patrimoines">
        Compare, à l’horizon choisi, le patrimoine d’un propriétaire (bien revendu, dette remboursée) et celui d’un locataire qui place l’apport, les frais et l’écart de budget mensuel.
      </PageHead>
      <SimNotice>
        Résultat entièrement fondé sur vos hypothèses (prix, loyer, hausses, rendement, frais) : modifiez-les, l’issue peut s’inverser. Le plus souvent, ce sont la durée de détention
        et l’évolution du prix qui décident. Pour le détail du prêt, voir le <Link to="/simulateurs/credit">calculateur de crédit</Link> et le <Link to="/simulateurs/comparer-des-credits#taeg">TAEG</Link>
        {' '}; pour la mensualité supportable, le <Link to="/simulateurs/endettement">taux d’endettement</Link>.
      </SimNotice>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Achat</legend>
            <NumberField label="Prix du bien" unit="€" value={s.price} onChange={up('price')} min={0} step={5000} sliderMax={1000000} />
            <NumberField label="Apport" unit="€" value={s.downPayment} onChange={up('downPayment')} min={0} step={5000} sliderMax={500000} />
            <NumberField label="Taux du prêt" unit="%" percent value={s.loanRate} onChange={up('loanRate')} min={0} max={20} step={0.05} sliderMax={8} />
            <NumberField label="Durée du prêt" unit="ans" value={s.loanYears} onChange={up('loanYears')} min={0} max={50} step={1} sliderMax={30} />
          </fieldset>
          <fieldset>
            <legend>Location et horizon</legend>
            <NumberField label="Loyer mensuel charges comprises" unit="€" value={s.monthlyRent} onChange={up('monthlyRent')} min={0} step={50} sliderMax={3000} />
            <NumberField label="Horizon de comparaison" unit="ans" value={s.horizonYears} onChange={up('horizonYears')} min={0} max={50} step={1} sliderMax={30} />
          </fieldset>
          <details className="fold advanced">
            <summary>Réglages avancés (facultatif)</summary>
            <div className="advanced-body">
              <p className="small muted">Déjà remplis avec des valeurs d’exemple. Si vous ne savez pas, laissez-les telles quelles : ce sont des hypothèses, pas des prévisions.</p>
              <NumberField label="Frais d’acquisition (en % du prix)" unit="%" percent value={s.acquisitionRate} onChange={up('acquisitionRate')} min={0} max={30} step={0.5} hint="Les frais payés en plus du prix à l’achat (notaire, taxes)." />
              <NumberField label="Taxe foncière, charges non récupérables, entretien (par an, en % de la valeur)" unit="%" percent value={s.ownerCostRate} onChange={up('ownerCostRate')} min={0} max={10} step={0.1} hint="Ce que le propriétaire paie chaque année en plus du prêt." />
              <NumberField label="Hausse annuelle du prix du bien" unit="%" percent value={s.priceGrowth} onChange={up('priceGrowth')} min={-10} max={15} step={0.25} hint="Hypothèse : le prix peut aussi baisser (valeur négative)." />
              <NumberField label="Frais de revente (en % du prix de vente)" unit="%" percent value={s.sellingRate} onChange={up('sellingRate')} min={0} max={30} step={0.5} hint="Ce qui est perdu à la revente (agence, diagnostics, etc.)." />
              <NumberField label="Hausse annuelle du loyer" unit="%" percent value={s.rentGrowth} onChange={up('rentGrowth')} min={-10} max={15} step={0.25} hint="De combien le loyer augmente chaque année (hypothèse)." />
              <NumberField label="Rendement annuel du placement (avant impôt)" unit="%" percent value={s.investReturn} onChange={up('investReturn')} min={-10} max={20} step={0.25} hint="Ce que rapporte l’argent que le locataire place au lieu d’acheter (hypothèse)." />
            </div>
          </details>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
          <JumpToResults />
        </form>
        <section id="resultats" aria-label="Résultats" tabIndex={-1}>
          <div className="kpis">
            <Kpi label="Patrimoine du propriétaire" value={fmtEur(r.buyerWealth)} sub={r.remainingDebt > 0.5 ? `revente ${fmtEur(r.finalValue)} (frais déduits), moins ${fmtEur(r.remainingDebt)} de prêt restant` : `revente ${fmtEur(r.finalValue)} (frais déduits), prêt soldé`} />
            <Kpi label="Patrimoine du locataire" value={fmtEur(r.renterWealth)} sub="apport, frais et écarts mensuels placés" />
            <Kpi label={buyWins ? 'Avantage à l’achat' : 'Avantage à la location'} value={fmtEur(Math.abs(r.advantage))} sub={`écart entre les deux patrimoines au bout de ${Math.floor(s.horizonYears)}\u00a0ans`} />
          </div>
          <Takeaway>{rentVsBuyTakeaway({ horizonYears: Math.floor(s.horizonYears), advantage: r.advantage, breakEvenMonth: r.breakEvenMonth })}</Takeaway>
          {r.series.length > 1 && (
            <>
              <h2>Qui est le plus riche, année après année ?</h2>
              <LineChart
                title="Patrimoine du propriétaire et du locataire à la fin de chaque année"
                xLabels={r.series.map((p) => `An ${p.year}`)}
                format={fmtEur}
                series={[
                  { name: 'Propriétaire', color: 'var(--chart-1)', values: r.series.map((p) => p.buyer) },
                  { name: 'Locataire', color: 'var(--chart-2)', values: r.series.map((p) => p.renter), dashed: true },
                ]}
                band={band ? { ...band, label: 'L’achat l’emporte', labelAt: 'bottom' } : undefined}
              />
              <p className="muted small">
                {band
                  ? 'Zone grisée : l’achat l’emporte pour de bon.'
                  : 'Tant que la courbe pleine (propriétaire) reste sous la courbe en tirets (locataire), louer laisse davantage.'}
                {' '}Le propriétaire rembourse {fmtEur(r.monthlyPayment)} par mois (hors assurance) et paie taxe foncière et entretien, le locataire paie son loyer :
                chaque mois, celui qui dépense le moins place la différence.
              </p>
            </>
          )}
          <h2>Et si les hypothèses changent ?</h2>
          <figure className="fb dv">
            <ScenarioBars
              title="Selon la durée avant de revendre"
              rows={byHorizon.map((d) => ({ key: `h${d.years}`, name: `${d.years}\u00a0ans`, advantage: d.advantage, current: d.years === Math.floor(s.horizonYears) }))}
            />
            <ScenarioBars
              title={`Selon la hausse du prix, à ${Math.floor(s.horizonYears)}\u00a0ans`}
              rows={byGrowth.map((d) => ({ key: `g${d.growth}`, name: growthName(d.growth), advantage: d.advantage, current: Math.abs(d.growth - s.priceGrowth) < 1e-9 }))}
            />
            <figcaption className="muted small">
              Une seule hypothèse change par ligne (surlignée : vos réglages) ; le montant est le patrimoine en plus de l’option gagnante.
              Le modèle ignore les impôts, l’assurance du prêt, les travaux exceptionnels et la valeur d’usage (stabilité, liberté de déménager).
            </figcaption>
          </figure>
          <SavedSims simKey="louer-acheter" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <Disclaimer />
          <SimFaq slug="louer-ou-acheter" />
        </section>
      </div>
    </>
  );
}
