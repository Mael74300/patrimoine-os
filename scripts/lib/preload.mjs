/**
 * Préchargement des modules d'une page pré-rendue.
 *
 * Sans cela, le navigateur télécharge d'abord le script principal, puis seulement le fichier de la page et ses
 * dépendances (chargés à la demande) : deux allers-retours réseau avant que la page devienne interactive
 * (curseurs et champs des simulateurs, menus, bulles de jargon). Les balises `modulepreload` placées dans le HTML
 * font partir ces téléchargements en même temps que le script principal.
 */

/**
 * Fichiers JavaScript à précharger pour une page : son propre fichier et tous ceux qu'il importe statiquement,
 * sans le script principal (déjà appelé par la page). `manifest` est le manifeste de Vite (`dist/.vite/manifest.json`),
 * `key` l'entrée de la page (ex. `src/pages/Guides.tsx`).
 */
export function modulePreloads(manifest, key) {
  const files = [];
  const seen = new Set();
  const visit = (k) => {
    const chunk = manifest[k];
    if (!chunk || seen.has(k) || chunk.isEntry) return;
    seen.add(k);
    files.push(chunk.file);
    for (const dep of chunk.imports ?? []) visit(dep);
  };
  visit(key);
  return files;
}

/** Balises `<link rel="modulepreload">` (même mode `crossorigin` que le script principal, pour éviter un double téléchargement). */
export function modulePreloadTags(files, base) {
  return files.map((f) => `<link rel="modulepreload" crossorigin href="${base}${f}" />`);
}
