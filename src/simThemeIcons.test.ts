import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SimThemeIcon } from './components/Illustrations';
import { simThemes } from './lib/simThemes';

describe('icônes des thèmes de simulateurs', () => {
  it('chaque thème a une icône décorative distincte', () => {
    const rendus = simThemes.map((t) => renderToStaticMarkup(createElement(SimThemeIcon, { id: t.id })));
    rendus.forEach((svg) => expect(svg).toContain('aria-hidden="true"'));
    const defaut = renderToStaticMarkup(createElement(SimThemeIcon, { id: 'inconnu' }));
    rendus.forEach((svg) => expect(svg).not.toBe(defaut));
    expect(new Set(rendus).size).toBe(rendus.length);
  });
});
