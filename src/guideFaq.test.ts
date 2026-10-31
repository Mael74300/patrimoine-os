import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SimFaq } from './components/ui';
import { guides } from './data/guides';

describe('FAQ des guides', () => {
  it('chaque question est repliée mais sa réponse reste dans le HTML', () => {
    const withFaq = guides.filter((g) => g.faq?.length);
    expect(withFaq.length).toBeGreaterThan(0);
    for (const g of withFaq) {
      const html = renderToString(createElement(SimFaq, { slug: g.slug, items: g.faq }));
      expect((html.match(/<details/g) ?? []).length).toBe(g.faq!.length);
      expect(html).not.toMatch(/<details[^>]* open/);
      for (const f of g.faq!) expect(html).toContain(f.q.replace(/’/g, '’'));
    }
  });
});
