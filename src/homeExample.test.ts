import { describe, expect, it } from 'vitest';
// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync } from 'node:fs';
import { projectGrowth } from './lib/calc/growth';

const home: string = readFileSync('src/pages/Home.tsx', 'utf8').replace(/[  ]/g, ' ');
const example = projectGrowth({ initial: 5000, monthly: 200, annualReturn: 0.05, annualFees: 0.005, years: 25, inflation: 0.02 });
const last = example[25];

describe('accueil : l’exemple fictif dit ce qu’il faut retenir', () => {
  it('calcule l’exemple avec les hypothèses annoncées', () => {
    expect(home).toContain('projectGrowth({ initial: 5000, monthly: 200, annualReturn: 0.05, annualFees: 0.005, years: 25, inflation: 0.02 })');
    expect(home).toContain('5 000 € au départ, puis 200 € par mois pendant 25 ans ; 5 % par an, moins 0,5 % de frais ; 2 % d\'inflation par an.');
    expect(home).toContain('Exemple fictif');
  });

  it('« près de la moitié de la somme finale vient des gains »', () => {
    expect(home).toContain('Près de la moitié de la somme finale vient des gains');
    const share = last.gains / last.value;
    expect(share).toBeGreaterThan(0.45);
    expect(share).toBeLessThan(0.5);
  });

  it('« dont les deux tiers pendant les 10 dernières années »', () => {
    expect(home).toContain('dont les deux tiers pendant les 10 dernières années');
    const late = (last.gains - example[15].gains) / last.gains;
    expect(late).toBeGreaterThan(0.64);
    expect(late).toBeLessThan(0.69);
  });

  it('« en pointillés, la même somme achète environ 40 % de moins »', () => {
    expect(home).toContain('En pointillés, la même somme en euros d’aujourd’hui : à cause de la hausse des prix, elle achète environ 40 % de moins.');
    const loss = 1 - last.realValue / last.value;
    expect(loss).toBeGreaterThan(0.37);
    expect(loss).toBeLessThan(0.42);
  });

  it('ne recopie plus les montants que la légende du graphique affiche déjà', () => {
    const block = home.slice(home.indexOf('<section className="home-example panel">'), home.indexOf('<LineChart'));
    expect(block).not.toMatch(/fmtEur\(/);
  });
});
