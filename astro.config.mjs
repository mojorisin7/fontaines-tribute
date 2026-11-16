import { defineConfig } from 'astro/config';

export default defineConfig({
  vite: {
    // Pre-bundle Leaflet at startup so the dev server doesn't serve a stale copy
    // after re-optimising dependencies (the map goes blank when that happens).
    optimizeDeps: { include: ['leaflet'] },
  },
});
