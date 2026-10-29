import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { compareEtfImmo, fmtEur, fmtPct, netOfFees, rentalAnalysis, type RentalInput } from '../lib/finance';
import { load } from '../lib/storage';
import { Crumbs, Disclaimer, SimFaq, Kpi, LineChart, NumberField, PageHead, SavedSims, SelectField, usePersistentState } from '../components/ui';
import { PS_OPTIONS, REGIMES, RENTAL_DEFAULTS, TMI_OPTIONS } from './SimImmobilier';

type State = {
  rental: RentalInput;
  etfReturn: number;
  etfFees: number;
  etfTax: number;
  horizon: number;
  inflation: number;
  cashRate: number;
  saleCostRate: number;
};

const DEFAULTS: State = {
  rental: RENTAL_DEFAULTS,
  etfReturn: 0.06,
  etfFees: 0.003,
  etfTax: 0.314,
  horizon: 20,
  inflation: 0.02,
  cashRate: 0.017,
  saleCostRate: 0.05,
};

const ETF_TAX = [
  { v: 0.314, label: '31,4 % (compte-titres, PFU 2026)' },
  { v: 0.186, label: '18,6 % (PEA après 5 ans, à vérifier)' },
  { v: 0.172, label: '17,2 % (PEA, taux historique)' },
  { v: 0, label: 'Aucune' },
];

export default function SimEtfImmobilier() {
  const [st, setSt] = usePersistentState<State>('etf-immobilier', DEFAULTS);
  const set = <K extends keyof State>(k: K) => (v: State[K]) => setSt((x) => ({ ...x, [k]: v }));
  const setR = <K extends keyof RentalInput>(k: K) => (v: RentalInput[K]) => setSt((x) => ({ ...x, rental: { ...x.rental, [k]: v } }));
  const R = st.rental;

  const res = useMemo(
    () => compareEtfImmo({
      rental: R,
      etf: { annualReturn: st.etfReturn, annualFees: st.etfFees, exitTaxRate: st.etfTax },
      horizon: st.horizon, inflation: st.inflation, cashRate: st.cashRate, saleCostRate: st.saleCostRate,
    }),
    [st, R],
  );
  const snap = useMemo(() => rentalAnalysis(R), [R]);
  const months = Math.max(1, st.horizon * 12);
  const avgMonthly = (res.etf.invested - res.startCapital) / months;
  const diff = res.etf.netWealth - res.immo.netWealth;

  const importFromCalculator = () => {
    const saved = load<Partial<RentalInput> | null>('last:immobilier', null);
    if (saved) setSt((x) => ({ ...x, rental: { ...RENTAL_DEFAULTS, ...saved } }));
  };

  const rows: [string, string, string][] = [
    ['Capital initial', fmtEur(res.startCapital), `${fmtEur(res.startCapital)} (apport)`],
    ['Épargne mensuelle moyenne', fmtEur(avgMonthly), fmtEur(avgMonthly)],
    ['Rendement hypothétique', `${fmtPct(st.etfReturn)} brut par an`, `loyers : rendement net ${fmtPct(snap.netYield)} ; prix du bien ${fmtPct(R.appreciation)} par an`],
    ['Frais', `${fmtPct(st.etfFees)} par an (net : ${fmtPct(netOfFees(st.etfReturn, st.etfFees))})`, `frais d'acquisition ${fmtPct(R.notaryRate)}, charges, crédit, revente ${fmtPct(st.saleCostRate)}`],
    ['Fiscalité', `gains imposés à ${fmtPct(st.etfTax)} à la sortie`, `${REGIMES.find((g) => g.v === R.regime)?.label} ; plus-value immobilière avec abattements`],
    ['Inflation', fmtPct(st.inflation), fmtPct(st.inflation)],
    ['Endettement', 'aucun', `${fmtEur(snap.loanAmount)} au départ, ${fmtEur(res.immo.debtAtHorizon)} à ${st.horizon} ans`],
    ['Patrimoine net estimé', fmtEur(res.etf.netWealth), fmtEur(res.immo.netWealth)],
    ["En euros d'aujourd'hui", fmtEur(res.etf.netWealthReal), fmtEur(res.immo.netWealthReal)],
    ['Liquidité', 'revente en quelques jours ouvrés', 'revente en plusieurs mois, frais élevés'],
    ['Temps de gestion', 'quelques minutes par mois', 'plusieurs heures par an (locataires, travaux, comptabilité)'],
    ['Risques majeurs', 'baisses de marché fortes et durables, risque de change', 'vacance, impayés, travaux, réglementation, baisse des prix locaux, concentration sur un bien'],
  ];

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'ETF ou immobilier' }]} />
      <PageHead eyebrow="Comparateur" title="Comparateur ETF et immobilier locatif">
        Deux stratégies financées par le même capital et le même effort d'épargne, comparées sur leur patrimoine net estimé à l'horizon.
      </PageHead>

      <div className="basis" role="note">
        <strong>Base de comparaison</strong>
        <ol>
          <li>Le même capital de départ : l'apport immobilier est investi en ETF dans l'autre scénario.</li>
          <li>Le même effort d'épargne chaque année : l'argent que le bien exige après impôt (flux négatif) est versé sur les ETF. Si le bien dégage un excédent, il est placé à {fmtPct(st.cashRate)}.</li>
          <li>La même date de sortie : patrimoine net après frais de revente et impôts estimés, des deux côtés.</li>
        </ol>
        <p className="small muted" style={{ margin: '8px 0 0' }}>
          Le rendement locatif (calculé sur le prix du bien) et le rendement d'un ETF (calculé sur la somme investie) ne sont jamais comparés directement.
        </p>
      </div>

      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <button type="button" className="btn small secondary" onClick={importFromCalculator} style={{ marginBottom: 14 }}>
            Reprendre ma saisie du calculateur immobilier
          </button>
          <fieldset>
            <legend>Commun</legend>
            <NumberField label="Horizon" unit="ans" value={st.horizon} onChange={set('horizon')} min={1} max={40} />
            <NumberField label="Inflation hypothétique" unit="%" percent value={st.inflation} onChange={set('inflation')} step={0.25} min={-2} max={15} />
          </fieldset>
          <fieldset>
            <legend>ETF</legend>
            <NumberField label="Rendement hypothétique brut" unit="%" percent value={st.etfReturn} onChange={set('etfReturn')} step={0.25} min={-10} max={20} />
            <NumberField label="Frais annuels" unit="%" percent value={st.etfFees} onChange={set('etfFees')} step={0.05} min={0} max={5} />
            <SelectField label="Fiscalité des gains à la sortie" value={st.etfTax} options={ETF_TAX} onChange={set('etfTax')} />
          </fieldset>
          <fieldset>
            <legend>Immobilier</legend>
            <NumberField label="Prix du bien" unit="€" value={R.price} onChange={setR('price')} min={0} step={5000} />
            <NumberField label="Frais d'acquisition" unit="%" percent value={R.notaryRate} onChange={setR('notaryRate')} step={0.5} min={0} max={20} />
            <NumberField label="Travaux" unit="€" value={R.works} onChange={setR('works')} min={0} step={1000} />
            <NumberField label="Apport (capital initial)" unit="€" value={R.downPayment} onChange={setR('downPayment')} min={0} step={1000} />
            <NumberField label="Loyer mensuel" unit="€" value={R.monthlyRent} onChange={setR('monthlyRent')} min={0} step={25} />
            <NumberField label="Vacance" unit="mois/an" value={R.vacancyMonths} onChange={setR('vacancyMonths')} min={0} max={12} step={0.5} />
            <NumberField label="Taxe foncière" unit="€/an" value={R.propertyTax} onChange={setR('propertyTax')} min={0} step={50} />
            <NumberField label="Autres charges" unit="€/an" value={R.coOwnership} onChange={setR('coOwnership')} min={0} step={50} />
            <NumberField label="Taux du crédit" unit="%" percent value={R.loanRate} onChange={setR('loanRate')} step={0.05} min={0} max={15} />
            <NumberField label="Durée du crédit" unit="ans" value={R.loanYears} onChange={setR('loanYears')} min={0} max={30} />
            <SelectField label="Régime fiscal" value={R.regime} options={REGIMES} onChange={(v) => setSt((x) => ({ ...x, rental: { ...x.rental, regime: v, microAllowance: REGIMES.find((g) => g.v === v)?.allowance ?? x.rental.microAllowance } }))} />
            <SelectField label="Tranche marginale" value={R.marginalRate} options={TMI_OPTIONS} onChange={setR('marginalRate')} />
            <SelectField label="Prélèvements sociaux" value={R.socialRate} options={PS_OPTIONS} onChange={setR('socialRate')} />
            <NumberField label="Évolution du prix du bien" unit="%/an" percent value={R.appreciation} onChange={setR('appreciation')} step={0.25} min={-10} max={10} />
            <NumberField label="Indexation loyers et charges" unit="%/an" percent value={R.indexation} onChange={setR('indexation')} step={0.25} min={-5} max={10} />
            <NumberField label="Frais de revente" unit="%" percent value={st.saleCostRate} onChange={set('saleCostRate')} step={0.5} min={0} max={15} />
            <NumberField label="Placement des excédents" unit="%/an" percent value={st.cashRate} onChange={set('cashRate')} step={0.1} min={0} max={10} />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setSt(DEFAULTS)}>Réinitialiser</button>
        </form>

        <section aria-label="Résultats">
          <div className="kpis">
            <Kpi label={`ETF : patrimoine net à ${st.horizon} ans`} value={fmtEur(res.etf.netWealth)} sub={`${fmtEur(res.etf.netWealthReal)} en euros d'aujourd'hui`} />
            <Kpi label={`Immobilier : patrimoine net à ${st.horizon} ans`} value={fmtEur(res.immo.netWealth)} sub={`${fmtEur(res.immo.netWealthReal)} en euros d'aujourd'hui`} />
            <Kpi label="Sommes investies (chaque côté)" value={fmtEur(res.etf.invested)} sub={`dont ${fmtEur(res.startCapital)} au départ`} />
            <Kpi label="Écart selon ces hypothèses" value={fmtEur(Math.abs(diff))} sub={diff >= 0 ? 'en faveur des ETF' : "en faveur de l'immobilier"} />
          </div>
          <div className="panel">
            <LineChart
              title="Patrimoine avant frais de sortie"
              xLabels={res.years.map((y) => `An ${y.year}`)}
              format={fmtEur}
              series={[
                { name: 'ETF (valeur)', color: 'var(--chart-1)', values: res.years.map((y) => y.etfValue) },
                { name: 'Immobilier (valeur − dette + excédents)', color: 'var(--chart-3)', values: res.years.map((y) => y.immoNetBeforeExit) },
                { name: 'Dette immobilière', color: 'var(--chart-4)', values: res.years.map((y) => y.debt), dashed: true },
              ]}
            />
            <p className="small muted" style={{ margin: '8px 0 0' }}>Courbes avant frais de revente et impôts de sortie ; ceux-ci sont déduits dans les montants nets ci-dessus.</p>
          </div>

          <h2>Comparaison détaillée</h2>
          <div className="table-wrap" tabIndex={0}>
            <table>
              <thead><tr><th style={{ width: 170 }}><span className="sr-only">Critère</span></th><th>ETF</th><th>Immobilier locatif</th></tr></thead>
              <tbody>
                {rows.map(([k, a, b]) => <tr key={k}><th scope="row">{k}</th><td>{a}</td><td>{b}</td></tr>)}
                <tr><th scope="row">Frais et impôts de sortie</th><td>{fmtEur(res.etf.exitCosts)}</td><td>{fmtEur(res.immo.exitCosts)}</td></tr>
              </tbody>
            </table>
          </div>
          <p className="small muted" style={{ marginTop: 12 }}>
            Hypothèses simplificatrices : rendements constants chaque année, sans volatilité ; fiscalité locative estimée ; plus-value immobilière sans surtaxe.
            Un résultat différent avec d'autres hypothèses est normal : modifiez rendement et évolution des prix pour mesurer la sensibilité.
            Méthode détaillée dans le guide <Link to="/guides/immobilier-ou-etf">Comment comparer immobilier et ETF</Link>.
          </p>
          <SavedSims simKey="etf-immobilier" current={st} onLoad={(d) => setSt({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
          <SimFaq slug="etf-immobilier" />
        </section>
      </div>
    </>
  );
}
