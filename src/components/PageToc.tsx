import { useEffect, useState, type ReactNode } from 'react';
import { activeSection, sectionId } from '../lib/toc';

export type TocItem = { id: string; label: string };

/** Ligne de lecture : sous l’en-tête collant du site (72 px) et la marge des ancres (84 px). */
const READ_LINE = 120;

/** Indice de la rubrique en cours de lecture, mis à jour au défilement (rien côté serveur). */
function useActiveSection(ids: string[]): number {
  const [active, setActive] = useState(-1);
  const key = ids.join('|');
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const tops = ids.map((id) => document.getElementById(id)?.getBoundingClientRect().top ?? Infinity);
      const doc = document.documentElement;
      const atBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 4;
      setActive(activeSection(tops, READ_LINE, atBottom, window.innerHeight));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return active;
}

/** Sommaire « Sur cette page » : liens vers les rubriques, la rubrique lue est mise en évidence. */
export function PageToc({ items, className = '', children }: { items: TocItem[]; className?: string; children?: ReactNode }) {
  const active = useActiveSection(items.map((t) => t.id));
  return (
    <nav className={`page-toc ${className}`.trim()} aria-label="Sur cette page">
      <p className="page-toc-title">Sur cette page</p>
      <ol>
        {items.map((t, i) => (
          <li key={t.id}><a href={`#${t.id}`} aria-current={i === active ? 'location' : undefined}>{t.label}</a></li>
        ))}
      </ol>
      {children}
    </nav>
  );
}

/**
 * Page de texte (Méthode, Confidentialité, Mentions légales) mise en page comme un guide :
 * le texte à gauche, le sommaire collant à droite sur grand écran (masqué sur téléphone).
 * Les titres de rubrique portent l’identifiant `sectionId(titre)`.
 */
export function ProseWithToc({ items, children }: { items: TocItem[]; children: ReactNode }) {
  return (
    <div className="guide-layout">
      <div className="prose">{children}</div>
      <PageToc className="guide-toc" items={items} />
    </div>
  );
}

/** Titre de rubrique repérable par le sommaire. */
export function TocH2({ children }: { children: string }) {
  return <h2 id={sectionId(children)}>{children}</h2>;
}

/** Entrées du sommaire à partir des titres de rubrique, dans l’ordre de la page. */
export function tocItems(headings: string[]): TocItem[] {
  return headings.map((h) => ({ id: sectionId(h), label: h }));
}
