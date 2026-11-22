import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { LineChart } from './components/ui';
import retraits from './pages/SimRetraits.tsx?raw';
import credit from './pages/SimCredit.tsx?raw';
import entreprise from './pages/SimEntreprise.tsx?raw';
import etalement from './pages/SimEtalement.tsx?raw';
import frais from './pages/SimFrais.tsx?raw';
import louer from './pages/SimLouerAcheter.tsx?raw';
import inflation from './pages/SimInflation.tsx?raw';
import compare from './pages/Compare.tsx?raw';
import rembourser from './pages/SimRembourser.tsx?raw';
import patrimoine from './pages/SimPatrimoine.tsx?raw';

describe('Légende des graphiques : ce que mesurent les montants', () => {
  it('affiche la mesure après la période lue', () => {
    const html = renderToStaticMarkup(
      createElement(LineChart, {
        title: 'Essai',
        xLabels: ['An 0', 'An 1'],
        format: (n: number) => `${n} €`,
        series: [{ name: 'Propriétaire', color: 'red', values: [1, 2] }],
        measure: 'patrimoine en fin d’année',
      }),
    );
    expect(html).toContain('<strong>An 1</strong><span class="chart-legend-measure"> · patrimoine en fin d’année</span>');
  });

  it('sans mesure, la légende reste inchangée', () => {
    const html = renderToStaticMarkup(
      createElement(LineChart, { title: 'Essai', xLabels: ['An 0'], format: String, series: [{ name: 'Valeur', color: 'red', values: [1] }] }),
    );
    expect(html).not.toContain('chart-legend-measure');
  });

  // Courbes nommées d'après un scénario (« Propriétaire », « Frais 1 % », « Votre retrait ») : la légende dit quel montant on lit.
  it.each([
    ['Retraits réguliers', retraits],
    ['Crédit', credit],
    ['Entreprise', entreprise],
    ['Investir d’un coup ou progressivement', etalement],
    ['Frais', frais],
    ['Louer ou acheter', louer],
    ['Inflation', inflation],
    ['Comparateur', compare],
    ['Rembourser ou investir', rembourser],
    ['Patrimoine', patrimoine],
  ])('%s : le graphique précise ce qu’il mesure', (_, src) => {
    expect(src).toMatch(/<LineChart\b[\s\S]{0,400}?\smeasure=/);
  });
});
