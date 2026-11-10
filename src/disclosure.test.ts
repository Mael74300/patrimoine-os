import { describe, expect, it } from 'vitest';
// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync } from 'node:fs';
import ui from './components/ui.tsx?raw';

const css: string = readFileSync('src/styles.css', 'utf8');

describe('Blocs repliables : un seul repère sur tout le site', () => {
  it('masque les triangles natifs et affiche « + » fermé, « − » ouvert sur chaque titre de bloc', () => {
    expect(css).toMatch(/\nsummary \{[^}]*list-style: none;[^}]*display: flex;[^}]*min-height: 44px;/);
    expect(css).toMatch(/\nsummary::-webkit-details-marker \{ display: none; \}/);
    expect(css).toMatch(/\nsummary::after \{ content: '\+';/);
    expect(css).toMatch(/\ndetails\[open\] > summary::after \{ content: '\\2212'; \}/);
  });

  it('aucun titre de bloc ne réaffiche un marqueur natif ni ne retire le repère', () => {
    expect(css).not.toMatch(/summary[^{]*\{[^}]*(list-style: (disclosure|inherit)|display: (block|list-item))/);
    expect(css).not.toMatch(/summary::after \{[^}]*content: (none|'')/);
  });

  it('les simulations enregistrées et les listes repliées sur mobile utilisent le style commun', () => {
    expect(ui).toContain('<details className="panel saved-sims">');
    expect(ui).not.toMatch(/<summary style=/);
    // libellé et indication dans un seul élément : le « + » reste à droite, sur la première ligne
    expect(ui).toContain('<summary><span>{label}{hint && <span className="fold-hint">{hint}</span>}</span></summary>');
  });
});
