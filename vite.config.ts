import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

import { dependencies } from './package.json';
function renderChunks(deps) {
  const chunks = {};
  Object.keys(deps).forEach((key) => {
    if (['phaser'].includes(key)) return;
    chunks[key] = [key];
  });
  return chunks;
}

export default defineConfig({
  // Add this line to set the base path for GitHub Pages
  base: '/fan-academy/', 

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
          ...renderChunks(dependencies)
        }
      },
      plugins: [
        // visualizer({
        //   filename: 'dist/stats.html',
        //   open: true,
        //   gzipSize: true,
        //   brotliSize: true
        // })
      ]
    }
  },
  resolve: { alias: { phaser: path.resolve(__dirname, 'node_modules/phaser/dist/phaser-arcade-physics.min.js') } }
});