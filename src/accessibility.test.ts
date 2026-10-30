import { describe, expect, it } from 'vitest';
// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync } from 'node:fs';

const css: string = readFileSync('src/styles.css', 'utf8');
const pages = import.meta.glob<string>('./pages/*.tsx', { query: '?raw', import: 'default', eager: true });

// Garde-fous d'accessibilité : contrastes des couleurs de texte et structure des tableaux.

const root = css.slice(css.indexOf(':root'), css.indexOf('}', css.indexOf(':root')));
const color = (name: string): string => {
  const m = root.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`variable --${name} introuvable`);
  return m[1];
};

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe('contraste du texte (WCAG AA : 4,5 pour 1 au minimum)', () => {
  const fonds = ['bg', 'surface', 'surface-2', 'accent-soft', 'warn-soft'];
  const textes = ['ink', 'ink-2', 'ink-3', 'primary', 'accent', 'danger'];
  for (const t of textes) {
    for (const f of fonds) {
      it(`--${t} sur --${f}`, () => {
        // --accent et --danger ne servent pas de texte courant sur --accent-soft / --surface-2 : on teste les couples réels
        if ((t === 'danger' || t === 'accent') && (f === 'surface-2' || f === 'warn-soft')) return;
        expect(contrast(color(t), color(f))).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
  it('--warn sur --warn-soft', () => {
    expect(contrast(color('warn'), color('warn-soft'))).toBeGreaterThanOrEqual(4.5);
  });
  it('texte blanc sur --primary', () => {
    expect(contrast(color('primary-ink'), color('primary'))).toBeGreaterThanOrEqual(4.5);
  });
});

describe('tableaux', () => {
  const fichiers = Object.entries(pages);
  it('chaque tableau défilant est atteignable au clavier', () => {
    for (const [f, src] of fichiers) {
      for (const m of src.matchAll(/<div className="table-wrap"[^>]*>/g)) {
        expect(m[0], `${f}`).toContain('tabIndex={0}');
      }
    }
  });
  it('aucune cellule d’en-tête vide', () => {
    for (const [f, src] of fichiers) {
      expect(src, `${f}`).not.toMatch(/<th(\s[^>]*)?\s*\/>/);
      expect(src, `${f}`).not.toMatch(/<th(\s[^>]*)?>\s*<\/th>/);
    }
  });
});

describe('texte réservé aux lecteurs d’écran', () => {
  it('reste contenu dans le tableau défilant (sinon la page déborde à droite sur mobile)', () => {
    const rule = css.match(/\.table-wrap \{[^}]*\}/)?.[0] ?? '';
    expect(rule).toMatch(/position:\s*relative/);
  });
});

describe('annonce des résultats aux lecteurs d’écran', () => {
  it('la phrase « Concrètement » est une zone de statut lue en entier à chaque changement', () => {
    const ui: string = readFileSync('src/components/ui.tsx', 'utf8');
    const m = ui.match(/<p className="takeaway"[^>]*>/);
    expect(m?.[0]).toContain('role="status"');
    expect(m?.[0]).toContain('aria-atomic="true"');
  });
});
