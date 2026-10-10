/**
 * Fonctions pures de la surveillance des sources (testées dans watch.test.ts).
 * Principe : on ne conserve qu'une empreinte (hash) du texte des pages officielles, jamais leur contenu.
 */
import { createHash } from 'node:crypto';

/** Texte visible d'une page HTML, limité à <main> quand il existe, espaces normalisés. */
export function normalizeHtml(html: string): string {
  let h = html.replace(/<!--[\s\S]*?-->/g, ' ');
  h = h.replace(/<(script|style|noscript|svg|template|iframe)\b[\s\S]*?<\/\1>/gi, ' ');
  const main = h.match(/<main\b[\s\S]*?<\/main>/i);
  if (main) h = main[0];
  h = h.replace(/<[^>]+>/g, ' ');
  h = h
    .replace(/&nbsp;|&#160;|&#xa0;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
  return h.replace(/\s+/g, ' ').trim();
}

export const fingerprint = (text: string) => createHash('sha256').update(text).digest('hex');

/**
 * Règles robots.txt applicables à un robot (groupe nommé, sinon « * »).
 * Renvoie true si le chemin est autorisé. Gère Allow/Disallow par préfixe le plus long, et les jokers * et $.
 */
export function robotsAllows(robotsTxt: string, path: string, agent = 'PatrimoineOS-SourceWatch'): boolean {
  type Group = { agents: string[]; rules: { allow: boolean; pattern: string }[] };
  const groups: Group[] = [];
  let current: Group | null = null;
  let lastWasAgent = false;
  for (const raw of robotsTxt.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim();
    if (!line) continue;
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (key === 'user-agent') {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else if (key === 'allow' || key === 'disallow') {
      lastWasAgent = false;
      if (current && (key === 'allow' || value)) current.rules.push({ allow: key === 'allow', pattern: value });
    } else {
      lastWasAgent = false;
    }
  }
  const a = agent.toLowerCase();
  const group = groups.find((g) => g.agents.some((x) => x !== '*' && a.includes(x))) ?? groups.find((g) => g.agents.includes('*'));
  if (!group) return true;
  let best: { allow: boolean; len: number } | null = null;
  for (const r of group.rules) {
    if (!r.pattern) continue;
    const re = new RegExp('^' + r.pattern.replace(/[.+?^${}()|[\]\\]/g, (c) => (c === '$' ? c : '\\' + c)).replace(/\*/g, '.*').replace(/\\\$$/, '$'));
    if (re.test(path)) {
      const len = r.pattern.length;
      if (!best || len > best.len || (len === best.len && r.allow)) best = { allow: r.allow, len };
    }
  }
  return best ? best.allow : true;
}

export type SourceState = { hash?: string; status: string; checkedAt: string; httpStatus?: number };

export type Finding = { url: string; kind: 'modifiée' | 'introuvable' | 'erreur' | 'interdite par robots.txt' | 'sans référence'; detail: string; usedBy: string[] };

/** Compare un relevé à l'état enregistré. Ne modifie jamais l'état : seule une validation humaine (--accept) le fait. */
export function classify(url: string, usedBy: string[], previous: SourceState | undefined, result: { httpStatus?: number; hash?: string; error?: string; robotsBlocked?: boolean }): Finding | null {
  if (result.robotsBlocked) return { url, kind: 'interdite par robots.txt', detail: 'Page non consultée automatiquement : vérification manuelle.', usedBy };
  if (result.error) return { url, kind: 'erreur', detail: result.error, usedBy };
  if (result.httpStatus === 404 || result.httpStatus === 410) return { url, kind: 'introuvable', detail: `HTTP ${result.httpStatus}`, usedBy };
  if (!result.httpStatus || result.httpStatus >= 400) return { url, kind: 'erreur', detail: `HTTP ${result.httpStatus ?? '?'}`, usedBy };
  if (!previous?.hash) return { url, kind: 'sans référence', detail: 'Aucune empreinte validée : relire la page puis lancer « npm run sources:accept ».', usedBy };
  if (previous.hash !== result.hash) return { url, kind: 'modifiée', detail: 'Le texte de la page a changé depuis la dernière validation.', usedBy };
  return null;
}

/** Fiches dont la révision est due (date passée) ou proche. */
export function dueReviews<T extends { slug: string; name: string; review: { nextReview: string } }>(items: T[], today: string, warnDays = 30) {
  const soon = new Date(Date.parse(today + 'T00:00:00Z') + warnDays * 86400000).toISOString().slice(0, 10);
  return {
    overdue: items.filter((i) => i.review.nextReview <= today),
    upcoming: items.filter((i) => i.review.nextReview > today && i.review.nextReview <= soon),
  };
}
