import { describe, expect, it } from 'vitest';
// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync } from 'node:fs';

/**
 * Cartes de résultat des simulateurs (`.kpis`). Avant le 2026-11-11, la grille « auto-fit » laissait une carte seule
 * sous une rangée pleine (4 + 1 sur le Calculateur immobilier et le Calculateur de crédit à 1 280 px, 3 + 1 sur six
 * simulateurs à 1 024 px). Les règles « quantité » choisissent une rangée entière ou des rangées équilibrées.
 * Ce test rejoue l'algorithme de retour à la ligne de flexbox avec les seuils lus dans la feuille de style.
 */
const css: string = readFileSync('src/styles.css', 'utf8');
const GAP = 12;
const MIN = 160;

function rule(n: number): string {
  const m = new RegExp(`\\.kpis:has\\(> :nth-child\\(${n}\\):last-child\\) > \\* \\{ flex-basis: ([^;]+);`).exec(css);
  expect(m, `règle pour ${n} cartes`).not.toBeNull();
  return m![1];
}

/** Évalue la base d'une carte (clamp imbriqués de la feuille de style) pour une largeur de conteneur. */
function basis(expr: string, width: number): number {
  const pct = (s: string) => s.replace(/(-?[\d.]+)%/g, (_, v) => `(${v} * ${width} / 100)`).replace(/px/g, '');
  const js = pct(expr)
    .replace(/clamp\(/g, 'cl(')
    .replace(/calc\(/g, '(');
  const cl = (a: number, v: number, b: number) => Math.max(a, Math.min(v, b));
  return Function('cl', `return ${js};`)(cl) as number;
}

function rows(n: number, width: number, b: number): number[] {
  const out: number[] = [];
  let line = 0;
  let used = 0;
  for (let i = 0; i < n; i++) {
    const need = (line ? GAP : 0) + b;
    if (line && used + need > width + 1e-6) {
      out.push(line);
      line = 0;
      used = 0;
    }
    used += (line ? GAP : 0) + b;
    line++;
  }
  out.push(line);
  return out;
}

describe('cartes de résultat : rangées équilibrées', () => {
  it('les seuils correspondent à une rangée entière de cartes de 160 px', () => {
    expect(rule(4)).toContain(`${4 * MIN + 3 * GAP}px`);
    expect(rule(5)).toContain(`${5 * MIN + 4 * GAP}px`);
    expect(rule(5)).toContain(`${3 * MIN + 2 * GAP}px`);
    expect(rule(6)).toContain(`${3 * MIN + 2 * GAP}px`);
  });

  it('jamais une carte seule sous une rangée de trois cartes ou plus, de 330 à 1 200 px', () => {
    for (const n of [4, 5, 6]) {
      const expr = rule(n);
      for (let w = 330; w <= 1200; w += 2) {
        const r = rows(n, w, basis(expr, w));
        const last = r[r.length - 1];
        expect(last >= r[0] - 1, `${n} cartes à ${w} px : ${r.join(' + ')}`).toBe(true);
        expect(Math.max(...r), `${n} cartes à ${w} px : ${r.join(' + ')}`).toBeLessThanOrEqual(n);
      }
    }
  });

  it('cas relevés à l’audit : 5 cartes en 3 + 2 dans la colonne de résultats (environ 720 px)', () => {
    expect(rows(5, 720, basis(rule(5), 720))).toEqual([3, 2]);
    expect(rows(4, 560, basis(rule(4), 560))).toEqual([2, 2]);
    expect(rows(4, 720, basis(rule(4), 720))).toEqual([4]);
  });

  it('l’ancienne règle mobile de grille a disparu (flexbox étire déjà la dernière carte)', () => {
    expect(css).not.toContain('.kpis > .kpi:last-child:nth-child(odd)');
    expect(css).toMatch(/\.kpis \{ display: flex; flex-wrap: wrap; gap: 12px;/);
  });
});
