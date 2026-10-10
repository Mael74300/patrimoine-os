import { useMemo } from 'react';
import { afterTax, fmtEur, fmtPct, netOfFees, projectGrowth, requiredMonthly } from '../lib/finance';
import { Crumbs, Disclaimer, Kpi, LineChart, NumberField, PageHead, SavedSims, usePersistentState } from '../components/ui';

const DEFAULTS = {
  initial: 5000,
  monthly: 300,
  annualReturn: 0.05,
  annualFees: 0.005,
  years: 25,
  inflation: 0.02,
  contributionGrowth: 0,
  taxRate: 0.314,
  target: 300000,
};

const TAX_OPTIONS = [
  { v: 0, label: 'Aucune (ex. livret réglementé)' },
  { v: 0.172, label: '17,2 % — prélèvements sociaux (ex. assurance-vie après abattement)' },
  { v: 0.186, label: '18,6 % — prélèvements sociaux taux 2026 relevé' },
  { v: 0.314, label: '31,4 % — PFU 2026 (compte-titres)' },
];

export default function SimPatrimoine() {
  const [s, setS, up] = usePersistentState('patrimoine', DEFAULTS);

  const points = useMemo(() => projectGrowth(s), [s]);
  const scenarios = useMemo(
    () => ({
      low: projectGrowth({ ...s, annualReturn: s.annualReturn - 0.02 }),
      high: projectGrowth({ ...s, annualReturn: s.annualReturn + 0.02 }),
    }),
    [s],
  );
  const last = points[points.length - 1];
  const net = afterTax(last.value, last.contributed, s.taxRate);
  const realNet = net / Math.pow(1 + s.inflation, s.years);
  const netRate = netOfFees(s.annualReturn, s.annualFees);
  const need = requiredMonthly(s.target, s.initial, netRate, s.years);
  const noFees = useMemo(() => projectGrowth({ ...s, annualFees: 0 }), [s]);
  const feesCost = noFees[noFees.length - 1].value - last.value;

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Patrimoine à long terme' }]} />
      <PageHead eyebrow="Simulateur" title="Simulateur de patrimoine à long terme">
        Projetez un capital avec des versements réguliers, des frais, l'inflation et la fiscalité à la sortie.
      </PageHead>
      <div className="sim">
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Versements</legend>
            <NumberField label="Capital de départ" unit="€" value={s.initial} onChange={up('initial')} min={0} step={500} />
            <NumberField label="Versement mensuel" unit="€" value={s.monthly} onChange={up('monthly')} min={0} step={50} />
            <NumberField label="Hausse annuelle des versements" unit="%" percent value={s.contributionGrowth} onChange={up('contributionGrowth')} step={0.5} min={0} max={20} />
            <NumberField label="Durée" unit="ans" value={s.years} onChange={up('years')} min={1} max={60} />
          </fieldset>
          <fieldset>
            <legend>Hypothèses</legend>
            <NumberField label="Rendement annuel brut supposé" unit="%" percent value={s.annualReturn} onChange={up('annualReturn')} step={0.25} min={-10} max={20} hint="Hypothèse personnelle, non garantie." />
            <NumberField label="Frais annuels" unit="%" percent value={s.annualFees} onChange={up('annualFees')} step={0.1} min={0} max={5} />
            <NumberField label="Inflation annuelle supposée" unit="%" percent value={s.inflation} onChange={up('inflation')} step={0.25} min={-2} max={15} />
            <div className="field">
              <label htmlFor="tax">Fiscalité sur les gains à la sortie</label>
              <select id="tax" value={s.taxRate} onChange={(e) => up('taxRate')(Number(e.target.value))}>
                {TAX_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
              </select>
              <div className="hint">Simplification : un taux unique appliqué aux gains.</div>
            </div>
            <NumberField label="Objectif de capital" unit="€" value={s.target} onChange={up('target')} min={0} step={10000} />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
        </form>

        <section aria-label="Résultats">
          <div className="kpis">
            <Kpi label={`Valeur projetée à ${s.years} ans`} value={fmtEur(last.value)} sub={`dont ${fmtEur(last.gains)} de gains`} />
            <Kpi label="Total versé" value={fmtEur(last.contributed)} />
            <Kpi label="Après fiscalité" value={fmtEur(net)} sub={`soit ${fmtEur(realNet)} en euros d'aujourd'hui`} />
            <Kpi label="Coût cumulé des frais" value={fmtEur(feesCost)} tone={feesCost > 0 ? 'neg' : undefined} sub="vs même scénario sans frais" />
          </div>
          <div className="panel">
            <LineChart
              title="Projection du patrimoine"
              xLabels={points.map((p) => `An ${p.year}`)}
              format={fmtEur}
              series={[
                { name: 'Scénario central', color: 'var(--chart-1)', values: points.map((p) => p.value) },
                { name: 'Rendement −2 pts', color: 'var(--chart-3)', values: scenarios.low.map((p) => p.value), dashed: true },
                { name: 'Rendement +2 pts', color: 'var(--chart-4)', values: scenarios.high.map((p) => p.value), dashed: true },
                { name: 'Versements cumulés', color: 'var(--chart-2)', values: points.map((p) => p.contributed) },
              ]}
            />
          </div>

          <h2>Atteindre votre objectif</h2>
          <p>
            Avec un rendement net de frais de <strong>{fmtPct(netRate)}</strong>, atteindre <strong>{fmtEur(s.target)}</strong> en {s.years} ans
            demanderait un versement mensuel constant d'environ <strong>{fmtEur(need)}</strong>
            {need <= s.monthly ? ' — votre versement actuel suffit selon ces hypothèses.' : ` (contre ${fmtEur(s.monthly)} actuellement).`}
          </p>

          <h2>Évolution détaillée</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Année</th><th className="r">Versé</th><th className="r">Valeur</th><th className="r">Gains</th><th className="r">Valeur réelle</th></tr></thead>
              <tbody>
                {points.filter((p) => p.year % 5 === 0 || p.year === s.years).map((p) => (
                  <tr key={p.year}>
                    <td>{p.year}</td>
                    <td className="r">{fmtEur(p.contributed)}</td>
                    <td className="r">{fmtEur(p.value)}</td>
                    <td className="r">{fmtEur(p.gains)}</td>
                    <td className="r">{fmtEur(p.realValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <SavedSims simKey="patrimoine" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
        </section>
      </div>
    </>
  );
}
