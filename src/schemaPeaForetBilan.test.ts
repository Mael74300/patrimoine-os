import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { investmentBySlug } from './data/investments';
import { FOREST_EXAMPLE, PEA_EXAMPLE, SchemaForetBilan, SchemaPeaBilan } from './components/schemas/fiches';
import { pfuSplit, PFU_PS_PCT } from './lib/calc/pfu';
import { forestCredit } from './lib/calc/ficheExemples';

/**
 * Fiches PEA et Forêt : l'exemple chiffré gagne un schéma de bilan (constat du 2026-11-19). Aucun chiffre nouveau :
 * les montants du schéma sont recalculés et doivent être ceux du texte de la fiche, marqué « fictif ».
 * Taux reconsultés le 2026-11-19 : Service-Public F21618 (PFU 31,4 % = 12,8 % + 18,6 %), F2329 (18,6 %, cas général),
 * BOFiP BOI-IR-RICI-60-20-20 (crédit de 25 %, plafonds 6 250 € et 12 500 €).
 */
const norm = (t: string) => t.replace(/[  ]/g, ' ');
const eur = (n: number) => `${norm(n.toLocaleString('fr-FR', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2 }))} €`;
const plain = (svg: string) => norm(svg.replace(/<[^>]+>/g, ' ').replace(/&#x27;|&#39;/g, '’')).replace(/\s+/g, ' ');

describe('fiche PEA : schéma du bilan, compte-titres face au PEA', () => {
  const { gain } = PEA_EXAMPLE;
  const cto = pfuSplit(gain);
  const peaTax = (gain * PFU_PS_PCT) / 100;
  const svg = renderToStaticMarkup(createElement(SchemaPeaBilan, null, 'légende'));
  const t = plain(svg);
  const ex = norm(investmentBySlug['pea']!.example);

  it('mêmes montants que le texte de la fiche : 6 280 €, 3 720 €, 2 560 € d’écart', () => {
    expect([cto.total, peaTax, cto.total - peaTax]).toEqual([6280, 3720, 2560]);
    expect(ex).toMatch(/^Exemple fictif/);
    for (const v of [gain, cto.total, peaTax, cto.total - peaTax]) expect(ex).toContain(eur(v));
  });
  it('le schéma montre ce qui reste et l’écart, égal à l’impôt sur le revenu évité', () => {
    expect(t).toContain(`${eur(gain - cto.total)} pour vous`);
    expect(t).toContain(`${eur(gain - peaTax)} pour vous`);
    expect(t).toContain(`impôt : ${eur(cto.total)}`);
    expect(t).toContain(`impôt : ${eur(peaTax)}`);
    expect(t).toContain(`+${eur(cto.ir)} en PEA`);
    expect(cto.ir).toBe(cto.total - peaTax);
  });
  it('accessible et léger', () => {
    expect(svg).toContain('role="img"');
    expect(svg).toContain('<desc');
    expect(svg.length).toBeLessThan(15000);
  });
});

describe('fiche Forêt : schéma du coût des parts après crédit d’impôt', () => {
  const { amount, ratePct, caps } = FOREST_EXAMPLE;
  const [seul, couple] = caps.map((c) => forestCredit(amount, c.cap, ratePct));
  const svg = renderToStaticMarkup(createElement(SchemaForetBilan, null, 'légende'));
  const t = plain(svg);
  const fiche = investmentBySlug['groupements-forestiers']!;

  it('plafonds et taux identiques à la rubrique Fiscalité', () => {
    const tax = norm(fiche.tax.text);
    expect(tax).toContain(`Crédit d’impôt de ${ratePct} %`);
    expect(tax).toContain(`plafonnées à ${eur(caps[0]!.cap)} pour une personne seule et ${eur(caps[1]!.cap)} pour un couple`);
  });
  it('le texte de la fiche légende le schéma : mêmes hypothèses, sans recopier les montants dessinés', () => {
    const ex = norm(fiche.example);
    expect(ex).toMatch(/^Exemple fictif, celui du schéma/);
    for (const v of [amount, seul!.retained, caps[1]!.cap]) expect(ex).toContain(eur(v));
    expect(ex).toContain(`${ratePct} %`);
    expect(ex).toContain('15,6 %');
    // « 2 500 € » ne doit pas se confondre avec la fin de « 12 500 € » : montant isolé seulement.
    const isole = (v: number) => new RegExp(`(?<![\\d ])${eur(v)}`);
    for (const v of [seul!.credit, seul!.netCost, couple!.credit, couple!.netCost]) expect(ex).not.toMatch(isole(v));
  });
  it('le schéma montre le coût et le crédit de chaque foyer', () => {
    expect(t).toContain(`coût : ${eur(seul!.netCost)}`);
    expect(t).toContain(`crédit : ${eur(seul!.credit)}`);
    expect(t).toContain(`coût : ${eur(couple!.netCost)}`);
    expect(t).toContain(`crédit : ${eur(couple!.credit)}`);
    expect(t).toContain('15,6 %');
    expect(svg).toContain('role="img"');
    expect(svg.length).toBeLessThan(15000);
  });
});
