import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { GuideGroupIcon } from './components/Illustrations';
import { guideGroups } from './data/guides';

describe('icônes des parcours de guides', () => {
  it('chaque parcours a une icône décorative distincte', () => {
    const rendus = guideGroups.map((_, i) => renderToStaticMarkup(createElement(GuideGroupIcon, { index: i })));
    rendus.forEach((svg) => expect(svg).toContain('aria-hidden="true"'));
    expect(new Set(rendus).size).toBe(rendus.length);
  });
});
