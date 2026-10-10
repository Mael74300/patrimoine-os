import { describe, expect, it } from 'vitest';
import { classify, dueReviews, fingerprint, normalizeHtml, robotsAllows } from './watch';

describe('normalisation des pages', () => {
  it('ignore scripts, styles, commentaires et mise en forme', () => {
    const a = normalizeHtml('<html><script>var t=Date.now()</script><main><h1>Livret  A</h1><!-- x --><p>Taux&nbsp;: 1,70 %</p></main><footer>pied</footer></html>');
    expect(a).toBe('Livret A Taux : 1,70 %');
  });
  it('une modification du texte change l’empreinte, pas une modification de mise en page', () => {
    const t1 = normalizeHtml('<main><p>Taux : 1,70 %</p></main>');
    const t2 = normalizeHtml('<main><div class="x"><p>Taux :   1,70 %</p></div></main>');
    const t3 = normalizeHtml('<main><p>Taux : 1,50 %</p></main>');
    expect(fingerprint(t1)).toBe(fingerprint(t2));
    expect(fingerprint(t1)).not.toBe(fingerprint(t3));
  });
});

describe('robots.txt', () => {
  const txt = `User-agent: *\nDisallow: /recherche\nAllow: /recherche/aide\nDisallow: /*.pdf$\n\nUser-agent: AutreRobot\nDisallow: /`;
  it('applique le groupe * et la règle la plus longue', () => {
    expect(robotsAllows(txt, '/particuliers/vosdroits/F2365')).toBe(true);
    expect(robotsAllows(txt, '/recherche?q=1')).toBe(false);
    expect(robotsAllows(txt, '/recherche/aide')).toBe(true);
    expect(robotsAllows(txt, '/doc/notice.pdf')).toBe(false);
  });
  it('fichier vide : tout est autorisé', () => expect(robotsAllows('', '/x')).toBe(true));
  it('groupe nommé prioritaire', () => expect(robotsAllows(txt, '/x', 'AutreRobot/1.0')).toBe(false));
});

describe('classement des relevés', () => {
  const prev = { hash: 'abc', status: 'ok', checkedAt: '2026-10-01' };
  it('page identique : rien à signaler', () => expect(classify('u', [], prev, { httpStatus: 200, hash: 'abc' })).toBeNull());
  it('page modifiée, disparue, en erreur, sans référence', () => {
    expect(classify('u', [], prev, { httpStatus: 200, hash: 'def' })?.kind).toBe('modifiée');
    expect(classify('u', [], prev, { httpStatus: 404 })?.kind).toBe('introuvable');
    expect(classify('u', [], prev, { error: 'timeout' })?.kind).toBe('erreur');
    expect(classify('u', [], undefined, { httpStatus: 200, hash: 'x' })?.kind).toBe('sans référence');
    expect(classify('u', [], prev, { robotsBlocked: true })?.kind).toBe('interdite par robots.txt');
  });
});

describe('révisions', () => {
  const items = [
    { slug: 'a', name: 'A', review: { nextReview: '2026-10-01' } },
    { slug: 'b', name: 'B', review: { nextReview: '2026-10-20' } },
    { slug: 'c', name: 'C', review: { nextReview: '2027-06-01' } },
  ];
  it('sépare les fiches en retard et à réviser bientôt', () => {
    const r = dueReviews(items, '2026-10-10');
    expect(r.overdue.map((i) => i.slug)).toEqual(['a']);
    expect(r.upcoming.map((i) => i.slug)).toEqual(['b']);
  });
});
