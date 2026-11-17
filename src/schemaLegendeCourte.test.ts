import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import * as Illustrations from './components/Illustrations';

/**
 * Schémas étroits (viewBox 340) sur grand écran : une légende longue se place à droite du dessin, une légende courte
 * (classe `fig-short`) reste dessous, centrée (constat du 2026-11-17 : une ou deux lignes seules à droite d'un dessin haut
 * paraissaient isolées). Ce test rend chaque schéma exporté et vérifie que la classe suit la longueur réelle de la légende.
 * Les légendes passées en `children` par la page (texte variable) sont rendues vides ici et ne sont pas contrôlées.
 */
const SEUIL = 110;
const texte = (html: string) => html.replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, ' ').trim();

const rendus = Object.entries(Illustrations)
  .filter(([nom, c]) => /^Schema/.test(nom) && typeof c === 'function')
  .map(([nom, c]) => {
    const props = nom === 'SchemaEscalier'
      ? { steps: ['Un', 'Deux', 'Trois', 'Quatre', 'Cinq'], targets: ['a', 'b', 'c', 'd', 'e'], title: 'Étapes' }
      : {};
    try {
      return { nom, html: renderToStaticMarkup(createElement(c as never, props as never)) };
    } catch {
      return { nom, html: '' };
    }
  });

const legendes = rendus.flatMap(({ nom, html }) =>
  [...html.matchAll(/<figure class="illustration[^"]*">([\s\S]*?)<\/figure>/g)]
    .filter((m) => /^<svg viewBox="0 0 340 /.test(m[1]))
    .flatMap((m) => {
      const c = m[1].match(/<figcaption( class="([^"]*)")?>([\s\S]*?)<\/figcaption>/);
      return c ? [{ nom, court: (c[2] ?? '').split(' ').includes('fig-short'), longueur: texte(c[3]).length }] : [];
    }),
);

describe('légendes des schémas étroits', () => {
  it('assez de schémas rendus pour que le contrôle ait un sens', () => {
    expect(legendes.filter((l) => l.longueur > 0).length).toBeGreaterThanOrEqual(20);
  });

  it('une légende courte porte la classe fig-short, une légende longue ne la porte pas', () => {
    for (const l of legendes.filter((x) => x.longueur > 0)) {
      expect({ nom: l.nom, court: l.court }).toEqual({ nom: l.nom, court: l.longueur <= SEUIL });
    }
  });

  it('les sept légendes courtes repérées le 2026-11-17 sont concernées', () => {
    const courts = new Set(legendes.filter((l) => l.court).map((l) => l.nom));
    for (const nom of ['SchemaEscalier', 'SchemaPatrimoineNet', 'SchemaRembourser', 'SchemaImmoEtf', 'SchemaDonation', 'SchemaPel', 'SchemaCompteATerme']) {
      expect(courts.has(nom)).toBe(true);
    }
  });
});
