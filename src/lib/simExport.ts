import type { SavedSim } from './storage';

/** Export / import local des simulations enregistrées (fichier JSON, rien n'est envoyé nulle part). */
export const EXPORT_APP = 'patrimoine-os';
export const EXPORT_VERSION = 1;
export const MAX_SAVED = 20;

export type SimExport<T> = { app: typeof EXPORT_APP; version: number; simKey: string; exportedAt: string; sims: SavedSim<T>[] };

export function buildExport<T>(simKey: string, sims: SavedSim<T>[], now = new Date()): SimExport<T> {
  return { app: EXPORT_APP, version: EXPORT_VERSION, simKey, exportedAt: now.toISOString(), sims };
}

const isSim = (x: unknown): x is SavedSim<unknown> => {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.name === 'string' && typeof o.savedAt === 'string' && typeof o.data === 'object' && o.data !== null && !Array.isArray(o.data);
};

/** Analyse un fichier d'export : refuse tout fichier d'une autre simulation ou mal formé. */
export function parseExport<T>(text: string, simKey: string): { ok: true; sims: SavedSim<T>[] } | { ok: false; error: string } {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: "Ce fichier n'est pas un JSON valide." };
  }
  const o = raw as Partial<SimExport<unknown>> | null;
  if (!o || o.app !== EXPORT_APP || !Array.isArray(o.sims)) return { ok: false, error: "Ce fichier n'est pas un export Patrimoine OS." };
  if (o.simKey !== simKey) return { ok: false, error: `Ce fichier concerne un autre simulateur (« ${String(o.simKey)} »).` };
  const sims = o.sims.filter(isSim).map((s) => ({ id: s.id, name: s.name.slice(0, 120), savedAt: s.savedAt, data: s.data })) as SavedSim<T>[];
  return { ok: true, sims };
}

/** Fusionne les simulations importées (les plus récentes d'abord, sans doublon d'identifiant, 20 au plus). */
export function mergeSims<T>(current: SavedSim<T>[], imported: SavedSim<T>[]): SavedSim<T>[] {
  const ids = new Set(current.map((s) => s.id));
  return [...current, ...imported.filter((s) => !ids.has(s.id))]
    .sort((a, b) => (a.savedAt < b.savedAt ? 1 : a.savedAt > b.savedAt ? -1 : 0))
    .slice(0, MAX_SAVED);
}
