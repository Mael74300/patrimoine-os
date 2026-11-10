import { describe, expect, it } from 'vitest';
// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync } from 'node:fs';

const src: string = readFileSync('src/components/Illustrations.tsx', 'utf8');

describe('schéma Immobilier ou ETF', () => {
  it('garde des légendes assez courtes pour ne pas être coupées par le bord du dessin (colonne de 206 unités)', () => {
    const bloc = src.slice(src.indexOf('export function SchemaImmoEtf'), src.indexOf('export function SchemaRegle72'));
    const fins = [...bloc.matchAll(/end: '([^']+)'/g)].map((m) => m[1]);
    expect(fins.length).toBe(2);
    for (const f of fins) expect(f.length).toBeLessThanOrEqual(32);
  });
});
