import { describe, expect, it } from 'vitest';
import { placeXLabels, yearTicks } from './components/ui';

const labels = (n: number) => Array.from({ length: n }, (_, i) => `Mois ${i}`);

describe('étiquettes de l’axe horizontal', () => {
  it('ne chevauche jamais deux étiquettes (cas du graphique de précaution à 375 px)', () => {
    const n = 19;
    const W = 327;
    const x = (i: number) => 48 + (i / (n - 1)) * (W - 48 - 16);
    const out = placeXLabels(labels(n), 5, x, W);
    const boxes = out
      .map((b, i) => (b ? { l: b.anchor === 'end' ? b.x - labels(n)[i].length * 6.6 : b.x - (labels(n)[i].length * 6.6) / 2, w: labels(n)[i].length * 6.6 } : null))
      .filter((b): b is { l: number; w: number } => b !== null);
    for (let k = 1; k < boxes.length; k++) expect(boxes[k].l).toBeGreaterThanOrEqual(boxes[k - 1].l + boxes[k - 1].w);
    expect(out[n - 1]).not.toBeNull();
    expect(out[15]).toBeNull();
  });

  it('garde la dernière étiquette dans le dessin', () => {
    const out = placeXLabels(labels(19), 5, (i) => 48 + i * 15, 327);
    expect(out[18]?.anchor).toBe('end');
  });
});

describe('graduations en années', () => {
  const years = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => `An ${from + i}`);
  const shown = (labels: string[], plot: number) => {
    const ticks = yearTicks(labels, plot);
    const x = (i: number) => 48 + (i / (labels.length - 1)) * plot;
    return placeXLabels(labels, ticks ?? 1, x, 48 + plot + 16).flatMap((b, i) => (b ? [labels[i]] : []));
  };

  it('choisit un pas rond selon la place (50 ans sur mobile : tous les 10 ans)', () => {
    expect(shown(years(0, 50), 263)).toEqual(['An 0', 'An 10', 'An 20', 'An 30', 'An 40', 'An 50']);
  });

  it('25 ans sur mobile : tous les 5 ans, sans graduation irrégulière', () => {
    expect(shown(years(0, 25), 263)).toEqual(['An 0', 'An 5', 'An 10', 'An 15', 'An 20', 'An 25']);
  });

  it('peu d’années sur grand écran : chaque année', () => {
    expect(shown(years(0, 5), 900)).toEqual(['An 0', 'An 1', 'An 2', 'An 3', 'An 4', 'An 5']);
  });

  it('axe qui commence à l’an 1 : la première année gardée si elle tient', () => {
    expect(yearTicks(years(1, 15), 900)?.[0]).toBe(0);
    const narrow = shown(years(1, 15), 263);
    expect(narrow[narrow.length - 1]).toBe('An 15');
    for (const l of narrow.slice(1, -1)) expect(Number(l.slice(3)) % 5).toBe(0);
  });

  it('ignore les libellés qui ne sont pas des années consécutives', () => {
    expect(yearTicks(['Mois 0', 'Mois 1'], 300)).toBeNull();
    expect(yearTicks(['An 0', 'An 2', 'An 4'], 300)).toBeNull();
  });
});
