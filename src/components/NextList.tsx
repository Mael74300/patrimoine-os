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
