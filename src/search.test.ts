import { describe, expect, it } from 'vitest';
import { search, searchDetailed, searchShortcuts, searchSuggestions, searchTerms, stem } from './lib/search';
import { guides } from './data/guides';
import { investments } from './data/investments';
import { simulators } from './lib/search';

describe('recherche', () => {
  it('trouve un mot au pluriel', () => {
    expect(search('livrets').length).toBeGreaterThan(0);
    expect(search('simulateurs de crédits').length).toBeGreaterThan(0);
  });
  it('un mot commence un mot du texte : « bourse » ne trouve plus « rembourser »', () => {
    const titles = search('bourse').map((h) => h.title.toLowerCase());
    expect(titles.length).toBeGreaterThan(0);
    expect(titles.some((t) => t.includes('rembourser'))).toBe(false);
  });
  it('les mots courants absents du site renvoient vers la bonne page', () => {
    expect(search('bitcoin')[0].to).toBe('/encyclopedie/cryptomonnaies');
    expect(search('héritage').some((h) => h.to === '/encyclopedie/donation')).toBe(true);
    expect(search('pierre papier').some((h) => h.to === '/encyclopedie/scpi')).toBe(true);
    expect(search('défiscaliser').some((h) => h.to === '/encyclopedie/per')).toBe(true);
  });
  it('les sigles courants trouvent la bonne fiche', () => {
    expect(search('cpf').some((h) => h.to === '/encyclopedie/capital-humain')).toBe(true);
    expect(search('crowdfunding').length).toBeGreaterThan(0);
    expect(search('tmi').length).toBeGreaterThan(0);
  });
  it('le glossaire est cherchable, avec une ancre existante', () => {
    const hits = search('volatilité');
    const g = hits.find((h) => h.kind === 'Glossaire');
    expect(g?.to).toBe('/glossaire#volatilite');
    expect(search('livret a')[0].kind).toBe('Fiche');
  });
  it('les suggestions pointent vers des pages existantes', () => {
    const ok = new Set([
      ...guides.map((g) => `/guides/${g.slug}`),
      ...investments.map((i) => `/encyclopedie/${i.slug}`),
      ...simulators.map((s) => `/simulateurs/${s.slug}`),
    ]);
    for (const s of searchSuggestions) expect(ok.has(s.to), s.to).toBe(true);
  });
  it('ignore les petits mots d’une question et ramène les mots à leur racine', () => {
    expect(searchTerms('Comment placer mon argent ?')).toEqual(['plac', 'argent']);
    expect(searchTerms('de la')).toEqual(['de', 'la']); // seulement des petits mots : on les garde
    expect(stem('emprunter')).toBe('emprunt');
    expect(stem('retraite')).toBe('retrait');
    expect(stem('placement')).toBe('plac');
    expect(stem('investissement')).toBe('invest');
    expect(stem('pea')).toBe('pea');
  });
  it('les questions courantes des visiteurs mènent à la bonne page en tête', () => {
    const top = (q: string, n = 3) => search(q).slice(0, n).map((h) => h.to);
    expect(top('acheter une maison')).toContain('/simulateurs/louer-ou-acheter');
    expect(top('acheter un appartement')).toContain('/simulateurs/louer-ou-acheter');
    expect(top('maison', 5)).not.toContain('/encyclopedie/objets-d-art-collection');
    expect(top('retraite')).toContain('/simulateurs/retraits-reguliers-duree-du-capital');
    expect(top('combien de temps durera mon capital', 2)).toContain('/simulateurs/retraits-reguliers-duree-du-capital');
    expect(top('premier salaire', 2)).toContain('/guides/par-ou-commencer');
    expect(top('débuter', 1)).toContain('/guides/par-ou-commencer');
    expect(top('vivre de ses rentes', 6)).toContain('/simulateurs/independance-financiere');
    expect(top('simulateur crédit', 3)).toContain('/simulateurs/credit');
    expect(top('livret a', 1)).toContain('/encyclopedie/livret-a');
    expect(top('taux livret a', 1)).toContain('/encyclopedie/livret-a');
    expect(top('flat tax', 1)[0]).toMatch(/^\/glossaire#/);
  });
  it('mots courts en mot entier, expressions et synonymes (audit du 16 novembre 2026)', () => {
    const top = (q: string, n = 3) => search(q).slice(0, n).map((h) => h.to);
    // « or » ne trouve plus « Compte-titres ordinaire », « per » ne trouve plus « personne »
    expect(top('or', 5)).toEqual(['/encyclopedie/or']);
    expect(top('per', 1)).toContain('/encyclopedie/per');
    // une expression tapée telle quelle passe devant les pages qui ont seulement ses mots épars
    expect(top('frais de notaire', 1)).toContain('/simulateurs/louer-ou-acheter');
    expect(top('frais de notaire', 5)).not.toContain('/encyclopedie/creation-entreprise');
    expect(top('placement sans risque', 2)).toContain('/encyclopedie/livret-a');
    // le futur acheteur trouve le calculateur de crédit
    expect(top('prêt immobilier')).toContain('/simulateurs/credit');
    // « préparer » ne fait plus remonter le PEL (« pensée pour préparer l’achat »)
    expect(top('préparer sa retraite', 1)).toContain('/encyclopedie/per');
    expect(top('préparer sa retraite', 3)).not.toContain('/encyclopedie/pel');
  });
  it('raccourcis des questions fréquentes (audit du 18 novembre 2026)', () => {
    const ok = new Set([
      ...guides.map((g) => `/guides/${g.slug}`),
      ...investments.map((i) => `/encyclopedie/${i.slug}`),
      ...simulators.map((s) => `/simulateurs/${s.slug}`),
    ]);
    // chaque raccourci mène à des pages existantes, dans l’ordre annoncé, en tête des résultats
    // un même exemple (après racine) ne mène pas à deux raccourcis différents
    const owner = new Map<string, number>();
    searchShortcuts.forEach((sc, k) => sc.queries.forEach((q) => {
      const key = searchTerms(q).sort().join(' ');
      expect(owner.get(key) ?? k, q).toBe(k);
      owner.set(key, k);
    }));
    for (const sc of searchShortcuts) {
      for (const to of sc.to) expect(ok.has(to), to).toBe(true);
      for (const q of sc.queries) expect(search(q).slice(0, sc.to.length).map((h) => h.to), q).toEqual(sc.to);
    }
    const first = (q: string) => search(q)[0].to;
    expect(first('investissement locatif')).toBe('/guides/rentabilite-locative');
    expect(first('Mensualité')).toBe('/simulateurs/credit');
    expect(first('assurance emprunteur')).toBe('/simulateurs/credit');
    expect(first('Où placer mon argent ?')).toBe('/guides/par-ou-commencer');
    expect(first('vivre de ses rentes')).toBe('/simulateurs/independance-financiere');
    expect(first('épargne salariale')).toBe('/encyclopedie/pee');
    expect(first('intéressement')).toBe('/encyclopedie/pee');
    expect(first('plan épargne entreprise')).toBe('/encyclopedie/pee');
    // audit du 19 novembre 2026
    expect(first('prêt')).toBe('/simulateurs/credit');
    expect(first('Crédit immobilier')).toBe('/simulateurs/credit');
    expect(first('Combien puis-je emprunter ?')).toBe('/simulateurs/endettement');
    expect(first('fonds euros')).toBe('/encyclopedie/fonds-euros');
    expect(first('investir en bourse')).toBe('/encyclopedie/etf-monde');
    expect(first('Payer moins d’impôts')).toBe('/guides/choisir-son-enveloppe');
    expect(first('placer 10 000 €')).toBe('/guides/par-ou-commencer');
    const safe = search('placement sans risque').slice(0, 5).map((h) => h.to);
    expect(safe.slice(0, 3)).toEqual(['/encyclopedie/livret-a', '/encyclopedie/lep', '/encyclopedie/fonds-euros']);
    expect(safe).not.toContain('/encyclopedie/cryptomonnaies');
    expect(search('placement garanti').some((h) => h.to === '/encyclopedie/actions-individuelles')).toBe(false);
    expect(search('risque').some((h) => h.to === '/encyclopedie/actions-individuelles')).toBe(true);
    // seuls les mots exacts d’un exemple déclenchent un raccourci
    expect(first('épargne logement')).not.toBe('/guides/par-ou-commencer');
  });
  it('mots du quotidien : réserve, économies, dettes, pension (audit du 21 novembre 2026)', () => {
    const first = (q: string) => search(q)[0].to;
    const top = (q: string, n = 3) => search(q).slice(0, n).map((h) => h.to);
    // « fonds d’urgence » ne mène plus aux fonds obligataires, quelle que soit l’apostrophe
    expect(first("fonds d'urgence")).toBe('/guides/combien-epargne-de-precaution');
    expect(first('fond d’urgence')).toBe('/guides/combien-epargne-de-precaution');
    expect(top('fonds d’urgence', 5)).not.toContain('/encyclopedie/obligations');
    expect(first('combien pour les imprévus')).toBe('/guides/combien-epargne-de-precaution');
    // « mettre de côté » ne mène plus aux fonds « cotés » en Bourse
    expect(first('mettre de l’argent de côté')).toBe('/simulateurs/budget');
    expect(first('Économiser')).toBe('/simulateurs/budget');
    expect(top('mettre de côté', 2)).not.toContain('/encyclopedie/etf-monde');
    // un crédit à la consommation se simule avec le calculateur de crédit
    expect(first('crédit à la consommation')).toBe('/simulateurs/credit');
    expect(first('rembourser mes dettes')).toBe('/simulateurs/dettes');
    // « pension » trouve les pages de la retraite au lieu de zéro résultat
    expect(top('pension')).toContain('/encyclopedie/per');
    expect(top('pension')).toContain('/simulateurs/retraits-reguliers-duree-du-capital');
  });
  it('un montant tapé ne compte pas comme un mot, sauf s’il est seul', () => {
    expect(searchTerms('placer 10000 euros')).toEqual(['plac']);
    expect(searchTerms('72')).toEqual(['72']);
  });
  it('« locatif » et « locative » se trouvent l’un l’autre, sans rejoindre « location »', () => {
    expect(stem('locatif')).toBe('locati');
    expect(stem('locative')).toBe('locati');
    expect(stem('locatives')).toBe('locati');
    expect(search('rentabilité locatif').some((h) => h.to === '/guides/rentabilite-locative')).toBe(true);
  });
  it('sans page contenant tous les mots, montre les plus proches et le signale', () => {
    const r = searchDetailed('combien de temps durera mon capital');
    expect(r.partial).toBe(true);
    expect(r.hits.length).toBeGreaterThan(0);
    expect(searchDetailed('livret').partial).toBe(false);
    expect(searchDetailed('zzzz').hits).toEqual([]);
  });
});
