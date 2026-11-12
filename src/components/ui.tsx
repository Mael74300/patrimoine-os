import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { JargonText } from './Jargon';
import { linkOnly } from '../lib/jargon';
import { simFaq, type FaqItem } from '../data/simFaq';
import { Link } from 'react-router-dom';
import { config } from '../config';
import type { Checked, Level, Source } from '../data/types';
import { load, save, type SavedSim } from '../lib/storage';
import { HeaderArt, type HeaderArtName } from './HeaderArt';
import { summarizeSeries } from '../lib/chartSummary';
import { coveragePercent } from '../lib/coverage';
import { fmtEur } from '../lib/finance';
import { readingForSimulator } from '../lib/relatedSims';
import { readableNumber } from '../lib/readableNumber';
import { fmtDate } from '../lib/dates';
import { sentenceLead } from '../lib/sentenceLead';
import { buildExport, mergeSims, parseExport } from '../lib/simExport';

// ------------------------------------------------------------ Champs

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
  hint?: string;
  /** Si true, la valeur affichée est en % et stockée en décimal. */
  percent?: boolean;
  /** Affiche un curseur en plus du champ (valeur maximale du curseur ; le champ accepte toujours jusqu'à `max`). */
  sliderMax?: number;
};

export function NumberField({ label, value, onChange, unit, step = 1, min, max, hint, percent, sliderMax }: NumberFieldProps) {
  const id = useId();
  const shown = percent ? round(value * 100, 4) : value;
  const [text, setText] = useState(String(shown));
  const last = useRef(shown);
  const echo = readableNumber(shown, unit);
  useEffect(() => {
    if (shown !== last.current) {
      setText(String(shown));
      last.current = shown;
    }
  }, [shown]);
  return (
    <div className="field">
      <div className="field-label">
        <label htmlFor={id}>{label}</label>
        {echo && <span className="field-echo" aria-hidden="true">{echo}</span>}
      </div>
      <div className="input-unit">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={text}
          step={step}
          min={min}
          max={max}
          onChange={(e) => {
            setText(e.target.value);
            const n = parseFloat(e.target.value.replace(',', '.'));
            if (Number.isFinite(n)) {
              const clamped = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));
              last.current = clamped;
              onChange(percent ? clamped / 100 : clamped);
            }
          }}
          aria-describedby={hint ? id + '-h' : undefined}
        />
        {unit && <span aria-hidden="true">{unit}</span>}
      </div>
      {sliderMax !== undefined && (
        <input
          className="slider"
          type="range"
          aria-label={`${label} (curseur)`}
          min={Math.max(0, min ?? 0)}
          max={sliderMax}
          step={step}
          value={Math.min(sliderMax, Math.max(Math.max(0, min ?? 0), shown))}
          style={{ ['--pos' as string]: `${Math.min(100, Math.max(0, ((shown - Math.max(0, min ?? 0)) / (sliderMax - Math.max(0, min ?? 0))) * 100))}%` }}
          onChange={(e) => {
            const n = parseFloat(e.target.value);
            setText(String(n));
            last.current = n;
            onChange(percent ? n / 100 : n);
          }}
        />
      )}
      {hint && <div className="hint" id={id + '-h'}>{hint}</div>}
    </div>
  );
}

function round(n: number, d: number) {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
}

/**
 * État de formulaire mémorisé sur l'appareil (préférence locale).
 * Le premier rendu utilise toujours les valeurs par défaut (identique au pré-rendu statique),
 * puis les valeurs enregistrées sont chargées dans le navigateur.
 */
export function usePersistentState<T extends object>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);
  const loaded = useRef(false);
  useEffect(() => {
    const stored = load<Partial<T> | null>('last:' + key, null);
    if (stored) setState((s) => ({ ...s, ...stored }));
    loaded.current = true;
  }, [key]);
  useEffect(() => {
    if (loaded.current) save('last:' + key, state);
  }, [key, state]);
  const update = <K extends keyof T>(k: K) => (v: T[K]) => setState((s) => ({ ...s, [k]: v }));
  return [state, setState, update] as const;
}

// ------------------------------------------------------------ Affichage

/** Colle le nombre à son unité (« 6 mois », « 1 an ») : une durée ne se coupe plus entre le chiffre et le mot. */
export const gluedUnits = (s: string) => s.replace(/(\d) (ans?|mois|€|%)(?![\p{L}\d])/gu, '$1\u00a0$2');

export function Kpi({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'pos' | 'neg' }) {
  return (
    <div className={'kpi ' + (tone ?? '')}>
      <div className="k-label">{label}</div>
      <div className="k-value">{gluedUnits(value)}</div>
      {sub && <div className="k-sub">{sub}</div>}
    </div>
  );
}

/** Jauge « où j'en suis » : part du montant visé déjà couverte (calcul exact, pas une illustration). */
export function CoverageGauge({ savings, target, label, suffix = 'couvert' }: { savings: number; target: number; label: string; suffix?: string }) {
  if (!(target > 0)) return null;
  const pct = coveragePercent(savings, target);
  const done = pct >= 100;
  return (
    <div className="gauge">
      <div className="gauge-bar" role="img" aria-label={`${label} : ${pct} % du montant visé`}>
        <span className={'gauge-fill' + (done ? ' done' : '')} style={{ width: `${pct}%` }} />
      </div>
      <div className="gauge-scale" aria-hidden="true">
        <span>0 €</span>
        <strong>{done ? 'Objectif atteint' : `${pct} % ${suffix}`}</strong>
        <span>{fmtEur(target)}</span>
      </div>
    </div>
  );
}

export function Dots({ level, kind, label, compact = false }: { level: Level; kind?: 'risk' | 'liq'; label: string; compact?: boolean }) {
  return (
    <div className={'meter' + (compact ? ' compact' : '')} aria-label={`${label} : ${level} sur 5`} role="img">
      {compact ? <span className="meter-score" aria-hidden="true">{level}/5</span> : <span>{label}</span>}
      <div className={'dots ' + (kind ?? '')}>
        {[1, 2, 3, 4, 5].map((i) => (
          <i key={i} className={i <= level ? 'on' : ''} />
        ))}
      </div>
    </div>
  );
}

const METER_HELP: { label: string; kind?: 'risk' | 'liq'; level: Level; text: string }[] = [
  { label: 'Risque', kind: 'risk', level: 4, text: 'plus c’est rempli, plus on peut perdre une partie de son argent.' },
  { label: 'Liquidité', kind: 'liq', level: 4, text: 'plus c’est rempli, plus on récupère son argent vite et sans perte.' },
  { label: 'Effort', level: 4, text: 'plus c’est rempli, plus il faut de temps, de suivi et de connaissances.' },
];

/** Explication repliable des trois repères sur 5 affichés avec les points. */
export function MetersLegend() {
  return (
    <details className="meters-legend">
      <summary>Comment lire ces repères ?</summary>
      <ul>
        {METER_HELP.map((m) => (
          <li key={m.label}>
            <div className={'dots ' + (m.kind ?? '')} aria-hidden="true">
              {[1, 2, 3, 4, 5].map((i) => (
                <i key={i} className={i <= m.level ? 'on' : ''} />
              ))}
            </div>
            <span><strong>{m.label}</strong> : {m.text}</span>
          </li>
        ))}
      </ul>
      <p className="small muted">Notes de 1 à 5 attribuées par Patrimoine OS pour comparer rapidement : elles sont indicatives et ne remplacent pas la lecture de la fiche.</p>
    </details>
  );
}

/** Découpe un texte en phrases (sans rien modifier au contenu) pour l'afficher ligne par ligne. */
export function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+(?=[A-ZÉÈÀÂÎÔ])/).map((t) => t.trim()).filter(Boolean);
}

/** Texte d'une rubrique où les pages citées par leur nom (« fiche PEA ») deviennent des liens. */
const Linked = ({ text, path }: { text: string; path?: string }) => <JargonText segs={linkOnly(text, path)} />;

export function CheckedText({ c, split = false, path }: { c: Checked; split?: boolean; path?: string }) {
  const badge = c.verified ? (
    <span className="badge-verified">✓ vérifié{c.asOf ? ` au ${fmtDate(c.asOf)}` : ''}</span>
  ) : c.advice ? null : (
    <span className="badge-unverified">à vérifier</span>
  );
  const parts = split ? splitSentences(c.text) : [c.text];
  if (parts.length < 3) {
    return (
      <p>
        <Linked text={c.text} path={path} /> {badge}
      </p>
    );
  }
  return (
    <>
      <ul className="sentence-list">
        {parts.map((t, k) => {
          const l = sentenceLead(t);
          return (
            <li key={t}>
              {l ? <><strong>{l.lead}</strong><Linked text={l.rest} path={path} /></> : <Linked text={t} path={path} />}
              {badge && k === parts.length - 1 && <> {badge}</>}
            </li>
          );
        })}
      </ul>
    </>
  );
}

export function Sources({ list }: { list: Source[] }) {
  return (
    <ul className="source-list">
      {list.map((s) => (
        <li key={s.url + s.label}>
          <a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>
          {s.official && <span className="muted small"> · source institutionnelle</span>}
        </li>
      ))}
    </ul>
  );
}

export function PageHead({ eyebrow, title, children, art }: { eyebrow?: string; title: string; children?: ReactNode; art?: HeaderArtName }) {
  useEffect(() => {
    document.title = `${title} · ${config.siteName}`;
  }, [title]);
  return (
    <header className={art ? 'page-head has-art' : 'page-head'}>
      {art && <HeaderArt name={art} />}
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h1>{title}</h1>
      {children && <div className="lede">{children}</div>}
    </header>
  );
}

export function Disclaimer() {
  return (
    <p className="notice small" role="note">
      Simulation pédagogique fondée sur vos hypothèses. Les rendements passés ou supposés ne préjugent pas des
      rendements futurs. Ce site ne fournit pas de conseil en investissement personnalisé.
    </p>
  );
}

/** Emplacement publicitaire : n'affiche rien tant que config.ads.enabled est false. */
export function AdSlot({ id }: { id: string }) {
  if (!config.ads.enabled) return null;
  return (
    <aside className="panel small muted" data-ad-slot={id} aria-label="Publicité">
      Publicité
    </aside>
  );
}

// ------------------------------------------------------------ Graphique

export type Series = { name: string; color: string; values: (number | undefined)[]; dashed?: boolean };

type ChartProps = {
  series: Series[];
  xLabels: (string | number)[];
  format: (n: number) => string;
  title: string;
  /** Affiche le titre au-dessus du graphique (utile quand aucun intertitre ne précède). */
  showTitle?: boolean;
  height?: number;
  /** Graduations de l'axe horizontal, si elles diffèrent des libellés de lecture (`xLabels`) ; une chaîne vide = pas de graduation. */
  axisLabels?: string[];
  /** Zone grisée entre deux index (par exemple la période d'étalement), avec un court libellé. */
  band?: { from: number; to: number; label: string };
  /** Point lu par défaut dans la légende (sinon le dernier), par exemple la valeur saisie. */
  defaultIndex?: number;
};

const CHAR_W = 6.6; // largeur moyenne d'un caractère de la police des graduations (px)

/**
 * Choisit les étiquettes de l'axe horizontal : toujours la dernière, alignée vers l'intérieur si elle
 * dépasserait du dessin, et les autres seulement si elles ne la chevauchent pas ni ne chevauchent la précédente.
 */
export function placeXLabels(
  labels: string[],
  every: number,
  x: (i: number) => number,
  width: number,
): ({ x: number; anchor: 'middle' | 'end' } | null)[] {
  const n = labels.length;
  const out: ({ x: number; anchor: 'middle' | 'end' } | null)[] = labels.map(() => null);
  if (n === 0) return out;
  const gap = 8;
  const last = n - 1;
  const wLast = labels[last].length * CHAR_W;
  const lastAnchor = x(last) + wLast / 2 > width ? 'end' : 'middle';
  const lastLeft = lastAnchor === 'end' ? x(last) - wLast : x(last) - wLast / 2;
  out[last] = { x: x(last), anchor: lastAnchor };
  let prevRight = -Infinity;
  for (let i = 0; i < last; i += every) {
    const w = labels[i].length * CHAR_W;
    const left = x(i) - w / 2;
    const right = x(i) + w / 2;
    if (!labels[i] || left < prevRight + gap || right + gap > lastLeft) continue;
    out[i] = { x: x(i), anchor: 'middle' };
    prevRight = right;
  }
  return out;
}

/** Graphique en lignes SVG, sans dépendance, utilisable à la souris, au doigt et au clavier. */
export function LineChart({ series, xLabels, format, title, showTitle, height = 300, axisLabels, band, defaultIndex }: ChartProps) {
  // Largeur du dessin = largeur affichée : les textes gardent leur taille réelle (lisibles sur mobile).
  const [W, setW] = useState(720);
  const narrow = W < 480;
  const H = narrow ? Math.min(height, 240) : height;
  const n = xLabels.length;
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = svgRef.current?.parentElement;
    if (!el) return;
    const measure = () => setW(Math.max(260, Math.round(el.getBoundingClientRect().width)));
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { max, min, ticks } = useMemo(() => {
    const all = series.flatMap((s) => s.values).filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
    const lo = Math.min(0, ...all);
    const hi = Math.max(1, ...all);
    const step = niceStep((hi - lo) / 4);
    const top = Math.ceil(hi / step) * step;
    const bottom = Math.floor(lo / step) * step;
    const t: number[] = [];
    for (let v = bottom; v <= top + step / 2; v += step) t.push(v);
    return { max: top, min: bottom, ticks: t };
  }, [series]);

  // Marge gauche adaptée à la plus longue graduation, pour ne jamais couper un signe moins ou un chiffre.
  const widest = Math.max(...ticks.map((t) => compact(t).length));
  const pad = { l: Math.max(narrow ? 48 : 64, Math.ceil(widest * 6.6) + 16), r: 16, t: 16, b: 32 };

  const x = (i: number) => pad.l + (n <= 1 ? 0 : (i / (n - 1)) * (W - pad.l - pad.r));
  const y = (v: number) => pad.t + (1 - (v - min) / (max - min || 1)) * (H - pad.t - pad.b);
  const labelEvery = axisLabels ? 1 : Math.max(1, Math.ceil(n / Math.max(3, Math.floor((W - pad.l - pad.r) / 56))));
  const tickLabels = axisLabels ?? xLabels.map(String);
  const xLabelBoxes = useMemo(
    () => placeXLabels(tickLabels, labelEvery, (i) => x(i), W),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [axisLabels, xLabels, labelEvery, W, pad.l, pad.r],
  );

  const onMove = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, i)));
  };

  const rest = defaultIndex !== undefined && defaultIndex >= 0 && defaultIndex < n ? defaultIndex : n - 1;
  const active = hover ?? rest;
  const descId = useId();
  const summary = useMemo(() => summarizeSeries(series, xLabels, format), [series, xLabels, format]);

  return (
    <figure className="line-chart">
      {showTitle && <div className="chart-title" aria-hidden="true">{title}</div>}
      <svg
        ref={svgRef}
        className="chart"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={title}
        aria-describedby={descId}
        tabIndex={0}
        onPointerMove={(e) => onMove(e.clientX)}
        onPointerLeave={() => setHover(null)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') setHover(Math.min(n - 1, (hover ?? rest) + 1));
          if (e.key === 'ArrowLeft') setHover(Math.max(0, (hover ?? rest) - 1));
        }}
      >
        {band && band.to > band.from && (
          <g className="chart-band">
            <rect x={x(band.from)} y={pad.t} width={x(band.to) - x(band.from)} height={H - pad.t - pad.b} />
            <text x={x(band.from) + 6} y={pad.t + 14}>{band.label}</text>
          </g>
        )}
        {ticks.map((t) => (
          <g key={t}>
            <line className="grid-line" x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end">{compact(t)}</text>
          </g>
        ))}
        {tickLabels.map((l, i) => {
          const box = xLabelBoxes[i];
          return box ? (
            <text key={i} x={box.x} y={H - 10} textAnchor={box.anchor}>{l}</text>
          ) : null;
        })}
        {series.map((s, idx) => (
          <path
            key={idx}
            d={s.values
              .map((v, i) => (typeof v === 'number' && Number.isFinite(v) ? `${i === 0 || !Number.isFinite(s.values[i - 1] as number) ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}` : ''))
              .join('')}
            fill="none"
            stroke={s.color}
            strokeWidth={2.2}
            strokeDasharray={s.dashed ? '5 4' : undefined}
            strokeLinejoin="round"
          />
        ))}
        <line x1={x(active)} x2={x(active)} y1={pad.t} y2={H - pad.b} stroke="var(--ink-3)" strokeDasharray="2 3" />
        {series.map((s, idx) =>
          typeof s.values[active] === 'number' ? (
            <circle key={idx} cx={x(active)} cy={y(s.values[active] as number)} r={4} fill={s.color} stroke="var(--surface)" strokeWidth={1.5} />
          ) : null,
        )}
      </svg>
      <div id={descId} className="sr-only">
        {title}. {summary.join(' ')} Flèches gauche et droite : lire les valeurs une à une.
      </div>
      <div className="sr-only">
        <table>
          <caption>{title}</caption>
          <thead>
            <tr>
              <th scope="col">Période</th>
              {series.map((s, idx) => <th key={idx} scope="col">{s.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {xLabels.map((l, i) => (
              <tr key={i}>
                <th scope="row">{l}</th>
                {series.map((s, idx) => (
                  <td key={idx}>{typeof s.values[i] === 'number' && Number.isFinite(s.values[i] as number) ? format(s.values[i] as number) : '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="chart-legend" aria-live="polite">
        <strong className="chart-legend-x">{xLabels[active]}</strong>
        {series.map((s, idx) => (
          <span key={idx} className={s.dashed ? 'dashed' : undefined} style={{ ['--c' as string]: s.color }}>
            {s.name}
            {typeof s.values[active] === 'number' ? <> : <span className="num">{format(s.values[active] as number)}</span></> : null}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

function niceStep(raw: number) {
  if (raw <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
}

export function compact(n: number) {
  const a = Math.abs(n);
  const sign = n < 0 ? '\u2212' : '';
  if (a >= 1e6) return sign + (a / 1e6).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' M€';
  if (a >= 1e3) return sign + (a / 1e3).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' k€';
  return sign + a.toLocaleString('fr-FR') + ' €';
}

// ------------------------------------------------------------ Simulations enregistrées

export function SavedSims<T>({ simKey, current, onLoad }: { simKey: string; current: T; onLoad: (d: T) => void }) {
  const storeKey = 'saved:' + simKey;
  const [list, setList] = useState<SavedSim<T>[]>([]);
  useEffect(() => {
    setList(load(storeKey, []));
  }, [storeKey]);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const persist = (l: SavedSim<T>[]) => {
    setList(l);
    if (!save(storeKey, l)) setMsg("Le stockage local est indisponible dans ce navigateur (navigation privée ?).");
  };
  return (
    <details className="panel saved-sims">
      <summary>{list.length === 0 ? 'Enregistrer cette simulation' : `Mes simulations enregistrées (${list.length})`}</summary>
      <p className="small muted" style={{ marginTop: 10 }}>
        Enregistrées uniquement dans ce navigateur, sur cet appareil. Elles ne sont ni envoyées ni synchronisées entre vos appareils.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input type="text" placeholder="Nom de la simulation" value={name} onChange={(e) => setName(e.target.value)} aria-label="Nom de la simulation" />
        <button
          className="btn small"
          onClick={() => {
            const label = name.trim() || `Simulation du ${new Date().toLocaleDateString('fr-FR')}`;
            persist([{ id: String(Date.now()), name: label, savedAt: new Date().toISOString(), data: current }, ...list].slice(0, 20));
            setName('');
            setMsg(`« ${label} » enregistrée.`);
          }}
        >
          Enregistrer
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        <button
          className="btn small secondary"
          disabled={list.length === 0}
          onClick={() => {
            const blob = new Blob([JSON.stringify(buildExport(simKey, list), null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `patrimoine-os-${simKey}.json`;
            a.click();
            URL.revokeObjectURL(url);
            setMsg('Export téléchargé : le fichier reste sur votre appareil.');
          }}
        >
          Exporter (.json)
        </button>
        <label className="btn small secondary" style={{ cursor: 'pointer' }}>
          Importer
          <input
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              const r = parseExport<T>(await file.text(), simKey);
              if (!r.ok) return setMsg(r.error);
              const merged = mergeSims(list, r.sims);
              persist(merged);
              setMsg(`${merged.length - list.length} simulation(s) importée(s).`);
            }}
          />
        </label>
      </div>
      {msg && <p className="small" role="status" style={{ marginTop: 8 }}>{msg}</p>}
      {list.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0' }}>
          {list.map((s) => (
            <li key={s.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 0', borderTop: '1px solid var(--line)' }}>
              <span style={{ flex: 1 }}>
                {s.name} <span className="muted small">· {new Date(s.savedAt).toLocaleDateString('fr-FR')}</span>
              </span>
              <button className="btn small secondary" onClick={() => onLoad(s.data)}>Charger</button>
              <button className="btn small secondary" aria-label={`Supprimer ${s.name}`} onClick={() => persist(list.filter((x) => x.id !== s.id))}>
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}

export function Crumbs({ items }: { items: { to?: string; label: string }[] }) {
  return (
    <nav className="breadcrumb" aria-label="Fil d'Ariane">
      {items.map((it, i) => (
        <span key={i}>
          {i > 0 && ' / '}
          {it.to ? <Link to={it.to}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

// ------------------------------------------------------------ Listes éditables (retraits, phases d'épargne)

type Row = { a: number; b: number };

export function RowsEditor({ title, rows, onChange, aLabel, bLabel, bUnit, addLabel, empty }: {
  title: string;
  rows: Row[];
  onChange: (rows: Row[]) => void;
  aLabel: string;
  bLabel: string;
  bUnit: string;
  addLabel: string;
  empty: string;
}) {
  const id = useId();
  return (
    <fieldset>
      <legend>{title}</legend>
      {rows.length === 0 && <p className="small muted" style={{ margin: '0 0 8px' }}>{empty}</p>}
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr auto', gap: 8, alignItems: 'end', marginBottom: 8 }}>
          <div>
            <label htmlFor={`${id}-a${i}`}>{aLabel}</label>
            <input id={`${id}-a${i}`} type="number" min={1} max={60} value={r.a} onChange={(e) => onChange(rows.map((x, k) => (k === i ? { ...x, a: Math.max(1, Math.round(+e.target.value || 1)) } : x)))} />
          </div>
          <div>
            <label htmlFor={`${id}-b${i}`}>{bLabel} ({bUnit})</label>
            <input id={`${id}-b${i}`} type="number" min={0} value={r.b} onChange={(e) => onChange(rows.map((x, k) => (k === i ? { ...x, b: Math.max(0, +e.target.value || 0) } : x)))} />
          </div>
          <button type="button" className="btn small secondary" aria-label={`Supprimer la ligne ${i + 1}`} onClick={() => onChange(rows.filter((_, k) => k !== i))}>×</button>
        </div>
      ))}
      <button type="button" className="btn small secondary" onClick={() => onChange([...rows, { a: (rows.at(-1)?.a ?? 4) + 1, b: rows.at(-1)?.b ?? 0 }])}>{addLabel}</button>
    </fieldset>
  );
}

/**
 * Choix parmi quelques options (2 à 5), affichées toutes à la fois sous forme de boutons.
 * Contrairement à un menu déroulant, rien n'est coupé sur mobile, les autres possibilités
 * restent visibles et un seul geste suffit. Boutons radio natifs : flèches du clavier,
 * lecteurs d'écran et formulaires fonctionnent sans code supplémentaire.
 */
export function ChoiceField<V extends string | number>({ label, value, options, onChange, hint, compact, columns }: {
  label: string;
  value: V;
  options: { v: V; label: string; detail?: string }[];
  onChange: (v: V) => void;
  hint?: string;
  /** Options très courtes (« 11 % ») : toutes sur une ligne. */
  compact?: boolean;
  /** 2 : options courtes avec un détail, deux par ligne même sur mobile (une dernière option seule occupe toute la ligne).
   *  1 : options au détail long, toujours empilées. */
  columns?: 1 | 2;
}) {
  const name = useId();
  const hintId = `${name}-hint`;
  return (
    <fieldset className="field choice-field" aria-describedby={hint ? hintId : undefined}>
      <legend>{label}</legend>
      <div className={`choice-opts${compact ? ' choice-opts--compact' : ''}${columns ? ` choice-opts--${columns}` : ''}`} style={{ '--n': options.length } as CSSProperties}>
        {options.map((o) => (
          <label key={String(o.v)} className="choice-opt">
            <input type="radio" name={name} value={String(o.v)} checked={String(o.v) === String(value)} onChange={() => onChange(o.v)} />
            <span className="choice-body">
              <span className="choice-label">{o.label}</span>
              {o.detail && <span className="choice-detail">{o.detail}</span>}
            </span>
          </label>
        ))}
      </div>
      {hint && <div className="hint" id={hintId}>{hint}</div>}
    </fieldset>
  );
}

export function Tabs({ items, active, onSelect, label }: { items: string[]; active: number; onSelect: (i: number) => void; label: string }) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {items.map((t, i) => (
        <button key={i} type="button" role="tab" aria-selected={i === active} className={i === active ? 'on' : ''} onClick={() => onSelect(i)}>{t}</button>
      ))}
    </div>
  );
}

/** Questions fréquentes d'un simulateur (mêmes questions que les données structurées FAQPage). */
export function SimFaq({ slug, items = simFaq[slug] }: { slug: string; items?: FaqItem[] }) {
  if (!items?.length) return <SimNext slug={slug} />;
  return (
    <>
    <section aria-label="Questions fréquentes" style={{ marginTop: 32 }}>
      <h2>Questions fréquentes</h2>
      <div className="faq">
        {items.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
    <SimNext slug={slug} />
    </>
  );
}

/** « Pour aller plus loin » : évite l'impasse en bas d'un simulateur (guides et fiches qui y renvoient). */
export function SimNext({ slug }: { slug: string }) {
  const links = readingForSimulator(slug);
  if (!links.length) return null;
  return (
    <nav className="sim-next" aria-label="Pour aller plus loin">
      <h3>Pour aller plus loin</h3>
      <ul>
        {links.map((l) => (
          <li key={l.to}><span className="sim-next-kind">{l.kind}</span><Link to={l.to}>{l.title}</Link></li>
        ))}
      </ul>
    </nav>
  );
}

/** Lien « Voir les résultats », visible seulement sur mobile : sous le formulaire, les résultats sont loin plus bas. */
export function JumpToResults() {
  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById('resultats');
    if (!el) return;
    e.preventDefault();
    const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
    el.focus({ preventScroll: true });
  };
  return (
    <a className="btn sim-jump" href="#resultats" onClick={go}>
      Voir les résultats <span aria-hidden="true">↓</span>
    </a>
  );
}

/** Phrase « Concrètement » sous les résultats : traduit les chiffres en langage courant. Rien n'est affiché si le texte est vide. */
export function Takeaway({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p className="takeaway" role="status" aria-atomic="true">
      <strong>Concrètement. </strong>
      {typeof children === 'string' && children.includes('\n')
        ? children.split('\n').map((l, i) => <span key={i} className="takeaway-line">{l}</span>)
        : children}
    </p>
  );
}

/** Bloc repliable (tableau détaillé, précisions) : la page reste courte, le contenu reste dans le HTML. */
export function Fold({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="fold">
      <summary>{title}</summary>
      {children}
    </details>
  );
}
/** Bloc replié sur mobile (liste longue), toujours ouvert en écran large et dans le HTML pré-rendu. */
export function MobileFold({ label, hint, quietOnDesktop, children }: { label: string; hint?: string; quietOnDesktop?: boolean; children?: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (window.matchMedia('(max-width: 700px)').matches && ref.current) ref.current.open = false;
  }, []);
  return (
    <details ref={ref} open className={`cmp-fold mob-fold${quietOnDesktop ? ' mob-fold--quiet' : ''}`}>
      <summary><span>{label}{hint && <span className="fold-hint">{hint}</span>}</span></summary>
      {children}
    </details>
  );
}


/**
 * Avertissement en tête de simulateur. Sur grand écran il reste affiché tel quel ; sous 700 px
 * il est replié derrière « À savoir avant de simuler » pour que le formulaire apparaisse plus vite.
 * Le texte reste dans le HTML pré-rendu (bloc ouvert) et accessible d'un geste.
 */
export function SimNotice({ children }: { children?: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (window.matchMedia('(max-width: 700px)').matches && ref.current) ref.current.open = false;
  }, []);
  return (
    <details ref={ref} open className="notice sim-notice" role="note">
      <summary>À savoir avant de simuler</summary>
      <p>{children}</p>
    </details>
  );
}
