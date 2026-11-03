import { describe, expect, it } from 'vitest';
// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readdirSync, readFileSync } from 'node:fs';

describe('lien « Voir les résultats » des simulateurs (mobile)', () => {
  const files: string[] = readdirSync('src/pages').filter((f: string) => /^Sim.*\.tsx$/.test(f));
  const withResults = files.filter((f) => readFileSync(`src/pages/${f}`, 'utf8').includes('aria-label="Résultats"'));
  it('le composant pointe vers l’ancre #resultats', () => {
    const ui: string = readFileSync('src/components/ui.tsx', 'utf8');
    expect(ui).toContain('href="#resultats"');
    expect(ui).toContain("getElementById('resultats')");
  });
  it('chaque simulateur à formulaire et résultats porte le lien et l’ancre', () => {
    expect(withResults.length).toBeGreaterThanOrEqual(20);
    for (const f of withResults) {
      const src: string = readFileSync(`src/pages/${f}`, 'utf8');
      expect(src, f).toContain('<JumpToResults />');
      expect(src, f).toContain('id="resultats"');
    }
  });
});
