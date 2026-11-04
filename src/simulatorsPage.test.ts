import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Simulators, { startSims } from './pages/Simulators';
import { simulators } from './lib/search';

describe('Liste des simulateurs', () => {
  it('les points de départ renvoient vers des simulateurs existants', () => {
    for (const s of startSims) expect(simulators.some((x) => x.slug === s.slug)).toBe(true);
  });
  it('affiche les points de départ', () => {
    const html = renderToString(createElement(MemoryRouter, { initialEntries: ['/simulateurs'] }, createElement(Simulators)));
    expect(html).toContain('sim-start');
    for (const s of startSims) expect(html).toContain(`/simulateurs/${s.slug}`);
  });
});
