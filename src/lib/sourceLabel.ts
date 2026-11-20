/**
 * Découpe le libellé d'une source (« Service-Public.fr — Livret A (vérifiée le 6 mars 2026) »)
 * en trois morceaux affichés séparément : l'organisme, le titre de la page et sa date.
 * Aucun mot n'est perdu : `pub`, `title` et `date` recomposent tout le libellé.
 */
export type SourceParts = { pub: string; title?: string; date?: string };

const MONTH = '(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)';
// « vérifiée le… », « consulté le… », « mise à jour le… », ou une date seule (« 16 décembre 2025 », « juillet 2024 »).
const DATE = `(?:(?:page )?(?:vérifiée?|consultée?|mise à jour) le .+|(?:\\d{1,2}(?:er)? )?${MONTH} \\d{4})`;
const TRAILING_PAREN = new RegExp(`^(.*?)\\s*\\((${DATE})\\)$`);
const TRAILING_COMMA = new RegExp(`^(.*?),\\s*(${DATE})$`);

export function splitSourceLabel(label: string): SourceParts {
  const sep = label.indexOf(' — ');
  if (sep < 0) return { pub: label };
  const pub = label.slice(0, sep);
  const rest = label.slice(sep + 3);
  const m = rest.match(TRAILING_PAREN) ?? rest.match(TRAILING_COMMA);
  return m ? { pub, title: m[1], date: m[2] } : { pub, title: rest };
}

/** Nom de site lisible tiré d'une adresse (« https://www.banque-france.fr/x » → « banque-france.fr »). */
export function siteOf(url: string): string | undefined {
  try {
    return new URL(url).hostname.replace(/^www\./, '') || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Morceaux affichés pour une source. Un libellé sans tiret (« Banque de France ») n'a pas de titre séparé :
 * il devient le titre, et le site de destination tient la place de l'organisme, pour que chaque ligne
 * ait ses deux colonnes (avant, la colonne de gauche restait vide sur grand écran).
 */
export function sourceParts(label: string, url: string): SourceParts & { site?: boolean } {
  const p = splitSourceLabel(label);
  if (p.title) return p;
  const site = siteOf(url);
  return site ? { pub: site, title: p.pub, site: true } : p;
}
