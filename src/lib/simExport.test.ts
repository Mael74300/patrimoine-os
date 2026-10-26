import { describe, expect, it } from 'vitest';
import { buildExport, mergeSims, parseExport } from './simExport';

const S = (id: string, savedAt: string) => ({ id, name: 'n' + id, savedAt, data: { a: 1 } });

describe('export / import des simulations', () => {
  it('aller-retour sans perte', () => {
    const sims = [S('1', '2026-01-01T00:00:00Z'), S('2', '2026-02-01T00:00:00Z')];
    const r = parseExport(JSON.stringify(buildExport('budget', sims)), 'budget');
    expect(r).toEqual({ ok: true, sims });
  });
  it('refuse un JSON invalide, un autre site et un autre simulateur', () => {
    expect(parseExport('pas du json', 'budget').ok).toBe(false);
    expect(parseExport('{"app":"autre","sims":[]}', 'budget').ok).toBe(false);
    const other = JSON.stringify(buildExport('frais', [S('1', '2026-01-01')]));
    const r = parseExport(other, 'budget');
    expect(r.ok).toBe(false);
  });
  it('ignore les entrées mal formées', () => {
    const txt = JSON.stringify({ app: 'patrimoine-os', version: 1, simKey: 'budget', sims: [S('1', '2026-01-01'), { id: 3 }, null, { ...S('2', 'x'), data: [] }] });
    const r = parseExport(txt, 'budget');
    expect(r.ok && r.sims.map((s) => s.id)).toEqual(['1']);
  });
  it('fusion : sans doublon, triée, limitée à 20', () => {
    const cur = [S('1', '2026-01-01')];
    expect(mergeSims(cur, [S('1', '2026-05-01'), S('2', '2026-03-01')]).map((s) => s.id)).toEqual(['2', '1']);
    const many = Array.from({ length: 25 }, (_, i) => S('m' + i, `2026-01-${String(i + 1).padStart(2, '0')}`));
    expect(mergeSims([], many)).toHaveLength(20);
  });
});
