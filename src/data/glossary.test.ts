import { describe, expect, it } from 'vitest';
import { glossary } from './glossary';
import { guides } from './guides';
import { investments } from './investments';
import { simulators } from '../lib/search';

const routes = new Set([
  ...guides.map((g) => `/guides/${g.slug}`),
  ...investments.map((i) => `/encyclopedie/${i.slug}`),
  ...simulators.map((s) => `/simulateurs/${s.slug}`),
]);

describe('glossaire', () => {
  it('termes uniques, définitions renseignées, au moins un lien par terme', () => {
    expect(new Set(glossary.map((t) => t.term)).size).toBe(glossary.length);
    for (const t of glossary) {
      expect(t.definition.length).toBeGreaterThan(40);
      expect(t.links.length).toBeGreaterThan(0);
    }
  });
  it('tous les liens internes pointent vers une page existante', () => {
    for (const t of glossary) for (const l of t.links) expect(routes.has(l.to), `${t.term} → ${l.to}`).toBe(true);
  });
});

describe('données structurées du glossaire', () => {
  it('DefinedTermSet reprend exactement les termes affichés', async () => {
    const { pagesMeta } = await import('../seo');
    const page = pagesMeta('https://exemple.github.io/patrimoine-os').find((p) => p.path === '/glossaire/')!;
    const set = (page.jsonLd as { '@type': string; hasDefinedTerm?: { name: string; description: string }[] }[]).find((d) => d['@type'] === 'DefinedTermSet')!;
    expect(set.hasDefinedTerm!.map((t) => t.name).sort()).toEqual(glossary.map((t) => t.term).sort());
    for (const t of set.hasDefinedTerm!) expect(glossary.find((g) => g.term === t.name)!.definition).toBe(t.description);
  });
});

describe('sigles de l’accueil', () => {
  it('PER, SCPI, assurance-vie et fonds en euros sont définis, avec un lien vers leur fiche', () => {
    for (const [debut, fiche] of [['PER', 'per'], ['SCPI', 'scpi'], ['Assurance-vie', 'assurance-vie'], ['Fonds en euros', 'fonds-euros']]) {
      const t = glossary.find((g) => g.term.startsWith(debut));
      expect(t, debut).toBeDefined();
      expect(t!.links.some((l) => l.to === `/encyclopedie/${fiche}`), debut).toBe(true);
    }
  });
});

describe('PEA et Livret A', () => {
  it('sont définis, avec un lien vers leur fiche', () => {
    for (const [debut, fiche] of [['PEA', 'pea'], ['Livret A', 'livret-a']]) {
      const t = glossary.find((g) => g.term.startsWith(debut));
      expect(t, debut).toBeDefined();
      expect(t!.links.some((l) => l.to === `/encyclopedie/${fiche}`), debut).toBe(true);
    }
  });
});

describe('notions fiscales les plus citées', () => {
  it('PFU, prélèvements sociaux et TMI sont définis sans chiffre réglementaire (renvoi vers les fiches datées)', () => {
    for (const debut of ['PFU', 'Prélèvements sociaux', 'TMI']) {
      const t = glossary.find((g) => g.term.startsWith(debut));
      expect(t, debut).toBeDefined();
      expect(t!.definition).not.toMatch(/\d\s?%/);
    }
  });
  it('la recherche trouve « pfu », « flat tax » et « tmi » dans le glossaire', async () => {
    const { search } = await import('../lib/search');
    for (const q of ['pfu', 'flat tax', 'tmi', 'prélèvements sociaux']) expect(search(q).some((r) => r.kind === 'Glossaire'), q).toBe(true);
  });
});

describe('liens vers le glossaire depuis les pages', () => {
  it('chaque ancre /glossaire#… des pages mène à un terme existant', async () => {
    const { glossaryId } = await import('./glossary');
    const ids = new Set(glossary.map((t) => glossaryId(t.term)));
    const pages = import.meta.glob<string>('../pages/*.tsx', { query: '?raw', import: 'default', eager: true });
    const anchors = Object.values(pages).flatMap((src) => [...src.matchAll(/\/glossaire#([a-z0-9-]+)/g)].map((m) => m[1]));
    expect(anchors).toContain('dic-document-d-informations-cles');
    for (const a of anchors) expect(ids, a).toContain(a);
  });
});

describe('simulateur Portefeuille : la note de risque est expliquée', () => {
  it('la question fréquente renvoie au DIC et à l’échelle de 1 à 7', async () => {
    const { simFaq } = await import('./simFaq');
    const a = simFaq.portefeuille.find((i) => i.q.includes('niveau de risque'))!.a;
    expect(a).toMatch(/document d’informations clés \(DIC\)/);
    expect(a).toMatch(/de 1 à 7/);
    expect(a).toMatch(/ne veut pas dire sans risque/);
  });
});
