/**
 * Typographie française : une espace avant « ? ! ; : » et « » ou entre un chiffre et « % » ou « € » ne doit pas
 * se couper en fin de ligne (sinon le signe se retrouve seul au début de la ligne suivante, surtout sur mobile).
 * On remplace l'espace ordinaire par une espace insécable (U+00A0). Seul le texte affiché est touché.
 * Une apostrophe droite entre deux lettres (« l'entreprise ») devient l'apostrophe typographique « ’ », comme
 * dans le reste du site : plus d'apostrophes de deux formes selon les pages.
 */
const NBSP = ' ';
const AVANT = / ([?!;:»])/g;
const APRES = /(«) /g;
const UNITE = /(\d) ([%€])/g;
const APOSTROPHE = /(\p{L})'(?=\p{L})/gu;

export function espacesInsecables(s: string): string {
  return s
    .replace(APOSTROPHE, '$1’')
    .replace(AVANT, `${NBSP}$1`)
    .replace(APRES, `$1${NBSP}`)
    .replace(UNITE, `$1${NBSP}$2`);
}

const IGNORES = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE', 'PRE']);

/** Corrige tous les nœuds texte sous `racine`. Appelée après l'hydratation : le HTML pré-rendu reste identique au rendu React. */
export function corrigerTextes(racine: Node): void {
  const doc = racine.ownerDocument ?? (racine as Document);
  const w = doc.createTreeWalker(racine, 4 /* NodeFilter.SHOW_TEXT */);
  let n: Node | null;
  while ((n = w.nextNode())) {
    const parent = n.parentElement;
    if (parent && IGNORES.has(parent.tagName)) continue;
    const v = n.nodeValue ?? '';
    const c = espacesInsecables(v);
    if (c !== v) n.nodeValue = c;
  }
}

/** Corrige la page puis tout texte ajouté ou modifié ensuite (changement de page, résultats de simulateur). Renvoie la fonction d'arrêt. */
export function surveillerTextes(racine: HTMLElement): () => void {
  corrigerTextes(racine);
  let attente: number | undefined;
  const obs = new MutationObserver(() => {
    window.clearTimeout(attente);
    attente = window.setTimeout(() => corrigerTextes(racine), 50);
  });
  obs.observe(racine, { childList: true, subtree: true, characterData: true });
  return () => {
    window.clearTimeout(attente);
    obs.disconnect();
  };
}
