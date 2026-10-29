import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { movedSims } from '../lib/movedSims';
import { Crumbs, PageHead } from '../components/ui';

/** Page de renvoi d'un ancien simulateur : lien visible, puis redirection automatique dans le navigateur. */
export default function SimMoved() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const moved = movedSims.find((m) => pathname.replace(/\/$/, '').endsWith('/' + m.slug));
  useEffect(() => {
    if (moved) navigate({ pathname: moved.to, hash: moved.tab }, { replace: true });
  }, [moved, navigate]);
  if (!moved) return null;
  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: moved.title }]} />
      <PageHead eyebrow="Simulateur déplacé" title={moved.title}>
        Ce calcul fait maintenant partie du simulateur « {moved.dest} », sous forme d’onglet.
      </PageHead>
      <p>
        <Link className="btn" to={{ pathname: moved.to, hash: moved.tab }}>Ouvrir le simulateur « {moved.dest} »</Link>
      </p>
    </>
  );
}
