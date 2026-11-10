import { describe, expect, it } from 'vitest';
import { deepKeepNumbers, hasBreakableNumber, keepNumbersTogether, NBSP } from './lib/nbsp';
import { investments } from './data/investments';
import { guides } from './data/guides';
// @ts-expect-error module JavaScript sans types
import { breakableNumbers } from '../scripts/seo-check.mjs';

describe('nombres insécables', () => {
  it('lie les milliers et l’unité au nombre, sans changer les chiffres', () => {
    expect(keepNumbersTogether('maximum 37 680 €, ou 4 710 €')).toBe(`maximum 37${NBSP}680${NBSP}€, ou 4${NBSP}710${NBSP}€`);
    expect(keepNumbersTogether('PFU de 31,4 % et 1 000 000 €')).toBe(`PFU de 31,4${NBSP}% et 1${NBSP}000${NBSP}000${NBSP}€`);
    expect(keepNumbersTogether('Durée : 4 ans, en 2024 et 2025')).toBe('Durée : 4 ans, en 2024 et 2025');
    const s = 'Plafond de 61 200 € et taux de 2,00 %';
    expect(keepNumbersTogether(s).replace(/ /g, ' ')).toBe(s);
  });

  it('parcourt tableaux et objets sans toucher aux autres valeurs', () => {
    expect(deepKeepNumbers({ a: ['10 €'], b: 3, c: null })).toEqual({ a: [`10${NBSP}€`], b: 3, c: null });
  });

  it('aucune fiche ni aucun guide ne garde un nombre sécable', () => {
    const texts = JSON.stringify([investments, guides]);
    expect(hasBreakableNumber(texts)).toBe(false);
  });

  it('le contrôle du build repère le texte visible, pas les schémas', () => {
    expect(breakableNumbers('<head><title>1 000 €</title></head><p>maximum 37 680 €</p>')).toEqual(['maximum 37 680 €']);
    expect(breakableNumbers(`<p>37${NBSP}680${NBSP}€</p><svg><text>1 000 €</text></svg>`)).toEqual([]);
  });
});
