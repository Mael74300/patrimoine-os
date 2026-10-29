import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { FamilyIcon } from './components/Illustrations';
import { categories } from './data/categories';

describe('icônes des familles', () => {
  it('chaque famille a une icône décorative distincte', () => {
    const rendus = categories.map((c) => renderToStaticMarkup(createElement(FamilyIcon, { id: c.id })));
    rendus.forEach((svg) => expect(svg).toContain('aria-hidden="true"'));
    const defaut = renderToStaticMarkup(createElement(FamilyIcon, { id: 'inconnu' }));
    categories.filter((c) => c.id !== 'autres').forEach((c) => expect(rendus[categories.indexOf(c)]).not.toBe(defaut));
    expect(new Set(rendus).size).toBe(rendus.length);
  });
});
