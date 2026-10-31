import { useMemo } from 'react';
import { wealthTakeaway } from '../lib/takeaways';
import { afterTax, fmtEur, fmtPct, netOfFees, projectGrowth, requiredMonthly, type SavingsChange, type Withdrawal } from '../lib/finance';
import { Crumbs, Disclaimer, Fold, SimFaq, Takeaway, Kpi, LineChart, NumberField, PageHead, RowsEditor, SavedSims, SelectField, Tabs, usePersistentState } from '../components/ui';

type Scenario = {
  name: string;
  initial: number;
  monthly: number;
  contributionGrowth: number;
  years: number;
  annualReturn: number;
  annualFees: number;
  inflation: number;
  taxRate: number;
  withdrawals: Withdrawal[];
  savingsChanges: SavingsChange[];
};
type State = { scenarios: Scenario[]; active: number; target: number };

const SCENARIO: Scenario = {
  name: 'Scénario A', initial: 5000, monthly: 300, contributionGrowth: 0, years: 25, annualReturn: 0.05, annualFees: 0.005,
  inflation: 0.02, taxRate: 0.314, withdrawals: [], savingsChanges: [],
};
const DEFAULTS: State = { scenarios: [SCENARIO], active: 0, target: 300000 };
const COLORS = ['var(--chart-1)', 'var(--chart-4)', 'var(--chart-3)'];

const PROFILES = [
  { name: 'Prudent', rate: 0.02, label: '2 % par an' },
  { name: 'Moyen', rate: 0.05, label: '5 % par an' },
  { name: 'Ambitieux', rate: 0.07, label: '7 % par an' },
];
const TAX_OPTIONS = [
  { v: 0, label: 'Aucune (livret réglementé)' },
  { v: 0.172, label: '17,2 % (prélèvements sociaux seuls, ex. assurance-vie après abattement)' },
  { v: 0.186, label: '18,6 % (prélèvements sociaux, taux relevé 2026)' },
  { v: 0.314, label: '31,4 % (PFU 2026, compte-titres)' },
];

export default function SimPatrimoine() {
  const [st, setSt] = usePersistentState<State>('patrimoine-v2', DEFAULTS);
  const active = Math.min(st.active, st.scenarios.length - 1);
  const s = st.scenarios[active];
  const set = <K extends keyof Scenario>(k: K) => (v: Scenario[K]) =>
    setSt((x) => ({ ...x, scenarios: x.scenarios.map((sc, i) => (i === active ? { ...sc, [k]: v } : sc)) }));

  const runs = useMemo(() => st.scenarios.map((sc) => projectGrowth(sc)), [st.scenarios]);
  const points = runs[active];
  const last = points[points.length - 1];
  const invested = last.contributed - last.withdrawn;
  const net = afterTax(last.value, invested, s.taxRate);
  const netReal = net / Math.pow(1 + s.inflation, s.years);
  const netRate = netOfFees(s.annualReturn, s.annualFees);
  const need = requiredMonthly(st.target, s.initial, netRate, s.years);
  const maxYears = Math.max(...runs.map((r) => r.length - 1));

  const addScenario = () =>
    setSt((x) => x.scenarios.length >= 3 ? x : {
      ...x,
      scenarios: [...x.scenarios, { ...x.scenarios[active], name: `Scénario ${'ABC'[x.scenarios.length]}` }],
      active: x.scenarios.length,
    });
  const removeScenario = () =>
    setSt((x) => x.scenarios.length <= 1 ? x : { ...x, scenarios: x.scenarios.filter((_, i) => i !== active), active: 0 });

  const series = st.scenarios.length === 1
    ? [
        { name: 'Capital nominal', color: COLORS[0], values: points.map((p) => p.value) },
        { name: "Capital en euros d'aujourd'hui", color: 'var(--chart-2)', values: points.map((p) => p.realValue), dashed: true },
        { name: 'Versements cumulés', color: 'var(--chart-3)', values: points.map((p) => p.contributed) },
      ]
    : st.scenarios.map((sc, i) => ({
        name: sc.name,
        color: COLORS[i],
        values: Array.from({ length: maxYears + 1 }, (_, y) => runs[i][y]?.value),
      }));

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Patrimoine à long terme' }]} />
      <PageHead eyebrow="Simulateur" title="Simulateur de patrimoine à long terme">
        Combien aurez-vous dans quelques années en mettant de côté un peu chaque mois ? Trois réglages suffisent : les autres sont facultatifs. Vous pouvez aussi comparer jusqu'à trois scénarios.
      </PageHead>
      <div className="sim">
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          {st.scenarios.length > 1 && <Tabs label="Scénarios" items={st.scenarios.map((sc) => sc.name)} active={active} onSelect={(i) => setSt((x) => ({ ...x, active: i }))} />}
          <fieldset>
            <legend>L'essentiel : 3 réglages</legend>
            <NumberField label="Combien avez-vous déjà de côté ?" unit="€" value={s.initial} onChange={set('initial')} min={0} step={500} sliderMax={100000} hint="0 si vous partez de zéro." />
            <NumberField label="Combien pouvez-vous mettre de côté chaque mois ?" unit="€" value={s.monthly} onChange={set('monthly')} min={0} step={10} sliderMax={2000} />
            <NumberField label="Pendant combien d'années ?" unit="ans" value={s.years} onChange={set('years')} min={0} max={60} sliderMax={50} />
          </fieldset>
          <fieldset>
            <legend>Que pensez-vous obtenir comme rendement ?</legend>
            <div className="choice-row" role="group" aria-label="Hypothèse de rendement">
              {PROFILES.map((p) => (
                <button key={p.name} type="button" className={'choice' + (s.annualReturn === p.rate ? ' on' : '')} aria-pressed={s.annualReturn === p.rate} onClick={() => set('annualReturn')(p.rate)}>
                  <strong>{p.name}</strong>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
            <p className="small muted">Ce sont des hypothèses de calcul, pas des prévisions : personne ne peut garantir un rendement. En général, plus l'hypothèse est haute, plus le risque de perdre de l'argent est fort. Vous pouvez saisir votre propre valeur dans les réglages avancés.</p>
          </fieldset>
          <details className="fold advanced">
            <summary>Réglages avancés (facultatif)</summary>
            <div className="advanced-body">
              <p className="small muted">Déjà remplis avec des valeurs d'exemple. Si vous ne savez pas, laissez-les telles quelles.</p>
              <div className="btn-row" style={{ marginBottom: 14 }}>
                {st.scenarios.length < 3 && <button type="button" className="btn small" onClick={addScenario}>Comparer : dupliquer en nouveau scénario</button>}
                {st.scenarios.length > 1 && <button type="button" className="btn small secondary" onClick={removeScenario}>Supprimer ce scénario</button>}
              </div>
              <NumberField label="Rendement annuel choisi (avant frais)" unit="%" percent value={s.annualReturn} onChange={set('annualReturn')} step={0.25} min={-10} max={20} hint="Ce que le placement rapporte chaque année en moyenne, avant frais." />
              <NumberField label="Frais annuels" unit="%" percent value={s.annualFees} onChange={set('annualFees')} step={0.1} min={0} max={5} hint="Frais prélevés chaque année par le placement (gestion, courtage…). Ils réduisent le rendement." />
              <NumberField label="Inflation supposée" unit="%" percent value={s.inflation} onChange={set('inflation')} step={0.25} min={-2} max={15} hint="Hausse moyenne des prix par an : elle réduit ce que l'on peut acheter avec le même capital." />
              <SelectField label="Impôts sur les gains à la sortie" value={s.taxRate} options={TAX_OPTIONS} onChange={set('taxRate')} hint="Simplification : un taux unique appliqué aux gains restants. Pas sûr ? Gardez la valeur proposée." />
              <NumberField label="Hausse annuelle de l'épargne" unit="%" percent value={s.contributionGrowth} onChange={set('contributionGrowth')} step={0.5} min={0} max={20} hint="Si vous augmentez votre épargne chaque année (par exemple avec votre salaire)." />
              <RowsEditor
                title="Changer le montant épargné en cours de route"
                empty="Épargne identique sur toute la durée."
                rows={s.savingsChanges.map((c) => ({ a: c.fromYear, b: c.monthly }))}
                onChange={(rows) => set('savingsChanges')(rows.map((r) => ({ fromYear: r.a, monthly: r.b })))}
                aLabel="À partir de l'année" bLabel="Épargne" bUnit="€/mois" addLabel="Ajouter une phase"
              />
              <RowsEditor
                title="Retirer de l'argent en cours de route"
                empty="Aucun retrait prévu."
                rows={s.withdrawals.map((w) => ({ a: w.year, b: w.amount }))}
                onChange={(rows) => set('withdrawals')(rows.map((r) => ({ year: r.a, amount: r.b })))}
                aLabel="Fin de l'année" bLabel="Montant" bUnit="€" addLabel="Ajouter un retrait"
              />
            </div>
          </details>
          <button type="button" className="btn small secondary" onClick={() => setSt(DEFAULTS)}>Réinitialiser</button>
        </form>

        <section aria-label="Résultats">
          <div className="kpis">
            <Kpi label="Total des versements" value={fmtEur(last.contributed)} sub={last.withdrawn ? `${fmtEur(last.withdrawn)} retirés` : undefined} />
            <Kpi label="Gains ou pertes simulés" value={fmtEur(last.gains)} tone={last.gains >= 0 ? 'pos' : 'neg'} />
            <Kpi label={`Capital final nominal (${s.years} ans)`} value={fmtEur(last.value)} sub={`${fmtEur(net)} après fiscalité`} />
            <Kpi label="Corrigé de l'inflation" value={fmtEur(last.realValue)} sub={`${fmtEur(netReal)} après fiscalité`} />
          </div>
          <Takeaway>{wealthTakeaway({ years: s.years, contributed: last.contributed, withdrawn: last.withdrawn, value: last.value, gains: last.gains, netValue: net, netRealValue: netReal, taxRate: s.taxRate, inflation: s.inflation })}</Takeaway>
          <div className="panel">
            <LineChart title="Évolution du capital" xLabels={Array.from({ length: (st.scenarios.length === 1 ? points.length - 1 : maxYears) + 1 }, (_, y) => `An ${y}`)} format={fmtEur} series={series} />
          </div>

          {st.scenarios.length > 1 && (
            <>
              <h2>Comparaison des scénarios</h2>
              <div className="table-wrap" tabIndex={0}>
                <table>
                  <thead><tr><th>Scénario</th><th className="r">Durée</th><th className="r">Versements</th><th className="r">Gains</th><th className="r">Capital nominal</th><th className="r">Corrigé inflation</th><th className="r">Après fiscalité</th></tr></thead>
                  <tbody>
                    {st.scenarios.map((sc, i) => {
                      const l = runs[i][runs[i].length - 1];
                      return (
                        <tr key={i}>
                          <td><span style={{ color: COLORS[i] }}>●</span> {sc.name}</td>
                          <td className="r">{sc.years} ans</td>
                          <td className="r">{fmtEur(l.contributed)}</td>
                          <td className="r">{fmtEur(l.gains)}</td>
                          <td className="r">{fmtEur(l.value)}</td>
                          <td className="r">{fmtEur(l.realValue)}</td>
                          <td className="r">{fmtEur(afterTax(l.value, l.contributed - l.withdrawn, sc.taxRate))}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <h2>Atteindre un objectif</h2>
          <div className="grid cols-2" style={{ maxWidth: 520 }}>
            <NumberField label="Objectif de capital" unit="€" value={st.target} onChange={(v) => setSt((x) => ({ ...x, target: v }))} min={0} step={10000} />
          </div>
          <p>
            Avec un rendement net de frais de <strong>{fmtPct(netRate)}</strong>, atteindre <strong>{fmtEur(st.target)}</strong> en {s.years} ans
            demanderait une épargne mensuelle constante d'environ <strong>{fmtEur(need)}</strong> (hors retraits).
          </p>

          <Fold title={`Tableau d'évolution année par année — ${s.name}`}>
          <div className="table-wrap" tabIndex={0}>
            <table>
              <thead><tr><th>Année</th><th className="r">Versé (cumul)</th><th className="r">Retiré (cumul)</th><th className="r">Capital nominal</th><th className="r">Gains</th><th className="r">Corrigé inflation</th></tr></thead>
              <tbody>
                {points.map((p) => (
                  <tr key={p.year}>
                    <td>{p.year}</td>
                    <td className="r">{fmtEur(p.contributed)}</td>
                    <td className="r">{fmtEur(p.withdrawn)}</td>
                    <td className="r">{fmtEur(p.value)}</td>
                    <td className={'r ' + (p.gains < 0 ? 'neg' : '')}>{fmtEur(p.gains)}</td>
                    <td className="r">{fmtEur(p.realValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small muted" style={{ marginTop: 12 }}>
            Conventions : versements en début de mois, capitalisation mensuelle au taux équivalent au taux annuel net de frais,
            retraits en fin d'année. Rendement nominal ; la colonne « corrigé inflation » divise par (1 + inflation)^année.
          </p>
          </Fold>
          <SavedSims simKey="patrimoine-v2" current={st} onLoad={(d) => setSt({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
          <SimFaq slug="patrimoine" />
        </section>
      </div>
    </>
  );
}
