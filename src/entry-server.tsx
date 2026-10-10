import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App';

export { pagesMeta, lastModified } from './seo';

/** Rend une page en HTML statique. `url` est relatif au site (sans le chemin de base). */
export function render(url: string, basename: string): string {
  return renderToString(
    <StaticRouter location={basename.replace(/\/$/, '') + url} basename={basename.replace(/\/$/, '') || '/'}>
      <App />
    </StaticRouter>,
  );
}
