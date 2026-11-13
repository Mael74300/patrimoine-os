import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { investmentBySlug } from './investments';
import { crowdfundingScenario, scpiFeesPayback } from '../lib/calc/ficheExemples';
import { CROWDFUNDING_EXAMPLE, SCPI_EXAMPLE } from '../lib/illustrationData';
import { SchemaCrowdfundingBilan, SchemaScpiBilan } from '../components/schemas/fiches';

/**
 * Exemples fictifs des fiches Financement participatif et SCPI : montants recalculés, cohérents entre le texte de la fiche
 * et son schéma. Frais d'entrée des SCPI : 6 % à 12 % du montant souscrit (La finance pour tous, mise à jour le
 * 2 janvier 2024, consultée le 2026-11-13).
 */
const norm = (t: string) => t.replace(/[  ]/g, ' ');
const eur = (n: number) => `${norm(n.toLocaleString('fr-FR'))} €`;
const plain = (svg: string) => norm(svg.replace(/<[^>]+>/g, ' ').replace(/&#x27;|&#39;/g, '’'));

describe('fiche Financement participatif : ce qu’un défaut coûte', () => {
  const { projects, ticket, ratePct, defaults } = CROWDFUNDING_EXAMPLE;
  const rows = defaults.map((d) => crowdfundingScenario(projects, ticket, ratePct, d));
  const ex = norm(investmentBySlug['crowdfunding']!.example);

  it('montants recalculés : 180 € gagnés sans défaut, 71 € avec un défaut, 38 € perdus avec deux', () => {
    expect(rows.map((r) => r.recovered)).toEqual([2180, 2071, 1962]);
    expect(rows.map((r) => r.gain)).toEqual([180, 71, -38]);
    expect(rows[0]!.gainPct).toBe(ratePct);
  });
  it('le texte de la fiche cite les mêmes montants et reste marqué fictif', () => {
    expect(ex).toMatch(/^Exemple fictif/);
    for (const v of [projects * ticket, ticket, rows[0]!.gain, rows[1]!.gain, -rows[2]!.gain]) expect(ex).toContain(eur(v));
    expect(ex).toContain(`${projects} prêts`);
    expect(ex).toContain(`${ratePct} %`);
    expect(ex).toContain('Avant impôt et frais de plateforme');
  });
  it('le schéma montre les mêmes bilans, un carré par prêt', () => {
    const svg = renderToStaticMarkup(createElement(SchemaCrowdfundingBilan, null, 'légende'));
    const t = plain(svg);
    expect(t).toContain(`Bilan : ${eur(180)} gagnés`);
    expect(t).toContain(`Bilan : ${eur(71)} gagnés`);
    expect(t).toContain(`Bilan : ${eur(38)} perdus`);
    expect(svg.match(/<rect /g)!.length).toBe(projects * defaults.length + 2);
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
  });
});

describe('fiche SCPI : frais d’entrée compensés par les loyers', () => {
  const { amount, entryFeePct, distributionPct } = SCPI_EXAMPLE;
  const r = scpiFeesPayback(amount, entryFeePct, distributionPct);
  const fiche = investmentBySlug['scpi']!;
  const ex = norm(fiche.example);

  it('montants recalculés : 1 000 € de frais, 500 € par an, 2 ans', () => {
    expect(r).toEqual({ fees: 1000, yearly: 500, years: 2 });
  });
  it('taux de frais pris dans la fourchette sourcée de la rubrique Frais (6 % à 12 %)', () => {
    expect(norm(fiche.fees.text)).toContain('entre 6 % et 12 % du montant souscrit');
    expect(entryFeePct).toBeGreaterThanOrEqual(6);
    expect(entryFeePct).toBeLessThanOrEqual(12);
  });
  it('le texte de la fiche et le schéma citent les mêmes montants', () => {
    expect(ex).toMatch(/^Exemple fictif/);
    for (const v of [amount, r.fees, r.yearly]) expect(ex).toContain(eur(v));
    expect(ex).toContain(`${entryFeePct} %`);
    expect(ex).toContain(`${distributionPct} %`);
    expect(ex).toContain(`${r.years} ans`);
    const svg = renderToStaticMarkup(createElement(SchemaScpiBilan, null, 'légende'));
    const t = plain(svg);
    expect(t).toContain(eur(r.fees));
    expect(t).toContain(`année 2 : ${eur(r.yearly)}`);
    expect(t).toContain(`Après ${r.years} ans, frais compensés`);
    expect(svg.length).toBeLessThan(15000);
  });
});
