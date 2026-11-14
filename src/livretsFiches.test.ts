import { describe, expect, it } from 'vitest';
import { investmentBySlug } from './data/investments';
import { LIVRETS } from './data/livrets';
import { splitSentences } from './lib/ficheText';
import { sentenceLead } from './lib/sentenceLead';

/** Fiches Livret A et LEP : même taux et mêmes plafonds que LIVRETS, carte Fiscalité en points courts à amorce (2026-11-14). */
const norm = (t: string) => t.replace(/[  ]/g, ' ');
const pct = (r: number) => `${(r * 100).toFixed(2).replace('.', ',')} %`;
const eur = (n: number) => `${n.toLocaleString('fr-FR').replace(/[  ]/g, ' ')} €`;
const by = Object.fromEntries(LIVRETS.map((l) => [l.id, l]));

describe('fiches Livret A et LEP', () => {
  it('taux et plafonds identiques à LIVRETS', () => {
    const a = norm(investmentBySlug['livret-a'].tax.text);
    expect(a).toContain(pct(by.livretA.rate));
    expect(a).toContain(eur(by.livretA.cap));
    expect(a).toContain(eur(by.ldds.cap));
    const l = norm(investmentBySlug.lep.tax.text);
    expect(l).toContain(pct(by.lep.rate));
    expect(l).toContain(eur(by.lep.cap));
    expect(l).toContain('23 028 €');
    expect(l).toContain('35 326 €');
  });
  it('chaque point de la carte Fiscalité commence par une amorce, « Impôts » en premier', () => {
    for (const slug of ['livret-a', 'lep']) {
      const parts = splitSentences(investmentBySlug[slug].tax.text);
      expect(parts.length).toBeGreaterThanOrEqual(3);
      expect(sentenceLead(parts[0])?.lead).toBe('Impôts');
      for (const p of parts) expect(sentenceLead(p), p).not.toBeNull();
    }
  });
  it('exemple fictif du LEP : 10 000 € au taux du LEP ≈ 250 €', () => {
    expect(Math.round(by.lep.cap * by.lep.rate)).toBe(250);
    expect(norm(investmentBySlug.lep.example)).toContain(`${eur(by.lep.cap)} à ${pct(by.lep.rate)}`);
    expect(norm(investmentBySlug.lep.example)).toContain('250 €');
  });
});
