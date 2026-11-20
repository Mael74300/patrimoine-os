import { describe, expect, it } from 'vitest';
import { siteOf, sourceParts, splitSourceLabel } from './sourceLabel';
import { investments } from '../data/investments';
import { guides } from '../data/guides';
import { LIVRETS } from '../data/livrets';

const words = (s: string) => s.replace(/[—(),]/g, ' ').split(/\s+/).filter(Boolean);

describe('splitSourceLabel', () => {
  it('sépare organisme, titre et date', () => {
    expect(splitSourceLabel('Service-Public.fr — Obtenir un crédit immobilier (vérifiée le 5 avril 2024)'))
      .toEqual({ pub: 'Service-Public.fr', title: 'Obtenir un crédit immobilier', date: 'vérifiée le 5 avril 2024' });
    expect(splitSourceLabel('AMF — Dépliant « Le financement participatif » (juillet 2024)'))
      .toEqual({ pub: 'AMF', title: 'Dépliant « Le financement participatif »', date: 'juillet 2024' });
    expect(splitSourceLabel('Service-Public.fr — Prêt à taux zéro (PTZ ou PTZ+), page vérifiée le 15 septembre 2026, consultée le 13 novembre 2026'))
      .toEqual({ pub: 'Service-Public.fr', title: 'Prêt à taux zéro (PTZ ou PTZ+)', date: 'page vérifiée le 15 septembre 2026, consultée le 13 novembre 2026' });
  });

  it('laisse dans le titre les parenthèses qui ne sont pas des dates', () => {
    expect(splitSourceLabel('BOFiP — Réduction d’impôt FCPI et FIP (BOI-IR-RICI-100)')).toEqual({ pub: 'BOFiP', title: 'Réduction d’impôt FCPI et FIP (BOI-IR-RICI-100)' });
    expect(splitSourceLabel('Service-Public.fr — Plan d’épargne entreprise (PEE) (vérifiée le 1er janvier 2026)'))
      .toEqual({ pub: 'Service-Public.fr', title: 'Plan d’épargne entreprise (PEE)', date: 'vérifiée le 1er janvier 2026' });
    expect(splitSourceLabel('AMF — Lettre de l’Observatoire de l’épargne n° 65 (avril 2026) : frais des fonds').date).toBeUndefined();
  });

  it('garde un libellé sans tiret tel quel', () => {
    expect(splitSourceLabel('La finance pour tous (IEFP)')).toEqual({ pub: 'La finance pour tous (IEFP)' });
  });

  it('ne perd aucun mot des sources du site', () => {
    const all = [...investments.flatMap((i) => i.sources), ...guides.flatMap((g) => g.sources), ...LIVRETS.map((l) => l.source)];
    expect(all.length).toBeGreaterThan(100);
    for (const s of all) {
      const p = splitSourceLabel(s.label);
      expect(words([p.pub, p.title, p.date].filter(Boolean).join(' '))).toEqual(words(s.label));
    }
  });
});

describe('sourceParts', () => {
  it('donne le site de destination à une source sans organisme séparé', () => {
    expect(sourceParts('Banque de France', 'https://www.banque-france.fr')).toEqual({ pub: 'banque-france.fr', title: 'Banque de France', site: true });
    expect(sourceParts('Haut Conseil de stabilité financière', 'https://www.economie.gouv.fr/hcsf').pub).toBe('economie.gouv.fr');
    expect(siteOf('pas une adresse')).toBeUndefined();
  });

  it('remplit les deux colonnes pour chaque source du site', () => {
    const all = [...investments.flatMap((i) => i.sources), ...guides.flatMap((g) => g.sources), ...LIVRETS.map((l) => l.source)];
    for (const s of all) {
      const p = sourceParts(s.label, s.url);
      expect(p.pub, s.label).toBeTruthy();
      expect(p.title, s.label).toBeTruthy();
    }
  });
});
