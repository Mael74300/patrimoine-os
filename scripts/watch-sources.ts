/**
 * Surveillance hebdomadaire des sources officielles citées par les fiches et les guides.
 * - Respecte robots.txt, s'identifie, espace les requêtes (une toutes les 3 secondes).
 * - Ne stocke qu'une empreinte du texte des pages (monitoring/sources-state.json), jamais leur contenu.
 * - Écrit monitoring/sources-report.md lorsqu'une page a changé, disparu ou ne répond plus.
 * - Ne modifie jamais une fiche : une modification détectée appelle une relecture humaine.
 *   Après relecture : `npm run sources:accept` enregistre les nouvelles empreintes.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { guides } from '../src/data/guides';
import { investments } from '../src/data/investments';
import { classify, fingerprint, normalizeHtml, robotsAllows, type Finding, type SourceState } from './lib/watch';

const STATE = new URL('../monitoring/sources-state.json', import.meta.url);
const REPORT = new URL('../monitoring/sources-report.md', import.meta.url);
const UA = 'PatrimoineOS-SourceWatch/1.0 (surveillance hebdomadaire de sources officielles ; projet open source)';
const accept = process.argv.includes('--accept');
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Pages suivies : sources officielles citées (les pages d'accueil généralistes sont exclues car trop changeantes).
const usage = new Map<string, Set<string>>();
for (const i of investments) for (const s of i.sources) if (s.official) (usage.get(s.url) ?? usage.set(s.url, new Set()).get(s.url)!).add(`fiche ${i.slug}`);
for (const g of guides) for (const s of g.sources) if (s.official) (usage.get(s.url) ?? usage.set(s.url, new Set()).get(s.url)!).add(`guide ${g.slug}`);
const urls = [...usage.keys()].filter((u) => new URL(u).pathname.length > 1).sort();

const state: Record<string, SourceState> = JSON.parse(await readFile(STATE, 'utf8').catch(() => '{}'));
const robotsCache = new Map<string, string>();

async function get(url: string) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html' }, signal: ctrl.signal, redirect: 'follow' });
    return { status: res.status, text: res.ok ? await res.text() : '' };
  } finally {
    clearTimeout(t);
  }
}

const findings: Finding[] = [];
const now = new Date().toISOString();
for (const url of urls) {
  const u = new URL(url);
  const usedBy = [...usage.get(url)!];
  let result: { httpStatus?: number; hash?: string; error?: string; robotsBlocked?: boolean } = {};
  try {
    if (!robotsCache.has(u.origin)) {
      const r = await get(u.origin + '/robots.txt').catch(() => ({ status: 0, text: '' }));
      robotsCache.set(u.origin, r.status === 200 ? r.text : '');
      await sleep(3000);
    }
    if (!robotsAllows(robotsCache.get(u.origin)!, u.pathname + u.search)) result = { robotsBlocked: true };
    else {
      const r = await get(url);
      result = { httpStatus: r.status, hash: r.text ? fingerprint(normalizeHtml(r.text)) : undefined };
    }
  } catch (e) {
    result = { error: e instanceof Error ? e.message : String(e) };
  }
  const f = classify(url, usedBy, state[url], result);
  if (f) findings.push(f);
  if (accept && result.hash) state[url] = { hash: result.hash, status: 'validée', checkedAt: now, httpStatus: result.httpStatus };
  else state[url] = { ...state[url], status: f ? f.kind : 'inchangée', checkedAt: now, httpStatus: result.httpStatus };
  console.log(`${f ? f.kind.padEnd(26) : 'inchangée'.padEnd(26)} ${url}`);
  await sleep(3000);
}

await writeFile(STATE, JSON.stringify(state, null, 2) + '\n');
const toReport = accept ? findings.filter((f) => f.kind !== 'modifiée' && f.kind !== 'sans référence') : findings;
const report = toReport.length
  ? [
      `# Sources à vérifier (${now.slice(0, 10)})`,
      '',
      'Ces pages officielles ont changé ou ne répondent plus. Relisez-les, mettez à jour les fiches concernées si nécessaire (et leur date de vérification),',
      'puis lancez `npm run sources:accept`. Aucune fiche n’a été modifiée automatiquement.',
      '',
      '| Statut | Page | Détail | Utilisée par |',
      '|---|---|---|---|',
      ...toReport.map((f) => `| ${f.kind} | ${f.url} | ${f.detail} | ${f.usedBy.join(', ')} |`),
      '',
    ].join('\n')
  : '';
await writeFile(REPORT, report);
console.log(report ? `\n${toReport.length} source(s) à vérifier : voir monitoring/sources-report.md` : '\nAucune source à vérifier.');
