import { describe, expect, it } from 'vitest';
// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readdirSync, readFileSync } from 'node:fs';

/**
 * Questions fréquentes et « Pour aller plus loin » sous la grille formulaire + résultats, en pleine largeur (2026-11-22) :
 * dans la colonne des résultats, elles laissaient un grand vide sous le formulaire à 1 280 px et des lignes étroites.
 */
describe('simulateurs : questions fréquentes en pleine largeur', () => {
  const files: string[] = readdirSync('src/pages').filter((f: string) => /^Sim.*\.tsx$/.test(f));
  const withFaq = files.filter((f) => readFileSync(`src/pages/${f}`, 'utf8').includes('<SimFaq'));
  it('aucun simulateur ne place SimFaq ni l’avertissement dans la colonne des résultats', () => {
    expect(withFaq.length).toBeGreaterThanOrEqual(20);
    for (const f of withFaq) {
      const src: string = readFileSync(`src/pages/${f}`, 'utf8');
      const after = src.slice(src.lastIndexOf('<SimFaq'));
      expect(after, f).not.toContain('</section>');
      const disc = src.lastIndexOf('<Disclaimer');
      expect(src.slice(disc), f).not.toContain('</section>');
    }
  });
});
