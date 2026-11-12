import { describe, expect, it } from 'vitest';
// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync, readdirSync } from 'node:fs';
import { simFaq } from './data/simFaq';
import { realRate } from './lib/finance';

/**
 * Sous-titres des cartes de résultat (`<Kpi sub="…">`). Avant le 2026-11-12, plusieurs étaient des formules
 * (« (1 + rendement) / (1 + inflation) − 1 », « loyers − charges ÷ coût total », « 3 mois × 2 000 € + 1 000 € »)
 * illisibles pour un débutant. Les formules restent dans les questions fréquentes repliées et la page Méthode.
 */
const dir = 'src/pages';
const subs: { file: string; text: string }[] = [];
for (const f of readdirSync(dir) as string[]) {
  if (!f.endsWith('.tsx')) continue;
  const src: string = readFileSync(`${dir}/${f}`, 'utf8');
  for (const m of src.matchAll(/<Kpi\b[^>]*?\bsub=(?:"([^"]*)"|\{`([^`]*)`\})/g)) subs.push({ file: f, text: m[1] ?? m[2] });
}

describe('sous-titres des cartes de résultat', () => {
  it('sont trouvés dans les simulateurs', () => {
    expect(subs.length).toBeGreaterThan(40);
  });
  it('ne contiennent ni formule ni opérateur entre deux mots', () => {
    const bad = subs.filter(({ text }) => /÷|×|\(1 \+| \/ |[a-zé] − [a-zé]/.test(text.replace(/\$\{[^}]*\}/g, 'X')));
    expect(bad).toEqual([]);
  });
  it('la formule du rendement réel reste expliquée dans la question repliée, avec le bon exemple', () => {
    const a = simFaq['independance-financiere'].map((f) => f.a).join(' ');
    expect(a).toContain('(1 + rendement) / (1 + inflation) − 1');
    expect(a).toContain(`${(realRate(0.05, 0.02) * 100).toFixed(2).replace('.', ',')}\u00a0%`);
  });
});
