import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base relative : fonctionne sur GitHub Pages (sous-chemin /<repo>/) comme en local.
export default defineConfig({
  plugins: [react()],
  base: './',
  test: { environment: 'node' },
} as any);
