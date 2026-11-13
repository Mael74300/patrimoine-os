import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BASE_PATH : chemin du site, par exemple /patrimoine-os/ sur GitHub Pages (renseigné par le workflow).
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  // Manifeste des fichiers construits : le pré-rendu y lit les modules de chaque page à précharger.
  build: { manifest: !isSsrBuild },
  base: process.env.BASE_PATH || '/',
  test: { environment: 'node', include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'] },
} as any));
