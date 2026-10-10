import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BASE_PATH : chemin du site, par exemple /patrimoine-os/ sur GitHub Pages (renseigné par le workflow).
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || '/',
  test: { environment: 'node', include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'] },
} as any);
