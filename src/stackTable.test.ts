import { describe, expect, it } from 'vitest';
// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync } from 'node:fs';
import credits from './pages/SimComparerCredits.tsx?raw';
import budget from './pages/SimBudget.tsx?raw';
import frais from './pages/SimFrais.tsx?raw';
import entreprise from './pages/SimEntreprise.tsx?raw';

const css: string = readFileSync('src/styles.css', 'utf8');
const mobile = css.slice(css.indexOf('/* Tableaux de scénarios : sous 700 px'), css.indexOf('/* Glossaire sur mobile'));

describe('Tableaux de scénarios compacts (stack-table)', () => {
  it('sur mobile, chaque carte range deux valeurs par ligne, le nom sur toute la largeur', () => {
    expect(mobile).toMatch(/\.stack-table tr \{[^}]*display: grid; grid-template-columns: 1fr 1fr;/);
    expect(mobile).toMatch(/\.stack-table \.st-name \{[^}]*grid-column: 1 \/ -1;/);
    expect(mobile).toMatch(/td:nth-child\(even\):last-child \{ grid-column: 1 \/ -1; \}/);
  });

  it('sur grand écran, la première colonne ne se coupe pas (« 20 ans »)', () => {
    expect(mobile).toMatch(/@media \(min-width: 701px\) \{\s*\.stack-table \.st-name \{ white-space: nowrap; \}/);
  });

  it('chaque ligne des deux tableaux commence par un nom puis des valeurs étiquetées', () => {
    for (const src of [credits, entreprise]) {
      const start = src.indexOf('className="stack-table"');
      const table = src.slice(start, src.indexOf('</table>', start));
      const tds = [...table.matchAll(/<td ([^>]*)>/g)].map((m) => m[1]);
      expect(tds[0]).toContain('st-name');
      for (const td of tds.slice(1).filter((t) => !t.includes('st-name'))) expect(td).toContain('data-label=');
    }
  });

  it('simulateur Budget : le tableau répétant les barres est remplacé par une phrase par poste', () => {
    expect(budget).not.toContain('stack-table');
    expect(budget).toContain('className="bb-list"');
    expect(budget).toContain('budgetGapPhrase(');
  });

  it('simulateur Frais : le tableau répétant les cartes est remplacé par des barres (versements, gains gardés, frais)', () => {
    expect(frais).not.toContain('stack-table');
    expect(frais).toContain('feeSplit(');
    expect(frais).toMatch(/<Fold title="Voir l'évolution année par année">\s*<LineChart/);
  });
});
