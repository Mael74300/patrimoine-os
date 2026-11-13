import { describe, expect, it } from 'vitest';
import { guideBySlug, guides } from '../data/guides';
import { investmentBySlug } from '../data/investments';
import { guideSimulators, nextForSimulator, readingForSimulator, simsForGuide, simsForInvestment } from './relatedSims';
import { simulators } from './search';

const simSlugs = new Set(simulators.map((s) => s.slug));

describe('liens fiches / guides vers simulateurs', () => {
  it('les clés désignent des fiches et des guides existants', () => {
    for (const k of Object.keys(simsForInvestment)) expect(investmentBySlug[k], k).toBeDefined();
    for (const k of Object.keys(simsForGuide)) expect(guideBySlug[k], k).toBeDefined();
  });
  it('les simulateurs cités existent, sans doublon', () => {
    for (const list of [...Object.values(simsForInvestment), ...Object.values(simsForGuide)]) {
      for (const s of list) expect(simSlugs.has(s), s).toBe(true);
      expect(new Set(list).size).toBe(list.length);
    }
  });
  it('chaque guide et chaque simulateur reçoit au moins un lien entrant', () => {
    for (const slug of Object.keys(guideBySlug)) expect(simsForGuide[slug]?.length, slug).toBeGreaterThan(0);
    const used = new Set([...Object.values(simsForInvestment), ...Object.values(simsForGuide)].flat());
    for (const s of simSlugs) expect(used.has(s), s).toBe(true);
  });
});

describe('pistes de lecture en bas des simulateurs', () => {
  it('chaque simulateur propose au moins une piste, sans doublon, vers des pages existantes', () => {
    for (const s of simSlugs) {
      const links = readingForSimulator(s);
      expect(links.length, s).toBeGreaterThanOrEqual(3);
      expect(links.length).toBeLessThanOrEqual(4);
      expect(new Set(links.map((l) => l.to)).size).toBe(links.length);
      for (const l of links) expect(l.to).toMatch(/^\/(guides|encyclopedie|simulateurs)\/[a-z0-9-]+$/);
    }
  });
  it('chaque piste choisie désigne une page existante (rien n’est perdu en route)', () => {
    for (const [s, refs] of Object.entries(nextForSimulator)) {
      expect(simSlugs.has(s), s).toBe(true);
      expect(readingForSimulator(s).length, s).toBe(refs.length);
      for (const r of refs) expect(r, s).toMatch(/^[gfs]:[a-z0-9-]+$/);
    }
  });
  it('une étape suivante au plus vers un autre simulateur, jamais vers lui-même, et au moins un guide ou une fiche', () => {
    for (const s of simSlugs) {
      const links = readingForSimulator(s);
      const sims = links.filter((l) => l.kind === 'Simulateur');
      expect(sims.length, s).toBeLessThanOrEqual(1);
      expect(links.some((l) => l.to === `/simulateurs/${s}`), s).toBe(false);
      expect(links.some((l) => l.kind !== 'Simulateur'), s).toBe(true);
    }
  });
  it('un simulateur inconnu ne produit aucune piste', () => {
    expect(readingForSimulator('inconnu')).toEqual([]);
  });
});

describe('pistes de lecture du simulateur Budget', () => {
  it('renvoie vers des fiches liées au budget (Livret A), pas vers des fiches sans rapport', () => {
    const fiches = readingForSimulator('budget').filter((l) => l.kind === 'Fiche').map((l) => l.to);
    expect(fiches).toContain('/encyclopedie/livret-a');
    expect(fiches).not.toContain('/encyclopedie/activite-numerique');
    expect(fiches).not.toContain('/encyclopedie/capital-humain');
  });
});

describe('pistes de lecture du futur acheteur', () => {
  it('le calculateur de crédit mène au taux d’endettement, au PTZ et à Louer ou acheter, pas au rachat d’entreprise', () => {
    const to = readingForSimulator('credit').map((l) => l.to);
    expect(to[0]).toBe('/guides/taux-endettement-capacite-emprunt');
    expect(to).toContain('/guides/pret-a-taux-zero-ptz');
    expect(to).toContain('/simulateurs/louer-ou-acheter');
    expect(to).not.toContain('/encyclopedie/reprise-entreprise');
  });
});

describe('simulateurs liés d’un guide', () => {
  it('ne répètent jamais le simulateur du bouton principal', () => {
    for (const g of guides) {
      expect(guideSimulators(g.slug, g.cta?.to).map((s) => `/simulateurs/${s.slug}`), g.slug).not.toContain(g.cta?.to);
    }
    expect(guideSimulators('patrimoine-net', guideBySlug['patrimoine-net'].cta?.to).map((s) => s.slug)).toEqual(['budget']);
  });
});
