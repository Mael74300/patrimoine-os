import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaForet } from './components/Illustrations';
import { investmentBySlug } from './data/investments';
import { ficheParagraphs } from './lib/ficheText';

const svg = () => renderToStaticMarkup(createElement(SchemaForet)).replace(/[  ]/g, ' ');
/** Largeur estimée d'un texte (0,52 em par caractère, police système sans empattement). */
const largeur = (texte: string, taille: number) => texte.length * 0.52 * taille;
const TAILLES: Record<string, number> = { 'ill-step': 14.5, 'ill-in': 12, 'ill-sub': 13 };

describe('fiche Forêt : schéma empilé et conditions sans redite', () => {
  it('schéma étroit (viewBox 340), lisible à 375 px', () => {
    expect(svg()).toContain('viewBox="0 0 340 360"');
  });

  it('chaque texte tient dans le dessin, et les lignes ne se touchent pas', () => {
    const textes = [...svg().matchAll(/<text x="(\d+)" y="(\d+)" text-anchor="(\w+)" class="([\w-]+)">([^<]+)<\/text>/g)].map((m) => ({
      x: Number(m[1]), y: Number(m[2]), anchor: m[3], taille: TAILLES[m[4]], texte: m[5],
    }));
    expect(textes.length).toBeGreaterThanOrEqual(13);
    for (const t of textes) {
      const w = largeur(t.texte, t.taille);
      const [g, d] = t.anchor === 'middle' ? [t.x - w / 2, t.x + w / 2] : [t.x, t.x + w];
      expect(g, t.texte).toBeGreaterThanOrEqual(4);
      expect(d, t.texte).toBeLessThanOrEqual(336);
    }
    const parY = [...new Set(textes.map((t) => t.y))].sort((a, b) => a - b);
    for (let i = 1; i < parY.length; i++) expect(parY[i] - parY[i - 1]).toBeGreaterThanOrEqual(16);
  });

  it('montre le taux et la condition de conservation, comme la fiche', () => {
    const s = svg();
    expect(s).toContain('25 %');
    expect(s).toContain('jusqu’au 31 décembre');
    expect(s).toContain('de la huitième année suivant l’achat');
    const inv = investmentBySlug['groupements-forestiers'];
    expect(inv.tax.text.replace(/[  ]/g, ' ')).toContain('Crédit d’impôt de 25 %');
  });

  it('la condition des huit ans n’est plus répétée dans Fonctionnement (schéma, Comment investir et Fiscalité la portent)', () => {
    const inv = investmentBySlug['groupements-forestiers'];
    expect(inv.howItWorks).not.toContain('huitième année');
    expect(inv.howItWorks).toContain('schéma ci-dessous');
    const fois = ficheParagraphs(inv).filter((p) => p.includes('31 décembre de la huitième année'));
    expect(fois).toHaveLength(2);
  });
});
