// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Texte des schémas et graphiques SVG : une pile de polices sans ui-sans-serif ni system-ui.
 * Sous Linux, ces deux noms donnent souvent DejaVu Sans, nettement plus large qu'Arial : relevé du 2026-11-12,
 * 37 textes de schéma touchaient ou dépassaient le bord de leur case sur les 94 pages (375 et 1 280 px).
 * La pile garde la police système de macOS, Windows et Android, puis Arial ou Liberation Sans (mêmes largeurs).
 */
const css = readFileSync('src/styles.css', 'utf8') as string;
const pile = /--font-schema:\s*([^;]+);/.exec(css)?.[1] ?? '';
const polices = pile.split(',').map((p) => p.trim().replace(/['"]/g, ''));

describe('police du texte des schémas', () => {
  it('ne passe ni par ui-sans-serif ni par system-ui', () => {
    expect(polices).not.toContain('ui-sans-serif');
    expect(polices).not.toContain('system-ui');
  });

  it('prend Arial ou Liberation Sans avant la police générique', () => {
    expect(polices.at(-1)).toBe('sans-serif');
    expect(polices.indexOf('Arial')).toBeGreaterThan(-1);
    expect(polices.indexOf('Liberation Sans')).toBeGreaterThan(-1);
    expect(polices).not.toContain('DejaVu Sans');
  });

  it('garde la police système des grands systèmes (macOS, Windows, Android)', () => {
    for (const p of ['-apple-system', 'Segoe UI', 'Roboto']) expect(polices).toContain(p);
  });

  it('s’applique au texte de tous les dessins SVG, schémas et graphiques', () => {
    expect(css).toContain('svg text { font-family: var(--font-schema); }');
    expect(css).toMatch(/\.chart text \{ font-family: var\(--font-schema\);/);
    expect(css).toMatch(/\.ill-svg text \{ font-family: var\(--font-schema\);/);
  });
});
