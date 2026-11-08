import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { config } from './config';
import { trackPageview } from './lib/analytics';
import { surveillerTextes } from './lib/typo';
import { ROUTES } from './routes';

const NAV = [
  { to: '/encyclopedie', label: 'Encyclopédie' },
  { to: '/simulateurs', label: 'Simulateurs' },
  { to: '/comparateur', label: 'Comparateur' },
  { to: '/entrepreneuriat', label: 'Entrepreneuriat' },
  { to: '/guides', label: 'Guides' },
  { to: '/methodologie', label: 'Méthode' },
];

function ScrollTop() {
  const { pathname, hash } = useLocation();
  // Accolades obligatoires : dans les navigateurs récents, scrollTo renvoie une promesse,
  // que React prendrait pour une fonction de nettoyage et appellerait au changement de page.
  const premiere = useRef(true);
  useEffect(() => {
    window.scrollTo(0, 0);
    // Après un changement de page (pas au premier affichage), le focus passe au contenu :
    // sans cela, il retombe sur le corps de la page et le clavier repart du haut, menu compris.
    if (premiere.current) {
      premiere.current = false;
      return;
    }
    document.getElementById('contenu')?.focus({ preventScroll: true });
  }, [pathname]);
  // Lien vers une ancre d'une autre page (ex. une notion du glossaire depuis la recherche) :
  // la page est chargée à la demande, on attend que l'élément existe (au plus ~1 s).
  useEffect(() => {
    if (hash.length < 2) return;
    let essais = 0;
    let timer = 0;
    const versAncre = () => {
      const cible = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (cible) cible.scrollIntoView();
      else if (essais++ < 20) timer = window.setTimeout(versAncre, 50);
    };
    versAncre();
    return () => window.clearTimeout(timer);
  }, [pathname, hash]);
  return null;
}

/** Espaces insécables avant « ? ! ; : » (voir lib/typo.ts) : appliquées après l'hydratation, sur la page et sur tout texte qui apparaît ensuite. */
function FrenchSpaces() {
  useEffect(() => {
    return surveillerTextes(document.body);
  }, []);
  return null;
}

/** Annonce le titre de la nouvelle page aux lecteurs d'écran : le site ne recharge pas la page en naviguant, donc rien n'est annoncé sinon. */
function RouteAnnouncer() {
  const { pathname } = useLocation();
  const [text, setText] = useState('');
  const premiere = useRef(true);
  useEffect(() => {
    if (premiere.current) {
      premiere.current = false;
      return;
    }
    // Le titre est mis à jour par la page elle-même, après son rendu : on attend un instant.
    const t = setTimeout(() => setText(document.title), 150);
    return () => clearTimeout(t);
  }, [pathname]);
  return <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{text}</div>;
}

/** Bouton « Haut de page » : les pages font 4 000 à 5 500 px de haut sur mobile ; il apparaît après un long défilement. */
function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 1200);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!visible) return null;
  return (
    <button
      type="button"
      className="back-top"
      onClick={() => {
        window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        document.getElementById('contenu')?.focus({ preventScroll: true });
      }}
    >
      <span aria-hidden="true">↑</span> Haut de page
    </button>
  );
}

export function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
      <defs><linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#17358a" /><stop offset="1" stopColor="#0a7658" /></linearGradient></defs>
      <rect width="32" height="32" rx="9" fill="url(#logo-grad)" />
      <circle cx="24" cy="10" r="2.4" fill="#e8a61c" />
      <path d="M8 22 L14 15 L18 18 L24 10" stroke="#ffffff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Compte une page vue à chaque changement d'adresse (le site ne recharge pas la page en naviguant). */
function Analytics() {
  const { pathname } = useLocation();
  useEffect(() => {
    trackPageview();
  }, [pathname]);
  return null;
}

function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  const btnRef = useRef<HTMLButtonElement>(null);
  // Échap referme le menu mobile ouvert et rend le focus au bouton « Menu ».
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      btnRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  return (
    <header className="site-header">
      <div className="container">
        <Link to="/" className="brand"><Logo /> {config.siteName}</Link>
        <button ref={btnRef} className="menu-btn" aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>
          Menu
        </button>
        <nav id="main-nav" className={'nav' + (open ? ' open' : '')} aria-label="Navigation principale">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {n.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <strong style={{ color: 'var(--ink)' }}>{config.siteName}</strong>
          <p className="small" style={{ marginTop: 8 }}>
            Informations générales et outils pédagogiques. Aucun conseil en investissement personnalisé.
            Chaque fiche indique la date de sa dernière vérification. Aucun cookie, aucune inscription, mesure d'audience anonyme :
            vos saisies et simulations restent dans votre navigateur. Aucun lien commercial.
          </p>
        </div>
        <div>
          <strong style={{ color: 'var(--ink)' }}>Explorer</strong>
          <ul className="footer-links" style={{ marginTop: 8 }}>
            {NAV.map((n) => <li key={n.to}><Link to={n.to}>{n.label}</Link></li>)}
            <li><Link to="/glossaire">Glossaire</Link></li>
            <li><Link to="/plan-du-site">Plan du site</Link></li>
            <li><Link to="/confidentialite">Confidentialité</Link></li>
            <li><Link to="/mentions-legales">Mentions légales</Link></li>
          </ul>
        </div>
        <div>
          <strong style={{ color: 'var(--ink)' }}>Sources officielles</strong>
          <ul style={{ marginTop: 8 }}>
            <li><a href="https://www.service-public.fr" target="_blank" rel="noopener noreferrer">Service-Public.fr</a></li>
            <li><a href="https://www.impots.gouv.fr" target="_blank" rel="noopener noreferrer">impots.gouv.fr</a></li>
            <li><a href="https://www.amf-france.org" target="_blank" rel="noopener noreferrer">AMF</a></li>
            <li><a href="https://www.banque-france.fr" target="_blank" rel="noopener noreferrer">Banque de France</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

/** Coquille de l'application, sans routeur : utilisée par le navigateur (BrowserRouter) et le pré-rendu (StaticRouter). */
export default function App() {
  return (
    <>
      <ScrollTop />
      <Analytics />
      <RouteAnnouncer />
      <a href="#contenu" className="skip" onClick={(e) => { e.preventDefault(); document.getElementById('contenu')?.focus(); }}>
        Aller au contenu
      </a>
      <Header />
      <main id="contenu" tabIndex={-1}>
        <div className="container">
          <Suspense fallback={<p className="small" role="status">Chargement…</p>}>
            <Routes>
              {ROUTES.map(({ path, Component }) => <Route key={path} path={path} element={<Component />} />)}
            </Routes>
            {/* Dans la zone Suspense : l'effet ne démarre qu'une fois la page hydratée (sinon erreurs d'hydratation). */}
            <FrenchSpaces />
          </Suspense>
        </div>
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
