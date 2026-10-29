/** Résumé textuel d'un graphique en lignes, pour les lecteurs d'écran : début, fin, minimum et maximum de chaque courbe. */
export type SummarySeries = { name: string; values: (number | undefined)[] };

type Point = { i: number; v: number };

function points(values: (number | undefined)[]): Point[] {
  const out: Point[] = [];
  values.forEach((v, i) => {
    if (typeof v === 'number' && Number.isFinite(v)) out.push({ i, v });
  });
  return out;
}

export function summarizeSeries(
  series: SummarySeries[],
  xLabels: (string | number)[],
  format: (n: number) => string,
): string[] {
  const lines: string[] = [];
  for (const s of series) {
    const pts = points(s.values);
    if (pts.length === 0) continue;
    const first = pts[0];
    const last = pts[pts.length - 1];
    const hi = pts.reduce((a, p) => (p.v > a.v ? p : a));
    let line = `${s.name} : de ${format(first.v)} (${xLabels[first.i]}) à ${format(last.v)} (${xLabels[last.i]})`;
    if (hi.i !== first.i && hi.i !== last.i) line += `, maximum ${format(hi.v)} (${xLabels[hi.i]})`;
    lines.push(line + '.');
  }
  return lines;
}
