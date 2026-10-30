import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { simFaq, type FaqItem } from '../data/simFaq';
import { Link } from 'react-router-dom';
import { config } from '../config';
import type { Checked, Level, Source } from '../data/types';
import { load, save, type SavedSim } from '../lib/storage';
import { summarizeSeries } from '../lib/chartSummary';
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
};

export function NumberField({ label, value, onChange, unit, step = 1, min, max, hint, percent }: NumberFieldProps) {
  const id = useId();
  const shown = percent ? round(value * 100, 4) : value;
  const [text, setText] = useState(String(shown));
  const last = useRef(shown);
  useEffect(() => {
    if (shown !== last.current) {
      setText(String(shown));
      last.current = shown;
    }
  }, [shown]);
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
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

export function Kpi({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'pos' | 'neg' }) {
  return (
    <div className={'kpi ' + (tone ?? '')}>
      <div className="k-label">{label}</div>
      <div className="k-value">{value}</div>
      {sub && <div className="k-sub">{sub}</div>}
    </div>
  );
}

export function Dots({ level, kind, label }: { level: Level; kind?: 'risk' | 'liq'; label: string }) {
  return (
    <div className="meter" aria-label={`${label} : ${level} sur 5`} role="img">
      <span>{label}</span>
      <div className={'dots ' + (kind ?? '')}>
        {[1, 2, 3, 4, 5].map((i) => (
          <i key={i} className={i <= level ? 'on' : ''} />
        ))}
      </div>
    </div>
  );
}

export function CheckedText({ c }: { c: Checked }) {
  return (
    <p>
      {c.text}{' '}
      {c.verified ? (
        <span className="badge-verified">✓ vérifié{c.asOf ? ` au ${c.asOf}` : ''}</span>
      ) : (
        <span className="badge-unverified">à vérifier</span>
      )}
    </p>
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

export function PageHead({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  useEffect(() => {
    document.title = `${title} · ${config.siteName}`;
  }, [title]);
  return (
    <header style={{ marginBottom: 24 }}>
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
  height?: number;
};

/** Graphique en lignes SVG, sans dépendance, utilisable à la souris, au doigt et au clavier. */
export function LineChart({ series, xLabels, format, title, height = 300 }: ChartProps) {
  // Largeur du dessin = largeur affichée : les textes gardent leur taille réelle (lisibles sur mobile).
  const [W, setW] = useState(720);
  const narrow = W < 480;
  const H = narrow ? Math.min(height, 240) : height;
  const pad = { l: narrow ? 48 : 64, r: 16, t: 16, b: 32 };
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

  const x = (i: number) => pad.l + (n <= 1 ? 0 : (i / (n - 1)) * (W - pad.l - pad.r));
  const y = (v: number) => pad.t + (1 - (v - min) / (max - min || 1)) * (H - pad.t - pad.b);
  const labelEvery = Math.max(1, Math.ceil(n / Math.max(3, Math.floor((W - pad.l - pad.r) / 56))));

  const onMove = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, i)));
  };

  const active = hover ?? n - 1;
  const descId = useId();
  const summary = useMemo(() => summarizeSeries(series, xLabels, format), [series, xLabels, format]);

  return (
    <figure style={{ margin: 0 }}>
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
          if (e.key === 'ArrowRight') setHover(Math.min(n - 1, (hover ?? n - 1) + 1));
          if (e.key === 'ArrowLeft') setHover(Math.max(0, (hover ?? n - 1) - 1));
        }}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line className="grid-line" x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end">{compact(t)}</text>
          </g>
        ))}
        {xLabels.map((l, i) =>
          (i % labelEvery === 0 && n - 1 - i >= labelEvery * 0.6) || i === n - 1 ? (
            <text key={i} x={x(i)} y={H - 10} textAnchor="middle">{l}</text>
          ) : null,
        )}
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
      <div className="chart-tip" aria-live="polite">
        <strong>{xLabels[active]}</strong>{' '}
        {series.map((s, idx) =>
          typeof s.values[active] === 'number' ? (
            <span key={idx} style={{ marginLeft: 12 }}>
              <span style={{ color: s.color }}>●</span> {s.name} : <span className="num">{format(s.values[active] as number)}</span>
            </span>
          ) : null,
        )}
      </div>
      <figcaption className="chart-legend">
        {series.map((s, idx) => (
          <span key={idx} style={{ ['--c' as string]: s.color }}>{s.name}</span>
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

function compact(n: number) {
  const a = Math.abs(n);
  if (a >= 1e6) return (n / 1e6).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' M€';
  if (a >= 1e3) return (n / 1e3).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' k€';
  return n.toLocaleString('fr-FR') + ' €';
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
    <details className="panel" style={{ marginTop: 16 }}>
      <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Mes simulations enregistrées ({list.length})</summary>
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

export function SelectField<V extends string | number>({ label, value, options, onChange, hint }: {
  label: string;
  value: V;
  options: { v: V; label: string }[];
  onChange: (v: V) => void;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={String(value)} onChange={(e) => {
        const o = options.find((x) => String(x.v) === e.target.value);
        if (o) onChange(o.v);
      }}>
        {options.map((o) => <option key={String(o.v)} value={String(o.v)}>{o.label}</option>)}
      </select>
      {hint && <div className="hint">{hint}</div>}
    </div>
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
  if (!items?.length) return null;
  return (
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
  );
}

/** Phrase « Concrètement » sous les résultats : traduit les chiffres en langage courant. Rien n'est affiché si le texte est vide. */
export function Takeaway({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p className="takeaway" role="status" aria-atomic="true">
      <strong>Concrètement. </strong>
      {children}
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
