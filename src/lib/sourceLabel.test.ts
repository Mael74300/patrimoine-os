import { describe, expect, it } from 'vitest';
import { splitSourceLabel } from './sourceLabel';
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
