import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { categoryById } from '../data/categories';
import { investmentBySlug, investments } from '../data/investments';
import { fmtEur, projectGrowth } from '../lib/finance';
import { Disclaimer, Dots, LineChart, NumberField, PageHead } from '../components/ui';

/** Critères longs : repliés par ligne sur mobile (le tableau y est empilé), toujours ouverts sans JavaScript et en écran large. */
export const CMP_FOLDED_ON_MOBILE = ['Capital nécessaire', 'Frais', 'Fiscalité', 'Avantages', 'Inconvénients'];

export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 700px)');
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return mobile;
}

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)'];
const DEFAULT_IDS = ['livret-a', 'assurance-vie', 'etf-monde'];

export default function Compare() {
  const [params, setParams] = useSearchParams();
  const ids = (params.get('ids')?.split(',') ?? DEFAULT_IDS).filter((id) => investmentBySlug[id]).slice(0, 3);
  const items = ids.map((id) => investmentBySlug[id]);
  const setIds = (next: string[]) => setParams({ ids: next.join(',') }, { replace: true });

  const [hyp, setHyp] = useState<Record<string, { r: number; f: number }>>({
    'livret-a': { r: 0.017, f: 0 }, 'assurance-vie': { r: 0.035, f: 0.006 }, 'etf-monde': { r: 0.06, f: 0.002 },
  });
  const [amount, setAmount] = useState(10000);
  const [monthly, setMonthly] = useState(200);
  const [years, setYears] = useState(15);
  const getH = (id: string) => hyp[id] ?? { r: 0.03, f: 0.005 };

  const proj = useMemo(
    () => items.map((i) => projectGrowth({ initial: amount, monthly, annualReturn: getH(i.slug).r, annualFees: getH(i.slug).f, years, inflation: 0 })),
    [ids.join(), hyp, amount, monthly, years],
  );

  const mobile = useIsMobile();
  const [closed, setClosed] = useState<string[]>([]);
  useEffect(() => { setClosed(mobile ? CMP_FOLDED_ON_MOBILE : []); }, [mobile]);
  const toggle = (label: string) => setClosed((c) => (c.includes(label) ? c.filter((x) => x !== label) : [...c, label]));

  const rows: [string, (i: (typeof items)[number]) => ReactNode][] = [
    ['Famille', (i) => categoryById[i.category].name],
    ['Risque', (i) => <Dots level={i.risk} kind="risk" label="Risque" />],
    ['Liquidité', (i) => <Dots level={i.liquidity} kind="liq" label="Liquidité" />],
    ['Effort', (i) => <Dots level={i.effort} label="Effort" />],
    ['Horizon', (i) => i.horizon],
    ['Capital nécessaire', (i) => i.minCapital.text],
    ['Frais', (i) => i.fees.text],
    ['Fiscalité', (i) => i.tax.text],
    ['Avantages', (i) => <ul className="cmp-list">{i.pros.map((x) => <li key={x}>{x}</li>)}</ul>],
    ['Inconvénients', (i) => <ul className="cmp-list">{i.cons.map((x) => <li key={x}>{x}</li>)}</ul>],
  ];

  return (
    <>
      <PageHead eyebrow="Comparateur" title="Comparer des placements et des stratégies">
        Choisissez jusqu'à trois placements, comparez leurs caractéristiques, puis projetez-les avec vos propres hypothèses.
      </PageHead>

      <div className="grid cols-3">
        {[0, 1, 2].map((k) => (
          <div key={k} className="field">
            <label htmlFor={`cmp-${k}`}>Placement {k + 1}</label>
            <select id={`cmp-${k}`} value={ids[k] ?? ''} onChange={(e) => {
              const next = [...ids];
              if (e.target.value) next[k] = e.target.value; else next.splice(k, 1);
              setIds(Array.from(new Set(next.filter(Boolean))));
            }}>
              <option value="">— Aucun —</option>
              {investments.map((i) => <option key={i.slug} value={i.slug}>{i.name}</option>)}
            </select>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <div className="table-wrap cmp-wrap" tabIndex={0}>
          <table className="cmp-table">
            <thead>
              <tr><th style={{ width: 150 }}><span className="sr-only">Critère</span></th>{items.map((i) => <th key={i.slug}><Link to={`/encyclopedie/${i.slug}`}>{i.name}</Link></th>)}</tr>
            </thead>
            <tbody>
              {rows.map(([label, render]) => (
                <tr key={label} className={closed.includes(label) ? 'cmp-closed' : undefined}>
                  <th scope="row">
                    {mobile ? (
                      <button type="button" className="cmp-toggle" aria-expanded={!closed.includes(label)} onClick={() => toggle(label)}>{label}</button>
                    ) : label}
                  </th>
                  {items.map((i) => <td key={i.slug} data-label={i.name}>{render(i)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2>Projection selon vos hypothèses</h2>
      <p className="muted">Les rendements pré-remplis sont des hypothèses d'illustration, pas des prévisions. Modifiez-les librement.</p>
      <div className="grid cols-3">
        <NumberField label="Montant initial" unit="€" value={amount} onChange={setAmount} min={0} step={1000} />
        <NumberField label="Versement mensuel" unit="€" value={monthly} onChange={setMonthly} min={0} step={50} />
        <NumberField label="Durée" unit="ans" value={years} onChange={setYears} min={1} max={50} />
      </div>
      <div className="grid cols-3">
        {items.map((i, k) => (
          <div className="panel" key={i.slug}>
            <strong><span style={{ color: COLORS[k] }} aria-hidden="true">●</span> {i.name}</strong>
            <div style={{ marginTop: 10 }}>
              <NumberField label="Rendement brut supposé" unit="%" percent value={getH(i.slug).r} step={0.25} min={-10} max={20}
                onChange={(v) => setHyp((h) => ({ ...h, [i.slug]: { ...getH(i.slug), r: v } }))} />
              <NumberField label="Frais annuels" unit="%" percent value={getH(i.slug).f} step={0.1} min={0} max={5}
                onChange={(v) => setHyp((h) => ({ ...h, [i.slug]: { ...getH(i.slug), f: v } }))} />
            </div>
            <div className="small">Valeur à {years} ans : <strong className="num">{fmtEur(proj[k][years].value)}</strong></div>
          </div>
        ))}
      </div>
      {items.length > 0 && (
        <div className="panel" style={{ marginTop: 16 }}>
          <LineChart
            title="Comparaison des projections"
            xLabels={proj[0].map((p) => `An ${p.year}`)}
            format={fmtEur}
            series={items.map((i, k) => ({ name: i.name, color: COLORS[k], values: proj[k].map((p) => p.value) }))}
          />
        </div>
      )}
      <p className="small muted" style={{ marginTop: 12 }}>Projection avant fiscalité et sans volatilité : un placement risqué peut finir sous un placement sûr.</p>
      <Disclaimer />
    </>
  );
}
