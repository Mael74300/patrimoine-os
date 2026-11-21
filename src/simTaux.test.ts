// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LIVRET_A, LIVRETS } from './data/livrets';
import { PFU_IR_PCT, PFU_PS_PCT, PFU_PS_RATE, PFU_TOTAL_PCT, PFU_TOTAL_RATE, PS_2025_PCT, PS_2025_RATE, pctLabel, rateOfPct } from './lib/calc/pfu';

/**
 * Taux réglementaires des simulateurs tirés d'un seul endroit (chantier 270) : le taux du Livret A vient de
 * `LIVRETS` (révisé au 1er février et au 1er août), le PFU et les prélèvements sociaux de `lib/calc/pfu.ts`
 * (loi de finances, loi de financement de la Sécurité sociale). Aucun simulateur ne les recopie en dur :
 * le jour où ils changent, une seule valeur suffit et les valeurs par défaut suivent.
 */
const pages = import.meta.glob<string>('./pages/Sim*.tsx', { query: '?raw', import: 'default', eager: true });
const files: [string, string][] = [...Object.entries(pages), ['EnvelopeCards.tsx', readFileSync('src/components/EnvelopeCards.tsx', 'utf8') as string]];

describe('simulateurs : taux réglementaires sans copie en dur', () => {
  it('les taux décimaux valent exactement les pourcentages sources', () => {
    expect(PFU_TOTAL_RATE).toBe(0.314);
    expect(PFU_PS_RATE).toBe(0.186);
    expect(PS_2025_RATE).toBe(0.172);
    expect(rateOfPct(PFU_IR_PCT) + rateOfPct(PFU_PS_PCT)).toBeCloseTo(PFU_TOTAL_RATE, 10);
    expect(pctLabel(PFU_TOTAL_PCT)).toBe('31,4 %');
    expect(pctLabel(PS_2025_PCT)).toBe('17,2 %');
    expect(LIVRET_A).toBe(LIVRETS.find((l) => l.id === 'livretA'));
  });

  it('aucun simulateur ne recopie le taux du Livret A, du PFU ou des prélèvements sociaux', () => {
    expect(files.length).toBeGreaterThan(15);
    const livret = String(LIVRET_A.rate);
    const banned = [
      livret, String(PFU_TOTAL_RATE), String(PFU_PS_RATE), String(PS_2025_RATE),
      ...[PFU_TOTAL_PCT, PFU_PS_PCT, PFU_IR_PCT, PS_2025_PCT, LIVRET_A.rate * 100].map((p) => p.toLocaleString('fr-FR', { minimumFractionDigits: 1 })),
    ];
    for (const [f, src] of files) {
      for (const b of banned) {
        const re = new RegExp(`(?<![\\d.,])${b.replace(/[.]/g, '\\.')}(?![\\d])`);
        expect(re.test(src), `${f} contient ${b}`).toBe(false);
      }
    }
  });
});
