/**
 * Contrôle d'exactitude d'une pull request avant fusion automatique.
 * La description doit contenir une section « ## Vérification des informations » qui, soit déclare
 * qu'aucune information factuelle n'est ajoutée ni modifiée, soit liste chaque information avec
 * sa source (lien https) et sa date de consultation (AAAA-MM-JJ ou « 10 octobre 2026 »).
 * Usage : PR_BODY="…" node scripts/check-pr-facts.mjs
 */
const HEADING = /^##\s+Vérification des informations\s*$/im;
const NONE = /aucune information factuelle (n'est |n’est )?(ajoutée|modifiée)/i;
const DATE = /\b(\d{4}-\d{2}-\d{2}|\d{1,2}(er)? (janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre) \d{4})\b/i;
const URL = /https:\/\/\S+/;

export function checkPrFacts(body) {
  const text = String(body ?? '').replace(/\r\n/g, '\n');
  const m = HEADING.exec(text);
  if (!m) return ['section « ## Vérification des informations » absente'];
  const rest = text.slice(m.index + m[0].length);
  const next = rest.search(/^##\s/m);
  const section = (next === -1 ? rest : rest.slice(0, next)).trim();
  if (!section) return ['section « Vérification des informations » vide'];
  if (NONE.test(section)) return [];
  const items = section.split('\n').filter((l) => /^\s*[-*]\s+/.test(l));
  if (!items.length) return ['aucune information listée (une ligne « - » par information, ou « Aucune information factuelle ajoutée ni modifiée »)'];
  const errors = [];
  for (const line of items) {
    if (!URL.test(line)) errors.push(`source https manquante : ${line.trim()}`);
    if (!DATE.test(line)) errors.push(`date de consultation manquante : ${line.trim()}`);
  }
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const errors = checkPrFacts(process.env.PR_BODY);
  if (errors.length) {
    console.error('Fusion automatique refusée — vérification des informations incomplète :');
    for (const e of errors) console.error(' - ' + e);
    process.exit(1);
  }
  console.log('Vérification des informations : description conforme.');
}
