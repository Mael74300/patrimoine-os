import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { investments } from './data/investments';
import { MeterRows } from './components/ui';
import { effortLevelsFromText, effortParts, meterWord } from './lib/meters';

describe('repères des fiches en un mot', () => {
  it('lit le nombre de points, de 1 à 5', () => {
    expect(meterWord('risk', 1)).toBe('très faible');
    expect(meterWord('risk', 4)).toBe('élevé');
    expect(meterWord('liq', 5)).toBe('très bonne');
    expect(meterWord('liq', 1)).toBe('très faible');
    expect(meterWord('effort', 3)).toBe('modéré');
  });

  it('reconnaît le niveau annoncé au début du texte « Temps et compétences »', () => {
    expect(effortLevelsFromText('Faible à modéré.')).toEqual([2]);
    expect(effortLevelsFromText('Faible : surtout de la comparaison.')).toEqual([1, 2]);
    expect(effortLevelsFromText('Très élevé : produit, technique, marketing.')).toEqual([5]);
    expect(effortLevelsFromText('Quelques minutes pour l’ouvrir.')).toBeNull();
  });

  it('les points d’effort et la phrase « Temps et compétences » de chaque fiche ne se contredisent pas', () => {
    const contradictions = investments
      .filter((i) => {
        const levels = effortLevelsFromText(i.timeSkills);
        return levels !== null && !levels.includes(i.effort);
      })
      .map((i) => `${i.slug} : ${i.effort}/5 pour « ${i.timeSkills} »`);
    expect(contradictions).toEqual([]);
  });

  it('reprend le niveau écrit dans la fiche sans le répéter dans la précision', () => {
    expect(effortParts('Modéré : analyse de chaque projet.', 3)).toEqual({ word: 'modéré', note: 'Analyse de chaque projet.' });
    expect(effortParts('Faible à modéré.', 2)).toEqual({ word: 'faible à modéré', note: '' });
    expect(effortParts('Modéré, avec un notaire.', 3)).toEqual({ word: 'modéré', note: 'Avec un notaire.' });
    expect(effortParts('Quelques minutes pour l’ouvrir.', 1)).toEqual({ word: 'très faible', note: 'Quelques minutes pour l’ouvrir.' });
    for (const i of investments) {
      const { word, note } = effortParts(i.timeSkills, i.effort);
      expect(word.length).toBeGreaterThan(0);
      expect(note.toLowerCase().startsWith(word)).toBe(false);
    }
  });

  it('affiche nom, points, mot et précision sur l’effort, sans répéter la note aux lecteurs d’écran', () => {
    const html = renderToStaticMarkup(createElement(MeterRows, { risk: 4, liquidity: 3, effort: 2, effortNote: 'Faible si l’on investit en ETF.' }));
    expect(html).toContain('Risque');
    expect(html).toContain('élevé<span class="sr-only"> (4 sur 5)</span>');
    expect(html).toContain('moyenne');
    expect(html).toContain('>faible<span class="sr-only"> (2 sur 5)</span>');
    expect(html).toContain('Si l’on investit en ETF.');
    expect((html.match(/class="on"/g) ?? []).length).toBe(4 + 3 + 2);
    expect(html).toContain('aria-hidden="true"');
  });
});
