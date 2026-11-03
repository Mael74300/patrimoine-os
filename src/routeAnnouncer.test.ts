import { describe, expect, it } from 'vitest';
// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync } from 'node:fs';

describe('annonce du changement de page', () => {
  const app: string = readFileSync('src/App.tsx', 'utf8');
  it('une région aria-live annonce le titre de la page après navigation', () => {
    expect(app).toContain('function RouteAnnouncer');
    expect(app).toMatch(/aria-live="polite"/);
    expect(app).toContain('<RouteAnnouncer />');
  });
});
