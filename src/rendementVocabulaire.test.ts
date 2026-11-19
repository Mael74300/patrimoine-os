import { describe, expect, it } from 'vitest';
import { simulators } from './lib/simulatorsList';
import { guides } from './data/guides';
import { glossary } from './data/glossary';

const page = import.meta.glob<string>('./pages/SimRendement.tsx', { query: '?raw', import: 'default', eager: true })['./pages/SimRendement.tsx']!;

// Sur le site, « rendement réel » veut dire « corrigé de l'inflation » (glossaire, guide Inflation).
// Le simulateur de rendement calcule un taux annuel avant inflation : il ne doit ni s'appeler « réel »
// ni être présenté comme calculant l'effet de l'inflation.
describe('Vocabulaire du rendement', () => {
  it('le glossaire réserve « réel » au rendement corrigé de l’inflation', () => {
    const inflation = glossary.find((t) => t.term === 'Inflation');
    expect(inflation?.definition).toMatch(/rendement « réel » est un rendement corrigé de l’inflation/);
  });

  it('le simulateur de rendement ne se dit pas « réel » et précise qu’il est avant inflation', () => {
    const sim = simulators.find((s) => s.slug === 'rendement-reel-de-mon-placement');
    expect(sim?.title).toBe('Rendement de mon placement');
    expect(page).not.toMatch(/Rendement réel de mon placement/);
    expect(page).toMatch(/et avant inflation\./);
    expect(page).toMatch(/Ce taux ne la retire pas/);
  });

  it('le guide Inflation ne prête pas au simulateur de rendement un calcul d’inflation', () => {
    const text = JSON.stringify(guides.find((g) => g.slug === 'inflation-pouvoir-d-achat-epargne'));
    expect(text).not.toMatch(/Rendement réel de mon placement/);
    expect(text).toMatch(/« Rendement de mon placement » donne le taux obtenu, avant inflation/);
  });
});
