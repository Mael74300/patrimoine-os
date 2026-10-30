/**
 * Stockage local (navigateur uniquement). Rien n'est envoyé à un serveur.
 * Toutes les opérations sont protégées : navigation privée ou stockage bloqué ne cassent pas le site.
 */
const PREFIX = 'patrimoine-os:';

export type SavedSim<T> = { id: string; name: string; savedAt: string; data: T };

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): boolean {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function clearAll(): void {
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* stockage indisponible */
  }
}

/* Export et import des données locales : un fichier JSON téléchargé puis rechargé par l'utilisateur, sans serveur. */
export const EXPORT_FORMAT = 'patrimoine-os-donnees';
export const EXPORT_VERSION = 1;
export const IMPORT_MAX_BYTES = 2_000_000;
const KEY_PATTERN = /^[A-Za-z0-9._:-]{1,80}$/;

export type LocalExport = { format: string; version: number; exportedAt: string; data: Record<string, unknown> };

/** Construit le contenu du fichier d'export à partir des entrées locales (clés sans préfixe). */
export function buildExport(data: Record<string, unknown>, now: Date = new Date()): LocalExport {
  return { format: EXPORT_FORMAT, version: EXPORT_VERSION, exportedAt: now.toISOString(), data };
}

/** Valide le texte d'un fichier importé. Renvoie les entrées à restaurer ou la raison du refus (en français). */
export function parseImport(text: string): { ok: true; data: Record<string, unknown> } | { ok: false; error: string } {
  if (text.length > IMPORT_MAX_BYTES) return { ok: false, error: 'Fichier trop volumineux.' };
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "Ce fichier n'est pas un fichier JSON valide." };
  }
  const file = parsed as Partial<LocalExport> | null;
  if (!file || typeof file !== 'object' || file.format !== EXPORT_FORMAT) {
    return { ok: false, error: "Ce fichier n'a pas été créé par Patrimoine OS." };
  }
  if (file.version !== EXPORT_VERSION) return { ok: false, error: "Version du fichier non prise en charge." };
  const data = file.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return { ok: false, error: 'Le fichier ne contient pas de données.' };
  for (const key of Object.keys(data)) {
    if (!KEY_PATTERN.test(key)) return { ok: false, error: 'Le fichier contient un nom de donnée inattendu.' };
  }
  return { ok: true, data: data as Record<string, unknown> };
}

/** Lit toutes les données locales du site (clés sans préfixe). */
export function readAll(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  try {
    for (const k of Object.keys(window.localStorage)) {
      if (!k.startsWith(PREFIX)) continue;
      try {
        out[k.slice(PREFIX.length)] = JSON.parse(window.localStorage.getItem(k) ?? 'null');
      } catch {
        /* entrée illisible ignorée */
      }
    }
  } catch {
    /* stockage indisponible */
  }
  return out;
}

/** Restaure des entrées validées ; renvoie le nombre d'entrées écrites. */
export function writeAll(data: Record<string, unknown>): number {
  let n = 0;
  for (const [k, v] of Object.entries(data)) if (save(k, v)) n++;
  return n;
}
