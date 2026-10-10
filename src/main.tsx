import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App';
import './styles.css';

const root = document.getElementById('root')!;

if (import.meta.env.VITE_HASH === '1') {
  // Version d'aperçu en fichier unique : routage par ancre, sans pré-rendu.
  createRoot(root).render(<StrictMode><HashRouter><App /></HashRouter></StrictMode>);
} else {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';
  const app = <StrictMode><BrowserRouter basename={basename}><App /></BrowserRouter></StrictMode>;
  const here = location.pathname.replace(/\/?$/, '/');
  // Hydrate uniquement si le HTML pré-rendu correspond exactement à l’adresse (la page 404 sert d’autres adresses ;
  // les filtres en paramètres d’URL changent le premier rendu).
  if (root.hasChildNodes() && !location.search && root.dataset.path && import.meta.env.BASE_URL.replace(/\/$/, '') + root.dataset.path === here) hydrateRoot(root, app);
  else createRoot(root).render(app);
}
