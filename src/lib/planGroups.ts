import { guideGroups, guides } from '../data/guides';
import { simulators } from './search';
import { simThemes } from './simThemeList';

export type PlanGroup = { title: string; links: { to: string; label: string }[] };

/** Simulateurs rangés par thème, comme sur la page Simulateurs ; ceux sans thème finissent dans « Autres ». */
export function simulatorGroups(): PlanGroup[] {
  const bySlug = new Map(simulators.map((s) => [s.slug, s]));
  const themed = new Set(simThemes.flatMap((t) => t.slugs));
  const groups = simThemes.map((t) => ({ title: t.title, slugs: t.slugs }));
  groups.push({ title: 'Autres', slugs: simulators.filter((s) => !themed.has(s.slug)).map((s) => s.slug) });
  return groups
    .map((g) => ({ title: g.title, links: g.slugs.flatMap((slug) => { const s = bySlug.get(slug); return s ? [{ to: `/simulateurs/${slug}`, label: s.title }] : []; }) }))
    .filter((g) => g.links.length);
}

/** Guides rangés par étape, comme sur la page Guides ; ceux sans groupe finissent dans « Autres guides ». */
export function guidePlanGroups(): PlanGroup[] {
  const bySlug = new Map(guides.map((g) => [g.slug, g]));
  const grouped = new Set(guideGroups.flatMap((g) => g.slugs));
  const groups = guideGroups.map((g) => ({ title: g.title, slugs: g.slugs }));
  groups.push({ title: 'Autres guides', slugs: guides.filter((g) => !grouped.has(g.slug)).map((g) => g.slug) });
  return groups
    .map((g) => ({ title: g.title, links: g.slugs.flatMap((slug) => { const x = bySlug.get(slug); return x ? [{ to: `/guides/${slug}`, label: x.title }] : []; }) }))
    .filter((g) => g.links.length);
}

