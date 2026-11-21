// @ts-expect-error les types de Node ne sont pas installés ; le module existe sous Vitest
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PrintSource } from './App';
import { openForPrint, printedAddress, restoreAfterPrint } from './lib/print';

const css: string = readFileSync('src/styles.css', 'utf8');
/** Contenu des blocs @media print de la feuille de style. */
function printRules(): string {
  const out: string[] = [];
  const re = /@media print\s*\{/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    let depth = 1;
    let i = re.lastIndex;
    for (; i < css.length && depth > 0; i++) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') depth--;
    }
    out.push(css.slice(re.lastIndex, i - 1));
  }
  return out.join('\n');
}

describe('impression (chantier 256)', () => {
  it('ouvre les blocs fermés le temps de l’impression, puis rend leur état', () => {
    const blocks = [{ open: false }, { open: true }, { open: false }];
    const opened = openForPrint(blocks);
    expect(blocks.every((b) => b.open)).toBe(true);
    expect(opened).toHaveLength(2);
    restoreAfterPrint(opened);
    expect(blocks.map((b) => b.open)).toEqual([false, true, false]);
  });

  it('imprime l’adresse de la page sans barre en double', () => {
    expect(printedAddress('https://exemple.org/site', '/simulateurs/credit/')).toBe('https://exemple.org/site/simulateurs/credit/');
    expect(printedAddress('https://exemple.org/site/', '/')).toBe('https://exemple.org/site/');
  });

  it('la ligne d’origine imprimée cite le site et l’adresse de la page', () => {
    const html = renderToString(createElement(StaticRouter, { location: '/encyclopedie/pea/' }, createElement(PrintSource)));
    expect(html).toContain('print-only');
    expect(html).toMatch(/\/encyclopedie\/pea\//);
    expect(html).toContain('pas un conseil personnalisé');
  });

  it('garde les hypothèses d’un simulateur sur papier et masque ce qui ne sert qu’à l’écran', () => {
    const p = printRules();
    // Le formulaire (les hypothèses) n'est plus masqué ; ses curseurs et boutons le sont.
    const hidden = [...p.matchAll(/([^{}]+)\{[^}]*display:\s*none/g)].flatMap((m: RegExpMatchArray) => m[1].split(',').map((s) => s.trim()));
    expect(hidden).not.toContain('.sim-form');
    expect(hidden).toContain('.sim-form .slider');
    expect(hidden).toContain('.saved-sims');
    expect(p).toMatch(/details:not\(\[open\]\)/);
    // Couleurs des barres et repères conservées, pas de coupure dans un schéma ni sous un titre.
    expect(p).toMatch(/print-color-adjust:\s*exact/);
    expect(p).toMatch(/break-inside:\s*avoid/);
    expect(p).toMatch(/break-after:\s*avoid/);
    // Ligne d'origine visible seulement à l'impression.
    expect(css).toMatch(/\.print-only\s*\{\s*display:\s*none/);
  });
});
