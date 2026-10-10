import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { config } from './config';
import { trackPageview } from './lib/analytics';
import { AS_OF } from './data/investments';
import Home from './pages/Home';
import Encyclopedia from './pages/Encyclopedia';
import InvestmentPage from './pages/InvestmentPage';
import Compare from './pages/Compare';
import Simulators from './pages/Simulators';
import SimPatrimoine from './pages/SimPatrimoine';
import SimImmobilier from './pages/SimImmobilier';
import SimCredit from './pages/SimCredit';
import SimPortefeuille from './pages/SimPortefeuille';
import Entrepreneuriat from './pages/Entrepreneuriat';
import { GuideList, GuidePage } from './pages/Guides';
import Methodologie from './pages/Methodologie';
import SearchPage from './pages/SearchPage';
import SimEtfImmobilier from './pages/SimEtfImmobilier';
import SimEntreprise from './pages/SimEntreprise';
import SimIndependance from './pages/SimIndependance';
import { Confidentialite, MentionsLegales } from './pages/Legal';
import NotFound from './pages/NotFound';

const NAV = [
  { to: '/encyclopedie', label: 'Encyclopédie' },
  { to: '/simulateurs', label: 'Simulateurs' },
  { to: '/comparateur', label: 'Comparateur' },
  { to: '/entrepreneuriat', label: 'Entrepreneuriat' },
  { to: '/guides', label: 'Guides' },
  { to: '/methodologie', label: 'Méthode' },
];

function ScrollTop() {
  const { pathname } = useLocation();
  // Accolades obligatoires : dans les navigateurs récents, scrollTo renvoie une promesse,
  // que React prendrait pour une fonction de nettoyage et appellerait au changement de page.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#123a4a" />
      <path d="M8 22 L14 15 L18 18 L24 10" stroke="#e8f1ee" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
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
  return (
    <header className="site-header">
      <div className="container">
        <Link to="/" className="brand"><Logo /> {config.siteName}</Link>
        <button className="menu-btn" aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>
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
            Données réglementaires vérifiées au {AS_OF}. Aucun cookie, aucune inscription, mesure d'audience anonyme :
            vos saisies et simulations restent dans votre navigateur. Aucun lien commercial.
          </p>
        </div>
        <div>
          <strong style={{ color: 'var(--ink)' }}>Explorer</strong>
          <ul style={{ marginTop: 8 }}>
            {NAV.map((n) => <li key={n.to}><Link to={n.to}>{n.label}</Link></li>)}
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
      <a href="#contenu" className="skip" onClick={(e) => { e.preventDefault(); document.getElementById('contenu')?.focus(); }}>
        Aller au contenu
      </a>
      <Header />
      <main id="contenu" tabIndex={-1}>
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recherche" element={<SearchPage />} />
            <Route path="/encyclopedie" element={<Encyclopedia />} />
            <Route path="/encyclopedie/:slug" element={<InvestmentPage />} />
            <Route path="/comparateur" element={<Compare />} />
            <Route path="/simulateurs" element={<Simulators />} />
            <Route path="/simulateurs/patrimoine" element={<SimPatrimoine />} />
            <Route path="/simulateurs/immobilier" element={<SimImmobilier />} />
            <Route path="/simulateurs/credit" element={<SimCredit />} />
            <Route path="/simulateurs/portefeuille" element={<SimPortefeuille />} />
            <Route path="/simulateurs/etf-immobilier" element={<SimEtfImmobilier />} />
            <Route path="/simulateurs/entreprise" element={<SimEntreprise />} />
            <Route path="/simulateurs/independance-financiere" element={<SimIndependance />} />
            <Route path="/confidentialite" element={<Confidentialite />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/entrepreneuriat" element={<Entrepreneuriat />} />
            <Route path="/guides" element={<GuideList />} />
            <Route path="/guides/:slug" element={<GuidePage />} />
            <Route path="/methodologie" element={<Methodologie />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </>
  );
}
