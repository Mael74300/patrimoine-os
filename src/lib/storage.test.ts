import { describe, expect, it } from 'vitest';
import { buildExport, parseImport, EXPORT_FORMAT, IMPORT_MAX_BYTES } from './storage';

describe('export et import des données locales', () => {
  it('relit ce qu\'il a exporté', () => {
    const data = { 'credit:saved': [{ id: 'a', name: 'Test', savedAt: '2026-10-30', data: { amount: 200000 } }] };
    const text = JSON.stringify(buildExport(data, new Date('2026-10-30T10:00:00Z')));
    const r = parseImport(text);
    expect(r).toEqual({ ok: true, data });
  });
  it('refuse un JSON invalide, un autre format, une autre version', () => {
    expect(parseImport('pas du json').ok).toBe(false);
    expect(parseImport('null').ok).toBe(false);
    expect(parseImport(JSON.stringify({ format: 'autre', version: 1, data: {} })).ok).toBe(false);
    expect(parseImport(JSON.stringify({ format: EXPORT_FORMAT, version: 2, data: {} })).ok).toBe(false);
  });
  it('refuse des données mal formées ou des noms inattendus', () => {
    expect(parseImport(JSON.stringify({ format: EXPORT_FORMAT, version: 1, data: [] })).ok).toBe(false);
    expect(parseImport(JSON.stringify({ format: EXPORT_FORMAT, version: 1 })).ok).toBe(false);
    expect(parseImport(JSON.stringify({ format: EXPORT_FORMAT, version: 1, data: { '<script>': 1 } })).ok).toBe(false);
  });
  it('refuse un fichier trop gros', () => {
    expect(parseImport(' '.repeat(IMPORT_MAX_BYTES + 1)).ok).toBe(false);
  });
});
