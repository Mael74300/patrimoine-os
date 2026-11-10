import { Fragment, useEffect, useRef, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { glossaryId } from '../data/glossary';
import type { JargonSegment } from '../lib/jargon';

/** Attributs HTML de l'API Popover, absents des types de React 18 (transmis tels quels au DOM). */
const POPOVER = { popover: 'auto' } as Record<string, string>;

type PopEl = HTMLSpanElement & { showPopover?: () => void; hidePopover?: () => void };

/** Place la bulle sous le mot (ou au-dessus s'il n'y a pas la place), sans dépasser de l'écran. */
function place(anchor: HTMLElement, pop: HTMLElement) {
  const r = anchor.getBoundingClientRect();
  const w = pop.offsetWidth;
  const h = pop.offsetHeight;
  const left = Math.max(16, Math.min(r.left, document.documentElement.clientWidth - w - 16));
  const below = r.bottom + 8 + h <= window.innerHeight || r.top - 8 - h < 0;
  pop.style.left = `${left + window.scrollX}px`;
  pop.style.top = `${(below ? r.bottom + 8 : r.top - 8 - h) + window.scrollY}px`;
}

/** Un mot de jargon : lien vers le glossaire, qui ouvre la définition sur place quand le navigateur le permet. */
function Term({ seg }: { seg: Exclude<JargonSegment, string> }) {
  const link = useRef<HTMLAnchorElement>(null);
  const pop = useRef<PopEl>(null);

  useEffect(() => {
    const el = pop.current;
    if (!el) return;
    // Fermée (clic ailleurs, Échap, bouton) : le focus revient au mot si il était dans la bulle.
    const onToggle = (e: Event) => {
      if ((e as Event & { newState?: string }).newState === 'closed' && (el.contains(document.activeElement) || document.activeElement === document.body)) link.current?.focus();
    };
    el.addEventListener('toggle', onToggle);
    return () => el.removeEventListener('toggle', onToggle);
  }, []);

  const open = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = pop.current;
    if (!el || typeof el.showPopover !== 'function') return; // navigateur ancien : lien ordinaire vers le glossaire
    e.preventDefault();
    el.showPopover();
    place(e.currentTarget, el);
    el.focus();
  };

  const href = `/glossaire#${glossaryId(seg.term.term)}`;
  return (
    <>
      <Link ref={link} to={href} className="term" aria-haspopup="dialog" aria-controls={seg.id} onClick={open}>{seg.text}</Link>
      <span ref={pop} id={seg.id} className="term-pop" role="dialog" aria-label={`Définition : ${seg.term.term}`} tabIndex={-1} {...POPOVER}>
        <strong className="term-pop-name">{seg.term.term}</strong>
        <span className="term-pop-def">{seg.term.definition}</span>
        <Link className="term-pop-more" to={href}>Voir dans le glossaire</Link>
        <button type="button" className="term-pop-close" aria-label="Fermer la définition" onClick={() => pop.current?.hidePopover?.()}>×</button>
      </span>
    </>
  );
}

/** Texte dont les mots de jargon (calculés par `annotateJargon`) s'expliquent au clic. */
export function JargonText({ segs }: { segs: JargonSegment[] }) {
  return <>{segs.map((s, i) => (typeof s === 'string' ? <Fragment key={i}>{s}</Fragment> : <Term key={s.id} seg={s} />))}</>;
}
