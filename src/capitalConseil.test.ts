import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CapitalFact } from './components/ui';
import { investments } from './data/investments';

const html = (slug: string) => renderToStaticMarkup(createElement(CapitalFact, { c: investments.find((i) => i.slug === slug)!.minCapital }));

// Chantier 151 : un conseil (« Lisez le minimum… ») ne doit pas ressembler à un montant dans « En bref » et le comparateur.
describe('« Capital nécessaire » : conseil ou montant', () => {
  it('chaque conseil porte la pastille « Conseil » et le style de note, avec son texte inchangé', () => {
    const advice = investments.filter((i) => i.minCapital.advice);
    expect(advice.length).toBeGreaterThanOrEqual(10);
    for (const i of advice) {
      const h = html(i.slug);
      expect(h, i.slug).toContain('class="fact-advice"');
      expect(h, i.slug).toContain('Conseil');
      expect(h, i.slug).toContain('aria-hidden="true"');
      expect(h, i.slug).not.toContain('à vérifier');
    }
  });

  it('un montant vérifié s’affiche tel quel, sans pastille ni badge', () => {
    const h = html('livret-a');
    expect(h).not.toContain('Conseil');
    expect(h).not.toContain('à vérifier');
    expect(h).toContain('10');
  });

  it('les deux emplacements de la fiche et le comparateur passent par le même composant', () => {
    const src = import.meta.glob<string>(['./pages/InvestmentPage.tsx', './pages/Compare.tsx'], { query: '?raw', import: 'default', eager: true });
    expect(src['./pages/InvestmentPage.tsx']!.match(/<CapitalFact c=\{inv\.minCapital\} \/>/g)).toHaveLength(2);
    expect(src['./pages/Compare.tsx']).toContain('<CapitalFact c={i.minCapital} />');
  });
});
