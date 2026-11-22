import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { investmentBySlug, investments } from '../data/investments';
import { fmtEur, projectGrowth } from '../lib/finance';
import { durationExceeded, impossibleFromYear, monthCapExceeded, projectionSplit, totalContributed } from '../lib/calc/compareSummary';
import { fmtMonths } from '../lib/calc/format';
import { compareCell } from '../lib/compareCell';
import { sentenceLead } from '../lib/sentenceLead';
import { fmtDate } from '../lib/dates';
import type { Checked } from '../data/types';
import { readingFromRefs, nextForComparator } from '../lib/relatedSims';
import { DURATION_LIMITS, REGULATED_RATES, VERSEMENT_CAPS } from '../data/versementCaps';
import { CapitalFact, Disclaimer, Linked, LineChart, MeterRows, MetersLegend, NumberField, PageHead, SimNext } from '../components/ui';

/** Critères longs et chiffrés : repliés par ligne sur mobile (le tableau y est empilé), toujours ouverts sans JavaScript et en écran large.
 *  Restent ouverts sur mobile les repères, l'horizon et les avantages et inconvénients : de quoi comparer d'un coup d'œil. */
export const CMP_FOLDED_ON_MOBILE = ['Capital nécessaire', 'Frais', 'Fiscalité'];

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

function splitText(value: number, amount: number, monthly: number, years: number): ReactNode {
  const { gains } = projectionSplit(value, totalContributed(amount, monthly, years));
  return <><strong className="num">{fmtEur(Math.abs(gains))}</strong> {gains >= 0 ? 'de gains' : 'de moins que vos versements'}</>;
}

/** Une ligne de case : l'amorce en gras (« Après 8 ans : »), comme sur les fiches. */
function CmpLine({ text, path }: { text: string; path: string }) {
  const l = sentenceLead(text);
  return <li>{l ? <><strong>{l.lead}</strong><Linked text={l.rest} path={path} /></> : <Linked text={text} path={path} />}</li>;
}

/**
 * Case Capital nécessaire, Frais ou Fiscalité : trois lignes visibles au plus, la suite repliée
 * (« 3 autres points »), pour que la case la plus longue ne dicte plus la hauteur de toute la ligne.
 * Le repli est un <details> : tout le texte reste dans le HTML pré-rendu.
 */
function CmpFact({ c, slug, field }: { c: Checked; slug: string; field: 'minCapital' | 'fees' | 'tax' }) {
  const { shown, more } = compareCell(c, slug, field);
  const path = `/encyclopedie/${slug}`;
  const badge = c.verified ? <span className="badge-verified">✓ vérifié{c.asOf ? ` au ${fmtDate(c.asOf)}` : ''}</span> : c.advice ? null : <span className="badge-unverified">à vérifier</span>;
  if (shown.length === 1 && more.length === 0) return <p><Linked text={shown[0]} path={path} /> {badge}</p>;
  return (
    <>
      <ul className="sentence-list">{shown.map((t) => <CmpLine key={t} text={t} path={path} />)}</ul>
      {more.length > 0 && (
        <details className="cmp-more">
          <summary>{more.length} autres points</summary>
          <ul className="sentence-list">{more.map((t) => <CmpLine key={t} text={t} path={path} />)}</ul>
        </details>
      )}
      {badge && <p className="cmp-badge">{badge}</p>}
    </>
  );
}

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)'];
const DEFAULT_IDS = ['livret-a', 'assurance-vie', 'etf-monde'];

export default function Compare() {
  const [params, setParams] = useSearchParams();
  const ids = (params.get('ids')?.split(',') ?? DEFAULT_IDS).filter((id) => investmentBySlug[id]).slice(0, 3);
  const items = ids.map((id) => investmentBySlug[id]);
  const setIds = (next: string[]) => setParams({ ids: next.join(',') }, { replace: true });

  // Livrets réglementés et PEL ouvert en 2026 : leur taux en vigueur, sans frais supposés (données datées de `LIVRETS`) ; ailleurs, hypothèses d'illustration.
  const [hyp, setHyp] = useState<Record<string, { r: number; f: number }>>({
    'livret-a': { r: REGULATED_RATES['livret-a'], f: 0 }, lep: { r: REGULATED_RATES.lep, f: 0 }, pel: { r: REGULATED_RATES.pel, f: 0 },
    'assurance-vie': { r: 0.035, f: 0.006 }, 'etf-monde': { r: 0.06, f: 0.002 },
  });
  const [amount, setAmount] = useState(10000);
  // Exemple de départ réalisable sur chaque placement proposé par défaut : 28 000 € versés en 15 ans, sous le
  // plafond cumulé du Livret A et du LDDS (un exemple par défaut ne doit pas afficher d'alerte « Plafond dépassé »).
  const [monthly, setMonthly] = useState(100);
  const [years, setYears] = useState(15);
  const getH = (id: string) => hyp[id] ?? { r: 0.03, f: 0.005 };

  const proj = useMemo(
    () => items.map((i) => projectGrowth({ initial: amount, monthly, annualReturn: getH(i.slug).r, annualFees: getH(i.slug).f, years, inflation: 0 })),
    [ids.join(), hyp, amount, monthly, years],
  );

  // Zone grisée du graphique : à partir du premier moment où une courbe suppose des versements impossibles.
  const impossible = items
    .map((i) => {
      const cap = VERSEMENT_CAPS[i.slug]?.cap;
      const from = impossibleFromYear(amount, monthly, years, cap, DURATION_LIMITS[i.slug]);
      if (from === null) return null;
      const capMonth = cap === undefined ? null : monthCapExceeded(amount, monthly, years, cap);
      return { from, label: capMonth !== null && capMonth / 12 === from ? 'Plafond dépassé' : 'Fin des versements' };
    })
    .filter((b): b is { from: number; label: string } => b !== null)
    .sort((a, b) => a.from - b.from)[0];

  const mobile = useIsMobile();
  const [closed, setClosed] = useState<string[]>([]);
  useEffect(() => { setClosed(mobile ? CMP_FOLDED_ON_MOBILE : []); }, [mobile]);
  const toggle = (label: string) => setClosed((c) => (c.includes(label) ? c.filter((x) => x !== label) : [...c, label]));

  const rows: [string, (i: (typeof items)[number]) => ReactNode][] = [
    // Les trois repères dans une seule case, en points et en mots, comme le cadre « En bref » des fiches :
    // on lit un placement d'un coup d'œil, et la page mobile perd deux blocs empilés.
    ['Repères', (i) => <MeterRows risk={i.risk} liquidity={i.liquidity} effort={i.effort} effortNote={i.timeSkills} noNote />],
    ['Horizon', (i) => i.horizon],
    // Avantages et inconvénients dans une seule case, marqués ✓ et ✕ comme sur les fiches :
    // sur téléphone, le bloc reste ouvert sans allonger la page d'un second titre et de trois étiquettes.
    ['Avantages et inconvénients', (i) => (
      <>
        <span className="sr-only">Avantages :</span>
        <ul className="cmp-list cmp-pros">{i.pros.map((x) => <li key={x}>{x}</li>)}</ul>
        <span className="sr-only">Inconvénients :</span>
        <ul className="cmp-list cmp-cons">{i.cons.map((x) => <li key={x}>{x}</li>)}</ul>
      </>
    )],
    ['Capital nécessaire', (i) => (i.minCapital.advice ? <p><CapitalFact c={i.minCapital} /></p> : <CmpFact c={i.minCapital} slug={i.slug} field="minCapital" />)],
    ['Frais', (i) => <CmpFact c={i.fees} slug={i.slug} field="fees" />],
    ['Fiscalité', (i) => <CmpFact c={i.tax} slug={i.slug} field="tax" />],
  ];

  return (
    <>
      <PageHead art="comparateur" eyebrow="Comparateur" title="Comparer des placements et des stratégies">
        Choisissez jusqu'à trois placements, comparez leurs caractéristiques, puis projetez-les avec vos propres hypothèses.
      </PageHead>

      {/* Chaque placement garde sa couleur partout : choix, tableau, réglages, graphique et « Concrètement ». */}
      <div className="grid cols-3 cmp-pick">
        {[0, 1, 2].map((k) => (
          <div key={k} className="field">
            <label htmlFor={`cmp-${k}`}><i className="pt-dot" style={{ background: ids[k] ? COLORS[k] : 'var(--line)' }} aria-hidden="true" />Placement {k + 1}</label>
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
              <tr><th style={{ width: 150 }}><span className="sr-only">Critère</span></th>{items.map((i, k) => <th key={i.slug}><i className="pt-dot" style={{ background: COLORS[k] }} aria-hidden="true" /><Link to={`/encyclopedie/${i.slug}`}>{i.name}</Link></th>)}</tr>
            </thead>
            <tbody>
              {rows.map(([label, render]) => (
                <tr key={label} className={closed.includes(label) ? 'cmp-closed' : undefined}>
                  <th scope="row">
                    {mobile ? (
                      <button type="button" className="cmp-toggle" aria-expanded={!closed.includes(label)} onClick={() => toggle(label)}>{label}</button>
                    ) : label}
                  </th>
                  {items.map((i, k) => <td key={i.slug} data-label={i.name} style={{ '--cmp-c': COLORS[k] } as CSSProperties} className={label === 'Repères' ? 'cmp-meter' : undefined}>{render(i)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {items.length > 0 && <MetersLegend />}

      <h2>Projection selon vos hypothèses</h2>
      <p className="muted">Livrets et PEL ouvert en 2026 : taux en vigueur, sans frais supposés. Autres placements : rendements d'illustration, pas des prévisions. Tout se modifie.</p>
      <div className="grid cols-3 cmp-base">
        <NumberField label="Montant initial" shortLabel="Au départ" unit="€" value={amount} onChange={setAmount} min={0} step={1000} />
        <NumberField label="Versement mensuel" shortLabel="Par mois" unit="€" value={monthly} onChange={setMonthly} min={0} step={50} />
        <NumberField label="Durée" unit="ans" value={years} onChange={setYears} min={1} max={50} />
      </div>
      {items.length > 0 && (
        <>
          {/* Réglages par placement avant le graphique : on règle, puis on lit le résultat juste en dessous. */}
          <p className="cmp-hyp-intro">Rendement et frais supposés, par placement :</p>
          <div className="grid cols-3 cmp-hyp">
            {items.map((i, k) => (
              <fieldset className="cmp-hyp-set" key={i.slug}>
                <legend><i className="pt-dot" style={{ background: COLORS[k] }} aria-hidden="true" />{i.name}</legend>
                <div className="field-duo">
                  <NumberField label={`Rendement brut supposé (${i.name})`} shortLabel="Rendement brut" unit="%" percent value={getH(i.slug).r} step={0.25} min={-10} max={20}
                    onChange={(v) => setHyp((h) => ({ ...h, [i.slug]: { ...getH(i.slug), r: v } }))} />
                  <NumberField label={`Frais annuels (${i.name})`} shortLabel="Frais par an" unit="%" percent value={getH(i.slug).f} step={0.1} min={0} max={5}
                    onChange={(v) => setHyp((h) => ({ ...h, [i.slug]: { ...getH(i.slug), f: v } }))} />
                </div>
              </fieldset>
            ))}
          </div>
          <div className="panel" style={{ marginBottom: 16 }}>
            <LineChart
              title="Comparaison des projections"
              measure="valeur projetée"
              showTitle
              xLabels={proj[0].map((p) => `An ${p.year}`)}
              format={fmtEur}
              series={items.map((i, k) => ({ name: i.name, color: COLORS[k], values: proj[k].map((p) => p.value) }))}
              band={impossible && impossible.from < years ? { from: impossible.from, to: years, label: impossible.label } : undefined}
            />
          </div>
          <div className="takeaway cmp-concretement">
            <p>
              <strong>Concrètement.</strong> Vous versez <strong className="num">{fmtEur(totalContributed(amount, monthly, years))}</strong> de votre poche en {years}&nbsp;ans.
              Le reste de la valeur finale vient du rendement supposé, moins les frais :
            </p>
            <ul>
              {items.map((i, k) => (
                <li key={i.slug}><i className="pt-dot" style={{ background: COLORS[k] }} aria-hidden="true" />{i.name} : {splitText(proj[k][years].value, amount, monthly, years)}</li>
              ))}
            </ul>
            <p className="small muted">Projection avant impôts et sans à-coups des marchés : un placement risqué peut finir sous un placement sûr.</p>
          </div>
          {items.map((i) => {
            const c = VERSEMENT_CAPS[i.slug];
            const month = c ? monthCapExceeded(amount, monthly, years, c.cap) : null;
            if (!c || month === null) return null;
            return (
              <p key={i.slug} className="notice cmp-cap">
                <strong>Plafond dépassé : {i.name}.</strong> On ne peut pas y verser plus de <span className="num">{fmtEur(c.cap)}</span>
                {c.detail ? ` (${c.detail})` : ''}. Vos versements le dépassent {month === 0 ? 'dès le départ' : month === 1 ? 'dès le premier versement mensuel' : <>au bout de {fmtMonths(month)}</>} :
                au-delà (zone grisée du graphique), sa courbe suppose des versements impossibles.
              </p>
            );
          })}
          {items.map((i) => {
            const d = DURATION_LIMITS[i.slug];
            const over = d ? durationExceeded(monthly, years, d) : null;
            if (!d || !over || (!over.deposits && !over.contract)) return null;
            return (
              <p key={i.slug} className="notice cmp-cap">
                <strong>Durée dépassée : {i.name}.</strong>
                {over.deposits && <> On ne peut plus y verser après {d.depositYears}&nbsp;ans : au-delà (zone grisée du graphique), sa courbe suppose des versements impossibles.</>}
                {over.contract && <> Après {d.contractYears}&nbsp;ans, {d.afterContract} : la courbe garde un taux qui n’est plus garanti.</>}
              </p>
            );
          })}
        </>
      )}
      <SimNext links={readingFromRefs(nextForComparator)} />
      <Disclaimer />
    </>
  );
}
