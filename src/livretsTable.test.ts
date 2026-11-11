import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { LivretsTable } from './components/LivretsTable';
import { LIVRETS_AS_OF, LIVRETS_PERIOD } from './data/livrets';

const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(LivretsTable)));
const text = html.replace(/<[^>]+>/g, ' ').replace(/[  ]/g, ' ').replace(/\s+/g, ' ');

describe('tableau des livrets du guide Épargne de précaution', () => {
  it('affiche taux et plafonds de src/data/livrets.ts, dans l’ordre LEP, Livret A, LDDS', () => {
    expect(text).toMatch(/1\. LEP sous conditions de revenus 2,5 % 10 000 €/);
    expect(text).toMatch(/2\. Livret A 1,7 % 22 950 €/);
    expect(text).toMatch(/3\. LDDS 1,7 % 12 000 €/);
  });
  it('date les taux et donne leur période de validité', () => {
    expect(text).toContain(`Taux annuels au ${LIVRETS_AS_OF}, fixés pour la période ${LIVRETS_PERIOD}`);
  });
  it('est un vrai tableau accessible avec légende et en-têtes', () => {
    expect(html).toContain('<caption>');
    expect(html.match(/scope="col"/g)).toHaveLength(3);
    expect(html.match(/scope="row"/g)).toHaveLength(3);
    expect(html).toContain('href="/encyclopedie/lep"');
  });
});
