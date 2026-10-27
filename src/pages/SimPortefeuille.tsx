import { useMemo } from 'react';
import { fmtEur, fmtPct, projectGrowth, rebalance, summarizePortfolio, type PortfolioLine } from '../lib/finance';
import { Crumbs, Disclaimer, SimFaq, Kpi, LineChart, NumberField, PageHead, SavedSims, usePersistentState } from '../components/ui';

type Line = PortfolioLine & { target: number };
type State = { lines: Line[]; monthly: number; years: number };

const DEFAULTS: State = {
  monthly: 300,
  years: 20,
  lines: [
    { id: 'l1', label: 'ETF actions monde', amount: 12000, expectedReturn: 0.06, fees: 0.002, risk: 4, target: 0.6 },
    { id: 'l2', label: 'Fonds euros', amount: 5000, expectedReturn: 0.025, fees: 0.006, risk: 1, target: 0.25 },
    { id: 'l3', label: 'Livret A', amount: 3000, expectedReturn: 0.017, fees: 0, risk: 1, target: 0.15 },
  ],
};
const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', '#5a7d8c', '#a0a35a'];

export default function SimPortefeuille() {
  const [s, setS] = usePersistentState<State>('portefeuille', DEFAULTS);
  const sum = useMemo(() => summarizePortfolio(s.lines), [s.lines]);
  const targetTotal = s.lines.reduce((a, l) => a + l.target, 0);
  const moves = useMemo(() => rebalance(s.lines, Object.fromEntries(s.lines.map((l) => [l.id, l.target]))), [s.lines]);
  const proj = useMemo(
    () => projectGrowth({ initial: sum.total, monthly: s.monthly, annualReturn: sum.netReturn, annualFees: 0, years: s.years, inflation: 0 }),
    [sum, s.monthly, s.years],
  );

  const setLine = (id: string, patch: Partial<Line>) =>
    setS((st) => ({ ...st, lines: st.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Portefeuille' }]} />
      <PageHead eyebrow="Calculateur" title="Calculateur de portefeuille financier">
        Saisissez vos lignes : le calculateur pondère rendements supposés, frais et risque, puis indique les mouvements pour revenir à votre allocation cible.
      </PageHead>

      <div className="kpis">
        <Kpi label="Valeur totale" value={fmtEur(sum.total)} />
        <Kpi label="Rendement supposé net de frais" value={fmtPct(sum.netReturn)} sub={`brut ${fmtPct(sum.grossReturn)}`} />
        <Kpi label="Frais annuels" value={fmtEur(sum.annualFeesEuro)} sub={`${fmtPct(sum.weightedFees)} en moyenne`} tone="neg" />
        <Kpi label="Risque moyen pondéré" value={`${sum.weightedRisk.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} / 7`} sub="échelle saisie par vous" />
      </div>

      <h2>Lignes du portefeuille</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Support</th><th className="r">Montant (€)</th><th className="r">Rendement supposé (%)</th><th className="r">Frais (%)</th>
              <th className="r">Risque (1-7)</th><th className="r">Cible (%)</th><th className="r">Poids actuel</th><th className="r">Rééquilibrage</th><th />
            </tr>
          </thead>
          <tbody>
            {s.lines.map((l, idx) => {
              const w = sum.weights.find((x) => x.id === l.id)?.weight ?? 0;
              const num = (v: number, f: (n: number) => void, step = 1, label = '') => (
                <input type="number" aria-label={`${label} ${l.label}`} step={step} value={v} style={{ width: 90, textAlign: 'right' }}
                  onChange={(e) => { const n = parseFloat(e.target.value); if (Number.isFinite(n)) f(n); }} />
              );
              return (
                <tr key={l.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span style={{ color: COLORS[idx % COLORS.length] }}>●</span>{' '}
                    <input type="text" aria-label="Nom du support" value={l.label} style={{ width: 170 }} onChange={(e) => setLine(l.id, { label: e.target.value })} />
                  </td>
                  <td className="r">{num(l.amount, (n) => setLine(l.id, { amount: Math.max(0, n) }), 100, 'Montant')}</td>
                  <td className="r">{num(+(l.expectedReturn * 100).toFixed(4), (n) => setLine(l.id, { expectedReturn: n / 100 }), 0.25, 'Rendement')}</td>
                  <td className="r">{num(+(l.fees * 100).toFixed(4), (n) => setLine(l.id, { fees: Math.max(0, n / 100) }), 0.05, 'Frais')}</td>
                  <td className="r">{num(l.risk, (n) => setLine(l.id, { risk: Math.min(7, Math.max(1, n)) }), 1, 'Risque')}</td>
                  <td className="r">{num(+(l.target * 100).toFixed(4), (n) => setLine(l.id, { target: Math.max(0, n / 100) }), 5, 'Cible')}</td>
                  <td className="r">{fmtPct(w)}</td>
                  <td className="r" style={{ color: moves[l.id] >= 0 ? 'var(--accent)' : 'var(--danger)' }}>
                    {moves[l.id] >= 0 ? '+' : ''}{fmtEur(moves[l.id])}
                  </td>
                  <td>
                    <button className="btn small secondary" aria-label={`Retirer ${l.label}`} onClick={() => setS((st) => ({ ...st, lines: st.lines.filter((x) => x.id !== l.id) }))}>×</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="btn-row" style={{ marginTop: 12 }}>
        <button className="btn small" onClick={() => setS((st) => ({ ...st, lines: [...st.lines, { id: 'l' + Date.now(), label: 'Nouveau support', amount: 1000, expectedReturn: 0.03, fees: 0.005, risk: 3, target: 0 }] }))}>
          Ajouter une ligne
        </button>
        <button className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
      </div>
      {Math.abs(targetTotal - 1) > 0.001 && (
        <p className="notice small" style={{ marginTop: 12 }}>
          Vos allocations cibles totalisent {fmtPct(targetTotal)} au lieu de 100 % : le rééquilibrage affiché n'est pas cohérent.
        </p>
      )}

      <h2>Répartition actuelle</h2>
      <div className="panel">
        {sum.weights.map((w, i) => (
          <div key={w.id} style={{ marginBottom: 10 }}>
            <div className="small" style={{ display: 'flex', justifyContent: 'space-between' }}><span>{w.label}</span><span className="num">{fmtPct(w.weight)}</span></div>
            <div className="bar"><div style={{ width: `${w.weight * 100}%`, background: COLORS[i % COLORS.length] }} /></div>
          </div>
        ))}
      </div>

      <h2>Projection</h2>
      <div className="grid cols-2" style={{ maxWidth: 520 }}>
        <NumberField label="Versement mensuel" unit="€" value={s.monthly} onChange={(v) => setS((st) => ({ ...st, monthly: v }))} min={0} step={50} />
        <NumberField label="Durée" unit="ans" value={s.years} onChange={(v) => setS((st) => ({ ...st, years: v }))} min={1} max={50} />
      </div>
      <div className="panel">
        <LineChart
          title="Projection du portefeuille"
          xLabels={proj.map((p) => `An ${p.year}`)}
          format={fmtEur}
          series={[
            { name: 'Valeur projetée', color: 'var(--chart-1)', values: proj.map((p) => p.value) },
            { name: 'Versements cumulés', color: 'var(--chart-2)', values: proj.map((p) => p.contributed) },
          ]}
        />
        <p className="small muted" style={{ margin: '8px 0 0' }}>
          Hypothèse simplificatrice : allocation maintenue constante et rendement net pondéré appliqué chaque année, sans volatilité.
        </p>
      </div>
      <SavedSims simKey="portefeuille" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
      <div style={{ marginTop: 16 }}><Disclaimer /></div>
      <SimFaq slug="portefeuille" />
    </>
  );
}
