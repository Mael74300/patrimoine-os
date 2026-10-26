import { describe, expect, it } from 'vitest';
// @ts-expect-error module JavaScript du build, sans déclaration de types
import { checkSeo } from './seo-check.mjs';

const site = 'https://exemple.github.io/patrimoine-os';
const page = (path: string, { title = 'Un titre de page tout à fait correct', desc = 'Une description suffisamment longue pour être utile aux moteurs de recherche.', links = [] as string[], ld = '', canonical = site + path } = {}) => ({
  path,
  html: `<title>${title}</title><meta name="description" content="${desc}" /><link rel="canonical" href="${canonical}" />${ld}${links.map((l) => `<a href="${l}">x</a>`).join('')}`,
});
const run = (pages: ReturnType<typeof page>[]) => checkSeo(pages, { siteUrl: site, base: '/' }) as string[];

describe('contrôle SEO', () => {
  it('accepte un site cohérent', () => {
    const a = page('/', { links: ['/a'] });
    const b = page('/a/', { title: 'Autre titre de page parfaitement valide', desc: 'Une autre description, différente de la première, et assez longue.', links: ['/'] });
    expect(run([a, b])).toEqual([]);
  });
  it('signale titres trop longs ou en double, descriptions en double', () => {
    const errs = run([page('/', { title: 'x'.repeat(90), links: ['/a'] }), page('/a/', { links: ['/'] })]);
    expect(errs.some((e) => e.includes('titre de 90'))).toBe(true);
    expect(run([page('/', { links: ['/a'] }), page('/a/', { links: ['/'] })]).some((e) => e.includes('titre en double'))).toBe(true);
  });
  it('signale canonique erronée, lien cassé et page orpheline', () => {
    const errs = run([page('/', { canonical: 'https://autre.fr/', links: ['/absente', '/a'] }), page('/a/', { title: 'Un autre titre valable ici', desc: 'Description différente pour la page a, assez longue pour passer.' }), page('/b/', { title: 'Encore un titre différent', desc: 'Troisième description distincte, de longueur tout à fait correcte.', links: ['/'] })]);
    expect(errs.some((e) => e.includes('canonique'))).toBe(true);
    expect(errs.some((e) => e.includes('lien interne cassé'))).toBe(true);
    expect(errs.some((e) => e.includes('/b : page orpheline'))).toBe(true);
  });
  it('retire le préfixe de déploiement, avec ou sans barre finale', () => {
    const a = page('/', { links: ['/depot', '/depot/a'] });
    const b = page('/a/', { title: 'Autre titre de page parfaitement valide', desc: 'Une autre description, différente de la première, et assez longue.', links: ['/depot/'] });
    expect(checkSeo([a, b], { siteUrl: site, base: '/depot/' })).toEqual([]);
  });
  it('signale un JSON-LD invalide', () => {
    const errs = run([page('/', { ld: '<script type="application/ld+json">{oups</script>' })]);
    expect(errs.some((e) => e.includes('JSON-LD invalide'))).toBe(true);
  });
});
