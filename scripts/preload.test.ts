import { describe, expect, it } from 'vitest';
import { modulePreloads, modulePreloadTags } from './lib/preload.mjs';

const manifest = {
  'index.html': { file: 'assets/index-a.js', isEntry: true, dynamicImports: ['src/pages/Guides.tsx'] },
  'src/pages/Guides.tsx': { file: 'assets/Guides-b.js', isDynamicEntry: true, imports: ['index.html', '_ui-c.js', 'src/pages/NotFound.tsx'] },
  'src/pages/NotFound.tsx': { file: 'assets/NotFound-d.js', isDynamicEntry: true, imports: ['index.html', '_ui-c.js'] },
  '_ui-c.js': { file: 'assets/ui-c.js', imports: ['_common-e.js'] },
  '_common-e.js': { file: 'assets/common-e.js' },
};

describe('préchargement des modules d’une page', () => {
  it('liste le fichier de la page et ses dépendances statiques, une seule fois, sans le script principal', () => {
    expect(modulePreloads(manifest, 'src/pages/Guides.tsx')).toEqual([
      'assets/Guides-b.js', 'assets/ui-c.js', 'assets/common-e.js', 'assets/NotFound-d.js',
    ]);
  });
  it('ne renvoie rien pour une page absente du manifeste', () => {
    expect(modulePreloads(manifest, 'src/pages/Inconnue.tsx')).toEqual([]);
  });
  it('écrit des balises avec le chemin de base du site', () => {
    expect(modulePreloadTags(['assets/ui-c.js'], '/patrimoine-os/')).toEqual([
      '<link rel="modulepreload" crossorigin href="/patrimoine-os/assets/ui-c.js" />',
    ]);
  });
});
