import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { NumberField } from './components/ui';
import { formatFr, liveFormatFr, parseFr, stepValue } from './lib/frNumber';

const NB = ' ';

describe('formatFr : nombres saisis au format français', () => {
  it('regroupe les milliers avec une espace insécable et met une virgule décimale', () => {
    expect(formatFr(200000)).toBe(`200${NB}000`);
    expect(formatFr(5000)).toBe(`5${NB}000`);
    expect(formatFr(3.5)).toBe('3,5');
    expect(formatFr(0.25)).toBe('0,25');
    expect(formatFr(300)).toBe('300');
    expect(formatFr(-1200000)).toBe(`-1${NB}200${NB}000`);
  });
  it('n’arrondit pas une saisie précise', () => {
    expect(formatFr(4.4875)).toBe('4,4875');
  });
  it('laisse vide un nombre non fini', () => {
    expect(formatFr(NaN)).toBe('');
  });
});

describe('parseFr : lit ce que tape le visiteur', () => {
  it('accepte espaces, virgule ou point, et le signe moins typographique', () => {
    expect(parseFr(`200${NB}000`)).toBe(200000);
    expect(parseFr('200 000')).toBe(200000);
    expect(parseFr('200 000')).toBe(200000);
    expect(parseFr('3,5')).toBe(3.5);
    expect(parseFr('3.5')).toBe(3.5);
    expect(parseFr('3,')).toBe(3);
    expect(parseFr('−2')).toBe(-2);
    expect(parseFr('-0,5')).toBe(-0.5);
  });
  it('refuse un texte incomplet ou qui n’est pas un nombre', () => {
    expect(parseFr('')).toBeNaN();
    expect(parseFr('-')).toBeNaN();
    expect(parseFr('abc')).toBeNaN();
    expect(parseFr('1e5')).toBeNaN();
    expect(parseFr('3,5,2')).toBeNaN();
  });
  it('relit exactement ce que formatFr affiche', () => {
    for (const n of [0, 1, 999, 1000, 22950, 250000, 3.5, 0.05, -10, 1234567.89]) expect(parseFr(formatFr(n))).toBe(n);
  });
});

describe('liveFormatFr : milliers regroupés pendant la frappe', () => {
  it('regroupe un nombre entier', () => {
    expect(liveFormatFr('2500000')).toBe(`2${NB}500${NB}000`);
    expect(liveFormatFr(`200${NB}00`)).toBe(`20${NB}000`);
  });
  it('laisse tel quel un décimal ou un texte incomplet', () => {
    expect(liveFormatFr('3,')).toBe('3,');
    expect(liveFormatFr('3,5')).toBe('3,5');
    expect(liveFormatFr('-')).toBe('-');
    expect(liveFormatFr('')).toBe('');
  });
});

describe('stepValue : flèches haut et bas', () => {
  it('avance d’un pas sans erreur d’arrondi et reste dans les bornes', () => {
    expect(stepValue(0.1, 0.1, 1)).toBe(0.2);
    expect(stepValue(0.2, 0.1, 1)).toBe(0.3);
    expect(stepValue(3.5, 0.25, -1)).toBe(3.25);
    expect(stepValue(200000, 1000, 1)).toBe(201000);
    expect(stepValue(0, 1, -1, 0)).toBe(0);
    expect(stepValue(99.5, 1, 1, 0, 100)).toBe(100);
  });
});

describe('NumberField', () => {
  it('affiche la valeur au format français dans le champ, sans écho redondant', () => {
    const html = renderToString(createElement(NumberField, { label: 'Prix du bien', value: 250000, onChange: () => {}, unit: '€' }));
    expect(html).toContain(`value="250${NB}000"`);
    expect(html).toContain('inputMode="decimal"');
    expect(html).not.toContain('field-echo');
    const pct = renderToString(createElement(NumberField, { label: 'Taux', value: 0.035, onChange: () => {}, unit: '%', percent: true }));
    expect(pct).toContain('value="3,5"');
  });
});
