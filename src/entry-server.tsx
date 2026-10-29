import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App';
import { eager } from './routes';

// Le pré-rendu embarque toutes les pages : le HTML statique doit contenir leur contenu.
Object.assign(eager, import.meta.glob('./pages/*.tsx', { eager: true }));

export { pagesMeta, lastModified } from './seo';
export { config } from './config';

/** Rend une page en HTML statique. `url` est relatif au site (sans le chemin de base). */
export function render(url: string, basename: string): string {
  return renderToString(
    <StaticRouter location={basename.replace(/\/$/, '') + url} basename={basename.replace(/\/$/, '') || '/'}>
      <App />
    </StaticRouter>,
  );
}
