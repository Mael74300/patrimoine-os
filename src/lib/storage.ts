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
