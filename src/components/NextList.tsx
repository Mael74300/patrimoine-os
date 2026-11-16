import { Link } from 'react-router-dom';

/** Une carte « Pour aller plus loin » : ce qu'elle est (simulateur, guide, fiche), son titre et, si possible, un résumé. */
export type NextItem = { kind: string; to: string; title: string; blurb?: string };

/** Grille de cartes « Pour aller plus loin », commune aux guides et aux fiches. */
export function NextList({ items }: { items: NextItem[] }) {
  return (
    <ul className="next-list">
      {items.map((it) => (
        <li key={it.to}>
          <span className="next-kind">{it.kind}</span>
          <Link className={it.blurb ? undefined : 'next-solo'} to={it.to}>{it.title}</Link>
          {it.blurb && <span>{it.blurb}</span>}
        </li>
      ))}
    </ul>
  );
}

/** Suite repliée sous la grille : son résumé nomme les pages qu'elle contient, pour que rien ne disparaisse. */
export function NextMore({ items }: { items: NextItem[] }) {
  if (!items.length) return null;
  return (
    <details className="fold next-more">
      <summary><span>{items.length === 1 ? 'Une autre page liée' : `${items.length} autres pages liées`}<span className="fold-hint">{items.map((r) => r.title).join(' · ')}</span></span></summary>
      <NextList items={items} />
    </details>
  );
}
