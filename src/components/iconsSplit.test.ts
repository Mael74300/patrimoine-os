// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as Icons from './Icons';
import * as Illustrations from './Illustrations';

const lire = (chemin: string): string => readFileSync(`src/pages/${chemin}.tsx`, 'utf8');

describe('icônes séparées des schémas', () => {
  it("l'accueil, l'Encyclopédie et les Simulateurs n'importent pas le gros fichier de schémas", () => {
    for (const page of ['Home', 'Encyclopedia', 'Simulators']) {
      expect(lire(page)).not.toMatch(/components\/Illustrations/);
    }
  });
  it('le fichier de schémas continue d’exposer les icônes (compatibilité)', () => {
    expect(Illustrations.FamilyIcon).toBe(Icons.FamilyIcon);
    expect(Illustrations.SimThemeIcon).toBe(Icons.SimThemeIcon);
    expect(Illustrations.GuideGroupIcon).toBe(Icons.GuideGroupIcon);
    expect(Illustrations.SituationIcon).toBe(Icons.SituationIcon);
  });
});

describe('schémas chargés à la demande', () => {
  it("aucune page n'importe le fichier qui réunit tous les schémas", () => {
    for (const f of readdirSync('src/pages') as string[]) {
      if (f.endsWith('.tsx')) expect(lire(f.replace(/\.tsx$/, '')), f).not.toMatch(/components\/Illustrations'/);
    }
  });
  it('les fiches et les guides ne partagent que les schémas communs', () => {
    expect(lire('InvestmentPage')).not.toMatch(/schemas\/guides'/);
    expect(lire('Guides')).not.toMatch(/schemas\/fiches'/);
  });
});
