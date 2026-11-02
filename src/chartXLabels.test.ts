import { describe, expect, it } from 'vitest';
import { placeXLabels } from './components/ui';

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
